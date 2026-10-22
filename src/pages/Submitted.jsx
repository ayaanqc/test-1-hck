import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Btn, Card, Notice, Page, StatusPill } from '../components/Common.jsx'
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
  const ackBy = addDays(complaint.createdAt, CONFIG.ackDays)
  const respondBy = addDays(complaint.createdAt, CONFIG.respondDays)
  const resolveBy = addDays(complaint.createdAt, CONFIG.resolveDays)

  return (
    <Page title={t('submitted.title')} sub={t('submitted.notified')}>
      <Card className="border-brand-700">
        <p className="text-base font-semibold text-slate-700">{t('submitted.id')}</p>
        <p className="text-2xl font-black tracking-wide text-brand-800">{complaint.id}</p>
        <div className="mt-2">
          <StatusPill statusKey={d.statusKey} />
        </div>
        <dl className="mt-3">
          <div className="border-t border-slate-200 py-2">
            <dt className="text-sm font-semibold text-slate-700">{t('submitted.office')}</dt>
            <dd className="text-base font-semibold">{tt(d.officeNow)}</dd>
          </div>
          <div className="border-t border-slate-200 py-2">
            <dt className="text-sm font-semibold text-slate-700">{t('submitted.deadlines')}</dt>
            <dd className="text-base">
              <span className="block">{t('submitted.ackBy')}: {fmtDate(ackBy, lang)}</span>
              <span className="block">{t('submitted.respondBy')}: {fmtDate(respondBy, lang)}</span>
              <span className="block">{t('submitted.resolveBy')}: {fmtDate(resolveBy, lang)}</span>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="mt-4">
        <Card>
          <h2 className="text-lg font-bold">{t('submitted.next')}</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-base">
            <li>{t('submitted.next1', { ack: CONFIG.ackDays })}</li>
            <li>{t('submitted.next2', { next: tt(nextOffice) })}</li>
            <li>{t('submitted.next3')}</li>
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Notice tone="info">{t('submitted.identity')}</Notice>
      </div>

      <div className="mt-4 space-y-3">
        <Btn to={`/complaint/${complaint.id}`}>{t('submitted.track')}</Btn>
        <Btn variant="secondary" onClick={() => window.print()}>🖨 {t('submitted.save')}</Btn>
      </div>

      <p className="mt-4 text-sm text-slate-700">{t('common.demoOnly')}</p>
    </Page>
  )
}
