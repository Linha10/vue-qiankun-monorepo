import { ref, watch } from 'vue'
import { useI18n } from './useI18n'

const WEEK_DAYS: Record<string, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
}

export function useWeekDays() {
  const { locale } = useI18n()
  const weekDays = ref<string[]>(WEEK_DAYS[locale.value] ?? WEEK_DAYS.zh)

  watch(locale, val => {
    weekDays.value = WEEK_DAYS[val] ?? WEEK_DAYS.zh
  })

  return { weekDays }
}
