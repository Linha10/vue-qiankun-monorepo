import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { ElMessage } from 'element-plus'
import { computed, type Ref } from 'vue'

interface CRUDOptions<TFilter extends Record<string, unknown>> {
  // 模組唯一識別名稱，作為 query cache 的 key
  queryKey: string
  // API 函式
  apiFns: {
    getList: (filters: TFilter) => Promise<unknown>
    create?: (data: unknown) => Promise<unknown>
    update?: (id: number, data: unknown) => Promise<unknown>
    delete?: (id: number) => Promise<unknown>
  }
  // 篩選條件（ref）
  filters: Ref<TFilter>
  // 控制 query 是否執行
  enabled?: Ref<boolean>
  // 操作成功訊息
  messages?: {
    createSuccess?: string
    updateSuccess?: string
    deleteSuccess?: string
  }
}

export function useCRUD<TFilter extends Record<string, unknown>>({
  queryKey,
  apiFns,
  filters,
  enabled,
  messages = {},
}: CRUDOptions<TFilter>) {
  const queryClient = useQueryClient()

  const {
    createSuccess = '新增成功',
    updateSuccess = '更新成功',
    deleteSuccess = '刪除成功',
  } = messages

  // 查詢列表
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: computed(() => [queryKey, JSON.stringify(filters.value)] as const),
    queryFn: () => apiFns.getList(filters.value),
    placeholderData: keepPreviousData,
    ...(enabled !== undefined && { enabled }),
  })

  // 操作成功後讓 cache 失效，自動重新 fetch
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] })

  // 新增
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (payload: unknown) => apiFns.create!(payload),
    onSuccess: () => {
      ElMessage.success(createSuccess)
      invalidate()
    },
  })

  // 更新
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => apiFns.update!(id, data),
    onSuccess: () => {
      ElMessage.success(updateSuccess)
      invalidate()
    },
  })

  // 刪除
  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (id: number) => apiFns.delete!(id),
    onSuccess: () => {
      ElMessage.success(deleteSuccess)
      invalidate()
    },
  })

  return {
    // 查詢
    data,
    isLoading,
    isError,
    refetch,
    // 操作
    create,
    update,
    remove,
    // loading 狀態
    isCreating,
    isUpdating,
    isRemoving,
  }
}
