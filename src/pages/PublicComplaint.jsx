import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Card, KV, Notice, Page, SectionHeading, StatusPill } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import { derive } from '../lib/engine.js'
import { categoryLabel, getDept } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'

const RESTRICT_LABELS = {
  court_order: { en: 'Court order', hi: 'न्यायालय का आदेश' },
  safety: { en: 'Risk to someone’s safety', hi: 'किसी की सुरक्षा को ख़तरा' },
  other: { en: 'Other legal reason', hi: 'अन्य कानूनी कारण' },
  lifted: { en: 'Restriction lifted', hi: 'प्रतिबंध हटाया गया' },
}

export default function PublicComplaint() {
  const { id } = useParams()
  const { complaint } = useComplaint(id)
  const { t, tt, lang } = useI18n()

  if (!complaint) {
    return (
      <Page title={t('public.title')} back={{ to: '/record', label: t('nav.public') }}>
        <Notice tone="warn">{t('public.notFound')}</Notice>
      </Page>
    )
  }

  const d = derive(complaint)

  return (
    <Page title={complaint.id} sub={t('public.recordTitle')} back={{ to: '/record', label: t('nav.public') }}>
      {d.restriction ? (
        <Notice tone="warn">
          {t('public.restricted', {
            date: fmtDate(d.restriction.at, lang),
            reason: tt(RESTRICT_LABELS[d.restriction.reasonCategory] || RESTRICT_LABELS.other),
          })}
          <span className="mt-2 block text-sm">{t('public.noShow')}</span>
        </Notice>
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill statusKey={d.statusKey} />
            </div>
            <dl className="mt-2">
              <KV label={t('public.deptPage')}>{tt(getDept(complaint.deptId)?.name)}</KV>
              <KV label={t('public.officePage')}>{tt(d.officeNow)}</KV>
              <KV label={t('office.category')}>{tt(categoryLabel(complaint.category))}</KV>
              <KV label={t('mine.filed')}>{fmtDate(complaint.createdAt, lang)}</KV>
            </dl>
            <p className="mt-2 text-sm text-slate-700">{t('public.intro')}</p>
          </Card>

          <SectionHeading>{t('public.timeline')}</SectionHeading>
          <Timeline complaint={complaint} derived={null} mode="public" showUpcoming={false} />
        </>
      )}
      <p className="mt-6 text-sm text-slate-700">{t('public.allegations')}</p>
    </Page>
  )
}
