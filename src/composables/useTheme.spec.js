import { beforeEach, describe, expect, it } from 'vitest'
import { applyTheme, theme, toggleTheme } from './useTheme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    theme.value = 'light'
    applyTheme()
  })

  it('switches between light and dark and remembers the choice', () => {
    toggleTheme()
    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('atl-theme')).toBe('dark')

    toggleTheme()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('atl-theme')).toBe('light')
  })
})
