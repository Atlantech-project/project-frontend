import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import AtlButton from './AtlButton.vue'
import AtlInput from './AtlInput.vue'
import AtlPasswordInput from './AtlPasswordInput.vue'
import AtlAlert from './AtlAlert.vue'

const opts = { global: { plugins: [i18n, [PrimeVue, { unstyled: true }]] } }

describe('AtlButton', () => {
  it('renders its label and emits click', async () => {
    const w = mount(AtlButton, { ...opts, props: { label: 'Sign In' } })
    expect(w.text()).toContain('Sign In')
    expect(w.attributes('type')).toBe('button')
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('is disabled and busy while loading', () => {
    const w = mount(AtlButton, {
      ...opts,
      props: { label: 'Sign In', loading: true, type: 'submit' },
    })
    expect(w.attributes('disabled')).toBeDefined()
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.attributes('type')).toBe('submit')
  })
})

describe('AtlInput', () => {
  it('links the label to the input and updates v-model', async () => {
    const w = mount(AtlInput, {
      ...opts,
      props: {
        label: 'Username',
        modelValue: '',
        'onUpdate:modelValue': (v) => w.setProps({ modelValue: v }),
      },
      attrs: { autocomplete: 'username' },
    })
    const input = w.find('input')
    expect(w.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('autocomplete')).toBe('username')
    await input.setValue('port.gm')
    expect(w.props('modelValue')).toBe('port.gm')
  })

  it('shows the error and marks the input invalid', () => {
    const w = mount(AtlInput, { ...opts, props: { id: 'u', label: 'Username', error: 'Required' } })
    const input = w.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('u-error')
    expect(w.find('#u-error').text()).toBe('Required')
  })
})

describe('AtlPasswordInput', () => {
  it('hides the password until the eye button is pressed', async () => {
    const w = mount(AtlPasswordInput, { ...opts, props: { label: 'Password' } })
    const toggle = w.find('button')
    expect(w.find('input').attributes('type')).toBe('password')
    expect(toggle.attributes('aria-label')).toBe(en.form.showPassword)
    await toggle.trigger('click')
    expect(w.find('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(toggle.attributes('aria-label')).toBe(en.form.hidePassword)
  })
})

describe('AtlAlert', () => {
  it('shows title and body, and is an alert when assertive', () => {
    const w = mount(AtlAlert, {
      props: { title: 'Username or password is incorrect.', live: 'assertive' },
      slots: { default: 'Check your credentials.' },
    })
    expect(w.attributes('role')).toBe('alert')
    expect(w.text()).toContain('Username or password is incorrect.')
    expect(w.text()).toContain('Check your credentials.')
  })

  it('is a polite status by default', () => {
    expect(mount(AtlAlert, { props: { title: 'Saved' } }).attributes('role')).toBe('status')
  })
})
