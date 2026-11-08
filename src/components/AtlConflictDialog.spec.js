import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import AtlConflictDialog from './AtlConflictDialog.vue'

async function mountDialog(props = {}) {
  const w = mount(AtlConflictDialog, {
    props: { visible: true, ...props },
    slots: { default: 'Omar Hassan · omar.hassan' },
    global: { plugins: [i18n, [PrimeVue, { unstyled: true }]] },
    attachTo: document.body,
  })
  await flushPromises()
  return w
}
// The dialog is teleported to <body>.
const page = () => document.body.textContent
const button = (label) =>
  [...document.body.querySelectorAll('button')].find((b) => b.textContent.trim() === label)

describe('AtlConflictDialog', () => {
  it('says nothing was saved and shows the record', async () => {
    const w = await mountDialog({ subject: 'user' })
    expect(page()).toContain('This user was changed by someone else')
    expect(page()).toContain(en.conflict.body)
    expect(page()).toContain('Omar Hassan')
    w.unmount()
  })

  it('Reload asks the page to reload; Cancel closes', async () => {
    const w = await mountDialog()
    button(en.conflict.reload).click()
    expect(w.emitted('reload')).toHaveLength(1)
    button(en.conflict.cancel).click()
    expect(w.emitted('cancel')).toHaveLength(1)
    expect(w.emitted('update:visible')[0]).toEqual([false])
    w.unmount()
  })
})
