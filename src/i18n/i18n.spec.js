import { describe, it, expect } from 'vitest'
import { i18n, setLocale } from './index'
import en from './en.json'
import ar from './ar.json'

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('i18n', () => {
  it('has the same keys in English and Arabic', () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort())
  })

  it('switches direction with the locale', () => {
    setLocale('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(i18n.global.t('notFound.back')).toBe(ar.notFound.back)
    setLocale('en')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
