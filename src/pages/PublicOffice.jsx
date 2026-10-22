import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Chip, EmptyState, KV, Notice, Page, SectionHeading, StatCard, StatusPill } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { OFFICES, getDept } from '../data/authorities.js'
import { departmentStats, officeStats } from '../lib/accountability.js'
import { derive } from '../lib/engine.js'
import { CONFIG } from '../data/config.js'
import { fmtDate } from '../lib/format.js'

function ScoreRing({ score }) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#111318 ${pct * 3.6}deg, #ececE6 0deg)` }}
      role="img"
      aria-label={`${score} / 100`}
    >
      <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white">
        <span className="text-xl font-semibold leading-none">{score}</span>
        <span className="text-[11px] text-ink-400">/ 100</span>
      </div>
    </div>
  )
}

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
      <Page
        eyebrow={t('public.officePage')}
        title={tt(office.name)}
        sub={tt(getDept(office.deptId)?.name)}
        back={{ to: '/record', label: t('nav.public') }}
        actions={<Chip tone="neutral" icon="lock">{t('public.allegations')}</Chip>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label={t('public.allegations')} value={s.total} hint={t('public.byStatus')} icon="file" />
          <StatCard
            label={t('public.medianAck')}
            value={s.medianAckDays == null ? '—' : `${s.medianAckDays.toFixed(1)}`}
            hint={t('public.days')}
            icon="clock"
          />
          <StatCard
            label={t('public.medianRespond')}
            value={s.medianRespondDays == null ? '—' : `${s.medianRespondDays.toFixed(1)}`}
            hint={t('public.days')}
            icon="clock"
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.3fr]">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-caps">{t('public.indicator')}</p>
                {s.enoughData ? (
                  <p className="mt-1 text-sm text-ink-500">{t('acc.closedCount', { n: s.closedCount })}</p>
                ) : (
                  <p className="mt-1 text-sm text-ink-500">{t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}</p>
                )}
              </div>
              {s.enoughData ? <ScoreRing score={s.score} /> : null}
            </div>
            {s.enoughData ? (
              <div className="mt-3 space-y-1.5">
                {[
                  ['ack', s.parts.acknowledgedShare],
                  ['respond', s.parts.respondedShare],
                  ['deadline', s.parts.deadlineShare],
                  ['finding', s.parts.findingShare],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-1/2 truncate text-xs text-ink-500">{t(`acc.parts.${k}`, { days: CONFIG.ackDays })}</span>
                    <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100">
                      <span className="block h-full rounded-full bg-ink" style={{ width: `${Math.round(v * 100)}%` }} />
                    </span>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold">{Math.round(v * 100)}%</span>
                  </div>
                ))}
              </div>
            ) : null}
            <Link
              to={`/accountability/how?office=${officeId}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4"
            >
              {t('public.howWorked')} <Icon name="arrowRight" size={14} />
            </Link>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">{t('public.byStatus')}</h2>
            <p className="text-xs text-ink-400">{t('public.allegations')}</p>
            <ul className="mt-3 space-y-2">
              {Object.entries(s.byStatus).map(([k, n]) => (
                <li key={k} className="flex items-center justify-between gap-2">
                  <StatusPill statusKey={k} />
                  <span className="text-base font-semibold">{n}</span>
                </li>
              ))}
              {!Object.keys(s.byStatus).length ? <li className="text-base text-ink-500">{t('office.empty')}</li> : null}
            </ul>
            <dl className="mt-4 border-t border-line pt-2">
              <KV label={t('public.findings')}>
                {s.findings.substantiated} {t('finding.substantiated')} · {s.findings.not_substantiated} {t('finding.not_substantiated')} ·{' '}
                {s.findings.no_finding} {t('finding.no_finding_possible')}
              </KV>
            </dl>
          </Card>
        </div>

        <SectionHeading>{t('public.timeline')}</SectionHeading>
        {list.length ? (
          <Card padded={false} className="divide-y divide-line overflow-hidden">
            {list.map((c) => {
              const d = derive(c)
              return (
                <Link key={c.id} to={`/record/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-brand-50/60">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm">{c.id}</span>
                    <span className="block text-xs text-ink-400">{fmtDate(c.createdAt, lang)}</span>
                  </span>
                  <StatusPill statusKey={d.statusKey} />
                </Link>
              )
            })}
          </Card>
        ) : (
          <EmptyState icon="inbox" title={t('office.empty')} />
        )}

        <p className="mt-3 text-xs text-ink-400">{t('public.intro')}</p>
      </Page>
    )
  }

  const dept = getDept(deptId)
  const stats = departmentStats(deptId, complaints)
  return (
    <Page eyebrow={t('public.deptPage')} title={tt(dept?.name)} back={{ to: '/record', label: t('nav.public') }}>
      <Notice tone="info">{t('public.allegations')}</Notice>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {stats.map((s) => (
          <Link
            key={s.officeId}
            to={`/record/office/${s.officeId}`}
            className="group rounded-4xl border border-line bg-white p-5 shadow-card transition-colors hover:border-line-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug">{tt(s.office?.name)}</p>
                <p className="mt-0.5 text-sm text-ink-400">
                  {s.total} {t('public.allegations')} · {s.closedCount} {t('acc.closed')}
                </p>
              </div>
              {s.enoughData ? (
                <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">{s.score}/100</span>
              ) : (
                <Chip tone="neutral">{s.total}</Chip>
              )}
            </div>
            {s.enoughData ? (
              <span aria-hidden="true" className="mt-3 block h-1.5 overflow-hidden rounded-full bg-brand-100">
                <span className="block h-full rounded-full bg-ink" style={{ width: `${s.score}%` }} />
              </span>
            ) : (
              <p className="mt-3 text-xs text-ink-400">{t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}</p>
            )}
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 group-hover:gap-2.5">
              {t('public.officePage')} <Icon name="arrowRight" size={14} />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/accountability" className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4">
          {t('acc.how')}
        </Link>
      </div>
    </Page>
  )
}
