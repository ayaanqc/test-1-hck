import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Btn, Card, Chip, Notice, Page, SectionHeading } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { routesForCategory } from '../data/legal.js'

export default function NextSteps() {
  const { id } = useParams()
  const { complaint } = useComplaint(id || '')
  const { t, tt } = useI18n()

  const routes = routesForCategory(complaint?.category || '', complaint?.deptId)

  return (
    <Page
      eyebrow={t('nav.legal')}
      title={t('next.title')}
      sub={t('next.intro')}
      back={complaint ? { to: `/complaint/${complaint.id}`, label: t('next.backToComplaint') } : { to: '/legal', label: t('nav.legal') }}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="bg-ink text-white">
          <p className="text-sm text-white/65">{t('next.aid')}</p>
          <p className="mt-1.5 text-base text-white/85">{t('legal.intro')}</p>
          <div className="mt-4">
            <Btn to={complaint ? `/legal?complaint=${complaint.id}` : '/legal'} variant="secondary" size="sm" icon="scale">
              {t('legal.freeFirst')}
            </Btn>
          </div>
        </Card>

        <Card>
          <p className="label-caps">{t('next.caseSummary')}</p>
          <p className="mt-1.5 text-sm text-ink-500">{t('next.caseSummaryHelp')}</p>
          <div className="mt-4">
            {complaint ? (
              <Btn to={`/case-summary/${complaint.id}`} size="sm" icon="file">
                {t('next.caseSummary')}
              </Btn>
            ) : (
              <Btn to="/track" variant="secondary" size="sm" icon="track">
                {t('track.title')}
              </Btn>
            )}
          </div>
        </Card>
      </div>

      {complaint ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip tone="neutral" icon="file">{t('next.forComplaint', { id: complaint.id })}</Chip>
          {complaint.category === 'bribe' ? <Chip tone="warn" icon="alert">{t('next.bribe.extra')}</Chip> : null}
        </div>
      ) : null}

      <SectionHeading>{t('next.routesTitle')}</SectionHeading>
      <ul className="grid gap-4 lg:grid-cols-2">
        {routes.map((r, idx) => {
          const steps = t(`next.routes.${r.id}.steps`)
          const docs = t(`next.routes.${r.id}.docs`)
          return (
            <li key={r.id}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug tracking-tight">{t(`next.routes.${r.id}.title`)}</h3>
                    <p className="mt-0.5 text-sm text-ink-400">{tt(r.law)}</p>
                  </div>
                </div>
                <p className="mt-3 text-base leading-relaxed text-ink-700">{t(`next.routes.${r.id}.what`)}</p>

                <h4 className="label-caps mt-4">{t('next.steps')}</h4>
                <ol className="mt-2 space-y-2">
                  {(Array.isArray(steps) ? steps : [steps]).map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                      <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-ink-600">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>

                <h4 className="label-caps mt-4">{t('next.docs')}</h4>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {(Array.isArray(docs) ? docs : [docs]).map((s, i) => (
                    <li key={i}>
                      <Chip tone="neutral" icon="file">{s}</Chip>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4">
                  <a
                    href={r.source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4"
                  >
                    <Icon name="external" size={14} />
                    {tt(r.source.label)}
                  </a>
                  <p className="mt-2 text-xs text-ink-400">{t('legal.notLegalAdvice')}</p>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <div className="mt-4">
        <Notice tone="info">{t('legal.notLegalAdvice')}</Notice>
      </div>
    </Page>
  )
}
