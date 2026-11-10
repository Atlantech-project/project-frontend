<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<!-- A titled card of the Home Dashboard (Figma "Latest Notifications", "Quick Actions"). -->
<template>
  <section class="flex flex-col rounded-control border border-edge bg-card">
    <header class="flex items-center justify-between gap-3 px-5 py-3.5">
      <h2 class="type-h3 text-fg">{{ title }}</h2>
      <p v-if="note" class="type-caption text-fg-muted">{{ note }}</p>
    </header>
    <slot />
  </section>
</template>
