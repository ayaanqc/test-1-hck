import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Field, Notice, Page, SectionHeading, TextInput } from '../components/Common.jsx'
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
    <Page title={t('public.title')} sub={t('public.intro')} back={{ to: '/', label: t('nav.home') }}>
      <Card>
        <form onSubmit={search}>
          <Field label={t('public.searchLabel')} htmlFor="public-search">
            <TextInput id="public-search" value={q} onChange={setQ} placeholder="JD-2026-004821" />
          </Field>
          <Btn type="submit">{t('common.search')}</Btn>
        </form>
        {error ? (
          <div className="mt-3">
            <Notice tone="warn">{error}</Notice>
          </div>
        ) : null}
      </Card>

      <SectionHeading>{t('public.dept')}</SectionHeading>
      <p className="text-base text-slate-700">{t('public.intro')}</p>

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
          <Card key={dept.id} className="mt-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold">{tt(dept.name)}</h3>
              <Link to={`/record/department/${dept.id}`} className="text-base font-semibold text-brand-700 underline">
                {t('public.deptPage')} →
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-700">
              {totals.total} {t('public.allegations')} · {totals.closed} {t('acc.closed')}
            </p>
            <ul className="mt-2 space-y-2">
              {offices.map((o) => {
                const s = officeStats(o.id, complaints)
                return (
                  <li key={o.id}>
                    <Link to={`/record/office/${o.id}`} className="flex items-center justify-between gap-2 rounded-lg border-2 border-slate-200 p-2 hover:border-brand-600">
                      <span className="min-w-0 text-base">{tt(o.name)}</span>
                      <span className="shrink-0 text-sm font-semibold text-slate-700">
                        {s.total} · {t('public.indicator')}: {s.enoughData ? s.score : '—'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      })}

      <p className="mt-4 text-sm text-slate-700">
        {t('public.indicatorHidden', { n: CONFIG.minClosedComplaintsForIndicator })}
      </p>
      <div className="mt-2">
        <Btn to="/accountability" variant="secondary">{t('acc.title')}</Btn>
      </div>
    </Page>
  )
}
