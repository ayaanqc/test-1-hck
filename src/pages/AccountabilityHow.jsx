import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Field, Notice, Page, SectionHeading, Select, TextArea } from '../components/Common.jsx'
import { OFFICES } from '../data/authorities.js'
import { indicatorBreakdown } from '../lib/accountability.js'
import { CONFIG } from '../data/config.js'

export default function AccountabilityHow() {
  const { complaints } = useStore()
  const { t, tt } = useI18n()
  const [params, setParams] = useSearchParams()
  const officeId = params.get('office') || OFFICES[0].id
  const [errorText, setErrorText] = useState('')
  const [sent, setSent] = useState(false)
  const { stats, rows } = indicatorBreakdown(officeId, complaints)
  const W = CONFIG.indicatorWeights

  return (
    <Page title={t('acc.how')} sub={t('acc.title')} back={{ to: '/accountability', label: t('acc.title') }}>
      <Card>
        <Field label={t('public.officePage')} htmlFor="office-pick">
          <Select id="office-pick" value={officeId} onChange={(v) => setParams({ office: v })}>
            {OFFICES.map((o) => (
              <option key={o.id} value={o.id}>{tt(o.name)}</option>
            ))}
          </Select>
        </Field>
        <p className="mt-2 text-base">{t('acc.formula')}</p>
        <p className="mt-1 text-base font-semibold">{t('acc.noEffect')}</p>
        <p className="mt-2 text-sm text-slate-700">{t('acc.threshold', { n: CONFIG.minClosedComplaintsForIndicator })}</p>
      </Card>

      {stats.enoughData ? (
        <>
          <SectionHeading>{t('acc.score')}</SectionHeading>
          <Card>
            <p className="text-3xl font-black">
              {stats.score} <span className="text-base font-semibold text-slate-700">{t('acc.of100')}</span>
            </p>
            <table className="mt-3 w-full text-left text-base">
              <caption className="sr-only">{t('acc.formula')}</caption>
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th scope="col" className="py-1 text-sm">{t('acc.parts.ack')}</th>
                  <th scope="col" className="py-1 text-sm">{t('acc.partScore')}</th>
                  <th scope="col" className="py-1 text-sm">{t('acc.weight')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ack', stats.parts.acknowledgedShare, W.acknowledged, t('acc.parts.ack', { days: CONFIG.ackDays })],
                  ['respond', stats.parts.respondedShare, W.responded, t('acc.parts.respond', { days: CONFIG.respondDays })],
                  ['deadline', stats.parts.deadlineShare, W.deadlines, t('acc.parts.deadline', { days: CONFIG.resolveDays })],
                  ['finding', stats.parts.findingShare, W.findings, t('acc.parts.finding')],
                ].map(([k, share, weight, label]) => (
                  <tr key={k} className="border-b border-slate-200">
                    <th scope="row" className="py-2 text-left text-sm font-semibold">{label}</th>
                    <td className="py-2">{Math.round(share * 100)}%</td>
                    <td className="py-2">{Math.round(weight * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm text-slate-700">
              {t('acc.closedCount', { n: stats.closedCount })} · {stats.counts.ack}/{stats.closedCount} · {stats.counts.resp}/{stats.closedCount} ·{' '}
              {stats.counts.deadline}/{stats.closedCount} · {stats.counts.substantiated}/{stats.closedCount}
            </p>
          </Card>

          <SectionHeading>{t('acc.dataTitle')}</SectionHeading>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th scope="col" className="p-1">{t('acc.row')}</th>
                  <th scope="col" className="p-1">{t('acc.ack')}</th>
                  <th scope="col" className="p-1">{t('acc.respond')}</th>
                  <th scope="col" className="p-1">{t('acc.deadline')}</th>
                  <th scope="col" className="p-1">{t('acc.finding')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-200">
                    <th scope="row" className="p-1 text-left font-mono text-xs">{r.id}</th>
                    <td className="p-1">{r.ackOnTime ? '✓' : '✗'} {r.ackDays != null ? `${r.ackDays.toFixed(0)}d` : ''}</td>
                    <td className="p-1">{r.respondOnTime ? '✓' : '✗'} {r.respondDays != null ? `${r.respondDays.toFixed(0)}d` : ''}</td>
                    <td className="p-1">{r.deadlineMet ? '✓' : '✗'}</td>
                    <td className="p-1">{r.substantiated ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Notice tone="info">{t('acc.notEnough')}</Notice>
      )}

      <SectionHeading>{t('public.errorReport')}</SectionHeading>
      <Card>
        <Field label={t('public.errorExplain')} htmlFor="error-text">
          <TextArea id="error-text" value={errorText} onChange={setErrorText} />
        </Field>
        <Btn
          variant="secondary"
          onClick={() => {
            if (!errorText.trim()) return
            setSent(true)
            setErrorText('')
          }}
        >
          {t('public.errorReport')}
        </Btn>
        {sent ? (
          <div className="mt-2">
            <Notice tone="safe">{t('public.errorThanks')}</Notice>
          </div>
        ) : null}
      </Card>
    </Page>
  )
}
