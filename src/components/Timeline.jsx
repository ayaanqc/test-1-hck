import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { fmtDateTime, fmtDate, shortHash } from '../lib/format.js'
import { escalationSentence } from '../lib/messages.js'
import Icon from './icons.jsx'

const EVENT_ICON = {
  submitted: 'report',
  evidence_added: 'file',
  acknowledged: 'check',
  investigation_started: 'clock',
  update: 'edit',
  response: 'inbox',
  information_requested: 'info',
  transferred: 'arrowRight',
  escalated: 'arrowRight',
  finding_recorded: 'shield',
  closed: 'lock',
  appealed: 'arrowLeft',
  reopened: 'arrowRight',
  corrected: 'edit',
  withdrawn: 'close',
  restricted: 'lock',
}

function EventBody({ ev, t, tt, mode }) {
  const d = ev.details || {}
  const parts = []
  const isPublic = mode === 'public'
  const isOffice = mode === 'office'

  if (ev.type === 'submitted' && !isPublic) {
    parts.push(
      <p key="n" className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink-700">
        {tt(d.narrative)}
      </p>,
    )
    if (d.when || d.where || d.who) {
      parts.push(
        <dl key="meta" className="mt-3 space-y-1.5 rounded-2xl bg-brand-50/80 p-3">
          {d.when ? (
            <div className="flex gap-2 text-sm">
              <dt className="w-16 shrink-0 text-ink-400">{t('report.q4')}</dt>
              <dd className="text-ink-700">{tt(d.when)}</dd>
            </div>
          ) : null}
          {d.where ? (
            <div className="flex gap-2 text-sm">
              <dt className="w-16 shrink-0 text-ink-400">{t('report.q3')}</dt>
              <dd className="text-ink-700">{tt(d.where)}</dd>
            </div>
          ) : null}
          {d.who ? (
            <div className="flex gap-2 text-sm">
              <dt className="w-16 shrink-0 text-ink-400">{t('report.q5')}</dt>
              <dd className="text-ink-700">{tt(d.who)}</dd>
            </div>
          ) : null}
          {!isOffice && (d.witnesses || []).length ? (
            <div className="flex gap-2 text-sm">
              <dt className="w-16 shrink-0 text-ink-400">{t('report.q6')}</dt>
              <dd className="text-ink-700">{d.witnesses.map((x) => x.name).join(', ')}</dd>
            </div>
          ) : null}
        </dl>,
      )
    }
  }

  if (ev.type === 'evidence_added' && !isPublic) {
    if (isOffice) return null
    parts.push(
      <div key="e" className="mt-2 rounded-2xl bg-brand-50/80 p-3">
        <p className="text-sm font-semibold text-ink-700">{d.name}</p>
        <p className="mt-1 break-all font-mono text-xs text-ink-400">
          {t('event.fingerprint')}: {shortHash(d.fingerprint)}
        </p>
      </div>,
    )
  }

  if (ev.type === 'acknowledged' && d.office && !isPublic) {
    parts.push(
      <p key="o" className="mt-1 text-sm text-ink-400">
        {tt(d.office)}
      </p>,
    )
  }

  if (ev.type === 'investigation_started' && d.expectedDate) {
    parts.push(
      <p key="i" className="mt-1 text-sm text-ink-500">
        {t('event.expectedBy', { date: fmtDate(d.expectedDate) })}
      </p>,
    )
  }

  if (ev.type === 'update') {
    if (d.note && !isPublic) {
      parts.push(
        <p key="u" className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-ink-700">
          {tt(d.note)}
        </p>,
      )
    }
  }

  if (ev.type === 'response' && d.note && !isPublic) {
    parts.push(
      <p key="res" className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-ink-700">
        {tt(d.note)}
      </p>,
    )
  }

  if (ev.type === 'information_requested' && !isPublic) {
    parts.push(
      <p key="q" className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-ink-700">
        {tt(d.question)}
      </p>,
    )
  }

  if (ev.type === 'transferred') {
    parts.push(
      <div key="tr" className="mt-1">
        {d.toOffice && !isPublic ? <p className="text-base">{tt(d.toOffice)}</p> : null}
        {d.reason && !isPublic ? <p className="mt-1 text-sm text-ink-500">{tt(d.reason)}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'escalated') {
    parts.push(
      <p key="esc" className="mt-1.5 rounded-2xl bg-amber-50/80 p-3 text-sm leading-relaxed text-amber-950">
        {escalationSentence(ev, t, tt, (date) => fmtDate(date))}
      </p>,
    )
  }

  if (ev.type === 'finding_recorded' && !isPublic) {
    parts.push(
      <div key="f" className="mt-2 rounded-2xl bg-emerald-50/70 p-3">
        <p className="text-sm font-semibold text-emerald-950">{t(`finding.${d.finding}`)}</p>
        <p className="mt-0.5 text-sm text-emerald-900/80">{t(`finding.${d.finding}.def`)}</p>
        {d.reason ? <p className="mt-2 text-sm text-ink-700">{tt(d.reason)}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'closed' && !isPublic) {
    parts.push(
      <div key="c" className="mt-2 rounded-2xl bg-brand-50 p-3">
        {d.decision === 'rejected' ? <p className="text-sm font-semibold text-red-900">{t('event.rejected')}</p> : null}
        {d.reason ? <p className="mt-0.5 text-sm text-ink-700">{tt(d.reason)}</p> : null}
      </div>,
    )
  }

  if (['appealed', 'reopened', 'withdrawn', 'corrected'].includes(ev.type) && !isPublic) {
    parts.push(
      <div key="a" className="mt-1">
        {d.reason ? <p className="text-sm text-ink-700">{tt(d.reason)}</p> : null}
        {d.changes ? <p className="mt-1 text-sm text-ink-700">{tt(d.changes.narrative)}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'restricted' && !isPublic) {
    parts.push(
      <p key="rs" className="mt-1 text-sm text-ink-500">
        {fmtDate(ev.at)} · {d.lifted ? t('review.liftRestriction') : tt(d.reason)}
      </p>,
    )
  }

  return <>{parts}</>
}

function eventLabel(ev, t) {
  if (ev.type === 'update' && ev.details && ev.details.kind === 'redactions_approved') return t('event.redactions')
  if (ev.type === 'closed' && ev.details && ev.details.decision === 'rejected') return t('event.rejected')
  return t(`event.${ev.type}`)
}

export default function Timeline({ complaint, derived, mode = 'citizen', showUpcoming = true, compact = false, limit }) {
  const { t, tt, lang } = useI18n()
  const { admin } = useStore()
  const now = admin.demoDate ? new Date(admin.demoDate) : new Date()
  const visible = mode === 'public'
    ? complaint.events.filter((ev) => !(ev.type === 'update' && ev.details && ev.details.kind === 'redactions_approved'))
    : complaint.events
  const events = limit ? visible.slice(-limit) : visible

  return (
    <div>
      <ol className="relative">
        {events.map((ev, i) => {
          const isLast = i === events.length - 1
          return (
            <li key={ev.seq} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${
                    ev.type === 'escalated'
                      ? 'bg-amber-50 text-amber-800 ring-amber-200'
                      : ev.type === 'closed' || ev.type === 'finding_recorded'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : 'bg-brand-50 text-ink-500 ring-line'
                  }`}
                >
                  <Icon name={EVENT_ICON[ev.type] || 'info'} size={15} />
                </span>
                {!isLast ? <span aria-hidden="true" className="mt-1 w-px flex-1 bg-line" /> : null}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">{eventLabel(ev, t)}</h3>
                  <span className="font-mono text-xs text-ink-400">#{ev.seq}</span>
                </div>
                <p className="text-sm text-ink-400">
                  {fmtDateTime(ev.at, lang)}
                  {mode !== 'public' ? ` · ${ev.by}` : ''}
                </p>
                <EventBody ev={ev} t={t} tt={tt} mode={mode} />
              </div>
            </li>
          )
        })}
      </ol>

      {showUpcoming && derived ? (
        <div className="mt-2 rounded-3xl bg-brand-50 p-4 ring-1 ring-inset ring-line">
          <p className="label-caps">{t('timeline.upcoming')}</p>
          {derived.isClosed || derived.withdrawnAt ? (
            <p className="mt-1.5 text-base text-ink-600">{t('timeline.nothingScheduled')}</p>
          ) : derived.atTop ? (
            <p className="mt-1.5 text-base text-ink-700">{t('timeline.atTop')}</p>
          ) : derived.escalationAt ? (
            <>
              <p className="mt-1.5 flex items-center gap-2 text-base font-semibold text-ink">
                <Icon name="clock" size={17} className="text-ink-400" />
                {t(
                  {
                    ack: 'timeline.nextAck',
                    respond: 'timeline.nextRespond',
                    resolve: 'timeline.nextResolve',
                    update: 'timeline.nextUpdate',
                    info: 'timeline.nextInfo',
                  }[derived.escalationKind] || 'timeline.nextRespond',
                  { date: fmtDate(derived.escalationAt, lang) },
                )}
              </p>
              {derived.investigation ? (
                <p className="mt-1 text-sm text-ink-500">{t('timeline.pauseInvestigation', { days: 15 })}</p>
              ) : null}
              {derived.info ? <p className="mt-1 text-sm text-ink-500">{t('timeline.pauseInfo')}</p> : null}
              <p className="mt-2 text-sm text-ink-400">{t('admin.now', { date: fmtDate(now.toISOString(), lang) })}</p>
            </>
          ) : (
            <p className="mt-1.5 text-base text-ink-600">{t('timeline.nothingScheduled')}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
