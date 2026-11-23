<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQueryClient } from '@tanstack/vue-query'
import AppIcon from '@/components/AppIcon.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlConflictDialog from '@/components/AtlConflictDialog.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlDialog from '@/components/ui/AtlDialog.vue'
import AtlField from '@/components/ui/AtlField.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import AtlStatusBadge from '@/components/ui/AtlStatusBadge.vue'
import { describedBy, inputClasses } from '@/components/ui/inputClasses'
import { errorMessage, fieldMessages } from '@/api/errors'
import { resourceKeys, useResourceItem } from '@/composables/useResource'
import { useSessionStore } from '@/stores/session'
import DeactivateUserDialog from './DeactivateUserDialog.vue'
import { useDeactivate } from './useDeactivate'
import { useUserLabels } from './useUserLabels'
import {
  ASSIGNABLE_ROLES,
  createErrors,
  isRuleConflict,
  needsTerminal,
  roleErrors,
  userActions,
  users,
} from './users'

const i18n = useI18n()
const { t } = i18n
const labels = useUserLabels()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const session = useSessionStore()
const keys = resourceKeys(users.path)

const isNew = computed(() => route.name === 'user-new')
const userId = computed(() => (isNew.value ? null : route.params.id))
const { data: user, isPending, isError, error: loadError, refetch } = useResourceItem(users, userId)

// A user opened from the list shows at once from the list's copy, which has no role history
// (User, not UserDetail): ask the server for the full record then.
watch(
  user,
  (record) => {
    if (record && !('role_history' in record)) refetch()
  },
  { immediate: true },
)

const form = reactive({ name: '', username: '', role: '', terminalId: '', status: 'active' })
const errors = ref({})
const formError = ref('')
const saving = ref(false)

// The form shows the stored user; a reload after a conflict puts the latest one back.
function fill(record) {
  Object.assign(form, {
    name: record?.name ?? '',
    username: record?.username ?? '',
    role: record?.active_role?.role ?? '',
    terminalId: String(record?.active_role?.terminal_id ?? ''),
    status: record && !record.is_active ? 'inactive' : 'active',
  })
  errors.value = {}
  formError.value = ''
}
watch(
  () => user.value?.id,
  () => fill(user.value),
  { immediate: true },
)

// Terminal Scope takes digits only; the browser's number spinner is left out on purpose.
watch(
  () => form.terminalId,
  (value) => {
    const digits = String(value).replace(/\D/g, '')
    if (digits !== value) form.terminalId = digits
  },
)

const isSelf = computed(() => !!user.value && user.value.id === session.user?.id)
const roleChanged = computed(
  () =>
    form.role !== (user.value?.active_role?.role ?? '') ||
    (needsTerminal(form.role) &&
      Number(form.terminalId) !== (user.value?.active_role?.terminal_id ?? null)),
)
const statusChanged = computed(() => (form.status === 'active') !== !!user.value?.is_active)

// 409 VERSION_CONFLICT: someone changed the user first. Reload shows the latest data.
const conflict = ref(false)
const reloading = ref(false)
async function reload() {
  reloading.value = true
  try {
    const latest = await queryClient.fetchQuery({
      queryKey: keys.detail(userId.value),
      queryFn: () => users.get(userId.value),
      staleTime: 0,
    })
    fill(latest)
    conflict.value = false
  } finally {
    reloading.value = false
  }
}

const created = ref(null)
const roleFailed = ref('')

function showError(err) {
  if (err?.isConflict) {
    conflict.value = true
  } else if (isRuleConflict(err)) {
    formError.value = t('users.form.ruleRefused')
  } else if (err?.isValidation) {
    errors.value = fieldMessages(err, i18n)
    formError.value = t('errors.validation_failed')
  } else {
    formError.value = errorMessage(err, i18n)
  }
}

async function createUser() {
  const found = createErrors(form)
  errors.value = Object.fromEntries(Object.entries(found).map(([field, key]) => [field, t(key)]))
  if (Object.keys(found).length) return
  const record = await users.create({
    name: form.name.trim(),
    username: form.username.trim().toLowerCase(),
  })
  // The account exists now; a role that fails is set again from the details page.
  roleFailed.value = ''
  if (form.role) {
    try {
      Object.assign(
        record,
        await userActions.assignRole(record.id, { ...form, version: record.version }),
      )
    } catch (err) {
      roleFailed.value = errorMessage(err, i18n)
    }
  }
  queryClient.invalidateQueries({ queryKey: keys.lists })
  created.value = record
}

async function updateUser() {
  const found = roleErrors(form)
  errors.value = Object.fromEntries(Object.entries(found).map(([field, key]) => [field, t(key)]))
  if (Object.keys(found).length) return
  let version = user.value.version
  let saved = null
  if (roleChanged.value) {
    saved = form.role
      ? await userActions.assignRole(user.value.id, { ...form, version })
      : await userActions.endRole(user.value.id, version)
    version = saved.version
  }
  if (statusChanged.value) {
    saved = await (form.status === 'active' ? userActions.activate : userActions.deactivate)(
      user.value.id,
      version,
    )
  }
  if (saved) queryClient.setQueryData(keys.detail(user.value.id), (old) => ({ ...old, ...saved }))
  await queryClient.invalidateQueries({ queryKey: keys.all })
  router.push({ name: 'users' })
}

