export function fmtDate(iso, lang = 'en', withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  if (withTime) {
    opts.hour = 'numeric'
    opts.minute = '2-digit'
  }
  return d.toLocaleDateString(locale, opts)
}

export function fmtShortDate(iso, lang = 'en') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })
}

export function fmtDateTime(iso, lang) {
  return fmtDate(iso, lang, true)
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

export function money(amount, lang = 'en') {
  return new Intl.NumberFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function shortHash(hash) {
  if (!hash) return ''
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`
}
