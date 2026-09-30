<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HcButton } from '@monorepo/ui-kit'
import { useI18n } from '@monorepo/composables'

defineOptions({ name: 'ForbiddenView' })

const router = useRouter()
const { $t } = useI18n()
</script>

<template>
  <div class="forbidden-root">
    <i class="fa-solid fa-shield-halved forbidden-root__icon" />
    <h1 class="forbidden-root__title">403</h1>
    <p class="forbidden-root__desc">{{ $t('common.forbidden') }}</p>
    <HcButton type="primary" size="large" @click="router.push('/dashboard')">
      {{ $t('common.backToDashboard') }}
    </HcButton>
  </div>
</template>

<style scoped lang="scss">
.forbidden-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;

  &__icon {
    font-size: 3.5rem;
    color: #c07030;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a0a00;
    margin-bottom: 0.5rem;
  }

  &__desc {
    font-size: 1rem;
    color: #9a8070;
    margin-bottom: 2rem;
  }
}
</style>
