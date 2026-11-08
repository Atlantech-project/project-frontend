import { describe, it, expect } from 'vitest'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import ar from '@/i18n/ar.json'
import { ApiError, NETWORK_ERROR, errorMessage, fieldMessages, toApiError } from './errors'

const { t, te } = i18n.global
const problem = (status, data) => ({ response: { status, data } })

describe('toApiError', () => {
  it('reads an RFC 9457 problem', () => {
    const err = toApiError(
      problem(403, {
        type: 'https://atlantech.io/errors/account-disabled',
        title: 'Account disabled',
        status: 403,
        code: 'ACCOUNT_DISABLED',
        message_key: 'errors.account_disabled',
        detail: 'This account is disabled.',
      }),
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({
      status: 403,
      code: 'ACCOUNT_DISABLED',
      messageKey: 'errors.account_disabled',
    })
  })

  it('keeps 422 field errors and 409 current version', () => {
    const v = toApiError(
      problem(422, {
        code: 'VALIDATION_FAILED',
        message_key: 'errors.validation_failed',
        errors: { username: ['validation.required'] },
      }),
    )
    expect(v.isValidation).toBe(true)
    expect(v.fieldErrors).toEqual({ username: ['validation.required'] })

    const c = toApiError(
      problem(409, {
        code: 'VERSION_CONFLICT',
        message_key: 'errors.version_conflict',
        current: { id: 7, version: '2026-11-08T10:00:00.000000Z' },
      }),
    )
    expect(c.isConflict).toBe(true)
    expect(c.current).toEqual({ id: 7, version: '2026-11-08T10:00:00.000000Z' })
  })

  it('guesses the code from the status when the body is not a problem', () => {
    expect(toApiError(problem(429, '<html>')).code).toBe('TOO_MANY_ATTEMPTS')
    expect(toApiError(problem(502, null)).code).toBe('SERVER_ERROR')
  })

  it('treats no response as a network error', () => {
    const err = toApiError(new Error('Network Error'))
    expect(err.code).toBe(NETWORK_ERROR)
    expect(err.isNetwork).toBe(true)
  })
})

describe('messages', () => {
  it('translates by message_key, then by code, then generic', () => {
    expect(errorMessage(new ApiError({ code: 'ACCOUNT_DISABLED' }), { t, te })).toBe(
      en.errors.account_disabled,
    )
    expect(
      errorMessage(new ApiError({ code: 'FORBIDDEN', messageKey: 'errors.unknown.thing' }), {
        t,
        te,
      }),
    ).toBe(en.errors.forbidden)
    expect(errorMessage(new ApiError({ code: 'NEW_CODE' }), { t, te })).toBe(en.errors.server_error)
  })

  it('has every API error code in English and Arabic', () => {
    const codes = [
      'VALIDATION_FAILED',
      'VERSION_CONFLICT',
      'UNAUTHENTICATED',
      'SESSION_EXPIRED',
      'FORBIDDEN',
      'NOT_FOUND',
      'METHOD_NOT_ALLOWED',
      'ACCOUNT_DISABLED',
      'PASSWORD_CHANGE_REQUIRED',
      'DEVICE_REVOKED',
      'APP_UPDATE_REQUIRED',
      'LICENSE_READ_ONLY',
      'PLAN_LIMIT_EXCEEDED',
      'TOO_MANY_ATTEMPTS',
      'IDEMPOTENCY_KEY_REUSED',
      'SERVICE_UNAVAILABLE',
      'SERVER_ERROR',
      'BAD_REQUEST',
      NETWORK_ERROR,
    ]
    for (const code of codes) {
      expect(en.errors[code.toLowerCase()], code).toBeTruthy()
      expect(ar.errors[code.toLowerCase()], code).toBeTruthy()
    }
  })

  it('turns 422 rules into field messages', () => {
    const err = new ApiError({
      code: 'VALIDATION_FAILED',
      fieldErrors: { new_password: ['validation.password'], other: ['validation.something_new'] },
    })
    expect(fieldMessages(err, { t, te })).toEqual({
      new_password: en.validation.password,
      other: en.validation.invalid,
    })
  })
})
