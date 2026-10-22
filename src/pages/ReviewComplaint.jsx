import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint, useStore } from '../lib/useStore.js'
import { Btn, Card, DemoBadge, Field, KV, Notice, Page, SectionHeading, Select, StatusPill, TextArea } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import { EvidenceList, VerifyButton } from '../components/Actions.jsx'
import {
  approveRedactions,
  closeComplaint,
  liftRestriction,
  recordFinding,
  reopenComplaint,
  requestCorrection,
  restrictComplaint,
} from '../lib/store.js'
import { derive } from '../lib/engine.js'
import { computeFlags } from '../lib/flags.js'
import { categoryLabel, getDept } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'
import Icon from '../components/icons.jsx'

const REVIEWER = 'Oversight reviewer (demo)'

export default function ReviewComplaint() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { complaints } = useStore()
  const { t, tt, lang } = useI18n()

  const [finding, setFinding] = useState('substantiated')
  const [findingReason, setFindingReason] = useState('')
  const [decision, setDecision] = useState('resolved')
  const [closeReason, setCloseReason] = useState('')
  const [restrictCategory, setRestrictCategory] = useState('court_order')
  const [restrictReason, setRestrictReason] = useState('')
  const [correctionText, setCorrectionText] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [reopenReason, setReopenReason] = useState('')
  const [liftReason, setLiftReason] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const flags = useMemo(() => (complaint ? computeFlags(complaint, complaints) : []), [complaint, complaints])

  if (!complaint) {
    return (
      <Page title={t('review.title')}>
        <Notice tone="warn">{t('mine.notFound')}</Notice>
      </Page>
    )
  }

  const d = derive(complaint)
  const submitted = complaint.events.find((e) => e.type === 'submitted')
  const details = submitted?.details || {}
  const aiDraft = details.aiDraft
  const aiFields = aiDraft?.fields || aiDraft || null

  async function run(fn) {
    setError('')
    try {
      await fn()
      setMsg(t('review.actionDone'))
    } catch (err) {
      console.error(err)
      setError(t('verify.error'))
    }
  }

  return (
    <Page
      eyebrow={t('role.reviewer')}
      title={complaint.id}
      sub={`${tt(categoryLabel(complaint.category))} · ${t('office.filed')} ${fmtDate(complaint.createdAt, lang)}`}
      back={{ to: '/review', label: t('review.queue') }}
      actions={<StatusPill statusKey={d.statusKey} />}
    >
      <Card>
        <dl>
          <KV label={t('public.deptPage')}>{tt(getDept(complaint.deptId)?.name)}</KV>
          <KV label={t('mine.officeNow')}>{tt(d.officeNow)}</KV>
          <KV label={t('office.category')}>{tt(categoryLabel(complaint.category))}</KV>
          <KV label={t('review.declaration')}>{details.declaration ? t('common.yes') : t('common.no')}</KV>
          <KV label={t('review.phoneVerified')}>{details.phoneVerified ? t('common.yes') : t('common.no')}</KV>
        </dl>
      </Card>

      <SectionHeading
        action={<span className="flex items-center gap-1.5 text-xs text-ink-400"><Icon name="lock" size={13} /> {t('role.reviewer')}</span>}
      >
        {t('review.identity')}
      </SectionHeading>
      <div className="rounded-4xl bg-ink p-5 text-white shadow-ink">
        <dl>
          <div className="flex flex-col gap-0.5 border-b border-white/10 py-2.5 sm:flex-row sm:gap-4">
            <dt className="text-sm text-white/65 sm:w-2/5">{t('case.identity')}</dt>
            <dd className="text-base font-medium">{complaint.complainant.name}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-white/10 py-2.5 sm:flex-row sm:gap-4">
            <dt className="text-sm text-white/65 sm:w-2/5">{t('review.phone')}</dt>
            <dd className="font-mono text-base">{complaint.complainant.phone}</dd>
          </div>
          <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
            <dt className="text-sm text-white/65 sm:w-2/5">{t('review.account')}</dt>
            <dd className="text-base">
              {details.accountAgeDays === 0 ? `< 1 ${t('review.days')}` : `${details.accountAgeDays} ${t('review.days')}`}
            </dd>
          </div>
        </dl>
        <p className="mt-2 border-t border-white/10 pt-3 text-xs text-white/60">{t('office.noIdentity')}</p>
      </div>

      <SectionHeading>{t('review.witnesses')}</SectionHeading>
      <Card>
        {(details.witnesses || []).length ? (
          <ul className="space-y-1">
            {details.witnesses.map((w, i) => (
              <li key={i} className="text-base">
                <strong>{w.name}</strong>{w.relation ? ` — ${tt(w.relation)}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-ink-500">{t('review.noWitnesses')}</p>
        )}
      </Card>

      <SectionHeading>{t('review.evidence')}</SectionHeading>
      <p className="mb-2 text-sm text-ink-500">{t('mine.evidenceHidden')}</p>
      <EvidenceList complaint={complaint} allowOpen />

      <SectionHeading>{t('review.flags')}</SectionHeading>
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <DemoBadge />
          <span className="text-xs text-ink-400">{t('review.aiDemoNote')}</span>
        </div>
        {flags.length ? (
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="rounded-2xl bg-brand-50 p-3.5">
                <p className="flex items-center gap-2 text-base font-semibold">
                  <Icon name="flag" size={15} className="text-ink-500" />
                  {t(`flags.${f.id}`)}
                </p>
                <p className="mt-1 text-base">{tt(f.reason)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base">{t('review.noFlags')}</p>
        )}
        <p className="mt-3 text-sm text-ink-500">{t('review.aiNote')}</p>
      </Card>

      <SectionHeading action={<Icon name="lock" size={16} className="text-ink-400" />}>{t('review.redactions')}</SectionHeading>
      <Card>
        <p className="text-base">{t('review.redactionsHelp')}</p>
        {d.redactionsApprovedAt ? (
          <p className="mt-2 text-base font-semibold text-emerald-900">
            {t('review.approved', { date: fmtDate(d.redactionsApprovedAt, lang) })}
          </p>
        ) : (
          <div className="mt-2">
            <Btn onClick={() => run(() => approveRedactions(complaint.id, REVIEWER))}>
              {t('review.approveRedactions')}
            </Btn>
          </div>
        )}
      </Card>

      <SectionHeading>{t('review.aiDraft')}</SectionHeading>
      <Card>
        <p className="whitespace-pre-wrap text-base">{tt(details.narrative)}</p>
        <dl className="mt-2">
          <KV label={t('report.q4')}>{tt(details.when)}</KV>
          <KV label={t('report.q3')}>{tt(details.where)}</KV>
          <KV label={t('report.q5')}>{tt(details.who)}</KV>
        </dl>
        {aiFields ? (
          <div className="mt-3 rounded-2xl bg-brand-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-base font-semibold">{t('review.original')}</p>
              {aiDraft.demo ? <DemoBadge /> : null}
            </div>
            {Object.entries(aiFields)
              .filter(([k]) => k !== 'timeline')
              .map(([k, v]) => (
                <p key={k} className="mt-1 text-base">
                  <span className="font-semibold">{t(`draft.field.${k}`)}: </span>
                  {tt(v)}
                </p>
              ))}
            {details.corrections ? (
              <div className="mt-2 border-t border-line-strong pt-2">
                <p className="text-base font-semibold">{t('draft.yourVersion')}</p>
                {Object.entries(details.corrections).map(([k, v]) => (
                  <p key={k} className="mt-1 text-base">
                    <span className="font-semibold">{t(`draft.field.${k}`)}: </span>
                    {v}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <SectionHeading>{t('mine.timeline')}</SectionHeading>
      <Timeline complaint={complaint} derived={d} mode="reviewer" />

      <SectionHeading>{t('mine.verify')}</SectionHeading>
      <VerifyButton complaint={complaint} />

      <SectionHeading action={<Icon name="shield" size={16} className="text-ink-400" />}>{t('review.finding')}</SectionHeading>
      <p className="mb-2 text-base text-ink-500">{t('review.findingHelp')}</p>
      <Card>
        <Field label={t('finding.substantiated')} htmlFor="finding">
          <Select id="finding" value={finding} onChange={setFinding}>
            <option value="substantiated">{t('finding.substantiated')}</option>
            <option value="not_substantiated">{t('finding.not_substantiated')}</option>
            <option value="no_finding_possible">{t('finding.no_finding_possible')}</option>
          </Select>
        </Field>
        <p className="mb-2 text-sm text-ink-500">{t(`finding.${finding}.def`)}</p>
        <Field label={t('review.reason')} htmlFor="finding-reason" required>
          <TextArea id="finding-reason" value={findingReason} onChange={setFindingReason} />
        </Field>
        <Btn
          onClick={() => {
            if (!findingReason.trim()) return setError(t('review.mustReason'))
            run(() => recordFinding(complaint.id, { finding, reason: findingReason.trim(), by: REVIEWER }))
          }}
        >
          {t('review.saveFinding')}
        </Btn>
      </Card>

      <SectionHeading action={<Icon name="lock" size={16} className="text-ink-400" />}>{t('review.close')}</SectionHeading>
      <Card>
        <Field label={t('review.closeDecision')} htmlFor="decision">
          <Select id="decision" value={decision} onChange={setDecision}>
            <option value="resolved">{t('review.decisionResolved')}</option>
            <option value="rejected">{t('review.decisionRejected')}</option>
          </Select>
        </Field>
        <Field label={t('review.reason')} htmlFor="close-reason" required>
          <TextArea id="close-reason" value={closeReason} onChange={setCloseReason} />
        </Field>
        <Btn
          onClick={() => {
            if (!closeReason.trim()) return setError(t('review.mustReason'))
            run(() => closeComplaint(complaint.id, { reason: closeReason.trim(), decision, by: REVIEWER }))
          }}
        >
          {t('review.saveClose')}
        </Btn>
      </Card>

      {complaint.events.some((e) => e.type === 'appealed') && d.closedEvent ? (
        <>
          <SectionHeading>{t('review.reopen')}</SectionHeading>
          <Card>
            <p className="text-base">{t('review.reopenHelp')}</p>
            <Field label={t('review.reopenReason')} htmlFor="reopen-reason">
              <TextArea id="reopen-reason" value={reopenReason} onChange={setReopenReason} />
            </Field>
            <Btn
              onClick={() => {
                if (!reopenReason.trim()) return setError(t('review.mustReason'))
                run(() => reopenComplaint(complaint.id, { reason: reopenReason.trim(), by: REVIEWER }))
              }}
            >
              {t('review.reopen')}
            </Btn>
          </Card>
        </>
      ) : null}

      <SectionHeading action={<Icon name="lock" size={16} className="text-ink-400" />}>{t('review.restrict')}</SectionHeading>
      <Card>
        {d.restriction ? (
          <>
            <p className="text-base">{t('review.restrictedAlready')}</p>
            <p className="mt-1 text-base text-ink-500">{tt(d.restriction.reason)}</p>
            <Field label={t('review.liftReason')} htmlFor="lift-reason">
              <TextArea id="lift-reason" value={liftReason} onChange={setLiftReason} />
            </Field>
            <Btn
              variant="secondary"
              onClick={() => {
                if (!liftReason.trim()) return setError(t('review.mustReason'))
                run(() => liftRestriction(complaint.id, { reason: liftReason.trim(), by: REVIEWER }))
              }}
            >
              {t('review.liftRestriction')}
            </Btn>
          </>
        ) : (
          <>
            <Field label={t('review.restrictCategory')} htmlFor="restrict-category">
              <Select id="restrict-category" value={restrictCategory} onChange={setRestrictCategory}>
                <option value="court_order">{t('review.restrictCourt')}</option>
                <option value="safety">{t('review.restrictSafety')}</option>
                <option value="other">{t('review.restrictOther')}</option>
              </Select>
            </Field>
            <Field label={t('review.restrictReason')} htmlFor="restrict-reason">
              <TextArea id="restrict-reason" value={restrictReason} onChange={setRestrictReason} />
            </Field>
            <Btn
              variant="danger"
              onClick={() => {
                if (!restrictReason.trim()) return setError(t('review.mustReason'))
                run(() =>
                  restrictComplaint(complaint.id, {
                    reasonCategory: restrictCategory,
                    reason: { [lang]: restrictReason.trim() },
                    by: REVIEWER,
                  }),
                )
              }}
            >
              {t('review.restrict')}
            </Btn>
          </>
        )}
        <p className="mt-2 text-sm text-ink-500">{t('review.publicNote')}</p>
      </Card>

      <SectionHeading action={<Icon name="edit" size={16} className="text-ink-400" />}>{t('review.correct')}</SectionHeading>
      <Card>
        <Field label={t('review.correctNarrative')} htmlFor="correction">
          <TextArea id="correction" value={correctionText} onChange={setCorrectionText} />
        </Field>
        <Field label={t('review.correctReason')} htmlFor="correction-reason">
          <TextArea id="correction-reason" value={correctionReason} onChange={setCorrectionReason} />
        </Field>
        <Btn
          variant="secondary"
          onClick={() => {
            if (!correctionText.trim() || !correctionReason.trim()) return setError(t('review.mustReason'))
            run(() =>
              requestCorrection(complaint.id, {
                reason: correctionReason.trim(),
                changes: { narrative: correctionText.trim() },
                by: REVIEWER,
              }),
            )
          }}
        >
          {t('review.correct')}
        </Btn>
        <p className="mt-2 text-sm text-ink-500">{t('event.originalStays')}</p>
      </Card>

      <div className="mt-4" aria-live="polite">
        {msg ? <Notice tone="safe">{msg}</Notice> : null}
        {error ? <Notice tone="danger">{error}</Notice> : null}
      </div>
    </Page>
  )
}
