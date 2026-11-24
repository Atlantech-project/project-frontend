import { useI18n } from 'vue-i18n'

// Readable text for users: role names, terminal and the "role · terminal" line.
export function useUserLabels() {
  const { t, te, locale } = useI18n()

  const role = (code) => {
    if (!code) return t('users.noRole')
    return te(`roles.${code}`) ? t(`roles.${code}`) : code
  }

  // No terminals API yet (decided 2026-11-23), so a terminal shows by its number.
  const terminal = (id) => (id == null ? '—' : t('users.terminalNumber', { id }))

  const roleLine = (user) => {
    const active = user?.active_role
    if (!active) return t('users.noRole')
    return active.terminal_id == null
      ? role(active.role)
      : `${role(active.role)} · ${terminal(active.terminal_id)}`
  }

  const status = (user) => (user?.is_active ? 'ACTIVE' : 'INACTIVE')

  function date(iso) {
    if (!iso) return '—'
    const value = new Date(iso)
    if (Number.isNaN(value.getTime())) return iso
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(value)
  }

  return { role, terminal, roleLine, status, date }
}
