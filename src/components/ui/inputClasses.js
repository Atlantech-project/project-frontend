// Shared look of text inputs (FE-016), from Figma "Input": 48 px on forms, 40 px elsewhere.
export function inputClasses({ size = 'md', invalid = false } = {}) {
  return [
    'w-full rounded-control border bg-card px-4 type-body-m text-fg transition-colors',
    'placeholder:text-fg-muted',
    'focus:shadow-focus focus:outline-none',
    'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-fg-disabled',
    size === 'lg' ? 'h-control-lg' : 'h-control',
    invalid
      ? 'border-danger-600 focus:border-danger-600'
      : 'border-edge-strong hover:border-fg-secondary focus:border-edge-focus',
  ]
}

// aria-describedby for a field: its error text, else its hint.
export function describedBy(id, { error, hint }) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
