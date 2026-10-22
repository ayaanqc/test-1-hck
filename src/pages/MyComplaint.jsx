import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint, useStore } from '../lib/useStore.js'
import { Btn, Card, Field, KV, Notice, Page, SectionHeading, StatusPill, TextArea } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import { EvidenceList, VerifyButton } from '../components/Actions.jsx'
import { addComplainantInfo, appealComplaint, withdrawComplaint } from '../lib/store.js'
import { derive } from '../lib/engine.js'
import { getDept, categoryLabel } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'
import { escalationSentence } from '../lib/messages.js'

export default function MyComplaint() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { session } = useStore()
  const { t, tt, lang } = useI18n()
  const [info, setInfo] = useState('')
  const [withdrawReason, setWithdrawReason] = useState('')
  const [appealReason, setAppealReason] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showAppeal, setShowAppeal] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!complaint) {
    return (
      <Page title={t('mine.title')}>
        <Notice tone="warn">{t('mine.notFound')}</Notice>
        <Btn to="/track" variant="secondary">{t('track.title')}</Btn>
      </Page>
    )
  }

  const d = derive(complaint)
  const department = getDept(complaint.deptId)
  const isOwner = session.role === 'citizen' || session.role === 'reviewer' || session.role === 'admin'
  const decisionEvents = complaint.events.filter((e) => e.type === 'closed' || e.type === 'finding_recorded')
  const latestEscalation = [...complaint.events].reverse().find((e) => e.type === 'escalated')
  const canAppeal = d.closedEvent && !d.appealedAt

  async function sendInfo() {
    if (!info.trim()) return
    setBusy(true)
    await addComplainantInfo(complaint.id, { note: info.trim(), by: complaint.complainant.name })
    setInfo('')
    setBusy(false)
  }

  async function doWithdraw() {
    if (!withdrawReason.trim()) return
    setBusy(true)
    await withdrawComplaint(complaint.id, { reason: withdrawReason.trim(), by: complaint.complainant.name })
    setWithdrawReason('')
    setShowWithdraw(false)
    setBusy(false)
  }

  async function doAppeal() {
    if (!appealReason.trim()) return
    setBusy(true)
    await appealComplaint(complaint.id, { reason: appealReason.trim(), by: complaint.complainant.name })
    setAppealReason('')
    setShowAppeal(false)
    setBusy(false)
  }

  return (
    <Page title={t('mine.title')} back={{ to: '/track', label: t('track.title') }}>
      <Card className="border-brand-700">
        <p className="text-sm font-semibold text-slate-700">{t('mine.id')}</p>
        <p className="text-xl font-black tracking-wide text-brand-800">{complaint.id}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusPill statusKey={d.statusKey} />
          <span className="text-sm text-slate-700">{t('mine.filed')}: {fmtDate(complaint.createdAt, lang)}</span>
        </div>
        <dl className="mt-3">
          <KV label={t('mine.officeNow')}>{tt(d.officeNow)}</KV>
          <KV label={t('office.category')}>{tt(categoryLabel(complaint.category))}</KV>
          <KV label={t('public.deptPage')}>{tt(department?.name)}</KV>
        </dl>
      </Card>

      {d.restriction ? (
        <div className="mt-3">
          <Notice tone="warn">{t('mine.restrictedNotice')}</Notice>
        </div>
      ) : null}

      {latestEscalation && !d.isClosed && !d.withdrawnAt ? (
        <div className="mt-3">
          <Notice tone="warn">{escalationSentence(latestEscalation, t, tt, (date) => fmtDate(date, lang))}</Notice>
        </div>
      ) : null}

      {d.atTop && !d.isClosed && !d.withdrawnAt ? (
        <div className="mt-3">
          <Notice tone="warn" title={t('timeline.atTop')}>
            <Link className="font-semibold text-brand-800 underline" to={`/next-steps/${complaint.id}`}>
              {t('mine.seeNextSteps')} →
            </Link>
          </Notice>
        </div>
      ) : null}

      {d.info ? (
        <div className="mt-3">
          <Card className="border-amber-700">
            <h2 className="text-lg font-bold">{t('mine.infoRequests')}</h2>
            <p className="mt-1 text-base">{tt(d.info.question)}</p>
            <Field label={t('mine.addInfoLabel')} htmlFor="add-info">
              <TextArea id="add-info" value={info} onChange={setInfo} />
            </Field>
            <Btn onClick={sendInfo} disabled={busy}>{t('mine.addInfoSend')}</Btn>
          </Card>
        </div>
      ) : null}

      <SectionHeading>{t('mine.timeline')}</SectionHeading>
      <Timeline complaint={complaint} derived={d} mode="citizen" />

      <SectionHeading>{t('mine.decisions')}</SectionHeading>
      {decisionEvents.length ? (
        <ul className="space-y-2">
          {decisionEvents.map((ev) => (
            <li key={ev.seq}>
              <Card>
                <p className="text-sm text-slate-700">{fmtDate(ev.at, lang)}</p>
                <p className="text-base font-bold">
                  {ev.type === 'finding_recorded'
                    ? `${t('event.finding_recorded')}: ${t(`finding.${ev.details.finding}`)}`
                    : ev.details.decision === 'rejected'
                      ? t('event.rejected')
                      : t('event.closed')}
                </p>
                {ev.details.reason ? <p className="mt-1 text-base">{t('common.reason')}: {tt(ev.details.reason)}</p> : null}
                {ev.details.finding ? <p className="mt-1 text-base text-slate-700">{t(`finding.${ev.details.finding}.def`)}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-slate-700">{t('mine.noDecisions')}</p>
      )}

      {canAppeal ? (
        <Card className="mt-3">
          <h3 className="text-base font-bold">{t('mine.appeal')}</h3>
          {showAppeal ? (
            <div className="mt-2">
              <Field label={t('mine.appealLabel')} htmlFor="appeal-reason">
                <TextArea id="appeal-reason" value={appealReason} onChange={setAppealReason} />
              </Field>
              <Btn onClick={doAppeal} disabled={busy}>{t('mine.appealSend')}</Btn>
            </div>
          ) : (
            <Btn variant="secondary" onClick={() => setShowAppeal(true)}>{t('mine.appeal')}</Btn>
          )}
        </Card>
      ) : null}
      {d.appealedAt ? <p className="mt-2 text-base">{t('mine.appealed')}</p> : null}

      <SectionHeading>{t('mine.verify')}</SectionHeading>
      <VerifyButton complaint={complaint} />

      <SectionHeading>{t('mine.evidence')}</SectionHeading>
      <p className="mb-2 text-sm text-slate-700">{t('mine.evidenceHidden')}</p>
      <EvidenceList complaint={complaint} allowOpen />

      <SectionHeading>{t('mine.legalHelp')}</SectionHeading>
      <Card>
        <p className="text-base">{t('mine.legalHelpText')}</p>
        <div className="mt-2 space-y-2">
          <Btn to={`/next-steps/${complaint.id}`} variant="secondary">{t('mine.seeNextSteps')}</Btn>
          <Btn to="/legal" variant="quiet">⚖️ {t('nav.legal')}</Btn>
          <Btn to={`/case-summary/${complaint.id}`} variant="quiet">📄 {t('mine.caseSummary')}</Btn>
        </div>
      </Card>

      {isOwner && !d.isClosed && !d.withdrawnAt ? (
        <div className="mt-6">
          {showWithdraw ? (
            <Card>
              <h3 className="text-base font-bold">{t('mine.withdraw')}</h3>
              <Field label={t('mine.withdrawLabel')} htmlFor="withdraw-reason">
                <TextArea id="withdraw-reason" value={withdrawReason} onChange={setWithdrawReason} />
              </Field>
              <Btn variant="danger" onClick={doWithdraw} disabled={busy}>{t('mine.withdrawSend')}</Btn>
            </Card>
          ) : (
            <Btn variant="quiet" onClick={() => setShowWithdraw(true)}>{t('mine.withdraw')}</Btn>
          )}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-slate-700">{t('event.originalStays')}</p>
    </Page>
  )
}
