import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Notice, Page, SectionHeading } from '../components/Common.jsx'
import { OFFICES } from '../data/authorities.js'
import { officeStats } from '../lib/accountability.js'
import { CONFIG } from '../data/config.js'

export default function Accountability() {
  const { complaints } = useStore()
  const { t, tt } = useI18n()
  const stats = OFFICES.map((o) => ({ office: o, s: officeStats(o.id, complaints) }))

  return (
    <Page title={t('acc.title')} sub={t('acc.how')} back={{ to: '/record', label: t('nav.public') }}>
      <Card>
        <p className="text-base">{t('acc.formula')}</p>
        <p className="mt-2 text-base font-semibold">{t('acc.noEffect')}</p>
        <p className="mt-2 text-sm text-slate-700">{t('acc.threshold', { n: CONFIG.minClosedComplaintsForIndicator })}</p>
        <Link to="/accountability/how" className="mt-3 inline-block text-base font-semibold text-brand-700 underline">
          {t('acc.how')} →
        </Link>
      </Card>

      <SectionHeading>{t('public.dept')}</SectionHeading>
      <ul className="space-y-2">
        {stats.map(({ office, s }) => (
          <li key={office.id}>
            <Card>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-base font-bold">{tt(office.name)}</p>
                <p className="text-lg font-black">{s.enoughData ? `${s.score}/100` : '—'}</p>
              </div>
              <p className="text-sm text-slate-700">
                {t('acc.closedCount', { n: s.closedCount })} · {t('acc.sampleNote')}
              </p>
              {s.enoughData ? (
                <div className="mt-2 space-y-1">
                  {[
                    ['ack', s.parts.acknowledgedShare],
                    ['respond', s.parts.respondedShare],
                    ['deadline', s.parts.deadlineShare],
                    ['finding', s.parts.findingShare],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-2/3 text-sm">{t(`acc.parts.${k}`, { days: CONFIG[k === 'ack' ? 'ackDays' : k === 'respond' ? 'respondDays' : 'resolveDays'] })}</span>
                      <span className="text-sm font-semibold">{Math.round(v * 100)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-700">{t('acc.notEnough')}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-3">
                <Link to={`/accountability/how?office=${office.id}`} className="text-base font-semibold text-brand-700 underline">
                  {t('acc.how')}
                </Link>
                <Link to={`/record/office/${office.id}`} className="text-base font-semibold text-brand-700 underline">
                  {t('public.officePage')}
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </Page>
  )
}
