<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// A number that counts up quickly from zero the first time it scrolls into view.
const props = defineProps({
  value: { type: Number, required: true },
  prefix: { type: String, default: '' },
  duration: { type: Number, default: 1400 },
  delay: { type: Number, default: 0 },
})

const el = ref(null)
const shown = ref(props.value)
let observer = null
let frame = 0
let timer = 0

function count() {
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / props.duration)
    // Fast at first, settling onto the final value.
    shown.value = Math.round(props.value * (1 - Math.pow(1 - t, 3)))
    frame = t < 1 ? requestAnimationFrame(step) : 0
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  const reduced = matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (typeof IntersectionObserver === 'undefined' || reduced) return
  shown.value = 0
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      timer = setTimeout(count, props.delay)
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  observer.observe(el.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(timer)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="el" class="tabular-nums">
    <span class="sr-only">{{ prefix }}{{ value }}</span>
    <span aria-hidden="true">{{ prefix }}{{ shown }}</span>
  </span>
</template>
