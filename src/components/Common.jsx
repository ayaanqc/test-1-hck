import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { STATUS } from '../data/config.js'

export function Card({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`card rounded-2xl border-2 border-slate-200 bg-white p-4 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

const VARIANTS = {
  primary: 'bg-brand-700 text-white border-brand-700 hover:bg-brand-800',
  secondary: 'bg-white text-brand-700 border-brand-700 hover:bg-brand-50',
  quiet: 'bg-white text-ink border-slate-300 hover:bg-slate-50',
  danger: 'bg-white text-red-800 border-red-700 hover:bg-red-50',
  warning: 'bg-amber-100 text-ink border-amber-800 hover:bg-amber-200',
}

export function Btn({ children, variant = 'primary', to, href, onClick, type = 'button', disabled, className = '', ariaLabel, full = true }) {
  const cls = `btn inline-flex ${full ? 'w-full' : ''} min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-semibold disabled:opacity-50 ${VARIANTS[variant] || VARIANTS.primary} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener" aria-label={ariaLabel}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  )
}

export function BigAction({ icon, title, sub, to }) {
  return (
    <Link
      to={to}
      className="card flex min-h-[92px] w-full items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-brand-600"
    >
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-bold leading-tight text-brand-800">{title}</span>
        <span className="mt-1 block text-base text-slate-700">{sub}</span>
      </span>
      <span aria-hidden="true" className="ml-auto text-2xl text-brand-700">›</span>
    </Link>
  )
}

export function Field({ label, hint, children, required, htmlFor, id }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor || id} className="mb-1 block text-base font-semibold text-ink">
        {label} {required ? <span className="text-red-700">*</span> : null}
      </label>
      {hint ? <p className="mb-2 text-base text-slate-600">{hint}</p> : null}
      {children}
    </div>
  )
}

const INPUT_CLASS =
  'w-full min-h-[48px] rounded-xl border-2 border-slate-400 bg-white px-3 py-3 text-base text-ink'

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
      className={`${INPUT_CLASS} min-h-[110px]`}
      aria-label={ariaLabel}
    />
  )
}

export function Select({ id, value, onChange, children, ariaLabel }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} aria-label={ariaLabel}>
      {children}
    </select>
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
        className="mt-1 h-6 w-6 shrink-0 rounded border-2 border-slate-500"
      />
      <span className="text-base">{label}</span>
    </label>
  )
}

const STATUS_STYLE = {
  submitted: 'bg-slate-100 text-slate-900 border-slate-500',
  acknowledged: 'bg-brand-50 text-brand-800 border-brand-700',
  investigation: 'bg-amber-50 text-amber-950 border-amber-700',
  information_requested: 'bg-amber-50 text-amber-950 border-amber-700',
  response: 'bg-brand-50 text-brand-800 border-brand-700',
  transferred: 'bg-slate-100 text-slate-900 border-slate-500',
  escalated: 'bg-orange-50 text-orange-950 border-orange-700',
  finding_recorded: 'bg-emerald-50 text-emerald-950 border-emerald-700',
  closed: 'bg-emerald-50 text-emerald-950 border-emerald-700',
  rejected: 'bg-red-50 text-red-950 border-red-700',
  appealed: 'bg-purple-50 text-purple-950 border-purple-700',
  reopened: 'bg-brand-50 text-brand-800 border-brand-700',
  withdrawn: 'bg-slate-100 text-slate-900 border-slate-500',
  restricted: 'bg-slate-100 text-slate-900 border-slate-500',
  top_of_chain: 'bg-orange-50 text-orange-950 border-orange-700',
}

export function StatusPill({ statusKey }) {
  const { tt } = useI18n()
  const status = STATUS[statusKey] || STATUS.submitted
  return (
    <span className={`pill inline-flex items-center rounded-full border-2 px-3 py-1 text-base font-semibold ${STATUS_STYLE[statusKey] || STATUS_STYLE.submitted}`}>
      {tt(status)}
    </span>
  )
}

export function DemoBadge({ label }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-amber-700 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-950">
      <span aria-hidden="true">◆</span> {label || t('common.demo')}
    </span>
  )
}

export function Notice({ children, tone = 'info', title }) {
  const tones = {
    info: 'border-brand-700 bg-brand-50 text-ink',
    warn: 'border-amber-700 bg-amber-50 text-ink',
    danger: 'border-red-700 bg-red-50 text-ink',
    safe: 'border-emerald-700 bg-emerald-50 text-ink',
  }
  return (
    <div className={`rounded-xl border-2 p-4 ${tones[tone] || tones.info}`} role="note">
      {title ? <p className="mb-1 text-base font-bold">{title}</p> : null}
      <div className="text-base">{children}</div>
    </div>
  )
}

export function Page({ title, sub, children, back, actions }) {
  return (
    <main id="main" className="mx-auto w-full max-w-xl px-4 pb-24 pt-4">
      {back ? (
        <Link to={back.to} className="mb-3 inline-flex min-h-[48px] items-center gap-1 text-base font-semibold text-brand-700 underline">
          <span aria-hidden="true">‹</span> {back.label}
        </Link>
      ) : null}
      {title ? (
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold leading-tight text-ink">{title}</h1>
          {sub ? <p className="mt-1 text-base text-slate-700">{sub}</p> : null}
          {actions}
        </div>
      ) : null}
      {children}
    </main>
  )
}

export function SectionHeading({ children, id }) {
  return (
    <h2 id={id} className="mb-2 mt-6 text-xl font-bold text-ink">
      {children}
    </h2>
  )
}

export function KV({ label, children }) {
  return (
    <div className="flex flex-col border-b border-slate-200 py-2 last:border-0 sm:flex-row sm:gap-3">
      <dt className="text-base font-semibold text-slate-700 sm:w-2/5">{label}</dt>
      <dd className="text-base text-ink">{children}</dd>
    </div>
  )
}

export function Spinner({ label }) {
  const { t } = useI18n()
  return (
    <p role="status" className="py-8 text-center text-base text-slate-700">
      {label || t('common.loading')}
    </p>
  )
}
