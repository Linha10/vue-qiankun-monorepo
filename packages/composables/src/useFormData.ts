/**
 * useFormData — 將物件轉換為 FormData 的 composable
 *
 * 序列化規則：
 *   - null / undefined          → 略過（不 append）
 *   - File                      → 直接 append（二進位）
 *   - File[]                    → 逐項 append（多檔上傳）
 *   - 純值 array（string/number）→ 逐項 append 為字串（後端可解析成陣列）
 *   - 物件（含巢狀）             → JSON.stringify 後 append 為字串
 *   - 其餘純值                   → String() 轉型後 append
 */

type FormDataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | File
  | File[]
  | string[]
  | number[]
  | boolean[]
  | Record<string, unknown>

export type FormDataInput = Record<string, FormDataValue>

type Options = {
  objectMode?: 'json' | 'nested'
}

const DEFAULT_OPTIONS: Options = { objectMode: 'json' }

function buildFormData(data: FormDataInput, options: Options = DEFAULT_OPTIONS): FormData {
  const fd = new FormData()

  function append(key: string, value: FormDataValue) {
    if (value === null || value === undefined) return

    if (value instanceof File) {
      fd.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        append(`${key}[${i}]`, item as FormDataValue)
      })
    } else if (typeof value === 'object') {
      if (options.objectMode === 'json') {
        fd.append(key, JSON.stringify(value))
      } else {
        Object.entries(value).forEach(([k, v]) => {
          append(`${key}[${k}]`, v as FormDataValue)
        })
      }
    } else {
      fd.append(key, String(value))
    }
  }

  Object.entries(data).forEach(([k, v]) => append(k, v))
  return fd
}

export function useFormData() {
  return { buildFormData }
}
