<script setup>
import { ref } from 'vue'
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import AtlPasswordInput from '@/components/ui/AtlPasswordInput.vue'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlConflictDialog from '@/components/AtlConflictDialog.vue'

const username = ref('n.hassan')
const password = ref('temporary-pass1')
const conflictOpen = ref(false)
</script>

<!-- Dev-only page (/dev/states) to check the shared screen states and form components on brand,
     in both languages. -->
<template>
  <div class="mx-auto grid max-w-5xl gap-8 px-4 py-8">
    <section class="grid gap-4 md:grid-cols-3">
      <div class="rounded-card border border-edge bg-card">
        <AtlLoadingState />
      </div>
      <div class="rounded-card border border-edge bg-card">
        <AtlEmptyState />
      </div>
      <div class="rounded-card border border-edge bg-card">
        <AtlErrorState retryable />
      </div>
    </section>

    <section class="grid gap-6 rounded-card border border-edge bg-card p-8 md:grid-cols-2">
      <div class="grid content-start gap-5">
        <h2 class="type-h3 text-fg">Buttons</h2>
        <AtlButton label="Sign In" size="lg" block />
        <AtlButton label="Signing in" size="lg" block loading />
        <div class="flex flex-wrap gap-2">
          <AtlButton label="Primary" />
          <AtlButton label="Secondary" variant="secondary" />
          <AtlButton label="Ghost" variant="ghost" />
          <AtlButton label="Danger" variant="danger" />
          <AtlButton label="Disabled" disabled />
        </div>
      </div>
      <div class="grid content-start gap-5">
        <h2 class="type-h3 text-fg">Fields</h2>
        <AtlInput v-model="username" label="Username" size="lg" autocomplete="username" />
        <AtlPasswordInput v-model="password" label="Password" size="lg" />
        <AtlPasswordInput
          label="New password"
          size="lg"
          placeholder="At least 8 characters"
          error="Use at least 8 characters with letters and numbers."
        />
      </div>
      <div class="grid content-start gap-3 md:col-span-2">
        <h2 class="type-h3 text-fg">Messages</h2>
        <AtlAlert title="Username or password is incorrect." live="assertive">
          Check your port-local credentials and try again.
        </AtlAlert>
        <AtlAlert tone="info" title="Your session expired.">Sign in again to continue.</AtlAlert>
        <AtlAlert tone="warning" title="Read-only licence.">
          You can view data but not change it.
        </AtlAlert>
        <AtlAlert tone="danger" title="This account is disabled.">
          Contact your port administrator.
        </AtlAlert>
      </div>
      <div class="grid content-start gap-3 md:col-span-2">
        <h2 class="type-h3 text-fg">Record changed (409)</h2>
        <AtlButton
          label="Open dialog"
          variant="secondary"
          class="self-start"
          @click="conflictOpen = true"
        />
        <AtlConflictDialog
          v-model:visible="conflictOpen"
          subject="user"
          @reload="conflictOpen = false"
        >
          Omar Hassan · omar.hassan<br />CT Operations Supervisor · Terminal A
        </AtlConflictDialog>
      </div>
    </section>
  </div>
</template>
