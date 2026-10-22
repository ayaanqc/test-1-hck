import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Btn, Card, Notice, Page, SectionHeading } from '../components/Common.jsx'
import { routesForCategory } from '../data/legal.js'

export default function NextSteps() {
  const { id } = useParams()
  const { complaint } = useComplaint(id || '')
  const { t, tt } = useI18n()

  const routes = routesForCategory(complaint?.category || '', complaint?.deptId)
  return (
    <Page
      title={t('next.title')}
      sub={t('next.intro')}
      back={complaint ? { to: `/complaint/${complaint.id}`, label: t('next.backToComplaint') } : { to: '/legal', label: t('nav.legal') }}
    >
      {complaint ? (
        <Notice tone="warn">{t('next.forComplaint', { id: complaint.id })}</Notice>
      ) : null}

      <div className="mt-3">
        <Card>
          <h2 className="text-lg font-bold">{t('next.aid')}</h2>
          <p className="mt-1 text-base">{t('legal.intro')}</p>
          <div className="mt-2">
            <Btn to={`/legal${complaint ? `?complaint=${complaint.id}` : ''}`} variant="secondary">
              ⚖️ {t('legal.freeFirst')}
            </Btn>
          </div>
        </Card>
      </div>

      {complaint?.category === 'bribe' ? (
        <div className="mt-3">
          <Notice tone="warn">{t('next.bribe.extra')}</Notice>
        </div>
      ) : null}

      <SectionHeading>{t('next.routesTitle')}</SectionHeading>
      <ul className="space-y-4">
        {routes.map((r) => {
          const steps = t(`next.routes.${r.id}.steps`)
          const docs = t(`next.routes.${r.id}.docs`)
          return (
            <li key={r.id}>
              <Card>
                <h3 className="text-lg font-bold">{t(`next.routes.${r.id}.title`)}</h3>
                <p className="mt-1 text-base">{t(`next.routes.${r.id}.what`)}</p>
                <p className="mt-2 text-sm text-slate-700">{tt(r.law)}</p>
                <h4 className="mt-3 text-base font-bold">{t('next.steps')}</h4>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-base">
                  {Array.isArray(steps) ? steps.map((s, i) => <li key={i}>{s}</li>) : <li>{steps}</li>}
                </ol>
                <h4 className="mt-3 text-base font-bold">{t('next.docs')}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
                  {Array.isArray(docs) ? docs.map((s, i) => <li key={i}>{s}</li>) : <li>{docs}</li>}
                </ul>
                <p className="mt-3 text-base">
                  <a className="font-semibold text-brand-700 underline" href={r.source.url} target="_blank" rel="noreferrer noopener">
                    {t('next.source')}: {tt(r.source.label)}
                  </a>
                </p>
                <p className="mt-2 text-sm text-slate-700">{t('legal.notLegalAdvice')}</p>
              </Card>
            </li>
          )
        })}
      </ul>

      <SectionHeading>{t('next.caseSummary')}</SectionHeading>
      <Card>
        <p className="text-base">{t('next.caseSummaryHelp')}</p>
        <div className="mt-2">
          {complaint ? (
            <Btn to={`/case-summary/${complaint.id}`}>📄 {t('next.caseSummary')}</Btn>
          ) : (
            <Btn to="/track" variant="secondary">{t('track.title')}</Btn>
          )}
        </div>
      </Card>
    </Page>
  )
}
