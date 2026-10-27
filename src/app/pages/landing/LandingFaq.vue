<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const questions = ['accounts', 'offline', 'languages', 'data', 'decisions']
</script>

<template>
  <section id="faq" class="scroll-mt-16 bg-bg px-4 py-24 sm:py-28">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.6fr]">
      <h2
        class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl"
      >
        {{ t('landing.faq.title') }}
      </h2>
      <div class="grid gap-3">
        <details
          v-for="(q, i) in questions"
          :key="q"
          class="atl-faq group rounded-[var(--atl-radius)] border border-line bg-surface px-5"
          :open="i === 0"
        >
          <summary
            class="flex cursor-pointer list-none items-center gap-4 py-4 font-display text-lg font-semibold text-text"
          >
            {{ t(`landing.faq.items.${q}.q`) }}
            <span
              class="ms-auto grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-teal transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M7 1v12M1 7h12" />
              </svg>
            </span>
          </summary>
          <p class="max-w-2xl pb-5 text-muted">{{ t(`landing.faq.items.${q}.a`) }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-faq summary::-webkit-details-marker {
  display: none;
}

.atl-faq summary:focus-visible {
  outline: 2px solid var(--atl-focus);
  outline-offset: 4px;
  border-radius: var(--atl-radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  .atl-faq summary span {
    transition: none;
  }
}
</style>
