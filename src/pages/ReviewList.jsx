import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Chip, EmptyState, Notice, Page, StatusPill } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { derive } from '../lib/engine.js'
import { computeFlags } from '../lib/flags.js'
import { categoryLabel } from '../data/authorities.js'
import { fmtDate } from '../lib/format.js'

export default function ReviewList() {
  const { t, tt, lang } = useI18n()
  const { complaints } = useStore()
  const [onlyFlagged, setOnlyFlagged] = useState(false)

  const rows = useMemo(() => {
    return complaints
      .map((c) => ({ c, d: derive(c), flags: computeFlags(c, complaints) }))
      .filter((r) => !onlyFlagged || r.flags.length)
      .sort((a, b) => new Date(b.c.createdAt) - new Date(a.c.createdAt))
  }, [complaints, onlyFlagged])

  const needsRedactions = rows.filter((r) => !r.d.redactionsApprovedAt && r.d.level === 0).length
  const flagged = rows.filter((r) => r.flags.length).length

  return (
    <Page
      eyebrow={t('role.reviewer')}
      title={t('review.title')}
      sub={t('review.queue')}
      actions={
        <div className="flex flex-wrap gap-2">
          <Chip tone="warn" icon="lock">{needsRedactions}</Chip>
          <Chip tone="neutral" icon="flag">{flagged}</Chip>
        </div>
      }
    >
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="only-flagged" className="flex min-h-[44px] cursor-pointer items-center gap-3">
          <input
            id="only-flagged"
            type="checkbox"
            checked={onlyFlagged}
            onChange={(e) => setOnlyFlagged(e.target.checked)}
            className="h-5 w-5 rounded border border-line-strong accent-ink"
          />
          <span className="text-base font-medium">{t('review.flagged')}</span>
        </label>
        <p className="max-w-md text-xs text-ink-400">{t('review.aiNote')}</p>
      </Card>

      <div className="mt-4">
        {!rows.length ? (
          <EmptyState icon="shield" title={t('review.noFlags')} />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {rows.map(({ c, d, flags }) => (
              <li key={c.id}>
                <Link
                  to={`/review/${c.id}`}
                  className="group flex h-full flex-col rounded-4xl border border-line bg-white p-5 shadow-card transition-colors hover:border-line-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-ink-400">{c.id}</p>
                      <p className="mt-1 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{tt(categoryLabel(c.category))}</p>
                      <p className="mt-0.5 text-sm text-ink-400">
                        {tt(d.officeNow)} · {fmtDate(c.createdAt, lang)}
                      </p>
                    </div>
                    <StatusPill statusKey={d.statusKey} className="shrink-0" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {!d.redactionsApprovedAt && d.level === 0 ? (
                      <Chip tone="warn" icon="lock">{t('office.waitingRedaction')}</Chip>
                    ) : null}
                    {flags.slice(0, 3).map((f) => (
                      <Chip key={f.id} tone="neutral" icon="flag">{t(`flags.${f.id}`)}</Chip>
                    ))}
                    {flags.length > 3 ? <Chip tone="neutral">+{flags.length - 3}</Chip> : null}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-sm text-ink-400">
                      {c.complainant?.name} · {c.complainant?.phone}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 group-hover:gap-2">
                      {t('review.open')} <Icon name="arrowRight" size={15} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <Notice tone="info">{t('review.publicNote')}</Notice>
      </div>
    </Page>
  )
}
