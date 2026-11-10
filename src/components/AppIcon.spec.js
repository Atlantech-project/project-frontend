import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { NAVIGATION } from '@/app/navigation'
import { PAGE_ICONS, pageIcon } from '@/app/pageIcons'
import AppIcon from './AppIcon.vue'
import { ICONS, ICON_NAMES } from './icons'

// Every icon of the Figma "Components" page (Icon/*, Icon dark/*, Icon link/*, Icon muted/*).
const FIGMA_ICONS = `home dashboard bell file package clipboard calendar alert wind shieldcheck
  shieldalert users user tablet map mappin building anchor sliders history cpu warehouse grid
  layoutgrid wrench card filelock key ship layers badge plans license devices request sparkles
  shield plus upload save refresh trash arrowleft arrowright arrowup arrowdown external check x
  pencil login search eye ban`.split(/\s+/)

describe('app icon set (FE-018)', () => {
  it('has every icon of the Figma design, and nothing else', () => {
    expect([...ICON_NAMES].sort()).toEqual([...FIGMA_ICONS].sort())
  })

  it.each(ICON_NAMES)('%s is drawn on a 16 or 20 grid', (name) => {
    const [grid, paths] = ICONS[name]
    expect([16, 20]).toContain(grid)
    expect(paths.length).toBeGreaterThan(0)
    for (const d of paths) expect(d).toMatch(/^M[\d.\s\-MLHVCZ]+$/)
  })

  it('renders at the asked size with the Figma line width', () => {
    const icon = mount(AppIcon, { props: { name: 'search', size: 20 } })
    const svg = icon.get('svg')
    expect(svg.attributes()).toMatchObject({
      width: '20',
      viewBox: '0 0 16 16',
      'stroke-width': '1.33',
      'aria-hidden': 'true',
    })
    expect(icon.findAll('path')).toHaveLength(2)
    expect(
      mount(AppIcon, { props: { name: 'user' } })
        .get('svg')
        .attributes('stroke-width'),
    ).toBe('1.67')
  })

  it('points arrows the other way in Arabic, other icons stay', () => {
    expect(mount(AppIcon, { props: { name: 'arrowleft' } }).classes()).toContain('rtl:-scale-x-100')
    expect(mount(AppIcon, { props: { name: 'search' } }).classes()).not.toContain(
      'rtl:-scale-x-100',
    )
  })

  it('draws nothing for an unknown name', () => {
    expect(mount(AppIcon, { props: { name: 'nope' } }).findAll('path')).toHaveLength(0)
  })
})

describe('menu icons', () => {
  const pageIds = NAVIGATION.flatMap((section) => section.items).map((item) => item.pageId)

  it.each(pageIds)('%s has a Figma icon', (pageId) => {
    expect(PAGE_ICONS[pageId]).toBeDefined()
    expect(ICONS[pageIcon(pageId)]).toBeDefined()
  })
})
