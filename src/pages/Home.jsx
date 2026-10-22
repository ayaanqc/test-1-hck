import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { BigAction, Card, Notice, Page, SectionHeading, StatusPill } from '../components/Common.jsx'
import { fmtDate } from '../lib/format.js'
import { derive } from '../lib/engine.js'
import { getDept } from '../data/authorities.js'

export default function Home() {
  const { t, tt, lang } = useI18n()
  const { complaints, storage } = useStore()
  const recent = complaints.filter((c) => !c.archived && !derive(c).restriction).slice(0, 4)

  return (
    <Page title={t('home.title')} sub={t('home.intro')}>
      <div className="space-y-3">
        <BigAction icon="📝" title={t('home.report')} sub={t('home.reportSub')} to="/report" />
        <BigAction icon="🔎" title={t('home.track')} sub={t('home.trackSub')} to="/track" />
        <BigAction icon="⚖️" title={t('home.legal')} sub={t('home.legalSub')} to="/legal" />
        <BigAction icon="🏛" title={t('home.public')} sub={t('home.publicSub')} to="/record" />
      </div>

      <div className="mt-4 space-y-2">
        <Notice tone="info">
          <span aria-hidden="true">ℹ️</span> {t('home.sampleNote')}
        </Notice>
        {storage && storage.local === false ? <Notice tone="warn">{t('app.memoryMode')}</Notice> : null}
      </div>

      <SectionHeading>{t('home.latest')}</SectionHeading>
      <ul className="space-y-2">
        {recent.map((c) => {
          const d = derive(c)
          return (
            <li key={c.id}>
              <Link to={`/record/${c.id}`} className="block rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-brand-600">
                <p className="text-base font-bold">{c.id}</p>
                <p className="text-base text-slate-700">
                  {tt(getDept(c.deptId)?.name)} · {tt(d.officeNow)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusPill statusKey={d.statusKey} />
                  <span className="text-sm text-slate-700">{fmtDate(c.createdAt, lang)}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-sm text-slate-700">{t('public.intro')}</p>

      <Card className="mt-6">
        <p className="text-base font-semibold">{t('app.name')}</p>
        <p className="text-base text-slate-700">{t('app.sample')}</p>
        <p className="mt-2 text-base">
          <Link className="font-semibold text-brand-700 underline" to="/settings">
            {t('nav.settings')}
          </Link>
        </p>
      </Card>
    </Page>
  )
}
