// Saving with the version token (CT-01) and its 409 answer (FE-032): another user changed the
// record first. Nothing was saved, so the user is told (AtlConflictDialog) instead of losing
// the change silently. Reload puts the server's current record in the cache and hands it to
// the form; Cancel leaves the user's edits as they are.
import { computed, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { resourceKeys, useResourceSave } from './useResource'

export function useConflictSave(resource, { onReload } = {}) {
  const queryClient = useQueryClient()
  const keys = resourceKeys(resource.path)
  const save = useResourceSave(resource)
  const conflict = ref(null)
  const reloading = ref(false)

  // Resolves to the saved record, or null when the save hit a conflict. Other errors throw.
  async function submit(variables) {
    try {
      return await save.mutateAsync(variables)
    } catch (error) {
      if (!error?.isConflict) throw error
      conflict.value = { id: variables.id, current: error.current ?? null }
      return null
    }
  }

  async function reload() {
    const { id, current } = conflict.value
    reloading.value = true
    try {
      // The 409 answer usually carries the current record; otherwise ask for it.
      const latest =
        current ??
        (await queryClient.fetchQuery({
          queryKey: keys.detail(id),
          queryFn: () => resource.get(id),
          staleTime: 0,
        }))
      queryClient.setQueryData(keys.detail(id), latest)
      queryClient.invalidateQueries({ queryKey: keys.lists })
      conflict.value = null
      onReload?.(latest)
      return latest
    } finally {
      reloading.value = false
    }
  }

  function dismiss() {
    conflict.value = null
  }

  return {
    submit,
    reload,
    dismiss,
    conflict,
    reloading,
    hasConflict: computed({
      get: () => conflict.value !== null,
      set: (open) => {
        if (!open) dismiss()
      },
    }),
    isPending: save.isPending,
  }
}
