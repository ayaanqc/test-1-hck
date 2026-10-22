import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { fmtDateTime, fmtDate } from '../lib/format.js'
import { shortHash } from '../lib/format.js'
import { escalationSentence } from '../lib/messages.js'

function EventBody({ ev, t, tt, mode }) {
  const d = ev.details || {}
  const parts = []
  const isPublic = mode === 'public'
  const isOffice = mode === 'office'

  if (ev.type === 'submitted' && !isPublic) {
    parts.push(
      <p key="n" className="mt-1 whitespace-pre-wrap text-base">
        {tt(d.narrative)}
      </p>,
    )
    if (d.when) parts.push(<p key="w" className="mt-1 text-base text-slate-700">🕒 {tt(d.when)}</p>)
    if (d.where) parts.push(<p key="p" className="mt-1 text-base text-slate-700">📍 {tt(d.where)}</p>)
    if (d.who) parts.push(<p key="h" className="mt-1 text-base text-slate-700">👤 {tt(d.who)}</p>)
    if (!isOffice) {
      const w = d.witnesses || []
      parts.push(
        <p key="wit" className="mt-1 text-base text-slate-700">
          {w.length ? `👥 ${w.map((x) => x.name).join(', ')}` : ''}
        </p>,
      )
    }
  }

  if (ev.type === 'evidence_added' && !isPublic) {
    if (isOffice) return null
    parts.push(
      <div key="e" className="mt-2 rounded-lg bg-slate-50 p-3">
        <p className="text-base font-semibold">{d.name}</p>
        <p className="break-all text-sm text-slate-700">
          {t('event.fingerprint')}: {shortHash(d.fingerprint)}
        </p>
      </div>,
    )
  }

  if (ev.type === 'acknowledged' && d.office && !isPublic) {
    parts.push(<p key="o" className="mt-1 text-base text-slate-700">{tt(d.office)}</p>)
  }

  if (ev.type === 'investigation_started') {
    parts.push(
      <div key="i" className="mt-1">
        {d.expectedDate ? <p className="text-base text-slate-700">📅 {t('event.expectedBy', { date: fmtDate(d.expectedDate) })}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'update') {
    if (d.kind === 'redactions_approved') {
      parts.push(<p key="r" className="mt-1 text-base text-slate-700">{tt(d.note)}</p>)
    } else if (d.note && !isPublic) {
      parts.push(<p key="u" className="mt-1 whitespace-pre-wrap text-base">{tt(d.note)}</p>)
    }
    if (d.fromComplainant && !isPublic) {
      parts.push(<p key="fc" className="mt-1 text-sm text-slate-700">{t('event.notPublic')}</p>)
    }
  }

  if (ev.type === 'response' && d.note && !isPublic) {
    parts.push(<p key="res" className="mt-1 whitespace-pre-wrap text-base">{tt(d.note)}</p>)
  }

  if (ev.type === 'information_requested' && !isPublic) {
    parts.push(<p key="q" className="mt-1 whitespace-pre-wrap text-base">{tt(d.question)}</p>)
  }

  if (ev.type === 'transferred') {
    parts.push(
      <div key="tr" className="mt-1">
        {d.toOffice && !isPublic ? <p className="text-base">{tt(d.toOffice)}</p> : null}
        {d.reason && !isPublic ? <p className="mt-1 text-base text-slate-700">{t('common.reason')}: {tt(d.reason)}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'escalated') {
    parts.push(
      <p key="esc" className="mt-1 text-base font-medium">
        {escalationSentence(ev, t, tt, (date) => fmtDate(date))}
      </p>,
    )
  }

  if (ev.type === 'finding_recorded' && !isPublic) {
    parts.push(
      <div key="f" className="mt-1">
        <p className="text-base font-semibold">{t(`finding.${d.finding}`)}</p>
        <p className="text-base text-slate-700">{t(`finding.${d.finding}.def`)}</p>
        {d.reason ? <p className="mt-1 text-base">{t('common.reason')}: {tt(d.reason)}</p> : null}
      </div>,
    )
  }

  if (ev.type === 'closed' && !isPublic) {
    parts.push(
      <div key="c" className="mt-1">
        {d.decision === 'rejected' ? <p className="text-base font-semibold">{t('event.rejected')}</p> : null}
        {d.reason ? <p className="text-base">{t('common.reason')}: {tt(d.reason)}</p> : null}
        {d.decision === 'rejected' && !isPublic ? <p className="mt-1 text-base text-slate-700">↩ {t('mine.appeal')}</p> : null}
      </div>,
    )
  }

  if (['appealed', 'reopened', 'withdrawn', 'corrected'].includes(ev.type)) {
    if (!isPublic) {
      parts.push(
        <div key="a" className="mt-1">
          {d.reason ? <p className="text-base">{t('common.reason')}: {tt(d.reason)}</p> : null}
          {d.changes ? <p className="mt-1 text-base">{tt(d.changes.narrative)}</p> : null}
        </div>,
      )
    }
  }

  if (ev.type === 'restricted' && !isPublic) {
    parts.push(
      <p key="rs" className="mt-1 text-base">
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

export default function Timeline({ complaint, derived, mode = 'citizen', showUpcoming = true }) {
  const { t, tt, lang } = useI18n()
  const { admin } = useStore()
  const now = admin.demoDate ? new Date(admin.demoDate) : new Date()

  return (
    <div>
      <ol className="relative mt-2">
        {complaint.events.map((ev) => (
          <li key={ev.seq} className="relative mb-1 border-l-4 border-brand-100 pb-5 pl-4">
            <span
              aria-hidden="true"
              className="absolute -left-[11px] top-1 h-4 w-4 rounded-full border-2 border-white bg-brand-600"
            />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              {fmtDateTime(ev.at, lang)} · #{ev.seq}
            </p>
            <h3 className="text-base font-bold text-ink">{eventLabel(ev, t)}</h3>
            <EventBody ev={ev} t={t} tt={tt} mode={mode} />
            {mode !== 'public' ? (
              <p className="mt-1 text-sm text-slate-700">
                {t('common.by')}: {ev.by}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {showUpcoming && derived ? (
        <div className="mt-4 rounded-xl border-2 border-dashed border-brand-600 bg-brand-50 p-4">
          <h3 className="text-base font-bold">{t('timeline.upcoming')}</h3>
          {derived.isClosed || derived.withdrawnAt ? (
            <p className="text-base text-slate-700">{t('timeline.nothingScheduled')}</p>
          ) : derived.atTop ? (
            <p className="text-base">{t('timeline.atTop')}</p>
          ) : derived.escalationAt ? (
            <>
              <p className="text-base font-semibold">
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
                <p className="mt-1 text-base text-slate-700">{t('timeline.pauseInvestigation', { days: 15 })}</p>
              ) : null}
              {derived.info ? <p className="mt-1 text-base text-slate-700">{t('timeline.pauseInfo')}</p> : null}
              <p className="mt-2 text-sm text-slate-700">
                {t('admin.now', { date: fmtDate(now.toISOString(), lang) })}
              </p>
            </>
          ) : (
            <p className="text-base text-slate-700">{t('timeline.nothingScheduled')}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
