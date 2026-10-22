import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Field, Notice, Page, TextInput } from '../components/Common.jsx'

export default function Track() {
  const { t } = useI18n()
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

  return (
    <Page title={t('track.title')}>
      <Card>
        <form onSubmit={find}>
          <Field label={t('track.label')} hint={t('track.help')} htmlFor="track-id" required>
            <TextInput id="track-id" value={id} onChange={setId} placeholder="JD-2026-004821" autoComplete="off" />
          </Field>
          <Btn type="submit">{t('track.button')}</Btn>
        </form>
        {error ? (
          <div className="mt-3">
            <Notice tone="warn">{error}</Notice>
          </div>
        ) : null}
        <p className="mt-3 text-base">
          <Link className="font-semibold text-brand-700 underline" to="/complaint/JD-2026-004821">
            {t('track.example')}
          </Link>
        </p>
      </Card>
    </Page>
  )
}
