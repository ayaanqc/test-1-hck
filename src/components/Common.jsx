import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { STATUS } from '../data/config.js'
import Icon from './icons.jsx'

/* ------------------------------------------------------------------ surfaces */

export function Card({ children, className = '', as: Tag = 'div', padded = true, ...rest }) {
  return (
    <Tag className={`card ${padded ? 'p-5' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function Divider({ className = '' }) {
  return <hr className={`my-4 border-line ${className}`} />
}

/* ------------------------------------------------------------------ buttons */

const VARIANTS = {
  primary: 'bg-ink text-white border-ink hover:bg-brand-800 shadow-soft',
  secondary: 'bg-white text-ink border-line-strong hover:bg-brand-50',
  quiet: 'bg-transparent text-ink-700 border-transparent hover:bg-brand-50',
  ghost: 'bg-brand-50 text-ink border-transparent hover:bg-brand-100',
  danger: 'bg-white text-red-800 border-red-200 hover:bg-red-50',
  warning: 'bg-amber-100 text-ink border-amber-200 hover:bg-amber-200',
}

export function Btn({
  children,
  variant = 'primary',
  to,
  href,
  onClick,
  type = 'button',
  disabled,
  className = '',
  ariaLabel,
  full = true,
  icon,
  iconRight,
  size = 'md',
}) {
  const sizes = {
    sm: 'min-h-[44px] px-4 text-sm',
    md: 'min-h-[48px] px-5 text-base',
  }
  const cls = `btn inline-flex ${full ? 'w-full' : ''} ${sizes[size]} items-center justify-center gap-2 rounded-full border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant] || VARIANTS.primary} ${className}`
  const inner = (
    <>
      {icon ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
      {iconRight ? <Icon name={iconRight} size={17} /> : null}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener" aria-label={ariaLabel}>
        {inner}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {inner}
    </button>
  )
}

export function IconBtn({ label, to, onClick, icon, active = false, className = '' }) {
  const cls = `inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
    active ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink hover:bg-brand-50'
  } ${className}`
  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={cls}>
        <Icon name={icon} size={20} />
      </Link>
    )
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cls}>
      <Icon name={icon} size={20} />
    </button>
  )
}

/* ------------------------------------------------------------------ labels */

export function StatusPill({ statusKey, className = '' }) {
  const { tt } = useI18n()
  const status = STATUS[statusKey] || STATUS.submitted
  const tones = {
    submitted: 'bg-brand-50 text-ink-700 ring-line-strong',
    acknowledged: 'bg-brand-50 text-ink-700 ring-line-strong',
    investigation: 'bg-amber-50 text-amber-950 ring-amber-200',
    information_requested: 'bg-amber-50 text-amber-950 ring-amber-200',
    response: 'bg-brand-50 text-ink-700 ring-line-strong',
    transferred: 'bg-brand-50 text-ink-700 ring-line-strong',
    escalated: 'bg-orange-50 text-orange-950 ring-orange-200',
    finding_recorded: 'bg-emerald-50 text-emerald-950 ring-emerald-200',
    closed: 'bg-emerald-50 text-emerald-950 ring-emerald-200',
    rejected: 'bg-red-50 text-red-950 ring-red-200',
    appealed: 'bg-violet-50 text-violet-950 ring-violet-200',
    reopened: 'bg-brand-50 text-ink-700 ring-line-strong',
    withdrawn: 'bg-brand-50 text-ink-500 ring-line-strong',
    restricted: 'bg-brand-50 text-ink-700 ring-line-strong',
    top_of_chain: 'bg-orange-50 text-orange-950 ring-orange-200',
  }
  const dot = {
    investigation: 'bg-amber-600',
    information_requested: 'bg-amber-600',
    escalated: 'bg-orange-600',
    top_of_chain: 'bg-orange-600',
    finding_recorded: 'bg-emerald-600',
    closed: 'bg-emerald-600',
    rejected: 'bg-red-600',
    appealed: 'bg-violet-600',
    withdrawn: 'bg-ink-400',
  }[statusKey] || 'bg-ink-500'
  return (
    <span
      className={`pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tones[statusKey] || tones.submitted} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {tt(status)}
    </span>
  )
}

