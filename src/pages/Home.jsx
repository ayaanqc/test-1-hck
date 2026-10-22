import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { BigAction, Btn, Card, Chip, EmptyState, Notice, Page, SectionHeading, StatCard, StatusPill } from '../components/Common.jsx'
import { derive } from '../lib/engine.js'
import { categoryLabel, getDept } from '../data/authorities.js'
import { fmtDate, fmtShortDate } from '../lib/format.js'
import Icon from '../components/icons.jsx'

export default function Home() {
  const { t, tt, lang } = useI18n()
  const { complaints, storage } = useStore()

  const mine = complaints
    .filter((c) => !c.archived && c.complainant?.name === 'Sunita Devi')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const open = mine.filter((c) => {
    const d = derive(c)
    return !d.isClosed && !d.withdrawnAt
  })
  const latest = mine[0]
  const latestDerived = latest ? derive(latest) : null
  const nextDeadline = latestDerived?.escalationAt
  const recent = complaints.filter((c) => !c.archived && !derive(c).restriction).slice(0, 4)

  const primaryTo = latest ? `/complaint/${latest.id}` : '/report'

  return (
    <Page
      eyebrow={t('home.eyebrow')}
      title={t('home.greet', { name: t('home.name') })}
      sub={t('home.greetSub')}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Btn to="/report" icon="plus" full={false} size="sm">
            {t('home.report')}
          </Btn>
          <Btn to={primaryTo} variant="secondary" icon="track" full={false} size="sm">
            {t('home.track')}
          </Btn>
        </div>
      }
    >
      {/* Today at a glance */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          tone="dark"
          label={t('home.stat.open')}
          value={open.length}
          hint={t('home.stat.openHint', { n: mine.length })}
          icon="report"
        />
        <StatCard
          label={t('home.stat.deadline')}
          value={nextDeadline ? fmtShortDate(nextDeadline, lang) : '—'}
          hint={t('home.stat.deadlineHint')}
          icon="clock"
        />
        <StatCard
          label={t('home.stat.aid')}
          value={t('home.stat.aidValue')}
          hint={t('home.stat.aidHint')}
          icon="scale"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {storage && storage.local === false ? (
        <div className="mt-3">
          <Notice tone="warn">{t('app.memoryMode')}</Notice>
        </div>
      ) : null}

      {/* Latest complaint */}
      <SectionHeading
        action={
          <Link to="/track" className="text-sm font-semibold text-ink-500 underline decoration-line-strong underline-offset-4 hover:text-ink">
            {t('home.viewAll')}
          </Link>
        }
      >
        {t('home.latestMine')}
      </SectionHeading>

      {latest ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
            <div className="min-w-0">
              <p className="font-mono text-sm text-ink-400">{latest.id}</p>
              <p className="mt-1 truncate text-lg font-semibold tracking-tight">{tt(latestDerived.officeNow)}</p>
              <p className="mt-0.5 text-sm text-ink-400">
                {tt(getDept(latest.deptId)?.name)} · {tt(categoryLabel(latest.category))} · {fmtDate(latest.createdAt, lang)}
              </p>
            </div>
            <StatusPill statusKey={latestDerived.statusKey} />
          </div>
          <ul className="divide-y divide-line px-5">
            {latest.events.slice(-3).map((ev) => (
              <li key={ev.seq} className="flex items-start gap-3 py-3">
                <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-ink-500">
                  <Icon name={ev.type === 'escalated' ? 'arrowRight' : ev.type === 'evidence_added' ? 'file' : 'check'} size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">
                    {ev.type === 'update' && ev.details?.kind === 'redactions_approved' ? t('event.redactions') : t(`event.${ev.type}`)}
                  </span>
                  <span className="block text-xs text-ink-400">{fmtDate(ev.at, lang)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 border-t border-line bg-brand-50/60 p-4">
            <Btn to={`/complaint/${latest.id}`} size="sm" variant="primary" iconRight="arrowRight" full={false}>
              {t('common.viewComplaint')}
            </Btn>
            <Btn to={`/legal?complaint=${latest.id}`} size="sm" variant="secondary" icon="scale" full={false}>
              {t('nav.legal')}
            </Btn>
          </div>
        </Card>
      ) : (
        <EmptyState icon="report" title={t('home.none')}>
          <Link className="font-semibold text-ink underline" to="/report">
            {t('home.fileFirst')}
          </Link>
        </EmptyState>
      )}

      {/* Main actions */}
      <SectionHeading>{t('home.quick')}</SectionHeading>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigAction icon="report" title={t('home.report')} sub={t('home.reportSub')} to="/report" dark />
        <BigAction icon="track" title={t('home.track')} sub={t('home.trackSub')} to="/track" />
        <BigAction icon="scale" title={t('home.legal')} sub={t('home.legalSub')} to="/legal" />
        <BigAction icon="archive" title={t('home.public')} sub={t('home.publicSub')} to="/record" />
      </div>

      {/* Public record + safety */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeading
            action={
              <Link to="/record" className="text-sm font-semibold text-ink-500 underline decoration-line-strong underline-offset-4 hover:text-ink">
                {t('home.public')}
              </Link>
            }
          >
            {t('home.latest')}
          </SectionHeading>
          <Card padded={false} className="divide-y divide-line overflow-hidden">
            {recent.map((c) => {
              const d = derive(c)
              return (
                <Link key={c.id} to={`/record/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-brand-50/60">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-ink-500">
                    <Icon name="file" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm text-ink-700">{c.id}</span>
                    <span className="block truncate text-sm text-ink-400">
                      {tt(getDept(c.deptId)?.name)} · {tt(d.officeNow)}
                    </span>
                  </span>
                  <StatusPill statusKey={d.statusKey} className="hidden shrink-0 sm:inline-flex" />
                </Link>
              )
            })}
          </Card>
          <p className="mt-2 text-sm text-ink-400">{t('home.recordNote')}</p>
        </div>

        <div>
          <SectionHeading>{t('home.safety')}</SectionHeading>
          <Card className="bg-red-50/70">
            <Chip tone="danger" icon="phone">
              112
            </Chip>
            <p className="mt-3 text-base leading-relaxed text-red-950">{t('home.safetyText')}</p>
            <div className="mt-3">
              <a
                href="tel:112"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-red-800 px-4 text-base font-semibold text-white hover:bg-red-900"
              >
                <Icon name="phone" size={18} />
                {t('danger.call')}
              </a>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Notice tone="info">{t('home.sampleNote')}</Notice>
      </div>
    </Page>
  )
}
