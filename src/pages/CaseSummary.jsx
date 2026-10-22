import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Btn, Card, Notice, Page } from '../components/Common.jsx'
import { derive } from '../lib/engine.js'
import { verifyComplaint } from '../lib/store.js'
import { categoryLabel, getDept } from '../data/authorities.js'
import { STATUS } from '../data/config.js'
import { fmtDate, fmtDateTime } from '../lib/format.js'

export default function CaseSummary() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { t, tt, lang } = useI18n()
  const [check, setCheck] = useState(null)

  useEffect(() => {
    if (complaint) verifyComplaint(complaint.id).then(setCheck).catch(() => setCheck({ ok: false }))
  }, [complaint?.id])

  if (!complaint) {
    return (
      <Page title={t('case.title')}>
        <Notice tone="warn">{t('mine.notFound')}</Notice>
      </Page>
    )
  }

  const d = derive(complaint)
  const evidence = complaint.events.filter((e) => e.type === 'evidence_added')
  const responses = complaint.events.filter((e) => ['response', 'update', 'information_requested'].includes(e.type))
  const decisions = complaint.events.filter((e) => ['finding_recorded', 'closed', 'appealed', 'reopened', 'corrected', 'withdrawn', 'restricted'].includes(e.type))
  const submitted = complaint.events.find((e) => e.type === 'submitted')

  return (
    <Page title={t('case.title')} sub={t('case.subtitle')} back={{ to: `/complaint/${complaint.id}`, label: t('mine.title') }}>
      <div className="no-print mb-4 space-y-2">
        <Btn onClick={() => window.print()}>🖨 {t('case.print')}</Btn>
      </div>

      <Card className="print-block">
        <p className="text-base font-bold">{t('case.complaint')}: {complaint.id}</p>
        <p className="text-base">{t('case.generated', { date: fmtDateTime(new Date().toISOString(), lang) })}</p>
        <p className="mt-2 text-base"><strong>{t('case.identity')}:</strong> {complaint.complainant.name}</p>
        <p className="text-base"><strong>{t('review.phone')}:</strong> {complaint.complainant.phone}</p>
        <p className="text-base"><strong>{t('public.deptPage')}:</strong> {tt(getDept(complaint.deptId)?.name)}</p>
        <p className="text-base"><strong>{t('case.office')}:</strong> {tt(d.officeNow)}</p>
        <p className="text-base"><strong>{t('office.category')}:</strong> {tt(categoryLabel(complaint.category))}</p>
        <p className="text-base"><strong>{t('mine.status')}:</strong> {tt(STATUS[d.statusKey] || STATUS.submitted)}</p>
        <p className="text-base"><strong>{t('mine.filed')}:</strong> {fmtDate(complaint.createdAt, lang)}</p>
        <p className="mt-2 whitespace-pre-wrap text-base">{tt(submitted?.details?.narrative)}</p>
        <p className="mt-1 text-base">{tt(submitted?.details?.when)} · {tt(submitted?.details?.where)}</p>
        <p className="text-base">{tt(submitted?.details?.who)}</p>
      </Card>

      <h2 className="mb-2 mt-5 text-xl font-bold">{t('case.timeline')}</h2>
      <ol className="space-y-2">
        {complaint.events.map((ev) => (
          <li key={ev.seq} className="print-block rounded-lg border border-slate-300 p-2">
            <p className="text-sm text-slate-700">{fmtDateTime(ev.at, lang)} · #{ev.seq} · {ev.type}</p>
            <p className="text-base">{ev.by}</p>
            {ev.details?.note && ev.type !== 'update' ? <p className="text-base">{tt(ev.details.note)}</p> : null}
            {ev.details?.reason ? <p className="text-base">{t('common.reason')}: {tt(ev.details.reason)}</p> : null}
            {ev.type === 'escalated' && ev.details?.toOffice ? <p className="text-base">{tt(ev.details.toOffice)}</p> : null}
            {ev.details?.question ? <p className="text-base">{tt(ev.details.question)}</p> : null}
            {ev.type === 'evidence_added' ? <p className="break-all text-sm">{ev.details.name} · {ev.details.fingerprint}</p> : null}
          </li>
        ))}
      </ol>

      <h2 className="mb-2 mt-5 text-xl font-bold">{t('case.evidence')}</h2>
      {evidence.length ? (
        <ul className="space-y-2">
          {evidence.map((ev) => (
            <li key={ev.seq} className="print-block rounded-lg border border-slate-300 p-2">
              <p className="text-base font-semibold">{ev.details.name}</p>
              <p className="break-all text-sm">SHA-256: {ev.details.fingerprint}</p>
              <p className="text-sm">{t('review.changed')}: {fmtDateTime(ev.details.lastModified, lang)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base">{t('case.noEvidence')}</p>
      )}
      <p className="mt-1 text-sm text-slate-700">{t('case.fingerprints')}</p>

      <h2 className="mb-2 mt-5 text-xl font-bold">{t('case.responses')}</h2>
      {responses.length ? (
        <ul className="space-y-2">
          {responses.map((ev) => (
            <li key={ev.seq} className="print-block rounded-lg border border-slate-300 p-2">
              <p className="text-sm text-slate-700">{fmtDateTime(ev.at, lang)} · {ev.type}</p>
              <p className="text-base">{tt(ev.details?.note || ev.details?.question)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base">{t('timeline.nothingScheduled')}</p>
      )}

      <h2 className="mb-2 mt-5 text-xl font-bold">{t('case.decisions')}</h2>
      {decisions.length ? (
        <ul className="space-y-2">
          {decisions.map((ev) => (
            <li key={ev.seq} className="print-block rounded-lg border border-slate-300 p-2">
              <p className="text-sm text-slate-700">{fmtDateTime(ev.at, lang)} · {ev.type}</p>
              {ev.details?.finding ? <p className="text-base font-semibold">{t(`finding.${ev.details.finding}`)}</p> : null}
              {ev.details?.reason ? <p className="text-base">{t('common.reason')}: {tt(ev.details.reason)}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base">{t('mine.noDecisions')}</p>
      )}

      <h2 className="mb-2 mt-5 text-xl font-bold">{t('case.verify')}</h2>
      <Card>
        {check ? (
          check.ok ? (
            <p className="text-base">{t('verify.ok', { n: check.count })}</p>
          ) : (
            <p className="text-base">{t('verify.failEvent', { seq: check.seq })}</p>
          )
        ) : (
          <p className="text-base">{t('verify.checking')}</p>
        )}
      </Card>

      <p className="mt-4 text-sm text-slate-700">{t('case.subtitle')}</p>
    </Page>
  )
}
