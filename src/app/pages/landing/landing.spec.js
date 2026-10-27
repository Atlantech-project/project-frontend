import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import LandingPage from '../LandingPage.vue'

describe('landing page', () => {
  const w = mount(LandingPage, { global: { plugins: [i18n] } })

  it('shows the hero headline and every journey step', () => {
    expect(w.find('h1').text()).toContain(en.landing.hero.line1)
    for (const step of Object.values(en.landing.journey.steps)) {
      expect(w.text()).toContain(step.title)
    }
  })

  it('has the anchors the hero buttons point to', () => {
    expect(w.find('#how').exists()).toBe(true)
    expect(w.find('#features').exists()).toBe(true)
    expect(w.find('#top').exists()).toBe(true)
    expect(w.find('#roles').exists()).toBe(true)
    expect(w.find('#faq').exists()).toBe(true)
    expect(w.find('#security').exists()).toBe(true)
  })

  it('has no missing translations', () => {
    expect(w.text()).not.toMatch(/landing\.\w+/)
  })
})
