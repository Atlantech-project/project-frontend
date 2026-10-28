<script setup>
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
</script>

<!-- Dev-only page (/dev/states) to check the shared screen states on brand, in both languages. -->
<template>
  <section class="mx-auto grid max-w-5xl gap-4 px-4 py-8 md:grid-cols-3">
    <div class="rounded-[var(--atl-radius)] border border-line bg-surface">
      <AtlLoadingState />
    </div>
    <div class="rounded-[var(--atl-radius)] border border-line bg-surface">
      <AtlEmptyState />
    </div>
    <div class="rounded-[var(--atl-radius)] border border-line bg-surface">
      <AtlErrorState retryable />
    </div>
  </section>
</template>
