import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Notice, Page, StatusPill } from '../components/Common.jsx'
import { derive } from '../lib/engine.js'
import { computeFlags } from '../lib/flags.js'
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

  return (
    <Page title={t('review.title')} sub={t('review.queue')}>
      <Card className="mb-4">
        <label htmlFor="only-flagged" className="flex min-h-[44px] items-center gap-3">
          <input id="only-flagged" type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} className="h-5 w-5" />
          <span className="text-base font-semibold">{t('review.flagged')}</span>
        </label>
        <p className="mt-1 text-sm text-slate-700">{t('review.aiNote')}</p>
      </Card>

      {!rows.length ? <Notice tone="info">{t('review.noFlags')}</Notice> : null}

      <ul className="space-y-3">
        {rows.map(({ c, d, flags }) => (
          <li key={c.id}>
            <Link to={`/review/${c.id}`} className="block rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-brand-600">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-extrabold">{c.id}</p>
                <StatusPill statusKey={d.statusKey} />
              </div>
              <p className="mt-1 text-base text-slate-700">
                {tt(d.officeNow)} · {fmtDate(c.createdAt, lang)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {!d.redactionsApprovedAt && d.level === 0 ? (
                  <span className="rounded-full border-2 border-amber-700 bg-amber-50 px-2 py-1 text-sm font-semibold">
                    {t('office.waitingRedaction')}
                  </span>
                ) : null}
                {flags.map((f) => (
                  <span key={f.id} className="rounded-full border-2 border-slate-400 bg-slate-50 px-2 py-1 text-sm font-semibold">
                    ⚑ {t(`flags.${f.id}`)}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  )
}
