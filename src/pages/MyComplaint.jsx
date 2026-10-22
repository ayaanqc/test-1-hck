import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint, useStore } from '../lib/useStore.js'
import { Btn, Card, Field, Notice, Page, SectionHeading, StatusPill, TextArea } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import Icon from '../components/icons.jsx'
import { EvidenceList, VerifyButton } from '../components/Actions.jsx'
import { addComplainantInfo, appealComplaint, withdrawComplaint } from '../lib/store.js'
import { derive } from '../lib/engine.js'
import { categoryLabel, getDept } from '../data/authorities.js'
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
        <div className="mt-3">
          <Btn to="/track" variant="secondary">{t('track.title')}</Btn>
        </div>
      </Page>
    )
  }

  const d = derive(complaint)
  const department = getDept(complaint.deptId)
  const isOwner = session.role === 'citizen' || session.role === 'reviewer' || session.role === 'admin'
  const decisionEvents = complaint.events.filter((e) => e.type === 'closed' || e.type === 'finding_recorded')
  const latestEscalation = [...complaint.events].reverse().find((e) => e.type === 'escalated')
  const canAppeal = d.closedEvent && (!d.appealedAt || new Date(d.appealedAt) < new Date(d.closedEvent.at))

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
    <Page
      eyebrow={t('mine.title')}
      title={complaint.id}
      sub={`${tt(getDept(complaint.deptId)?.name)} · ${tt(categoryLabel(complaint.category))} · ${t('mine.filed')} ${fmtDate(complaint.createdAt, lang)}`}
      back={{ to: '/track', label: t('track.title') }}
      actions={<StatusPill statusKey={d.statusKey} />}
    >
      {/* alerts */}
      <div className="space-y-3">
        {d.restriction ? <Notice tone="warn">{t('mine.restrictedNotice')}</Notice> : null}
        {latestEscalation && !d.isClosed && !d.withdrawnAt ? (
          <Notice tone="warn">{escalationSentence(latestEscalation, t, tt, (date) => fmtDate(date, lang))}</Notice>
        ) : null}
        {d.atTop && !d.isClosed && !d.withdrawnAt ? (
          <Notice tone="warn" title={t('timeline.atTop')}>
            <Link className="inline-flex items-center gap-1 font-semibold text-ink underline decoration-line-strong underline-offset-4" to={`/next-steps/${complaint.id}`}>
              {t('mine.seeNextSteps')} <Icon name="arrowRight" size={14} />
            </Link>
          </Notice>
        ) : null}
      </div>

      {/* office + next deadline */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="label-caps">{t('mine.officeNow')}</p>
          <p className="mt-1.5 text-lg font-semibold tracking-tight">{tt(d.officeNow)}</p>
          <p className="mt-0.5 text-sm text-ink-400">{t('mine.acknowledgedBy')}: {d.ackedAt ? fmtDate(d.ackedAt, lang) : '—'}</p>
        </Card>
        <Card>
          <p className="label-caps">{t('mine.upcoming')}</p>
          {d.escalationAt && !d.isClosed ? (
            <p className="mt-1.5 flex items-center gap-2 text-base font-medium">
              <Icon name="clock" size={17} className="text-ink-400" />
              {fmtDate(d.escalationAt, lang)}
            </p>
          ) : (
            <p className="mt-1.5 text-base text-ink-500">{t('mine.noUpcoming')}</p>
          )}
          <p className="mt-1 text-sm text-ink-400">{t('timeline.disclaimer')}</p>
        </Card>
      </div>

      {d.info ? (
        <div className="mt-4">
          <Card className="ring-1 ring-inset ring-amber-200">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Icon name="info" size={17} className="text-amber-700" />
              {t('mine.infoRequests')}
            </h2>
            <p className="mt-2 text-base text-ink-700">{tt(d.info.question)}</p>
            <div className="mt-3">
              <Field label={t('mine.addInfoLabel')} htmlFor="add-info">
                <TextArea id="add-info" value={info} onChange={setInfo} />
              </Field>
            </div>
            <Btn size="sm" icon="plus" full={false} onClick={sendInfo} disabled={busy}>
              {t('mine.addInfoSend')}
            </Btn>
          </Card>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* Timeline */}
        <div className="min-w-0">
          <SectionHeading>{t('mine.timeline')}</SectionHeading>
          <Timeline complaint={complaint} derived={d} mode="citizen" />
        </div>

        {/* Side rail */}
        <div className="min-w-0 space-y-5">
          <div>
            <SectionHeading>{t('mine.decisions')}</SectionHeading>
            {decisionEvents.length ? (
              <ul className="space-y-2">
                {decisionEvents.map((ev) => (
                  <li key={ev.seq}>
                    <Card>
                      <p className="text-xs text-ink-400">{fmtDate(ev.at, lang)}</p>
                      <p className="mt-0.5 text-base font-semibold">
                        {ev.type === 'finding_recorded'
                          ? `${t('event.finding_recorded')}: ${t(`finding.${ev.details.finding}`)}`
                          : ev.details.decision === 'rejected'
                            ? t('event.rejected')
                            : t('event.closed')}
                      </p>
                      {ev.details.reason ? <p className="mt-1 text-sm text-ink-600">{tt(ev.details.reason)}</p> : null}
                      {ev.details.finding ? <p className="mt-1 text-sm text-ink-400">{t(`finding.${ev.details.finding}.def`)}</p> : null}
                      {ev.type === 'closed' && ev.details.decision === 'rejected' ? (
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                          <Icon name="arrowLeft" size={14} className="text-ink-400" />
                          {t('mine.appeal')}
                          {d.appealedAt ? <span className="font-normal text-ink-400">· {t('mine.appealed')}</span> : null}
                        </p>
                      ) : null}
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <Card>
                <p className="text-base text-ink-500">{t('mine.noDecisions')}</p>
              </Card>
            )}

            {canAppeal ? (
              <Card className="mt-2">
                {showAppeal ? (
                  <>
                    <Field label={t('mine.appealLabel')} htmlFor="appeal-reason">
                      <TextArea id="appeal-reason" value={appealReason} onChange={setAppealReason} />
                    </Field>
                    <Btn size="sm" onClick={doAppeal} disabled={busy}>{t('mine.appealSend')}</Btn>
                  </>
                ) : (
                  <Btn variant="secondary" size="sm" icon="arrowLeft" onClick={() => setShowAppeal(true)}>
                    {t('mine.appeal')}
                  </Btn>
                )}
              </Card>
            ) : null}
            {d.appealedAt ? <p className="mt-2 text-sm text-ink-500">{t('mine.appealed')}</p> : null}
          </div>

          <div>
            <SectionHeading>{t('mine.verify')}</SectionHeading>
            <Card>
              <VerifyButton complaint={complaint} />
            </Card>
          </div>

          <div>
            <SectionHeading>{t('mine.legalHelp')}</SectionHeading>
            <Card>
              <p className="text-sm text-ink-500">{t('mine.legalHelpText')}</p>
              <div className="mt-3 space-y-2">
                <Btn to={`/next-steps/${complaint.id}`} variant="primary" size="sm" icon="scale">
                  {t('mine.seeNextSteps')}
                </Btn>
                <Btn to="/legal" variant="secondary" size="sm" icon="wallet">
                  {t('nav.legal')}
                </Btn>
                <Btn to={`/case-summary/${complaint.id}`} variant="secondary" size="sm" icon="file">
                  {t('mine.caseSummary')}
                </Btn>
              </div>
            </Card>
          </div>

          <div>
            <SectionHeading>{t('mine.evidence')}</SectionHeading>
            <p className="mb-2 text-xs text-ink-400">{t('mine.evidenceHidden')}</p>
            <EvidenceList complaint={complaint} allowOpen />
          </div>

          {isOwner && !d.isClosed && !d.withdrawnAt ? (
            <div>
              {showWithdraw ? (
                <Card>
                  <h3 className="text-base font-semibold">{t('mine.withdraw')}</h3>
                  <p className="mt-1 text-sm text-ink-400">{t('mine.withdrawLabel')}</p>
                  <div className="mt-3">
                    <Field label={t('common.reason')} htmlFor="withdraw-reason">
                      <TextArea id="withdraw-reason" value={withdrawReason} onChange={setWithdrawReason} />
                    </Field>
                  </div>
                  <Btn variant="danger" size="sm" onClick={doWithdraw} disabled={busy}>{t('mine.withdrawSend')}</Btn>
                </Card>
              ) : (
                <Btn variant="quiet" size="sm" onClick={() => setShowWithdraw(true)}>
                  {t('mine.withdraw')}
                </Btn>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-8 text-xs text-ink-400">{t('event.originalStays')}</p>
    </Page>
  )
}
