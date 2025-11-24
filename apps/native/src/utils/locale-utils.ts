import { useLocaleStore } from '@/stores/locale-store'
import { POLISH_LOCALE } from '@yourbestaccent/i18n/i18n-config'

export const isUsingPolishLanguage = (): boolean => {
  const locale = useLocaleStore.getState().locale
  return locale === POLISH_LOCALE
}
