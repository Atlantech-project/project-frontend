import { createI18n } from 'vue-i18n'
import en from './en.json'
import ar from './ar.json'

export const SUPPORTED_LOCALES = ['en', 'ar']
const RTL_LOCALES = ['ar']

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar },
})

// Switch language and text direction together.
export function setLocale(locale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
}
