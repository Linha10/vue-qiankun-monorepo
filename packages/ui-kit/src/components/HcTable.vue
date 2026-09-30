<script setup lang="ts" generic="T extends Record<string, any>">
import { useSlots } from "vue";
import type { TableProps } from "element-plus";

export interface TableColumn {
  prop: string;
  label: string;
  minWidth?: number | string;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: boolean | "left" | "right";
  sortable?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    Partial<TableProps<T>> & {
      columns?: TableColumn[];
      total?: number;
      page?: number;
      pageSize?: number;
      pageSizes?: number[];
    }
  >(),
  {
    pageSizes: () => [10, 20, 50],
  },
);

const emit = defineEmits<{
  "update:page": [val: number];
  "update:pageSize": [val: number];
}>();

const slots = useSlots();

const handleSizeChange = (val: number) => {
  emit("update:pageSize", val);
  emit("update:page", 1);
};

const handleCurrentChange = (val: number) => {
  emit("update:page", val);
};
</script>

<template>
  <div class="hc-table">
    <el-table v-bind="$attrs" :data="props.data">
      <!-- columns 模式 -->
      <template v-if="columns && columns.length">
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth"
          :width="col.width"
          :align="col.align"
          :fixed="col.fixed"
          :sortable="col.sortable"
        >
          <template v-if="slots[col.prop]" #default="{ row, $index }">
            <slot :name="col.prop" :scope="row" :index="$index" />
          </template>
        </el-table-column>
      </template>

      <!-- slot 模式 fallback -->
      <template v-else>
        <slot />
      </template>
    </el-table>

    <!-- pagination -->
    <div v-if="total !== undefined" class="hc-table__pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-table {
  &__pagination {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
}

/* header 底色 */
:deep(.el-table__header-wrapper th.el-table__cell) {
  background-color: $color-neutral-800;
  color: $color-neutral-0;
}

/*
 * 修正 fixed（sticky）欄位背景色被覆蓋的問題：
 * Element Plus 針對 fixed 欄位另外提供了以捲動狀態（is-scrolling-none／
 * is-scrolling-left／is-scrolling-right／is-scrolling-middle）為前綴的選擇器，
 * 其 specificity 與這裡的 scoped 覆寫規則相同，最終由「樣式表載入順序」決定
 * 誰生效。qiankun 掛載子應用時會重新注入一份 element-plus 樣式表到
 * document head，順序晚於本元件樣式，因此會反過來蓋掉這裡的顏色，
 * 導致第一欄／最後一欄（fixed 欄位）背景「消失」。用 !important 確保
 * 不受載入順序影響。
 */
:deep(.el-table__header-wrapper th.el-table-fixed-column--left),
:deep(.el-table__header-wrapper th.el-table-fixed-column--right) {
  background-color: $color-neutral-800 !important;
  color: $color-neutral-0 !important;
}

:deep(.el-table__body td.el-table-fixed-column--left),
:deep(.el-table__body td.el-table-fixed-column--right) {
  background-color: var(--el-table-tr-bg-color, #fff) !important;
}

/* active 頁碼主題色 */
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: $color-primary-800;
  color: $color-neutral-0;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-active):hover) {
  color: $color-primary-800;
}
</style>
