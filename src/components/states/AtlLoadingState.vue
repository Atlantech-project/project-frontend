<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlWave from '@/components/AtlWave.vue'

defineProps({
  message: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<!-- The ATLANTECH symbol rides a moving wave while something loads. -->
<template>
  <div
    role="status"
    aria-live="polite"
    class="grid justify-items-center gap-3 px-4 py-12 text-center"
  >
    <div class="atl-loader">
      <div class="atl-loader__ship">
        <AtlantechLogo shape="symbol" :height="56" :card-on-dark="false" />
      </div>
      <AtlWave animated class="atl-loader__wave" />
    </div>
    <p class="text-muted">{{ message || t('states.loading') }}</p>
  </div>
</template>

<style scoped>
.atl-loader {
  display: grid;
  justify-items: center;
  width: 120px;
}

.atl-loader__ship {
  margin-bottom: -10px;
  animation: atl-bob 2.4s ease-in-out infinite;
  transform-origin: 50% 90%;
}

.atl-loader__wave {
  height: 18px;
  border-radius: 0 0 var(--atl-radius-sm) var(--atl-radius-sm);
  overflow: hidden;
}

@keyframes atl-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-6px) rotate(3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-loader__ship {
    animation: none;
  }
}
</style>
