import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useComplaint } from '../lib/useStore.js'
import { Card, KV, Notice, Page, SectionHeading, StatusPill } from '../components/Common.jsx'
import Timeline from '../components/Timeline.jsx'
import { derive } from '../lib/engine.js'
import { categoryLabel, getDept } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'
import Icon from '../components/icons.jsx'

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
    <Page
      eyebrow={t('nav.public')}
      title={t('public.recordTitle')}
      actions={d.restriction ? null : <StatusPill statusKey={d.statusKey} />}
    >
      <p className="-mt-2 mb-4 font-mono text-sm text-ink-500">{complaint.id}</p>
      {d.restriction ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900">
              <Icon name="lock" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-amber-950">
                {t('public.restricted', {
                  date: fmtDate(d.restriction.at, lang),
                  reason: tt(RESTRICT_LABELS[d.restriction.reasonCategory] || RESTRICT_LABELS.other),
                })}
              </p>
              <p className="mt-1 text-sm text-amber-900/80">{t('public.noShow')}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
          <Card className="h-fit">
            <dl>
              <KV label={t('public.deptPage')}>{tt(getDept(complaint.deptId)?.name)}</KV>
              <KV label={t('public.officePage')}>{tt(d.officeNow)}</KV>
              <KV label={t('office.category')}>{tt(categoryLabel(complaint.category))}</KV>
              <KV label={t('mine.filed')}>{fmtDate(complaint.createdAt, lang)}</KV>
            </dl>
            <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-xs text-ink-400">
              <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
              {t('public.intro')}
            </p>
          </Card>

          <div className="min-w-0">
            <SectionHeading>{t('public.timeline')}</SectionHeading>
            <Timeline complaint={complaint} derived={null} mode="public" showUpcoming={false} />
          </div>
        </div>
      )}
      <p className="mt-6 text-sm text-ink-500">{t('public.allegations')}</p>
    </Page>
  )
}
