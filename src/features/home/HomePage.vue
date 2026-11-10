<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { navigationFor } from '@/app/navigation'
import { useRoleName } from '@/app/useRoleName'
import { useSessionStore } from '@/stores/session'
import HomePanel from './HomePanel.vue'
import { SUMMARY_CARDS, shortcutsFor } from './widgets'

const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()
const roleName = useRoleName()

// Users tied to terminals see their terminals only; everyone else sees the whole port.
const terminalScoped = computed(() => (session.user?.terminal_ids?.length ?? 0) > 0)

const shortcuts = computed(() =>
  shortcutsFor(navigationFor(session.role), (path) => router.resolve(path).name !== 'not-found'),
)
</script>

<!-- P-17 Home Dashboard (FE-040), Figma "P-17 / Home Dashboard": the frame and the first
     widgets. Numbers, notifications (P-19) and live updates (SSE, FE-033) fill in as their
     features arrive; until then each widget says it has nothing yet. -->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div class="flex flex-col gap-1">
        <p class="type-strong-m text-fg">
          {{ t(terminalScoped ? 'home.scope.terminal' : 'home.scope.port') }}
        </p>
        <p class="type-caption text-fg-muted">
          {{ t('home.scope.user', { name: session.user?.name ?? '', role: roleName }) }}
        </p>
      </div>
      <div class="flex flex-col gap-1 text-end">
        <p class="type-strong-xs text-fg">{{ t('home.live.title') }}</p>
        <p class="type-caption text-fg-muted">{{ t('home.live.notConnected') }}</p>
      </div>
    </div>

    <ul class="grid grid-cols-2 gap-4 xl:grid-cols-4" :aria-label="t('home.summary.label')">
      <li
        v-for="card in SUMMARY_CARDS"
        :key="card.id"
        class="flex min-h-[126px] flex-col gap-2 rounded-control border border-edge bg-subtle p-4"
      >
        <h2 class="type-strong-m text-fg">{{ t(card.titleKey) }}</h2>
        <p class="flex items-center gap-3">
          <span class="text-[28px] leading-none text-fg" aria-hidden="true">—</span>
          <span class="type-caption text-fg-muted">{{ t('home.summary.noData') }}</span>
        </p>
        <p class="mt-auto type-caption text-fg-muted">{{ t(card.noteKey) }}</p>
      </li>
    </ul>

    <div class="grid gap-6 lg:grid-cols-2">
      <HomePanel :title="t('home.notifications.title')">
        <p class="border-t border-edge px-5 py-6 type-body-m text-fg-muted">
          {{ t('home.notifications.empty') }}
        </p>
      </HomePanel>
      <HomePanel :title="t('home.updates.title')">
        <p class="border-t border-edge px-5 py-6 type-body-m text-fg-muted">
          {{ t('home.updates.empty') }}
        </p>
      </HomePanel>
    </div>

    <HomePanel :title="t('home.actions.title')">
      <ul v-if="shortcuts.length" class="grid gap-4 px-5 pb-4 sm:grid-cols-3">
        <li v-for="item in shortcuts" :key="item.pageId">
          <RouterLink
            :to="item.path"
            class="flex h-9 items-center justify-center gap-1.5 rounded-control border border-edge-strong bg-card px-3 type-label-m text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
          >
            <AtlIcon name="eye" :size="16" />
            {{ t('home.actions.view', { page: t(item.labelKey) }) }}
          </RouterLink>
        </li>
      </ul>
      <p v-else class="border-t border-edge px-5 py-6 type-body-m text-fg-muted">
        {{ t('home.actions.empty') }}
      </p>
    </HomePanel>
  </div>
</template>
