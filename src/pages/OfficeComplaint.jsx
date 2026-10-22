import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint, useStore } from '../lib/useStore.js'
import { Btn, Card, Field, KV, Notice, Page, SectionHeading, Select, StatusPill, TextArea, TextInput } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import {
  acknowledge,
  officialResponse,
  postUpdate,
  requestInfo,
  requestTransfer,
  startInvestigation,
} from '../lib/store.js'
import { derive } from '../lib/engine.js'
import Icon from '../components/icons.jsx'
import { CONFIG } from '../data/config.js'
import { OFFICES, categoryLabel, chainFor, getDept } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'

function todayPlus(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

export default function OfficeComplaint() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { session } = useStore()
  const { t, tt, lang } = useI18n()
  const [ackMsg, setAckMsg] = useState('')
  const [expectedDate, setExpectedDate] = useState(todayPlus(14))
  const [updateNote, setUpdateNote] = useState('')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [dispute, setDispute] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [error, setError] = useState('')

  if (!complaint) {
    return (
      <Page title={t('office.title')}>
        <Notice tone="warn">{t('mine.notFound')}</Notice>
      </Page>
    )
  }

  const d = derive(complaint)
  const official = session.officialName || 'Neelam Choudhary'
  const canAct = !!d.redactionsApprovedAt
  const submitted = complaint.events.find((e) => e.type === 'submitted')
  const levels = chainFor(complaint.officeId, complaint.chainId)

  async function run(fn, reset) {
    setError('')
    await fn()
    if (reset) reset()
    setAckMsg(t('office.added'))
  }

  return (
    <Page
      eyebrow={t('role.official')}
      title={complaint.id}
      sub={`${tt(categoryLabel(complaint.category))} · ${t('office.filed')} ${fmtDate(complaint.createdAt, lang)}`}
      back={{ to: '/office', label: t('office.back') }}
      actions={<StatusPill statusKey={d.statusKey} />}
    >
      <Card>
        <dl>
          <KV label={t('public.deptPage')}>{tt(getDept(complaint.deptId)?.name)}</KV>
          <KV label={t('mine.officeNow')}>{tt(d.officeNow)}</KV>
          <KV label={t('office.category')}>{tt(categoryLabel(complaint.category))}</KV>
          <KV label={t('office.deadline')}>
            {d.escalationAt && !d.isClosed ? fmtDate(d.escalationAt, lang, true) : t('timeline.nothingScheduled')}
          </KV>
        </dl>
        <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-xs text-ink-400">
          <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
          {t('office.submittedBy')}
        </p>
      </Card>

      <div className="mt-3">
        <Notice tone="info">{t('office.noIdentity')} {t('office.evidenceHidden')}</Notice>
      </div>

      {!canAct ? (
        <div className="mt-3">
          <Notice tone="warn">{t('office.redactionPending')}</Notice>
        </div>
      ) : null}

      {canAct ? (
        <>
          <SectionHeading>{t('office.summary')}</SectionHeading>
          <Card>
            <p className="whitespace-pre-wrap text-base">{tt(submitted?.details?.narrative)}</p>
            <dl className="mt-2">
              <KV label={t('report.q4')}>{tt(submitted?.details?.when)}</KV>
              <KV label={t('report.q3')}>{tt(submitted?.details?.where)}</KV>
              <KV label={t('report.q5')}>{tt(submitted?.details?.who)}</KV>
              <KV label={t('report.q6')}>{t('office.witnessHidden')}</KV>
            </dl>
          </Card>

          <SectionHeading>{t('timeline.title')}</SectionHeading>
          <Timeline complaint={complaint} derived={d} mode="office" showUpcoming={false} />
        </>
      ) : null}

      <SectionHeading>{t('office.actions')}</SectionHeading>
      <p className="mb-2 text-sm text-ink-500">{t('office.recordKept')}</p>
      {ackMsg ? <Notice tone="safe">{ackMsg}</Notice> : null}
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {d.isClosed ? <Notice tone="warn">{t('office.closedNotice')}</Notice> : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="check" size={15} /></span>
            {t('office.ack')}
          </h3>
          {d.ackedAt ? (
            <p className="mt-1 text-base text-ink-500">{t('office.ackDone', { date: fmtDate(d.ackedAt, lang) })}</p>
          ) : (
            <div className="mt-2">
              <Btn disabled={!canAct} onClick={() => run(() => acknowledge(complaint.id, official))}>
                {t('office.ack')}
              </Btn>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="clock" size={15} /></span>
            {t('office.startInvestigation')}
          </h3>
          <p className="mt-1 text-base text-ink-500">{t('office.updateHelp', { days: CONFIG.updateIntervalDays })}</p>
          <Field label={t('office.expectedDate')} htmlFor="expected-date">
            <TextInput id="expected-date" type="date" value={expectedDate} onChange={setExpectedDate} />
          </Field>
          <Btn
            disabled={!canAct}
            onClick={() => {
              if (!expectedDate) return setError(t('office.expectedRequired'))
              run(() => startInvestigation(complaint.id, { expectedDate: new Date(expectedDate).toISOString(), by: official }))
            }}
          >
            {t('office.startInvestigation')}
          </Btn>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="edit" size={15} /></span>
            {t('office.update')}
          </h3>
          <Field label={t('office.updateLabel')} htmlFor="update-note">
            <TextArea id="update-note" value={updateNote} onChange={setUpdateNote} />
          </Field>
          <Btn
            disabled={!canAct}
            onClick={() => {
              if (!updateNote.trim()) return setError(t('office.mustReason'))
              run(() => postUpdate(complaint.id, { note: updateNote.trim(), by: official }), () => setUpdateNote(''))
            }}
          >
            {t('office.update')}
          </Btn>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="info" size={15} /></span>
            {t('office.requestInfo')}
          </h3>
          <Field label={t('office.question')} htmlFor="question">
            <TextArea id="question" value={question} onChange={setQuestion} />
          </Field>
          <Btn
            disabled={!canAct}
            onClick={() => {
              if (!question.trim()) return setError(t('office.mustReason'))
              run(() => requestInfo(complaint.id, { question: question.trim(), by: official }), () => setQuestion(''))
            }}
          >
            {t('office.requestInfo')}
          </Btn>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="inbox" size={15} /></span>
            {t('office.respond')}
          </h3>
          <Field label={t('office.responseLabel')} htmlFor="response">
            <TextArea id="response" value={response} onChange={setResponse} />
          </Field>
          <Btn
            disabled={!canAct}
            onClick={() => {
              if (!response.trim()) return setError(t('office.mustReason'))
              run(() => officialResponse(complaint.id, { note: response.trim(), by: official }), () => setResponse(''))
            }}
          >
            {t('office.respond')}
          </Btn>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="flag" size={15} /></span>
            {t('office.dispute')}
          </h3>
          <p className="mt-1 text-base text-ink-500">{t('office.disputeHelp')}</p>
          <Field label={t('office.responseLabel')} htmlFor="dispute">
            <TextArea id="dispute" value={dispute} onChange={setDispute} />
          </Field>
          <Btn
            variant="secondary"
            disabled={!canAct}
            onClick={() => {
              if (!dispute.trim()) return setError(t('office.mustReason'))
              run(() => officialResponse(complaint.id, { note: dispute.trim(), by: official }), () => setDispute(''))
            }}
          >
            {t('office.dispute')}
          </Btn>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="arrowRight" size={15} /></span>
            {t('office.transfer')}
          </h3>
          <Field label={t('office.transferTo')} htmlFor="transfer-to">
            <Select id="transfer-to" value={transferTo} onChange={setTransferTo}>
              <option value="">—</option>
              {OFFICES.filter((o) => o.deptId === complaint.deptId).map((o) => (
                <option key={o.id} value={o.id}>
                  {tt(o.name)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('office.transferReason')} htmlFor="transfer-reason">
            <TextArea id="transfer-reason" value={transferReason} onChange={setTransferReason} />
          </Field>
          <Btn
            variant="secondary"
            disabled={!canAct}
            onClick={() => {
              if (!transferTo) return setError(t('office.expectedRequired'))
              if (!transferReason.trim()) return setError(t('office.mustReason'))
              const target = OFFICES.find((o) => o.id === transferTo)
              run(
                () =>
                  requestTransfer(complaint.id, {
                    toOfficeId: transferTo,
                    toOffice: target?.name,
                    reason: transferReason.trim(),
                    by: official,
                  }),
                () => { setTransferTo(''); setTransferReason('') },
              )
            }}
          >
            {t('office.transfer')}
          </Btn>
        </Card>
      </div>

      <p className="mt-6 text-xs text-ink-400">{t('office.recordKept')}</p>
      <p className="mt-1 text-xs text-ink-400">
        {t('timeline.title')}: {levels.map((l) => tt(l.office)).join(' › ')}
      </p>
    </Page>
  )
}
