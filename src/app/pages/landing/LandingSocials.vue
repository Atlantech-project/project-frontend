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
        class="atl-glass grid size-11 place-items-center rounded-full transition duration-300 hover:-translate-y-0.5"
        :class="
          tone === 'light'
            ? 'text-offwhite/85 hover:bg-gold/85 hover:text-navy'
            : 'bg-navy/90 text-offwhite hover:bg-teal/90'
        "
      >
        <AtlIcon :name="s.name" :size="20" />
      </a>
    </li>
  </ul>
</template>
