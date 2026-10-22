import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Chip, Notice, Page, SectionHeading } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { OFFICES } from '../data/authorities.js'
import { officeStats } from '../lib/accountability.js'
import { CONFIG } from '../data/config.js'

export default function Accountability() {
  const { complaints } = useStore()
  const { t, tt } = useI18n()
  const stats = OFFICES.map((o) => ({ office: o, s: officeStats(o.id, complaints) }))
  const shown = stats.filter((x) => x.s.enoughData)

  return (
    <Page
      eyebrow={t('nav.public')}
      title={t('acc.title')}
      sub={t('acc.formula')}
      back={{ to: '/record', label: t('nav.public') }}
      actions={
        <Link
          to="/accountability/how"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
        >
          <Icon name="info" size={16} />
          {t('acc.how')}
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="label-caps">{t('acc.score')}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{shown.length ? shown[0].s.score : '—'}</p>
          <p className="mt-1 text-xs text-ink-400">{shown.length ? tt(shown[0].office.name) : t('acc.notEnough')}</p>
        </Card>
        <Card>
          <p className="label-caps">{t('acc.threshold')}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{shown.length}</p>
          <p className="mt-1 text-xs text-ink-400">{t('acc.sampleNote')}</p>
        </Card>
        <Card className="bg-ink text-white">
          <p className="text-sm text-white/65">{t('acc.noEffect')}</p>
          <p className="mt-2 text-sm text-white/85">{t('acc.formula')}</p>
        </Card>
      </div>

      <SectionHeading>{t('public.dept')}</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-2">
        {stats.map(({ office, s }) => (
          <Card key={office.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug">{tt(office.name)}</p>
                <p className="mt-0.5 text-sm text-ink-400">{t('acc.closedCount', { n: s.closedCount })}</p>
              </div>
              {s.enoughData ? (
                <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">{s.score}/100</span>
              ) : (
                <Chip tone="neutral">{s.total}</Chip>
              )}
            </div>

            {s.enoughData ? (
              <div className="mt-3 space-y-1.5">
                {[
                  ['ack', s.parts.acknowledgedShare, CONFIG.ackDays],
                  ['respond', s.parts.respondedShare, CONFIG.respondDays],
                  ['deadline', s.parts.deadlineShare, CONFIG.resolveDays],
                  ['finding', s.parts.findingShare, null],
                ].map(([k, v, days]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-1/2 truncate text-xs text-ink-500">{t(`acc.parts.${k}`, { days })}</span>
                    <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100">
                      <span className="block h-full rounded-full bg-ink" style={{ width: `${Math.round(v * 100)}%` }} />
                    </span>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold">{Math.round(v * 100)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-ink-400">{t('acc.notEnough')}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
              <Link
                to={`/accountability/how?office=${office.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4"
              >
                {t('acc.how')}
              </Link>
              <Link
                to={`/record/office/${office.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 underline decoration-line-strong underline-offset-4"
              >
                {t('public.officePage')} <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Notice tone="info">{t('acc.threshold', { n: CONFIG.minClosedComplaintsForIndicator })}</Notice>
      </div>
    </Page>
  )
}
