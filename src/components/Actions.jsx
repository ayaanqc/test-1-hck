import { useRef, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { verifyComplaint } from '../lib/store.js'
import { fmtDate, shortHash } from '../lib/format.js'
import { getEvidence } from '../lib/db.js'
import { Btn, Notice } from './Common.jsx'

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
        🔒 {t('verify.button')}
      </Btn>
      <p className="mt-2 text-sm text-slate-700">{t('verify.what')}</p>
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

  if (!events.length) return <p className="text-base text-slate-700">{t('review.noEvidence')}</p>

  async function open(ev) {
    const rec = await getEvidence(ev.details.evidenceId)
    if (!rec) return
    const url = URL.createObjectURL(rec.blob)
    setOpened((o) => ({ ...o, [ev.seq]: url }))
  }

  return (
    <ul className="space-y-2">
      {events.map((ev) => (
        <li key={ev.seq} className="rounded-lg border-2 border-slate-200 p-3">
          <p className="text-base font-semibold">{ev.details.name}</p>
          <p className="text-sm text-slate-700">
            {ev.details.type} · {Math.max(1, Math.round((ev.details.size || 0) / 1024))} KB
          </p>
          <p className="break-all text-sm text-slate-700">
            {t('review.fingerprint')}: {ev.details.fingerprint}
          </p>
          <p className="text-sm text-slate-700">
            {t('review.changed')}: {fmtDate(ev.details.lastModified, lang, true)}
          </p>
          {ev.details.note ? <p className="mt-1 text-base">{tt(ev.details.note)}</p> : null}
          {allowOpen ? (
            <div className="mt-2">
              <Btn variant="quiet" onClick={() => open(ev)}>
                {t('review.showFile')}
              </Btn>
              {opened[ev.seq] ? (
                <p className="mt-2 break-all">
                  <a className="text-base font-semibold text-brand-700 underline" href={opened[ev.seq]} target="_blank" rel="noreferrer">
                    {ev.details.name}
                  </a>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-700">{shortHash(ev.details.fingerprint)}</p>
          )}
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
      <Btn variant="quiet" onClick={listening ? stop : start} ariaLabel={label || t('report.speak')}>
        🎙 {listening ? t('report.listening') : label || t('report.speak')}
      </Btn>
      <p aria-live="polite" className="mt-1 text-sm text-slate-700">
        {message}
      </p>
    </div>
  )
}
