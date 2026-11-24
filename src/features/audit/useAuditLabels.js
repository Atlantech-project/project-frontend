import { useI18n } from 'vue-i18n'
import { fieldChanges, humanize } from './audit'

// Readable text for audit rows: entity, action, time and a one-line summary.
export function useAuditLabels() {
  const { t, te, locale } = useI18n()

  const entityType = (type) =>
    te(`audit.entities.${type}`) ? t(`audit.entities.${type}`) : humanize(type)
  const entity = (entry) =>
    entry.entity_id == null
      ? entityType(entry.entity_type)
      : `${entityType(entry.entity_type)} #${entry.entity_id}`
  const action = (code) =>
    te(`audit.actions.${code}`) ? t(`audit.actions.${code}`) : humanize(code.toLowerCase())
  const actor = (entry) => entry.actor?.name ?? t('audit.system')

  // Audit times are shown in UTC, as in Figma ("Time (UTC)").
  function time(iso, { year = false } = {}) {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      ...(year ? { year: 'numeric' } : {}),
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(date)
  }

  // One line for the table: the refusal reason, or the first changed field and how many more.
  function summary(entry) {
    if (entry.action === 'REJECTED_ATTEMPT') {
      return entry.after_state?.reason ?? entry.after_state?.code ?? t('audit.summary.rejected')
    }
    const changes = fieldChanges(entry)
    if (!changes.length) return '—'
    if (entry.action === 'CREATE' || entry.action === 'DELETE') {
      return t('audit.summary.fields', changes.length)
    }
    const [first, ...rest] = changes
    const line = `${humanize(first.field)}: ${first.before} → ${first.after}`
    return rest.length ? t('audit.summary.more', { change: line, count: rest.length }) : line
  }

  return { entityType, entity, action, actor, time, summary }
}
