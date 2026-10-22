import { useRef, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { verifyComplaint } from '../lib/store.js'
import { fmtDate, shortHash } from '../lib/format.js'
import { getEvidence } from '../lib/db.js'
import { Btn, Notice } from './Common.jsx'
import Icon from './icons.jsx'

export function VerifyButton({ complaint }) {
  const { t } = useI18n()
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  async function run() {
    setState('checking')
    try {
      const r = await verifyComplaint(complaint.id)
      setResult(r)
      setState(r.ok ? 'ok' : 'fail')
    } catch {
      setState('error')
    }
  }

  return (
    <div>
      <Btn variant="secondary" onClick={run} disabled={state === 'checking'}>
        <Icon name="lock" size={17} /> {t('verify.button')}
      </Btn>
      <p className="mt-2 text-sm text-ink-500">{t('verify.what')}</p>
      <div aria-live="polite">
        {state === 'checking' ? <p className="mt-2 text-base">{t('verify.checking')}</p> : null}
        {state === 'ok' ? (
          <div className="mt-2">
            <Notice tone="safe">{t('verify.ok', { n: result.count })}</Notice>
          </div>
        ) : null}
        {state === 'fail' ? (
          <div className="mt-2">
            <Notice tone="danger" title={t('verify.failEvent', { seq: result.seq })}>
              {result.kind === 'evidence'
                ? result.reason === 'missing'
                  ? t('verify.failMissing', { seq: result.seq, name: result.name })
                  : t('verify.failEvidence', { seq: result.seq, name: result.name })
                : result.reason === 'link'
                  ? t('verify.linkFail', { seq: result.seq })
                  : t('verify.failEvent', { seq: result.seq })}
              <span className="mt-2 block text-sm">{t('verify.note')}</span>
            </Notice>
          </div>
        ) : null}
        {state === 'error' ? <Notice tone="warn">{t('verify.error')}</Notice> : null}
      </div>
    </div>
  )
}

export function EvidenceList({ complaint, allowOpen = false }) {
  const { t, tt, lang } = useI18n()
  const [opened, setOpened] = useState({})
  const events = complaint.events.filter((e) => e.type === 'evidence_added')

  if (!events.length) return <p className="text-base text-ink-500">{t('review.noEvidence')}</p>

  async function open(ev) {
    const rec = await getEvidence(ev.details.evidenceId)
    if (!rec) return
    const url = URL.createObjectURL(rec.blob)
    setOpened((o) => ({ ...o, [ev.seq]: url }))
  }

  return (
    <ul className="space-y-2">
      {events.map((ev) => (
        <li key={ev.seq} className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-ink-500">
              <Icon name="file" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{ev.details.name}</p>
              <p className="text-sm text-ink-400">
                {ev.details.type} · {Math.max(1, Math.round((ev.details.size || 0) / 1024))} KB
              </p>
            </div>
          </div>
          <p className="mt-3 break-all font-mono text-xs text-ink-400">
            {t('review.fingerprint')}: {allowOpen ? ev.details.fingerprint : shortHash(ev.details.fingerprint)}
          </p>
          <p className="mt-1 text-sm text-ink-400">
            {t('review.changed')}: {fmtDate(ev.details.lastModified, lang, true)}
          </p>
          {ev.details.note ? <p className="mt-2 text-sm text-ink-700">{tt(ev.details.note)}</p> : null}
          {allowOpen ? (
            <div className="mt-3">
              <Btn variant="secondary" size="sm" onClick={() => open(ev)} full={false}>
                {t('review.showFile')}
              </Btn>
              {opened[ev.seq] ? (
                <p className="mt-2 break-all">
                  <a className="text-sm font-semibold text-ink underline" href={opened[ev.seq]} target="_blank" rel="noreferrer">
                    {ev.details.name}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function SpeakButton({ onText, lang = 'en', label }) {
  const { t } = useI18n()
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState('')
  const recRef = useRef(null)

  const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

  function start() {
    if (!SR) {
      setMessage(t('report.speakUnsupported'))
      return
    }
    const rec = new SR()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
      onText(text)
      setListening(false)
    }
    rec.onerror = () => {
      setMessage(t('report.speakUnsupported'))
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    setMessage('')
    setListening(true)
    rec.start()
  }

  function stop() {
    if (recRef.current) recRef.current.stop()
    setListening(false)
  }

  return (
    <div className="mt-2">
      <Btn variant="secondary" size="sm" full={false} onClick={listening ? stop : start} ariaLabel={label || t('report.speak')} icon="mic">
        {listening ? t('report.listening') : label || t('report.speak')}
      </Btn>
      <p aria-live="polite" className="mt-1 text-sm text-ink-500">
        {message}
      </p>
    </div>
  )
}
