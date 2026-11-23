import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { resourceKeys } from '@/composables/useResource'
import { isRuleConflict, userActions, users } from './users'

// The deactivate flow of P-23 and P-24: ask, send with the version token, and tell the user
// when the server refuses (yourself, the last active Port Admin) or the record changed.
export function useDeactivate({ onDone } = {}) {
  const queryClient = useQueryClient()
  const keys = resourceKeys(users.path)
  const target = ref(null)
  const open = ref(false)
  const refused = ref(false)
  const busy = ref(false)
  const error = ref(null)

  function ask(user) {
    target.value = user
    refused.value = false
    error.value = null
    open.value = true
  }

  async function confirm() {
    busy.value = true
    error.value = null
    try {
      const saved = await userActions.deactivate(target.value.id, target.value.version)
      queryClient.setQueryData(keys.detail(saved.id), (old) => ({ ...old, ...saved }))
      open.value = false
      onDone?.(saved)
    } catch (err) {
      if (isRuleConflict(err)) {
        refused.value = true
      } else {
        // A stale version or any other failure: the dialog closes and the page says why.
        open.value = false
        error.value = err
      }
    } finally {
      busy.value = false
      queryClient.invalidateQueries({ queryKey: keys.all })
    }
  }

  return { target, open, refused, busy, error, ask, confirm }
}
