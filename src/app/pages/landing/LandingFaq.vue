<script setup>
import { useI18n } from 'vue-i18n'
import { vReveal } from './reveal'

const { t } = useI18n()

const questions = ['accounts', 'offline', 'languages', 'data', 'decisions']
</script>

<template>
  <section id="faq" class="scroll-mt-16 bg-bg px-4 py-24 sm:py-28">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.7fr]">
      <h2
        v-reveal:line
        class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl"
      >
        {{ t('landing.faq.title') }}
      </h2>
      <div class="grid gap-3">
        <details
          v-for="(q, i) in questions"
          :key="q"
          v-reveal="i"
          class="atl-faq group rounded-[var(--atl-radius-lg)] bg-surface px-6"
          :open="i === 0"
        >
          <summary
            class="flex cursor-pointer list-none items-center gap-6 py-6 font-display text-lg font-semibold text-text"
          >
            <span class="flex-1">{{ t(`landing.faq.items.${q}.q`) }}</span>
            <span
              class="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 text-teal transition-colors group-open:bg-teal group-open:text-offwhite"
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
                <path d="M1 7h12" />
                <path class="atl-faq__bar" d="M7 1v12" />
              </svg>
            </span>
          </summary>
          <p class="pe-10 pb-6 leading-relaxed text-text">
            {{ t(`landing.faq.items.${q}.a`) }}
          </p>
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

/* The plus turns into a minus when the answer is open. */
.atl-faq__bar {
  transform-origin: center;
  transition: transform 0.25s;
}

.atl-faq[open] .atl-faq__bar {
  transform: scaleY(0);
}

/* Answers slide open where the browser can animate to auto height. */
.atl-faq {
  interpolate-size: allow-keywords;
}

.atl-faq::details-content {
  block-size: 0;
  overflow: clip;
  transition:
    block-size 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    content-visibility 0.5s allow-discrete;
}

.atl-faq[open]::details-content {
  block-size: auto;
}

@media (prefers-reduced-motion: reduce) {
  .atl-faq__bar,
  .atl-faq::details-content {
    transition: none;
  }
}
</style>
