import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'

// The signed-in user's role as a readable name; the role code if it has no translation.
export function useRoleName() {
  const { t, te } = useI18n()
  const session = useSessionStore()
  return computed(() => {
    const key = `roles.${session.role}`
    return te(key) ? t(key) : (session.role ?? '')
  })
}
