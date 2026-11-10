// What the Home Dashboard (P-17) shows, from Figma "P-17 / Home Dashboard". Each summary card
// gets its number when its feature's API arrives; until then it shows "—" (no data yet).
export const SUMMARY_CARDS = Object.freeze([
  { id: 'berths', titleKey: 'home.summary.berths.title', noteKey: 'home.summary.berths.note' },
  { id: 'tugs', titleKey: 'home.summary.tugs.title', noteKey: 'home.summary.tugs.note' },
  { id: 'pilots', titleKey: 'home.summary.pilots.title', noteKey: 'home.summary.pilots.note' },
  { id: 'plans', titleKey: 'home.summary.plans.title', noteKey: 'home.summary.plans.note' },
])

// Quick Actions: at most this many shortcuts to the role's other pages.
export const MAX_SHORTCUTS = 3

// The first pages of the role's menu that already exist, Home itself left out.
// `exists(path)` says whether the page has a route yet.
export function shortcutsFor(sections, exists) {
  return sections
    .flatMap((section) => section.items)
    .filter((item) => item.pageId !== 'P-17' && exists(item.path))
    .slice(0, MAX_SHORTCUTS)
}
