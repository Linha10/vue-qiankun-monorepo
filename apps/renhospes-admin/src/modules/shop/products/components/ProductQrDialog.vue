<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import { HcDialog, HcButton } from '@monorepo/ui-kit'
import { useI18n } from '@monorepo/composables'

// ⚠️ 依環境手動調整網址（ uat / prod） TODO: 後續可改成從環境變數讀取
// const BASE_QR_CODE_URL = 'https://uat.renhospes.com/shop/artwork'
const BASE_QR_CODE_URL_PROD = 'https://www.renhospes.com/shop/artwork'

const props = defineProps<{
  modelValue: boolean
  productId: string | number
  productName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const { $t } = useI18n()

const qrDataUrl = ref('')

watch(
  () => props.modelValue,
  async open => {
    if (!open) {
      qrDataUrl.value = ''
      return
    }
    qrDataUrl.value = await QRCode.toDataURL(`${BASE_QR_CODE_URL_PROD}/${props.productId}`, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }
)

function handleDownload() {
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `${props.productName}-qrcode.png`
  a.click()
}

const handlePrint = () => {
  const win = window.open('', '_blank', 'width=420,height=560')
  if (!win) return
  win.document.write(
    `
    <html>
    <head>
      <title>${props.productName}</title>
      <style>
        body { display:flex; flex-direction:column; align-items:center; justify-content:center;
               height:100vh; margin:0; font-family:sans-serif; }
        img  { width:280px; height:280px; }
        p    { margin:14px 0 0; font-size:14px; font-weight:600; color:#333; }
      </style>
    </head>
    <body>
      <img src="${qrDataUrl.value}" />
      <p>${props.productName}</p>
      <script>window.onload=function(){window.print();window.close();}</s` +
      `cript>
    </body>
    </html>
  `
  )
  win.document.close()
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="productName"
    :show-footer="false"
    width="340px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="qr-body">
      <!-- QR -->
      <div class="qr-image-wrap">
        <img v-if="qrDataUrl" :src="qrDataUrl" :alt="productName" class="qr-image" />
        <div v-else class="qr-placeholder">
          <i class="fa-solid fa-spinner fa-spin" />
        </div>
      </div>

      <!-- Actions -->
      <div class="qr-actions">
        <HcButton plain :disabled="!qrDataUrl" @click="handleDownload">
          <i class="fa-solid fa-download tw-mr-1" />
          {{ $t('shop.product.table.qrCodeDownload') }}
        </HcButton>
        <HcButton plain size="default" :disabled="!qrDataUrl" @click="handlePrint">
          <i class="fa-solid fa-print tw-mr-1" />
          {{ $t('shop.product.table.qrCodePrint') }}
        </HcButton>
      </div>
    </div>
  </HcDialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.qr-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 4px;
  gap: 12px;
}

.qr-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 220px;
  height: 220px;
}

.qr-placeholder {
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: $color-neutral-400;
}

.qr-url {
  margin: 0;
  font-size: 11px;
  color: $color-neutral-400;
  word-break: break-all;
  text-align: center;
  padding: 0 8px;
  user-select: text;
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 4px;
}
</style>