async function save() {
  formError.value = ''
  saving.value = true
  try {
    await (isNew.value ? createUser() : updateUser())
  } catch (err) {
    showError(err)
  } finally {
    saving.value = false
  }
}

function finishCreate() {
  const id = created.value.id
  created.value = null
  router.replace({ name: 'user-details', params: { id } })
}

const deactivate = useDeactivate({ onDone: (saved) => fill({ ...user.value, ...saved }) })

const selectClass = (field) => [
  ...inputClasses({ invalid: !!errors.value[field] }),
  'appearance-none pe-8',
]
</script>

<!-- P-24 User Details (FE-045), Figma "P-24 / User Details": create a user (the one-time
     password is shown once), or change an existing user's role and account status. Name and
     username are fixed after creation (decided 2026-11-23). Registered devices come with FE-046. -->
<template>
  <div class="flex flex-col gap-3">
    <nav class="flex flex-col gap-2" :aria-label="t('users.details.breadcrumb')">
      <p class="type-body-m text-fg">{{ t('users.title') }} / {{ t('users.details.title') }}</p>
      <RouterLink :to="{ name: 'users' }" class="type-body-m text-fg-link hover:underline">
        {{ t('users.details.back') }}
      </RouterLink>
    </nav>

    <AtlAlert v-if="deactivate.error.value" tone="danger" live="assertive">
      {{ errorMessage(deactivate.error.value, i18n) }}
    </AtlAlert>

    <AtlLoadingState v-if="!isNew && isPending" />
    <AtlErrorState
      v-else-if="!isNew && isError"
      :title="t('users.details.loadError')"
      :message="errorMessage(loadError, i18n)"
      retryable
      @retry="refetch()"
    />

    <template v-else>
      <div
        class="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-control border border-edge bg-subtle px-4 py-3"
      >
        <p class="type-strong-m text-fg">
          {{
            isNew
              ? t('users.details.newHeading')
              : t('users.details.existingHeading', { name: user.name })
          }}
        </p>
        <AtlStatusBadge v-if="!isNew" :value="labels.status(user)" />
        <span
          v-else
          class="inline-flex h-6 items-center rounded-control border border-status-info-border bg-status-info-bg px-2 type-body-s text-status-info-fg"
        >
          {{ t('users.details.newBadge') }}
        </span>
        <p class="type-caption text-fg-muted">
          {{ isNew ? t('users.details.newHint') : labels.roleLine(user) }}
        </p>
      </div>

      <form
        class="max-w-[784px] overflow-hidden rounded-control border border-edge bg-card"
        novalidate
        @submit.prevent="save"
      >
        <header class="flex items-center justify-between border-b border-edge bg-subtle px-5 py-4">
          <h2 class="type-h3 text-fg">
            {{ t(isNew ? 'users.form.createTitle' : 'users.form.editTitle') }}
          </h2>
          <p class="type-caption text-fg-muted">{{ t('users.form.required') }}</p>
        </header>

        <div class="grid grid-cols-1 gap-x-4 gap-y-5 p-5 md:grid-cols-2">
          <AtlAlert v-if="formError" tone="danger" live="assertive" class="md:col-span-2">
            {{ formError }}
          </AtlAlert>

          <AtlInput
            id="user-name"
            v-model="form.name"
            :label="`${t('users.form.name')} *`"
            :placeholder="t('users.form.namePlaceholder')"
            :error="errors.name"
            :disabled="!isNew"
            :hint="isNew ? '' : t('users.form.fixed')"
            autocomplete="off"
            maxlength="120"
          />
          <AtlInput
            id="user-username"
            v-model="form.username"
            :label="`${t('users.form.username')} *`"
            :placeholder="t('users.form.usernamePlaceholder')"
            :error="errors.username"
            :disabled="!isNew"
            :hint="isNew ? t('users.form.usernameHint') : t('users.form.fixed')"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            maxlength="50"
          />

          <AtlField
            v-if="!isNew"
            id="user-status"
            :label="`${t('users.form.status')} *`"
            :hint="isSelf ? t('users.form.selfHint') : ''"
          >
            <div class="relative">
              <select
                id="user-status"
                v-model="form.status"
                :class="selectClass('status')"
                :disabled="isSelf"
                :aria-describedby="
                  describedBy('user-status', { hint: isSelf ? t('users.form.selfHint') : '' })
                "
              >
                <option value="active">{{ t('status.ACTIVE') }}</option>
                <option value="inactive">{{ t('status.INACTIVE') }}</option>
              </select>
              <AtlIcon
                name="chevron"
                :size="16"
                class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-fg-muted"
              />
            </div>
          </AtlField>

          <AtlField
            id="user-role"
            :label="t('users.form.role')"
            :hint="t('users.form.roleHint')"
            :error="errors.role"
          >
            <div class="relative">
              <select
                id="user-role"
                v-model="form.role"
                :class="selectClass('role')"
                :aria-describedby="
                  describedBy('user-role', { error: errors.role, hint: t('users.form.roleHint') })
                "
              >
                <option value="">
                  {{ t(isNew ? 'users.form.rolePlaceholder' : 'users.noRole') }}
                </option>
                <option v-for="code in ASSIGNABLE_ROLES" :key="code" :value="code">
                  {{ labels.role(code) }}
                </option>
              </select>
              <AtlIcon
                name="chevron"
                :size="16"
                class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-fg-muted"
              />
            </div>
          </AtlField>

          <div v-if="needsTerminal(form.role)" class="md:col-span-2">
            <AtlInput
              id="user-terminal"
              v-model="form.terminalId"
              inputmode="numeric"
              autocomplete="off"
              maxlength="9"
              :label="`${t('users.form.terminal')} *`"
              :hint="t('users.form.terminalHint')"
              :error="errors.terminal_id"
            />
          </div>
          <p v-else class="type-caption text-fg-muted md:col-span-2">
            {{ t('users.form.terminalAppears') }}
          </p>
        </div>

        <footer class="flex flex-wrap items-center gap-3 border-t border-edge bg-subtle px-5 py-4">
          <AtlButton type="submit" :loading="saving">
            <AppIcon name="save" />
            {{ t('users.form.save') }}
          </AtlButton>
          <RouterLink
            :to="{ name: 'users' }"
            class="inline-flex h-control items-center rounded-control border border-edge-strong bg-card px-4 type-strong-m text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
          >
            {{ t('users.form.cancel') }}
          </RouterLink>
          <AtlButton
            v-if="!isNew && user.is_active"
            variant="secondary"
            class="ms-auto"
            @click="deactivate.ask(user)"
          >
            <AppIcon name="ban" />
            {{ t('users.table.deactivate') }}
          </AtlButton>
        </footer>
      </form>

      <section
        v-if="!isNew && user.role_history?.length"
        class="max-w-[784px] overflow-hidden rounded-control border border-edge bg-card"
      >
        <header class="px-4 py-3">
          <h2 class="type-strong-m text-fg">{{ t('users.history.title') }}</h2>
        </header>
        <table class="w-full text-start">
          <thead class="border-y border-edge bg-subtle">
            <tr class="h-10">
              <th
                v-for="column in ['role', 'terminal', 'from', 'to']"
                :key="column"
                scope="col"
                class="px-4 text-start type-strong-s text-fg"
              >
                {{ t(`users.history.${column}`) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in user.role_history"
              :key="`${entry.role}-${entry.active_from}`"
              class="h-11 border-b border-edge last:border-0"
            >
              <td class="px-4 type-body-s text-fg">{{ labels.role(entry.role) }}</td>
              <td class="px-4 type-body-s text-fg">{{ labels.terminal(entry.terminal_id) }}</td>
              <td class="px-4 type-body-s text-fg">{{ labels.date(entry.active_from) }}</td>
              <td class="px-4 type-body-s text-fg">
                {{ entry.active_to ? labels.date(entry.active_to) : t('users.history.current') }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <AtlDialog :visible="!!created" :title="t('users.created.title')" :closable="false">
      <template v-if="created">
        <div class="flex flex-col border border-edge bg-subtle px-3 py-2.5 type-strong-m">
          <span>{{ created.name }} · {{ created.username }}</span>
          <span>{{ labels.roleLine(created) }}</span>
        </div>
        <p>
          {{ t('users.created.password') }}
          <code
            class="rounded-control bg-subtle px-1.5 py-0.5 font-mono type-strong-m"
            data-testid="one-time-password"
            >{{ created.one_time_password }}</code
          >
        </p>
        <p>{{ t('users.created.hint') }}</p>
        <AtlAlert v-if="roleFailed" tone="warning" :title="t('users.created.roleFailed')">
          {{ roleFailed }}
        </AtlAlert>
      </template>
      <template #footer>
        <AtlButton :label="t('users.created.done')" @click="finishCreate" />
      </template>
    </AtlDialog>

    <AtlConflictDialog
      v-model:visible="conflict"
      :subject="t('users.subject')"
      :reloading="reloading"
      @reload="reload"
    >
      <template v-if="user">{{ user.name }} · {{ user.username }}</template>
    </AtlConflictDialog>

    <DeactivateUserDialog
      v-model:visible="deactivate.open.value"
      :user="deactivate.target.value"
      :refused="deactivate.refused.value"
      :busy="deactivate.busy.value"
      @confirm="deactivate.confirm()"
    />
  </div>
</template>
