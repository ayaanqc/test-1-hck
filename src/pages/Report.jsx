import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { Btn, Card, Checkbox, DemoBadge, Field, Notice, Page, Select, TextArea, TextInput } from '../components/Common.jsx'
import { SpeakButton } from '../components/Actions.jsx'
import { CATEGORIES, DEPARTMENTS, OFFICES, categoryLabel } from '../data/authorities.js'
import { CONFIG } from '../data/config.js'
import { prepareDraft } from '../lib/ai.js'
import { submitComplaint } from '../lib/store.js'

const FIELD_ORDER = ['what_happened', 'when', 'where', 'who', 'what_was_asked', 'evidence', 'timeline']

export default function Report() {
  const { t, tt, lang } = useI18n()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [deptId, setDeptId] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [officeQuery, setOfficeQuery] = useState('')
  const [when, setWhen] = useState('')
  const [whoDesc, setWhoDesc] = useState('')
  const [whoName, setWhoName] = useState('')
  const [witnesses, setWitnesses] = useState([])
  const [narrative, setNarrative] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [declaration, setDeclaration] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [recording, setRecording] = useState(null)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const [ai, setAi] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [corrections, setCorrections] = useState({})
  const [editing, setEditing] = useState(null)

  const hasDraftStep = !!recording
  const total = hasDraftStep ? 9 : 8
  const fileInput = useRef(null)

  const selectedOffice = OFFICES.find((o) => o.id === officeId)
  const deptOffices = useMemo(() => OFFICES.filter((o) => o.deptId === deptId), [deptId])
  const filteredOffices = useMemo(() => {
    const q = officeQuery.trim().toLowerCase()
    if (!q) return deptOffices
    return deptOffices.filter((o) => `${o.name.en} ${o.name.hi} ${o.district}`.toLowerCase().includes(q))
  }, [deptOffices, officeQuery])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
  }, [recordingUrl])

  useEffect(() => {
    if (step === 8 && hasDraftStep && !ai && !aiLoading) {
      setAiLoading(true)
      prepareDraft({ blob: recording, language: lang })
        .then((res) => setAi(res))
        .catch(() => setAi(null))
        .finally(() => setAiLoading(false))
    }
  }, [step, hasDraftStep, ai, aiLoading, recording, lang])

  function goNext() {
    setError('')
    if (step === 1 && !category) return setError(t('report.categoryRequired'))
    if (step === 2 && !deptId) return setError(t('report.officeRequired'))
    if (step === 3 && !officeId) return setError(t('report.officeRequired'))
    if (step === 4 && !when.trim()) return setError(t('report.whenRequired'))
    if (step === 7) {
      if (!recording && !narrative.trim()) return setError(t('report.whenRequired'))
      return setStep(8)
    }
    setStep((s) => Math.min(s + 1, total))
  }

  function goBack() {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        setRecording(blob)
        setAi(null)
        setCorrections({})
        if (recordingUrl) URL.revokeObjectURL(recordingUrl)
        setRecordingUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }
      recorderRef.current = mr
      const started = Date.now()
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => setRecordingSeconds(Math.round((Date.now() - started) / 1000)), 500)
      mr.start()
    } catch {
      setError(t('report.micError'))
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
  }

  function useDemoRecording() {
    const blob = new Blob([new Uint8Array(2048)], { type: 'audio/webm' })
    setRecording(blob)
    setAi(null)
    setCorrections({})
    setRecordingSeconds(18)
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    setRecordingUrl('')
    setError('')
  }

  function onFiles(e) {
    const chosen = Array.from(e.target.files || [])
    const ok = []
    for (const f of chosen) {
      if (f.size > CONFIG.maxEvidenceMB * 1024 * 1024) {
        setError(t('report.evidenceMax', { mb: CONFIG.maxEvidenceMB }))
        continue
      }
      ok.push({
        clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        type: f.type || 'application/octet-stream',
        blob: f,
        lastModified: f.lastModified,
      })
    }
    setFiles((prev) => [...prev, ...ok])
    if (fileInput.current) fileInput.current.value = ''
  }

  function addWitness() {
    setWitnesses((w) => [...w, { name: '', relation: '' }])
  }

  function updateWitness(i, key, value) {
    setWitnesses((w) => w.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)))
  }

  function removeWitness(i) {
    setWitnesses((w) => w.filter((_, idx) => idx !== i))
  }

  async function verifyOtp() {
    setError('')
    if (phone.replace(/\D/g, '').length < 10) return setError(t('report.phoneBad'))
    if (otp.trim() !== CONFIG.demoOtp) return setError(t('report.otpWrong'))
    setPhoneVerified(true)
  }

  async function submit() {
    setError('')
    if (!declaration) return setError(t('report.declarationRequired'))
    if (!phoneVerified) return setError(t('report.phoneBad'))
    setSubmitting(true)
    try {
      const field = (key, fallback = '') =>
        (corrections[key] && corrections[key].trim()) ||
        (ai && ai.fields && ai.fields[key] ? tt(ai.fields[key]) : '') ||
        fallback
      const finalNarrative = (field('what_happened') || narrative).trim()
      const finalWhen = (field('when') || when).trim()
      const finalWho = `${field('who') || whoDesc}${whoName ? ` — ${whoName}` : ''}`.trim()
      const allFiles = [...files]
      if (recording) {
        allFiles.push({
          clientId: 'voice-note',
          name: `voice_note_${Date.now()}.webm`,
          type: recording.type || 'audio/webm',
          blob: recording,
          lastModified: Date.now(),
        })
      }
      const complaint = await submitComplaint({
        category,
        deptId,
        officeId,
        when: finalWhen,
        where: tt(selectedOffice?.name),
        who: finalWho,
        witnesses: witnesses.filter((w) => w.name.trim()),
        narrative: finalNarrative,
        files: allFiles,
        complainant: { name: 'Sunita Devi', phone },
        phoneVerified,
        declaration: true,
        language: lang,
        aiAssisted: !!ai,
        aiDraft: ai ? { demo: ai.demo, transcript: ai.transcript?.text, fields: ai.fields, notes: ai.notes } : null,
        corrections: Object.keys(corrections).length ? corrections : null,
        recording: !!recording,
        incidentDate: null,
      })
      navigate(`/submitted/${complaint.id}`)
    } catch (err) {
      console.error(err)
      setError(t('verify.error'))
      setSubmitting(false)
    }
  }

  return (
    <Page title={t('report.title')} back={{ to: '/', label: t('nav.home') }}>
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>{t('report.stepOf', { n: step, total })}</span>
          <span className="text-slate-600">{Math.round((step / total) * 100)}%</span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={t('report.progress')}>
          <div className="h-full bg-brand-700" style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </div>

      {error ? (
        <div className="mb-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q1')}</h2>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <label key={c.id} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${category === c.id ? 'border-brand-700 bg-brand-50' : 'border-slate-300'}`}>
                <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => setCategory(c.id)} className="h-5 w-5" />
                <span className="text-base font-medium">{tt(c.label)}</span>
              </label>
            ))}
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q2')}</h2>
          <div className="mt-3 space-y-2">
            {DEPARTMENTS.map((d) => (
              <label key={d.id} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${deptId === d.id ? 'border-brand-700 bg-brand-50' : 'border-slate-300'}`}>
                <input type="radio" name="dept" value={d.id} checked={deptId === d.id} onChange={() => { setDeptId(d.id); setOfficeId('') }} className="h-5 w-5" />
                <span className="text-base font-medium">{tt(d.name)}</span>
              </label>
            ))}
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q3')}</h2>
          <p className="mt-1 text-base text-slate-700">{t('report.whereHelp')}</p>
          <Field label={t('report.searchOffice')} htmlFor="office-search">
            <TextInput id="office-search" value={officeQuery} onChange={setOfficeQuery} type="search" />
          </Field>
          <div className="space-y-2">
            {filteredOffices.map((o) => (
              <label key={o.id} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${officeId === o.id ? 'border-brand-700 bg-brand-50' : 'border-slate-300'}`}>
                <input type="radio" name="office" value={o.id} checked={officeId === o.id} onChange={() => setOfficeId(o.id)} className="h-5 w-5" />
                <span className="text-base font-medium">{tt(o.name)}</span>
              </label>
            ))}
            {!filteredOffices.length ? <p className="text-base">{t('report.noOffice')}</p> : null}
          </div>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q4')}</h2>
          <Field label={t('report.whenHelp')} htmlFor="when">
            <TextInput id="when" value={when} onChange={setWhen} placeholder={lang === 'hi' ? 'मंगलवार सुबह' : 'Tuesday morning'} />
          </Field>
          <SpeakButton onText={(text) => setWhen((w) => (w ? `${w} ${text}` : text))} lang={lang} />
        </Card>
      ) : null}

      {step === 5 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q5')}</h2>
          <Field label={t('report.whoHelp')} htmlFor="who">
            <TextArea id="who" value={whoDesc} onChange={setWhoDesc} />
          </Field>
          <SpeakButton onText={(text) => setWhoDesc((w) => (w ? `${w} ${text}` : text))} lang={lang} />
          <div className="mt-4">
            <Field label={t('report.nameKnown')} htmlFor="who-name">
              <TextInput id="who-name" value={whoName} onChange={setWhoName} />
            </Field>
          </div>
          <Notice tone="info">{t('report.whoPrivacy')}</Notice>
        </Card>
      ) : null}

      {step === 6 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.q6')}</h2>
          <p className="mt-1 text-base text-slate-700">{t('report.witnessHelp')}</p>
          <div className="mt-3 space-y-4">
            {witnesses.map((w, i) => (
              <div key={i} className="rounded-xl border-2 border-slate-200 p-3">
                <Field label={t('report.witnessName')} htmlFor={`wn-${i}`}>
                  <TextInput id={`wn-${i}`} value={w.name} onChange={(v) => updateWitness(i, 'name', v)} />
                </Field>
                <SpeakButton onText={(text) => updateWitness(i, 'name', w.name ? `${w.name} ${text}` : text)} lang={lang} />
                <Field label={t('report.witnessRelation')} htmlFor={`wr-${i}`}>
                  <TextInput id={`wr-${i}`} value={w.relation} onChange={(v) => updateWitness(i, 'relation', v)} />
                </Field>
                <Btn variant="quiet" onClick={() => removeWitness(i)}>
                  {t('report.removeWitness')}
                </Btn>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Btn variant="secondary" onClick={addWitness}>
              + {t('report.addWitness')}
            </Btn>
          </div>
        </Card>
      ) : null}

      {step === 7 ? (
        <Card>
          <h2 className="text-xl font-bold">{t('report.yourStory')}</h2>
          <p className="mt-1 text-base text-slate-700">{t('report.storyHelp')}</p>
          <Field label={t('report.evidenceHelp')} htmlFor="narrative">
            <TextArea id="narrative" value={narrative} onChange={setNarrative} rows={5} />
          </Field>
          <SpeakButton onText={(text) => setNarrative((n) => (n ? `${n} ${text}` : text))} lang={lang} />

          <hr className="my-4 border-slate-200" />
          <h3 className="text-lg font-bold">{t('report.record')}</h3>
          <p className="text-base text-slate-700">{t('report.recordHelp')}</p>
          {!isRecording && !recording ? (
            <div className="mt-2 space-y-2">
              <Btn variant="secondary" onClick={startRecording}>🎙 {t('report.startRecording')}</Btn>
              <Btn variant="quiet" onClick={useDemoRecording}>▶ {t('report.demoRecording')}</Btn>
              <p className="text-sm text-slate-700">{t('report.demoRecordingHint')}</p>
            </div>
          ) : null}
          {isRecording ? (
            <div className="mt-2">
              <p aria-live="polite" className="mb-2 text-base font-semibold text-red-800">● {t('report.recording')} {recordingSeconds}s</p>
              <Btn variant="warning" onClick={stopRecording}>■ {t('report.stopRecording')}</Btn>
            </div>
          ) : null}
          {recording && !isRecording ? (
            <div className="mt-2">
              <p className="text-base font-semibold">{t('report.recorded', { n: recordingSeconds })}</p>
              {recordingUrl ? <audio controls src={recordingUrl} className="mt-2 w-full" aria-label={t('report.record')} /> : null}
              <div className="mt-2">
                <Btn variant="quiet" onClick={startRecording}>🎙 {t('report.recode')}</Btn>
              </div>
            </div>
          ) : null}
          <p className="mt-2 text-sm text-slate-700">{t('report.voiceNote')}</p>

          <hr className="my-4 border-slate-200" />
          <h3 className="text-lg font-bold">{t('report.q7')}</h3>
          <p className="text-base text-slate-700">{t('report.evidenceHelp')}</p>
          <label htmlFor="evidence-files" className="mt-2 block text-base font-semibold">
            {t('report.pickFiles')}
          </label>
          <input
            ref={fileInput}
            id="evidence-files"
            type="file"
            multiple
            accept="image/*,application/pdf,audio/*,video/*"
            onChange={onFiles}
            className="mt-2 block w-full rounded-xl border-2 border-slate-400 p-3 text-base"
          />
          <p className="mt-1 text-sm text-slate-700">{t('report.evidenceMax', { mb: CONFIG.maxEvidenceMB })}</p>
          {files.length ? (
            <ul className="mt-2 space-y-1">
              {files.map((f) => (
                <li key={f.clientId} className="flex items-center justify-between gap-2 rounded border border-slate-200 p-2">
                  <span className="min-w-0 break-all text-base">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((x) => x.clientId !== f.clientId))}
                    className="min-h-[44px] shrink-0 rounded border-2 border-slate-400 px-3 text-base font-semibold"
                  >
                    {t('report.removeFile')}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {step === 8 && hasDraftStep ? (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{t('draft.title')}</h2>
            {ai && ai.demo ? <DemoBadge /> : null}
          </div>
          <p className="mt-1 text-base text-slate-700">{t('draft.editHint')}</p>
          {aiLoading ? (
            <p role="status" className="py-6 text-base">{t('common.loading')}</p>
          ) : ai ? (
            <div className="mt-3 space-y-4">
              {ai.demo ? <Notice tone="warn">{t('draft.demoNote')}</Notice> : null}
              {ai.transcript ? (
                <details className="rounded-xl border-2 border-slate-200 p-3">
                  <summary className="min-h-[44px] cursor-pointer text-base font-semibold">{t('draft.transcript')}</summary>
                  <div className="mt-2 space-y-1">
                    {ai.transcript.segments?.map((seg, i) => (
                      <p key={i} className="text-base text-slate-700">
                        <span className="font-mono text-sm">{seg.t}</span> {typeof seg === 'string' ? seg : tt(seg)}
                      </p>
                    ))}
                    {!ai.transcript.segments?.length ? <p className="text-base">{typeof ai.transcript.text === 'string' ? ai.transcript.text : tt(ai.transcript.text)}</p> : null}
                  </div>
                </details>
              ) : null}

              {FIELD_ORDER.map((key) => {
                const field = ai.fields[key]
                if (!field) return null
                const isEditing = editing === key
                return (
                  <div key={key} className="rounded-xl border-2 border-slate-200 p-3">
                    <h3 className="text-base font-bold">{t(`draft.field.${key}`)}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-base">{tt(field)}</p>
                    {field.source && field.source.kind === 'quote' ? (
                      <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-700">
                        {t('draft.fromRecording', { t: field.source.t })}: {tt(field.source.quote ?? field.source.text ?? '')}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-700">{t('draft.notStated')}</p>
                    )}
                    {corrections[key] ? (
                      <p className="mt-2 rounded border-l-4 border-brand-600 bg-brand-50 p-2 text-base">
                        <strong>{t('draft.yourVersion')}:</strong> {corrections[key]}
                      </p>
                    ) : null}
                    {isEditing ? (
                      <div className="mt-2">
                        <Field label={t('draft.yourVersion')} htmlFor={`corr-${key}`}>
                          <TextArea id={`corr-${key}`} value={corrections[key] ?? ''} onChange={(v) => setCorrections((c) => ({ ...c, [key]: v }))} />
                        </Field>
                        <Btn variant="quiet" onClick={() => setEditing(null)}>{t('common.save')}</Btn>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Btn variant="quiet" onClick={() => { setEditing(key); setCorrections((c) => ({ ...c, [key]: c[key] ?? tt(field) })) }}>
                          ✎ {t('draft.correct')}
                        </Btn>
                      </div>
                    )}
                  </div>
                )
              })}
              <Notice tone="info">
                {t('draft.aiNeverDecides')} {t('draft.keepBoth')}
              </Notice>
            </div>
          ) : (
            <Notice tone="warn">{t('verify.error')}</Notice>
          )}
        </Card>
      ) : null}

      {((step === 9 && hasDraftStep) || (step === 8 && !hasDraftStep)) ? (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-bold">{t('report.q8')}</h2>
            <p className="mt-1 text-base text-slate-700">{t('report.summaryHelp')}</p>
            <dl className="mt-2">
              <div className="border-b border-slate-200 py-2">
                <dt className="text-sm font-semibold text-slate-700">{t('report.q1')}</dt>
                <dd className="text-base">{tt(categoryLabel(category))}</dd>
              </div>
              <div className="border-b border-slate-200 py-2">
                <dt className="text-sm font-semibold text-slate-700">{t('report.q3')}</dt>
                <dd className="text-base">{tt(selectedOffice?.name)}</dd>
              </div>
              <div className="border-b border-slate-200 py-2">
                <dt className="text-sm font-semibold text-slate-700">{t('report.q4')}</dt>
                <dd className="text-base">{corrections.when || when || tt(ai?.fields?.when)}</dd>
              </div>
              <div className="border-b border-slate-200 py-2">
                <dt className="text-sm font-semibold text-slate-700">{t('report.yourStory')}</dt>
                <dd className="whitespace-pre-wrap text-base">{corrections.what_happened || tt(ai?.fields?.what_happened) || narrative}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-semibold text-slate-700">{t('report.q7')}</dt>
                <dd className="text-base">{t('report.filesChosen', { n: files.length + (recording ? 1 : 0) })}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-xl font-bold">{t('report.phoneTitle')}</h2>
            <Field label={t('report.phone')} htmlFor="phone">
              <TextInput id="phone" type="tel" inputMode="tel" value={phone} onChange={setPhone} placeholder="98XXXXXXXX" autoComplete="tel" />
            </Field>
            {!otpSent ? (
              <Btn variant="secondary" onClick={() => setOtpSent(true)}>{t('report.sendOtp')}</Btn>
            ) : null}
            {otpSent && !phoneVerified ? (
              <div className="mt-3">
                <Notice tone="warn">{t('report.otpShown', { otp: CONFIG.demoOtp })}</Notice>
                <Field label={t('report.otp')} htmlFor="otp">
                  <TextInput id="otp" inputMode="numeric" value={otp} onChange={setOtp} />
                </Field>
                <Btn variant="secondary" onClick={verifyOtp}>{t('report.verify')}</Btn>
              </div>
            ) : null}
            {phoneVerified ? <Notice tone="safe">{t('report.verified')}</Notice> : null}
          </Card>

          <Card>
            <h2 className="text-xl font-bold">{t('report.declarationTitle')}</h2>
            <Checkbox id="declaration" checked={declaration} onChange={setDeclaration} label={t('report.declaration')} />
          </Card>

          <Btn onClick={submit} disabled={submitting}>
            {submitting ? t('common.loading') : t('report.send')}
          </Btn>
        </div>
      ) : null}

      <div className="mt-5 flex gap-3">
        {step > 1 ? (
          <Btn variant="quiet" onClick={goBack}>{t('common.back')}</Btn>
        ) : null}
        {step < total && !(step === 8 && hasDraftStep) ? (
          <Btn onClick={goNext}>
            {step === 7 ? (recording ? t('report.continueDraft') : t('report.continueNoRecording')) : t('common.next')}
          </Btn>
        ) : null}
        {step === 8 && hasDraftStep ? (
          <Btn onClick={() => setStep(9)} disabled={aiLoading}>{t('draft.continue')}</Btn>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-slate-700">{t('common.demoOnly')}</p>
    </Page>
  )
}
