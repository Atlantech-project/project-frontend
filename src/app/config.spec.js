import { describe, it, expect, vi } from 'vitest'
import { DEFAULT_CONFIG, resolveConfig, loadConfig, getConfig, isEnabled } from './config'

describe('resolveConfig', () => {
  it('returns the defaults for a missing or invalid file', () => {
    expect(resolveConfig(null)).toBe(DEFAULT_CONFIG)
    expect(resolveConfig('oops')).toBe(DEFAULT_CONFIG)
  })

  it('overrides known settings and feature flags', () => {
    const cfg = resolveConfig({
      environment: 'demo',
      apiBaseUrl: 'https://app.atlantech.io/api/v1',
      defaultLocale: 'ar',
      features: { licenseMode: true },
    })
    expect(cfg.environment).toBe('demo')
    expect(cfg.apiBaseUrl).toBe('https://app.atlantech.io/api/v1')
    expect(cfg.eventsUrl).toBe(DEFAULT_CONFIG.eventsUrl)
    expect(cfg.defaultLocale).toBe('ar')
    expect(cfg.features.licenseMode).toBe(true)
    expect(cfg.features.modelRetraining).toBe(false)
  })

  it('drops wrong types and unknown features with a warning', () => {
    const warn = vi.fn()
    const cfg = resolveConfig(
      { apiBaseUrl: 42, defaultLocale: 'fr', features: { licenseMode: 'yes', darkMagic: true } },
      warn,
    )
    expect(cfg.apiBaseUrl).toBe(DEFAULT_CONFIG.apiBaseUrl)
    expect(cfg.defaultLocale).toBe('en')
    expect(cfg.features.licenseMode).toBe(false)
    expect(cfg.features).not.toHaveProperty('darkMagic')
    expect(warn).toHaveBeenCalledTimes(4)
  })

  it('returns a frozen object', () => {
    const cfg = resolveConfig({ environment: 'dev' })
    expect(Object.isFrozen(cfg)).toBe(true)
    expect(Object.isFrozen(cfg.features)).toBe(true)
  })
})

describe('loadConfig', () => {
  it('loads config.json from the base URL without caching', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ environment: 'dev', features: { nctRecommendations: true } }),
    })
    await loadConfig(fetchFn, '/')
    expect(fetchFn).toHaveBeenCalledWith('/config.json', { cache: 'no-store' })
    expect(getConfig().environment).toBe('dev')
    expect(isEnabled('nctRecommendations')).toBe(true)
    expect(isEnabled('licenseMode')).toBe(false)
  })

  it('falls back to the defaults when the file is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await loadConfig(vi.fn().mockResolvedValue({ ok: false, status: 404 }), '/')
    expect(getConfig()).toBe(DEFAULT_CONFIG)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
