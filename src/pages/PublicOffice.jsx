import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, KV, Notice, Page, SectionHeading, StatusPill } from '../components/Common.jsx'
import { OFFICES, getDept } from '../data/authorities.js'
import { departmentStats, officeStats } from '../lib/accountability.js'
import { derive } from '../lib/engine.js'
import { CONFIG } from '../data/config.js'
import { fmtDate } from '../lib/format.js'

export default function PublicOffice() {
  const { officeId, deptId } = useParams()
  const { complaints } = useStore()
  const { t, tt, lang } = useI18n()

  if (officeId) {
    const office = OFFICES.find((o) => o.id === officeId)
    if (!office) {
      return (
        <Page title={t('public.title')}>
          <Notice tone="warn">{t('common.notFound')}</Notice>
        </Page>
      )
    }
    const s = officeStats(officeId, complaints)
    const list = complaints.filter((c) => c.officeId === officeId && !c.archived)

    return (
      <Page title={tt(office.name)} sub={tt(getDept(office.deptId)?.name)} back={{ to: '/record', label: t('nav.public') }}>
        <Card>
          <h2 className="text-lg font-bold">{t('public.byStatus')}</h2>
          <p className="text-sm text-slate-700">{t('public.allegations')}</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(s.byStatus).map(([k, n]) => (
              <li key={k} className="flex items-center justify-between gap-2 text-base">
                <StatusPill statusKey={k} />
                <span className="font-bold">{n}</span>
              </li>
            ))}
            {!Object.keys(s.byStatus).length ? <li className="text-base">{t('office.empty')}</li> : null}
          </ul>
          <dl className="mt-3">
            <KV label={t('public.medianAck')}>
              {s.medianAckDays == null ? '—' : `${s.medianAckDays.toFixed(1)} ${t('public.days')}`}
            </KV>
            <KV label={t('public.medianRespond')}>
              {s.medianRespondDays == null ? '—' : `${s.medianRespondDays.toFixed(1)} ${t('public.days')}`}
            </KV>
            <KV label={t('public.findings')}>
              {s.findings.substantiated} {t('finding.substantiated')} · {s.findings.not_substantiated} {t('finding.not_substantiated')} ·{' '}
              {s.findings.no_finding} {t('finding.no_finding_possible')}
            </KV>
            <KV label={t('public.indicator')}>
              {s.enoughData ? (
                <span>
                  <strong className="text-xl">{s.score}</strong> {t('acc.of100')}{' '}
                  <Link to={`/accountability/how?office=${officeId}`} className="font-semibold text-brand-700 underline">
                    {t('public.howWorked')}
                  </Link>
                </span>
              ) : (
                <span>{t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}</span>
              )}
            </KV>
          </dl>
        </Card>

        <SectionHeading>{t('public.timeline')}</SectionHeading>
        <ul className="space-y-2">
          {list.map((c) => {
            const d = derive(c)
            return (
              <li key={c.id}>
                <Link to={`/record/${c.id}`} className="flex items-center justify-between gap-2 rounded-lg border-2 border-slate-200 bg-white p-3 hover:border-brand-600">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold">{c.id}</span>
                    <span className="block text-sm text-slate-700">{fmtDate(c.createdAt, lang)}</span>
                  </span>
                  <StatusPill statusKey={d.statusKey} />
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-sm text-slate-700">{t('public.intro')}</p>
      </Page>
    )
  }

  const dept = getDept(deptId)
  const stats = departmentStats(deptId, complaints)
  return (
    <Page title={tt(dept?.name)} sub={t('public.deptPage')} back={{ to: '/record', label: t('nav.public') }}>
      <Notice tone="info">{t('public.allegations')}</Notice>
      <ul className="mt-3 space-y-2">
        {stats.map((s) => (
          <li key={s.officeId}>
            <Link to={`/record/office/${s.officeId}`} className="block rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-brand-600">
              <p className="text-base font-bold">{tt(s.office?.name)}</p>
              <p className="text-sm text-slate-700">
                {s.total} {t('public.allegations')} · {s.closedCount} {t('acc.closed')}
              </p>
              <p className="text-sm text-slate-700">
                {t('public.indicator')}: {s.enoughData ? `${s.score}/100` : t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link to="/accountability" className="text-base font-semibold text-brand-700 underline">
          {t('acc.how')}
        </Link>
      </div>
    </Page>
  )
}
