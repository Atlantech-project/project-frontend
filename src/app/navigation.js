import { ROLES, WEB_ROLES } from './roles'

const {
  PORT_GM,
  PORT_STAFF,
  PILOTAGE_MANAGER,
  PILOTAGE_OFFICER,
  TUG_MANAGER,
  TUG_OFFICER,
  TERMINAL_ADMIN,
  TERMINAL_OFFICER,
  MARINE_SAFETY_OFFICER,
} = ROLES

// Web menu per role, from the Screens spec (page IDs P-xx and their "Web · Rn" lines).
// Only list pages appear here; detail and form pages (P-24, P-35..P-38, P-40, P-42, P-51)
// open from their list page. `readOnlyRoles` see the page without edit actions.
// Paths are placeholders until each page's routes land with its feature.
export const NAVIGATION = Object.freeze([
  {
    id: 'general',
    labelKey: 'nav.section.general',
    items: [
      { pageId: 'P-17', path: '/', labelKey: 'nav.home', roles: WEB_ROLES },
      {
        pageId: 'P-18',
        path: '/port-state',
        labelKey: 'nav.portState',
        roles: [
          PORT_GM,
          PORT_STAFF,
          PILOTAGE_MANAGER,
          PILOTAGE_OFFICER,
          TUG_MANAGER,
          TUG_OFFICER,
          TERMINAL_ADMIN,
          TERMINAL_OFFICER,
        ],
      },
      {
        pageId: 'P-21',
        path: '/environment',
        labelKey: 'nav.environment',
        roles: WEB_ROLES,
      },
      {
        pageId: 'P-19',
        path: '/notifications',
        labelKey: 'nav.notifications',
        roles: WEB_ROLES,
      },
    ],
  },
  {
    id: 'berthing',
    labelKey: 'nav.section.berthing',
    items: [
      {
        pageId: 'P-34',
        path: '/berthing/requests',
        labelKey: 'nav.berthingRequests',
        roles: [PORT_STAFF],
      },
      {
        pageId: 'P-31',
        path: '/berthing/baplie',
        labelKey: 'nav.baplieFiles',
        roles: [PORT_STAFF],
      },
      { pageId: 'P-33', path: '/berthing/vessels', labelKey: 'nav.vessels', roles: [PORT_STAFF] },
    ],
  },
  {
    id: 'plans',
    labelKey: 'nav.section.plans',
    items: [
      {
        pageId: 'P-39',
        path: '/plans',
        labelKey: 'nav.plans',
        roles: [PORT_STAFF, PORT_GM],
        readOnlyRoles: [TERMINAL_ADMIN, TERMINAL_OFFICER],
      },
      {
        pageId: 'P-41',
        path: '/plans/deviations',
        labelKey: 'nav.deviations',
        roles: [PORT_STAFF],
      },
    ],
  },
  {
    id: 'pilotage',
    labelKey: 'nav.section.pilotage',
    items: [
      {
        pageId: 'P-43',
        path: '/pilotage/roster',
        labelKey: 'nav.pilotRoster',
        roles: [PILOTAGE_MANAGER],
        readOnlyRoles: [PILOTAGE_OFFICER],
      },
      {
        pageId: 'P-44',
        path: '/pilotage/assignments',
        labelKey: 'nav.pilotageAssignments',
        roles: [PILOTAGE_OFFICER],
      },
    ],
  },
  {
    id: 'tugs',
    labelKey: 'nav.section.tugs',
    items: [
      {
        pageId: 'P-45',
        path: '/tugs/fleet',
        labelKey: 'nav.tugFleet',
        roles: [TUG_MANAGER],
        readOnlyRoles: [TUG_OFFICER],
      },
      {
        pageId: 'P-46',
        path: '/tugs/masters',
        labelKey: 'nav.tugMasters',
        roles: [TUG_MANAGER],
        readOnlyRoles: [TUG_OFFICER],
      },
      {
        pageId: 'P-47',
        path: '/tugs/assignments',
        labelKey: 'nav.tugAssignments',
        roles: [TUG_OFFICER],
      },
    ],
  },
  {
    id: 'terminal',
    labelKey: 'nav.section.terminal',
    items: [
      {
        pageId: 'P-48',
        path: '/terminal/equipment',
        labelKey: 'nav.equipment',
        roles: [TERMINAL_ADMIN],
      },
      { pageId: 'P-49', path: '/terminal/yard', labelKey: 'nav.yard', roles: [TERMINAL_ADMIN] },
      {
        pageId: 'P-50',
        path: '/terminal/yard-recommendations',
        labelKey: 'nav.yardRecommendations',
        roles: [TERMINAL_OFFICER],
      },
    ],
  },
  {
    id: 'safety',
    labelKey: 'nav.section.safety',
    items: [
      {
        pageId: 'P-59',
        path: '/safety/constraints',
        labelKey: 'nav.safetyConstraints',
        roles: [MARINE_SAFETY_OFFICER],
      },
    ],
  },
  {
    id: 'admin',
    labelKey: 'nav.section.admin',
    items: [
      { pageId: 'P-23', path: '/admin/users', labelKey: 'nav.users', roles: [PORT_GM] },
      { pageId: 'P-25', path: '/admin/devices', labelKey: 'nav.devices', roles: [PORT_GM] },
      {
        pageId: 'P-26',
        path: '/admin/port-profile',
        labelKey: 'nav.portProfile',
        roles: [PORT_GM],
      },
      { pageId: 'P-27', path: '/admin/terminals', labelKey: 'nav.terminals', roles: [PORT_GM] },
      { pageId: 'P-28', path: '/admin/berths', labelKey: 'nav.berths', roles: [PORT_GM] },
      { pageId: 'P-29', path: '/admin/audit', labelKey: 'nav.audit', roles: [PORT_GM] },
      { pageId: 'P-30', path: '/admin/ai-models', labelKey: 'nav.aiModels', roles: [PORT_GM] },
      { pageId: 'P-62', path: '/admin/settings', labelKey: 'nav.settings', roles: [PORT_GM] },
    ],
  },
])

// How a role may use a menu page: 'edit', 'read' or null (hidden).
export function accessFor(item, role) {
  if (item.roles.includes(role)) return 'edit'
  if (item.readOnlyRoles?.includes(role)) return 'read'
  return null
}

// The menu one role sees: sections with their visible items, empty sections dropped.
export function navigationFor(role) {
  return NAVIGATION.map((section) => ({
    id: section.id,
    labelKey: section.labelKey,
    items: section.items.flatMap((item) => {
      const access = accessFor(item, role)
      if (!access) return []
      return [
        {
          pageId: item.pageId,
          path: item.path,
          labelKey: item.labelKey,
          readOnly: access === 'read',
        },
      ]
    }),
  })).filter((section) => section.items.length > 0)
}

// Page-level check for the route guard (FE-021): 'edit', 'read' or null.
// Pages that are not in the menu are not covered here.
export function pageAccess(pageId, role) {
  for (const section of NAVIGATION) {
    const item = section.items.find((i) => i.pageId === pageId)
    if (item) return accessFor(item, role)
  }
  return null
}
