<script setup>
import AtlIcon from '@/components/AtlIcon.vue'
import { socials } from './contact'

defineProps({
  // 'light' on navy backgrounds, 'dark' on light ones.
  tone: { type: String, default: 'light' },
})
</script>

<template>
  <ul class="flex flex-wrap gap-3">
    <li v-for="s in socials" :key="s.name">
      <a
        :href="s.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="s.label"
        class="grid size-11 place-items-center rounded-full transition-colors"
        :class="
          tone === 'light'
            ? 'bg-offwhite/10 text-offwhite hover:bg-gold hover:text-navy'
            : 'bg-navy text-offwhite hover:bg-teal'
        "
      >
        <AtlIcon :name="s.name" :size="20" />
      </a>
    </li>
  </ul>
</template>