export function Chip({ children, tone = 'neutral', icon, className = '' }) {
  const tones = {
    neutral: 'bg-brand-50 text-ink-700 ring-line',
    dark: 'bg-ink text-white ring-ink',
    warn: 'bg-amber-50 text-amber-950 ring-amber-200',
    safe: 'bg-emerald-50 text-emerald-950 ring-emerald-200',
    danger: 'bg-red-50 text-red-950 ring-red-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  )
}

export function DemoBadge({ label }) {
  const { t } = useI18n()
  return (
    <Chip tone="warn" icon="spark">
      {label || t('common.demo')}
    </Chip>
  )
}

/* ------------------------------------------------------------------ notices */

export function Notice({ children, tone = 'info', title, icon }) {
  const tones = {
    info: 'bg-brand-50 text-ink-800 ring-line',
    warn: 'bg-amber-50 text-amber-950 ring-amber-200',
    danger: 'bg-red-50 text-red-950 ring-red-200',
    safe: 'bg-emerald-50 text-emerald-950 ring-emerald-200',
  }
  const iconName = icon || { info: 'info', warn: 'alert', danger: 'alert', safe: 'check' }[tone] || 'info'
  return (
    <div className={`rounded-3xl p-4 ring-1 ring-inset ${tones[tone] || tones.info}`} role="note">
      <div className="flex gap-3">
        <Icon name={iconName} size={19} className="mt-0.5 shrink-0 opacity-70" />
        <div className="min-w-0 text-base">
          {title ? <p className="mb-1 font-semibold">{title}</p> : null}
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ page */

export function Page({ title, sub, children, back, actions, eyebrow }) {
  return (
    <main id="main" className="mx-auto w-full max-w-[1120px] px-1 pb-24 pt-1">
      {back ? (
        <Link
          to={back.to}
          className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-full pr-3 text-sm font-semibold text-ink-500 hover:text-ink"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white">
            <Icon name="arrowLeft" size={16} />
          </span>
          {back.label}
        </Link>
      ) : null}
      {title ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? <p className="label-caps mb-1">{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h1>
            {sub ? <p className="mt-2 max-w-2xl text-base text-ink-500">{sub}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </main>
  )
}

export function SectionHeading({ children, id, action }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3 first:mt-0">
      <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function KV({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex-row sm:gap-4">
      <dt className="text-sm font-medium text-ink-400 sm:w-2/5 sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-base text-ink-800">{children}</dd>
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'light', icon, className = '' }) {
  const dark = tone === 'dark'
  return (
    <div
      className={`rounded-3xl p-5 ${
        dark ? 'bg-ink text-white shadow-ink' : 'border border-line bg-white text-ink shadow-card'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium ${dark ? 'text-white/60' : 'text-ink-400'}`}>{label}</p>
        {icon ? (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'bg-white/10' : 'bg-brand-50'}`}>
            <Icon name={icon} size={16} />
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{value}</p>
      {hint ? <p className={`mt-1 text-sm ${dark ? 'text-white/65' : 'text-ink-400'}`}>{hint}</p> : null}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong bg-white/50 px-6 py-10 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-ink-400">
        <Icon name={icon} size={22} />
      </span>
      {title ? <p className="text-base font-semibold text-ink">{title}</p> : null}
      {children ? <p className="mt-1 max-w-sm text-base text-ink-500">{children}</p> : null}
    </div>
  )
}

export function BigAction({ icon, title, sub, to, dark = false }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-[110px] flex-col justify-between rounded-4xl p-5 transition-transform hover:-translate-y-0.5 ${
        dark ? 'bg-ink text-white shadow-ink' : 'border border-line bg-white text-ink shadow-card'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
          dark ? 'bg-white/12 text-white' : 'bg-brand-50 text-ink'
        }`}
      >
        <Icon name={icon} size={19} />
      </span>
      <span className="mt-4 block">
        <span className="block text-lg font-semibold leading-snug tracking-tight">{title}</span>
        <span className={`mt-1 block text-sm ${dark ? 'text-white/60' : 'text-ink-400'}`}>{sub}</span>
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ forms */

const INPUT_CLASS =
  'w-full min-h-[48px] rounded-2xl border border-line-strong bg-white px-4 py-3 text-base text-ink placeholder:text-ink-400/70 focus:border-ink focus:outline-none'

export function Field({ label, hint, children, required, htmlFor, id }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor || id} className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label} {required ? <span className="text-red-700">*</span> : null}
      </label>
      {hint ? <p className="mb-2 text-sm text-ink-500">{hint}</p> : null}
      {children}
    </div>
  )
}

export function TextInput({ id, value, onChange, placeholder, type = 'text', autoComplete, inputMode, ariaLabel, ...rest }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
      autoComplete={autoComplete}
      inputMode={inputMode}
      aria-label={ariaLabel}
      {...rest}
    />
  )
}

export function TextArea({ id, value, onChange, rows = 4, placeholder, ariaLabel }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${INPUT_CLASS} min-h-[110px] resize-y`}
      aria-label={ariaLabel}
    />
  )
}

export function Select({ id, value, onChange, children, ariaLabel }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} appearance-none pr-11`}
        aria-label={ariaLabel}
      >
        {children}
      </select>
      <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400" />
    </div>
  )
}

export function Checkbox({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex min-h-[48px] cursor-pointer items-start gap-3 py-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-6 w-6 shrink-0 rounded-md border border-line-strong accent-ink"
      />
      <span className="text-base leading-relaxed">{label}</span>
    </label>
  )
}

export function RadioCard({ id, name, value, checked, onChange, title, sub, icon }) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
        checked ? 'border-ink bg-brand-50' : 'border-line-strong bg-white hover:bg-brand-50/60'
      }`}
    >
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white'
        }`}
      >
        {checked ? <Icon name="check" size={12} strokeWidth={3} /> : null}
      </span>
      {icon ? <Icon name={icon} size={19} className="shrink-0 text-ink-500" /> : null}
      <span className="min-w-0">
        <span className="block text-base font-medium leading-snug">{title}</span>
        {sub ? <span className="mt-0.5 block text-sm text-ink-400">{sub}</span> : null}
      </span>
    </label>
  )
}

export function Spinner({ label }) {
  const { t } = useI18n()
  return (
    <p role="status" className="flex items-center justify-center gap-2 py-8 text-base text-ink-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden="true" />
      {label || t('common.loading')}
    </p>
  )
}
