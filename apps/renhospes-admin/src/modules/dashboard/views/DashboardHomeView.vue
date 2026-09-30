<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { HcButton } from '@monorepo/ui-kit'
import { employeeApi, type EmployeeItem } from '@/api/employees'
import { productApi, type ProductItem } from '@/api/products'

const { $t } = useI18n()
const appStore = useAppStore()
const router = useRouter()

const employees = ref<EmployeeItem[]>([])
const products = ref<ProductItem[]>([])
const loading = ref(false)

const LOW_STOCK_THRESHOLD = 10

const activeEmployeeCount = computed(() => employees.value.filter(e => e.status === 1).length)
const lowStockCount = computed(
  () => products.value.filter(p => p.stock < LOW_STOCK_THRESHOLD).length
)

const departmentStats = computed(() => {
  const map = new Map<string, number>()
  employees.value.forEach(e => map.set(e.department, (map.get(e.department) ?? 0) + 1))
  const max = Math.max(1, ...map.values())
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count, percent: Math.round((count / max) * 100) }))
    .sort((a, b) => b.count - a.count)
})

const categoryStats = computed(() => {
  const map = new Map<string, number>()
  products.value.forEach(p => map.set(p.category, (map.get(p.category) ?? 0) + 1))
  const max = Math.max(1, ...map.values())
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count, percent: Math.round((count / max) * 100) }))
    .sort((a, b) => b.count - a.count)
})

async function fetchData() {
  loading.value = true
  try {
    const [empRes, prodRes] = await Promise.all([
      employeeApi.getList({ page: 1, pageSize: 200 }),
      productApi.getList({ page: 1, pageSize: 200 }),
    ])
    employees.value = (empRes as { data: { list: EmployeeItem[] } })?.data?.list ?? []
    products.value = (prodRes as { data: { list: ProductItem[] } })?.data?.list ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-loading="loading" class="tw-flex tw-flex-col tw-gap-4">
    <div class="tw-bg-white tw-rounded-lg tw-p-5 tw-shadow-sm">
      <h2 class="tw-text-lg tw-font-semibold">
        {{ $t('dashboardHome.welcome', { name: appStore.userInfo?.accountName ?? 'demo' }) }}
      </h2>
    </div>

    <el-row :gutter="16">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__value">{{ employees.length }}</div>
          <div class="stat-card__label">{{ $t('dashboardHome.employeeCount') }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__value">{{ activeEmployeeCount }}</div>
          <div class="stat-card__label">{{ $t('dashboardHome.activeEmployees') }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__value">{{ products.length }}</div>
          <div class="stat-card__label">{{ $t('dashboardHome.productCount') }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__value">{{ lowStockCount }}</div>
          <div class="stat-card__label">{{ $t('dashboardHome.lowStockProducts') }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="tw-bg-white tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h3 class="tw-text-sm tw-font-semibold tw-mb-3">
            {{ $t('dashboardHome.departmentDistribution') }}
          </h3>
          <div v-for="item in departmentStats" :key="item.name" class="dist-row">
            <span class="dist-row__label">{{ item.name }}</span>
            <div class="dist-row__bar">
              <div class="dist-row__bar-fill" :style="{ width: item.percent + '%' }" />
            </div>
            <span class="dist-row__count">{{ item.count }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="tw-bg-white tw-rounded-lg tw-p-5 tw-shadow-sm">
          <h3 class="tw-text-sm tw-font-semibold tw-mb-3">
            {{ $t('dashboardHome.categoryDistribution') }}
          </h3>
          <div v-for="item in categoryStats" :key="item.name" class="dist-row">
            <span class="dist-row__label">{{ item.name }}</span>
            <div class="dist-row__bar">
              <div class="dist-row__bar-fill" :style="{ width: item.percent + '%' }" />
            </div>
            <span class="dist-row__count">{{ item.count }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="tw-bg-white tw-rounded-lg tw-p-5 tw-shadow-sm">
      <h3 class="tw-text-sm tw-font-semibold tw-mb-3">{{ $t('dashboardHome.quickLinks') }}</h3>
      <div class="tw-flex tw-gap-3">
        <HcButton type="primary" plain @click="router.push('/employees')">
          {{ $t('dashboardHome.goToEmployees') }}
        </HcButton>
        <HcButton type="primary" plain @click="router.push('/products')">
          {{ $t('dashboardHome.goToProducts') }}
        </HcButton>
        <HcButton type="primary" plain @click="router.push('/system-settings/account-management')">
          {{ $t('dashboardHome.goToSystemSettings') }}
        </HcButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  text-align: center;

  &__value {
    font-size: 28px;
    font-weight: 700;
  }

  &__label {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;

  &__label {
    width: 72px;
    flex-shrink: 0;
    color: #606266;
  }

  &__bar {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: #f0f2f5;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 4px;
    background: var(--el-color-primary);
  }

  &__count {
    width: 24px;
    text-align: right;
    color: #303133;
  }
}
</style>
