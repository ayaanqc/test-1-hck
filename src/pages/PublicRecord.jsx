import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Chip, Field, Notice, Page, SectionHeading, TextInput } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { DEPARTMENTS, OFFICES } from '../data/authorities.js'
import { officeStats } from '../lib/accountability.js'
import { CONFIG } from '../data/config.js'

export default function PublicRecord() {
  const { t, tt } = useI18n()
  const { complaints } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  function search(e) {
    e.preventDefault()
    const clean = q.trim().toUpperCase()
    const match = complaints.find((c) => c.id.toUpperCase() === clean)
    if (!match) {
      setError(t('public.notFound'))
      return
    }
    setError('')
    navigate(`/record/${match.id}`)
  }

  return (
    <Page
      eyebrow={t('nav.public')}
      title={t('public.title')}
      sub={t('public.intro')}
      actions={
        <Btn to="/accountability" variant="secondary" size="sm" icon="shield" full={false}>
          {t('acc.title')}
        </Btn>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <form onSubmit={search}>
            <Field label={t('public.searchLabel')} htmlFor="public-search">
              <TextInput id="public-search" value={q} onChange={setQ} placeholder="JD-2026-004821" />
            </Field>
            <Btn type="submit" icon="track">{t('common.search')}</Btn>
          </form>
          {error ? (
            <div className="mt-3" aria-live="polite">
              <Notice tone="warn">{error}</Notice>
            </div>
          ) : null}
          <p className="mt-4 flex items-start gap-2 text-xs text-ink-400">
            <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
            {t('public.intro')}
          </p>
        </Card>

        <Card className="bg-ink text-white">
          <p className="text-sm text-white/65">{t('public.allegations')}</p>
          <p className="mt-2 text-base leading-relaxed text-white/85">{t('home.recordNote')}</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-semibold">{complaints.filter((c) => !c.archived).length}</p>
              <p className="text-xs text-white/65">{t('public.allegations')}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{complaints.filter((c) => c.events.some((e) => e.type === 'closed')).length}</p>
              <p className="text-xs text-white/65">{t('acc.closed')}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {complaints.filter((c) => c.events.some((e) => e.type === 'finding_recorded')).length}
              </p>
              <p className="text-xs text-white/65">{t('public.findings')}</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionHeading>{t('public.dept')}</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-2">
        {DEPARTMENTS.map((dept) => {
          const offices = OFFICES.filter((o) => o.deptId === dept.id)
          const totals = offices.reduce(
            (acc, o) => {
              const s = officeStats(o.id, complaints)
              acc.total += s.total
              acc.closed += s.closedCount
              return acc
            },
            { total: 0, closed: 0 },
          )
          return (
            <Card key={dept.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight">{tt(dept.name)}</h3>
                  <p className="mt-0.5 text-sm text-ink-400">
                    {totals.total} {t('public.allegations')} · {totals.closed} {t('acc.closed')}
                  </p>
                </div>
                <Link
                  to={`/record/department/${dept.id}`}
                  aria-label={t('public.deptPage')}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink hover:bg-brand-50"
                >
                  <Icon name="arrowRight" size={16} />
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-line">
                {offices.map((o) => {
                  const s = officeStats(o.id, complaints)
                  return (
                    <li key={o.id}>
                      <Link to={`/record/office/${o.id}`} className="flex items-center gap-3 py-2.5 hover:text-ink">
                        <span className="min-w-0 flex-1 truncate text-sm">{tt(o.name)}</span>
                        {s.enoughData ? (
                          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                            {s.score}/100
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-ink-400">{s.total}</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-ink-400">
        <Icon name="info" size={15} />
        {t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}
      </p>
    </Page>
  )
}
