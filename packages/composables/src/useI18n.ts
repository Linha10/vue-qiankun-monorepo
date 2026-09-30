import { inject, ref } from 'vue'
import { I18N_KEY, type I18nContext } from './context/keys'

// 沒有人 provide 時的預設行為：把 key 原樣印出來，方便元件獨立開發/測試時不會整個爆掉
const fallback: I18nContext = {
  $t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key),
  locale: ref('zh'),
  setLocale: () => {},
}

export function useI18n(): I18nContext {
  return inject(I18N_KEY, fallback)
}
