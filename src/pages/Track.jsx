import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Field, Notice, Page, TextInput } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { derive } from '../lib/engine.js'

export default function Track() {
  const { t, tt } = useI18n()
  const { complaints } = useStore()
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [error, setError] = useState('')

  function find(e) {
    e.preventDefault()
    const clean = id.trim().toUpperCase()
    const match = complaints.find((c) => c.id.toUpperCase() === clean)
    if (!match) {
      setError(t('track.notFound'))
      return
    }
    setError('')
    navigate(`/complaint/${match.id}`)
  }

  const suggested = complaints.filter((c) => !c.archived).slice(0, 3)

  return (
    <Page eyebrow={t('nav.track')} title={t('track.title')} sub={t('track.help')}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <form onSubmit={find}>
            <Field label={t('track.label')} htmlFor="track-id" required>
              <TextInput id="track-id" value={id} onChange={setId} placeholder="JD-2026-004821" autoComplete="off" />
            </Field>
            <Btn type="submit" icon="track" iconRight="arrowRight">
              {t('track.button')}
            </Btn>
          </form>
          {error ? (
            <div className="mt-3" aria-live="polite">
              <Notice tone="warn">{error}</Notice>
            </div>
          ) : null}
          <p className="mt-4 text-sm text-ink-400">
            <Link className="font-semibold text-ink underline decoration-line-strong underline-offset-4" to="/complaint/JD-2026-004821">
              {t('track.example')}
            </Link>
          </p>
        </Card>

        <Card>
          <p className="label-caps">{t('home.latest')}</p>
          <ul className="mt-2 divide-y divide-line">
            {suggested.map((c) => {
              const d = derive(c)
              return (
                <li key={c.id}>
                  <Link to={`/complaint/${c.id}`} className="flex items-center gap-3 py-3 hover:text-ink">
                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-ink-500">
                      <Icon name="file" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-sm">{c.id}</span>
                      <span className="block truncate text-sm text-ink-400">{tt(d.officeNow)}</span>
                    </span>
                    <Icon name="chevronRight" size={16} className="shrink-0 text-ink-400" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </Page>
  )
}
