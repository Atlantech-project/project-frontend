<script setup>
import { useI18n } from 'vue-i18n'
import mark from '@/brand/logos/atlantech-symbol-mono-white.png'

defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<!-- Shown when a list or page has nothing to show. Actions go in the default slot. -->
<template>
  <div class="grid justify-items-center gap-3 px-4 py-12 text-center">
    <slot name="icon">
      <!-- The ATLANTECH symbol as a quiet, single-colour silhouette -->
      <span class="atl-empty__mark" :style="{ '--atl-mark': `url(${mark})` }" aria-hidden="true" />
    </slot>
    <h2 class="font-display text-lg font-semibold text-text">
      {{ title || t('states.emptyTitle') }}
    </h2>
    <p class="max-w-md text-muted">{{ message || t('states.emptyBody') }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* The logo's shape used as a mask, filled with the muted text colour so it follows the theme. */
.atl-empty__mark {
  display: block;
  width: 120px;
  aspect-ratio: 640 / 489;
  background: var(--atl-text-muted);
  opacity: 0.35;
  mask: var(--atl-mark) center / contain no-repeat;
}
</style>
