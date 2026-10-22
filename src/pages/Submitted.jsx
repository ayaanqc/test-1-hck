import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Btn, Card, Notice, Page, StatusPill } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { derive, addDays } from '../lib/engine.js'
import { chainFor } from '../data/authorities.js'
import { CONFIG } from '../data/config.js'
import { fmtDate } from '../lib/format.js'

export default function Submitted() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { t, tt, lang } = useI18n()

  if (!complaint) {
    return (
      <Page title={t('submitted.title')}>
        <Notice tone="warn">{t('mine.notFound')}</Notice>
      </Page>
    )
  }

  const d = derive(complaint)
  const levels = chainFor(complaint.officeId, complaint.chainId)
  const nextOffice = levels[1]?.office || levels[0].office

  const deadlines = [
    { label: t('submitted.ackBy'), value: addDays(complaint.createdAt, CONFIG.ackDays) },
    { label: t('submitted.respondBy'), value: addDays(complaint.createdAt, CONFIG.respondDays) },
    { label: t('submitted.resolveBy'), value: addDays(complaint.createdAt, CONFIG.resolveDays) },
  ]

  return (
    <Page title={t('submitted.title')} sub={t('submitted.notified')}>
      {/* receipt */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-4xl bg-ink p-6 text-white shadow-ink">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <Icon name="check" size={16} />
              {t('app.name')}
            </span>
            <StatusPill statusKey={d.statusKey} className="bg-white/10 text-white ring-white/20" />
          </div>
          <p className="mt-6 text-sm text-white/65">{t('submitted.id')}</p>
          <p className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{complaint.id}</p>
          <p className="mt-6 text-sm text-white/65">{t('submitted.office')}</p>
          <p className="text-base font-medium">{tt(d.officeNow)}</p>
          <p className="mt-4 text-xs text-white/60">{t('submitted.identity')}</p>
        </div>

        <Card>
          <p className="label-caps">{t('submitted.deadlines')}</p>
          <ul className="mt-3 space-y-3">
            {deadlines.map((row) => (
              <li key={row.label} className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-ink-500">
                  <Icon name="clock" size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink-400">{row.label}</span>
                  <span className="block text-base font-medium">{fmtDate(row.value, lang)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <Btn to={`/complaint/${complaint.id}`} size="sm" iconRight="arrowRight" full={false}>
              {t('submitted.track')}
            </Btn>
            <Btn variant="secondary" size="sm" icon="print" full={false} onClick={() => window.print()}>
              {t('submitted.save')}
            </Btn>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-lg font-semibold tracking-tight">{t('submitted.next')}</h2>
        <ol className="mt-3 space-y-3">
          {[
            t('submitted.next1', { ack: CONFIG.ackDays }),
            t('submitted.next2', { next: tt(nextOffice) }),
            t('submitted.next3'),
          ].map((text, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-ink-600">
                {i + 1}
              </span>
              <span className="text-base leading-relaxed text-ink-700">{text}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-4">
        <Notice tone="info">{t('common.demoOnly')}</Notice>
      </div>
    </Page>
  )
}
