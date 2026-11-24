// API errors (FE-030). The backend answers every error as RFC 9457 problem+json with a stable
// `code` and a `message_key` (DEC-57). We turn every failure, including no network, into an
// ApiError so pages only ever deal with one shape.

// Used when the body is missing or isn't a problem (proxy page, gateway timeout ...).
const CODE_BY_STATUS = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'VERSION_CONFLICT',
  419: 'SESSION_EXPIRED',
  422: 'VALIDATION_FAILED',
  423: 'LICENSE_READ_ONLY',
  426: 'APP_UPDATE_REQUIRED',
  429: 'TOO_MANY_ATTEMPTS',
  503: 'SERVICE_UNAVAILABLE',
}

// The request never got an answer (offline, server down, CORS).
export const NETWORK_ERROR = 'NETWORK_ERROR'

// VERSION_CONFLICT -> errors.version_conflict
export const messageKeyFor = (code) => `errors.${code.toLowerCase()}`

export class ApiError extends Error {
  constructor({
    status = 0,
    code,
    messageKey,
    title = '',
    detail = '',
    fieldErrors = {},
    current = null,
    problem = null,
  }) {
    super(detail || title || code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.messageKey = messageKey || messageKeyFor(code)
    this.title = title
    this.detail = detail
    // 422: { field: ['validation.required', ...] }
    this.fieldErrors = fieldErrors
    // 409: the stored record's { id, version }, so the page can reload it
    this.current = current
    this.problem = problem
  }

  get isConflict() {
    return this.code === 'VERSION_CONFLICT'
  }

  get isValidation() {
    return this.code === 'VALIDATION_FAILED'
  }

  get isNetwork() {
    return this.code === NETWORK_ERROR
  }
}

function isProblem(data) {
  return !!data && typeof data === 'object' && typeof data.code === 'string'
}

// Any error thrown by axios (or anything else) -> ApiError.
export function toApiError(error) {
  if (error instanceof ApiError) return error

  const response = error?.response
  if (!response) return new ApiError({ code: NETWORK_ERROR, detail: error?.message ?? '' })

  const { status, data } = response
  if (isProblem(data)) {
    return new ApiError({
      status,
      code: data.code,
      messageKey: data.message_key,
      title: data.title ?? '',
      detail: data.detail ?? '',
      fieldErrors: data.errors ?? {},
      current: data.current ?? null,
      problem: data,
    })
  }

  const code = CODE_BY_STATUS[status] ?? 'SERVER_ERROR'
  return new ApiError({ status, code })
}

// Text to show the user, in the current language. `t`/`te` come from useI18n() or i18n.global.
// Unknown keys fall back to the code's generic message, then to "something went wrong".
export function errorMessage(error, { t, te }) {
  const err = toApiError(error)
  for (const key of [err.messageKey, messageKeyFor(err.code)]) {
    if (key && te(key)) return t(key)
  }
  return t('errors.server_error')
}

// 422 field errors as text: { username: 'This field is required.' }. First rule per field.
export function fieldMessages(error, { t, te }) {
  const err = toApiError(error)
  return Object.fromEntries(
    Object.entries(err.fieldErrors).map(([field, keys]) => {
      const key = keys?.[0]
      return [field, key && te(key) ? t(key) : t('validation.invalid')]
    }),
  )
}
