import type { HTMLAttributes } from 'react'

type Tone = 'neutral' | 'warning' | 'success' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-stone-100 text-stone-700',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-red-100 text-red-700',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  )
}
