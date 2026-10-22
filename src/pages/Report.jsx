import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { Btn, Card, Checkbox, DemoBadge, Field, Notice, Page, RadioCard, Select, TextArea, TextInput } from '../components/Common.jsx'
import { SpeakButton } from '../components/Actions.jsx'
import Icon from '../components/icons.jsx'
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
  const verifyStep = hasDraftStep ? 9 : 8

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
      const field = (key, fallback = '') => (corrections[key] && corrections[key].trim()) || (ai && ai.fields && ai.fields[key] ? tt(ai.fields[key]) : '') || fallback
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

  const heading = {
    1: { title: t('report.q1'), sub: null },
    2: { title: t('report.q2'), sub: null },
    3: { title: t('report.q3'), sub: t('report.whereHelp') },
    4: { title: t('report.q4'), sub: t('report.whenHelp') },
    5: { title: t('report.q5'), sub: t('report.whoHelp') },
    6: { title: t('report.q6'), sub: t('report.witnessHelp') },
    7: { title: t('report.yourStory'), sub: t('report.storyHelp') },
    8: hasDraftStep ? { title: t('draft.title'), sub: t('draft.editHint') } : { title: t('report.q8'), sub: t('report.summaryHelp') },
    9: { title: t('report.q8'), sub: t('report.summaryHelp') },
  }[step] || { title: t('report.title'), sub: null }

  return (
    <Page
      eyebrow={t('report.stepOf', { n: step, total })}
      title={heading.title}
      sub={heading.sub}
      back={{ to: '/', label: t('nav.home') }}
      actions={<Btn to="/track" variant="secondary" size="sm" icon="track" full={false}>{t('home.track')}</Btn>}
    >
      {/* progress */}
      <div className="mb-5 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={t('report.progress')}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-line'}`} />
        ))}
      </div>

      {error ? (
        <div className="mb-4" aria-live="polite">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => (
            <RadioCard
              key={c.id}
              id={`cat-${c.id}`}
              name="category"
              value={c.id}
              checked={category === c.id}
              onChange={() => setCategory(c.id)}
              title={tt(c.label)}
            />
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-2.5">
          {DEPARTMENTS.map((d) => (
            <RadioCard
              key={d.id}
              id={`dept-${d.id}`}
              name="dept"
              value={d.id}
              checked={deptId === d.id}
              onChange={() => { setDeptId(d.id); setOfficeId('') }}
              title={tt(d.name)}
            />
          ))}
        </div>
      ) : null}

      {step === 3 ? (
        <Card>
          <Field label={t('report.searchOffice')} htmlFor="office-search">
            <TextInput id="office-search" value={officeQuery} onChange={setOfficeQuery} type="search" />
          </Field>
          <div className="space-y-2.5">
            {filteredOffices.map((o) => (
              <RadioCard
                key={o.id}
                id={`office-${o.id}`}
                name="office"
                value={o.id}
                checked={officeId === o.id}
                onChange={() => setOfficeId(o.id)}
                title={tt(o.name)}
                sub={o.district}
              />
            ))}
            {!filteredOffices.length ? <p className="text-base text-ink-500">{t('report.noOffice')}</p> : null}
          </div>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <Field label={t('report.whenHelp')} htmlFor="when">
            <TextInput id="when" value={when} onChange={setWhen} placeholder={lang === 'hi' ? 'मंगलवार सुबह' : 'Tuesday morning'} />
          </Field>
          <SpeakButton onText={(text) => setWhen((w) => (w ? `${w} ${text}` : text))} lang={lang} />
        </Card>
      ) : null}

      {step === 5 ? (
        <Card>
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
        <div className="space-y-3">
          <div className="space-y-3">
            {witnesses.map((w, i) => (
              <Card key={i}>
                <Field label={t('report.witnessName')} htmlFor={`wn-${i}`}>
                  <TextInput id={`wn-${i}`} value={w.name} onChange={(v) => updateWitness(i, 'name', v)} />
                </Field>
                <SpeakButton onText={(text) => updateWitness(i, 'name', w.name ? `${w.name} ${text}` : text)} lang={lang} />
                <Field label={t('report.witnessRelation')} htmlFor={`wr-${i}`}>
                  <TextInput id={`wr-${i}`} value={w.relation} onChange={(v) => updateWitness(i, 'relation', v)} />
                </Field>
                <Btn variant="quiet" size="sm" icon="close" full={false} onClick={() => removeWitness(i)}>
                  {t('report.removeWitness')}
                </Btn>
              </Card>
            ))}
          </div>
          <Btn variant="secondary" icon="plus" onClick={addWitness}>
            {t('report.addWitness')}
          </Btn>
          <Notice tone="info">{t('report.witnessHelp')}</Notice>
        </div>
      ) : null}

      {step === 7 ? (
        <div className="space-y-4">
          <Card>
            <Field label={t('report.storyHelp')} htmlFor="narrative">
              <TextArea id="narrative" value={narrative} onChange={setNarrative} rows={5} />
            </Field>
            <SpeakButton onText={(text) => setNarrative((n) => (n ? `${n} ${text}` : text))} lang={lang} />

            <div className="mt-5 rounded-3xl bg-brand-50 p-4">
              <div className="flex items-center gap-2">
                <Icon name="mic" size={18} className="text-ink-500" />
                <h3 className="text-base font-semibold">{t('report.record')}</h3>
              </div>
              <p className="mt-1 text-sm text-ink-500">{t('report.recordHelp')}</p>
              {!isRecording && !recording ? (
                <div className="mt-3 space-y-2">
                  <Btn variant="primary" icon="mic" onClick={startRecording}>
                    {t('report.startRecording')}
                  </Btn>
                  <Btn variant="secondary" icon="play" onClick={useDemoRecording}>
                    {t('report.demoRecording')}
                  </Btn>
                  <p className="text-xs text-ink-400">{t('report.demoRecordingHint')}</p>
                </div>
              ) : null}
              {isRecording ? (
                <div className="mt-3">
                  <p aria-live="polite" className="mb-2 flex items-center gap-2 text-base font-semibold text-red-800">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-700" aria-hidden="true" />
                    {t('report.recording')} {recordingSeconds}s
                  </p>
                  <Btn variant="warning" icon="stop" onClick={stopRecording}>
                    {t('report.stopRecording')}
                  </Btn>
                </div>
              ) : null}
              {recording && !isRecording ? (
                <div className="mt-3">
                  <p className="text-base font-semibold">{t('report.recorded', { n: recordingSeconds })}</p>
                  {recordingUrl ? <audio controls src={recordingUrl} className="mt-2 w-full" aria-label={t('report.record')} /> : null}
                  <div className="mt-2">
                    <Btn variant="secondary" size="sm" icon="mic" full={false} onClick={startRecording}>
                      {t('report.recode')}
                    </Btn>
                  </div>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-ink-400">{t('report.voiceNote')}</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Icon name="file" size={18} className="text-ink-500" />
              <h3 className="text-base font-semibold">{t('report.q7')}</h3>
            </div>
            <p className="mt-1 text-sm text-ink-500">{t('report.evidenceHelp')}</p>
            <label htmlFor="evidence-files" className="mt-3 mb-1.5 block text-sm font-semibold text-ink-700">
              {t('report.pickFiles')}
            </label>
            <input
              ref={fileInput}
              id="evidence-files"
              type="file"
              multiple
              accept="image/*,application/pdf,audio/*,video/*"
              onChange={onFiles}
              className="block w-full rounded-2xl border border-dashed border-line-strong bg-brand-50/60 p-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="mt-2 text-xs text-ink-400">{t('report.evidenceMax', { mb: CONFIG.maxEvidenceMB })}</p>
            {files.length ? (
              <ul className="mt-3 space-y-2">
                {files.map((f) => (
                  <li key={f.clientId} className="flex items-center justify-between gap-2 rounded-2xl border border-line p-3">
                    <span className="min-w-0 break-all text-sm">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((x) => x.clientId !== f.clientId))}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-500 hover:bg-brand-50"
                      aria-label={t('report.removeFile')}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        </div>
      ) : null}

      {step === 8 && hasDraftStep ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {ai && ai.demo ? <DemoBadge /> : null}
            <span className="text-sm text-ink-400">{t('draft.aiNeverDecides')}</span>
          </div>

          {aiLoading ? (
            <Card>
              <p role="status" className="flex items-center gap-2 text-base text-ink-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden="true" />
                {t('common.loading')}
              </p>
            </Card>
          ) : ai ? (
            <>
              {ai.demo ? <Notice tone="warn">{t('draft.demoNote')}</Notice> : null}

              {ai.transcript ? (
                <Card>
                  <details>
                    <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-base font-semibold">
                      <Icon name="mic" size={17} className="text-ink-500" />
                      {t('draft.transcript')}
                    </summary>
                    <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                      {ai.transcript.segments?.map((seg, i) => (
                        <p key={i} className="text-sm text-ink-600">
                          <span className="mr-2 font-mono text-xs text-ink-400">{seg.t}</span>
                          {typeof seg === 'string' ? seg : tt(seg)}
                        </p>
                      ))}
                      {!ai.transcript.segments?.length ? (
                        <p className="text-base">{typeof ai.transcript.text === 'string' ? ai.transcript.text : tt(ai.transcript.text)}</p>
                      ) : null}
                    </div>
                  </details>
                </Card>
              ) : null}

              {FIELD_ORDER.map((key) => {
                const field = ai.fields[key]
                if (!field) return null
                const isEditing = editing === key
                return (
                  <Card key={key}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="label-caps">{t(`draft.field.${key}`)}</h3>
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => { setEditing(key); setCorrections((c) => ({ ...c, [key]: c[key] ?? tt(field) })) }}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-500 hover:bg-brand-50"
                        >
                          <Icon name="edit" size={14} />
                          {t('draft.correct')}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink-800">{tt(field)}</p>
                    {field.source && field.source.kind === 'quote' ? (
                      <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-sm text-ink-500">
                        <Icon name="mic" size={13} className="mr-1.5 inline align-[-2px]" />
                        {t('draft.fromRecording', { t: field.source.t })}: {tt(field.source.quote ?? field.source.text ?? '')}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-ink-400">{t('draft.noQuote')}</p>
                    )}
                    {corrections[key] && !isEditing ? (
                      <div className="mt-3 rounded-2xl border-l-2 border-ink bg-brand-50 p-3">
                        <p className="label-caps">{t('draft.yourVersion')}</p>
                        <p className="mt-1 text-base">{corrections[key]}</p>
                      </div>
                    ) : null}
                    {isEditing ? (
                      <div className="mt-3">
                        <Field label={t('draft.yourVersion')} htmlFor={`corr-${key}`}>
                          <TextArea id={`corr-${key}`} value={corrections[key] ?? ''} onChange={(v) => setCorrections((c) => ({ ...c, [key]: v }))} />
                        </Field>
                        <Btn variant="secondary" size="sm" icon="check" full={false} onClick={() => setEditing(null)}>
                          {t('common.save')}
                        </Btn>
                      </div>
                    ) : null}
                  </Card>
                )
              })}
              <Notice tone="info">{t('draft.keepBoth')}</Notice>
            </>
          ) : (
            <Notice tone="warn">{t('verify.error')}</Notice>
          )}
        </div>
      ) : null}

      {step === verifyStep && !(step === 8 && hasDraftStep) ? (
        <div className="space-y-4">
          <Card>
            <dl>
              {[
                [t('report.q1'), tt(categoryLabel(category))],
                [t('report.q3'), tt(selectedOffice?.name)],
                [t('report.q4'), corrections.when || when || tt(ai?.fields?.when)],
                [t('report.yourStory'), corrections.what_happened || tt(ai?.fields?.what_happened) || narrative],
                [t('report.q7'), t('report.filesChosen', { n: files.length + (recording ? 1 : 0) })],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line py-2.5 last:border-0">
                  <dt className="label-caps">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-base text-ink-800">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Icon name="phone" size={17} className="text-ink-500" />
              {t('report.phoneTitle')}
            </h3>
            <div className="mt-3">
              <Field label={t('report.phone')} htmlFor="phone">
                <TextInput id="phone" type="tel" inputMode="tel" value={phone} onChange={setPhone} placeholder="98XXXXXXXX" autoComplete="tel" />
              </Field>
            </div>
            {!otpSent ? (
              <Btn variant="secondary" size="sm" full={false} onClick={() => setOtpSent(true)}>
                {t('report.sendOtp')}
              </Btn>
            ) : null}
            {otpSent && !phoneVerified ? (
              <div className="mt-3">
                <Notice tone="warn">{t('report.otpShown', { otp: CONFIG.demoOtp })}</Notice>
                <div className="mt-3">
                  <Field label={t('report.otp')} htmlFor="otp">
                    <TextInput id="otp" inputMode="numeric" value={otp} onChange={setOtp} />
                  </Field>
                </div>
                <Btn variant="secondary" size="sm" full={false} onClick={verifyOtp}>
                  {t('report.verify')}
                </Btn>
              </div>
            ) : null}
            {phoneVerified ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Icon name="check" size={16} /> {t('report.verified')}
              </p>
            ) : null}
          </Card>

          <Card>
            <Checkbox id="declaration" checked={declaration} onChange={setDeclaration} label={t('report.declaration')} />
          </Card>

          <p className="text-center text-sm text-ink-400">{t('common.demoOnly')}</p>
        </div>
      ) : null}

      {/* sticky navigation */}
      <div className="sticky bottom-0 z-20 -mx-2 mt-6 flex gap-2 border-t border-line bg-paper/80 px-2 py-3 backdrop-blur">
        {step > 1 ? (
          <Btn variant="secondary" icon="arrowLeft" onClick={goBack}>
            {t('common.back')}
          </Btn>
        ) : null}
        {step < total && !(step === 8 && hasDraftStep) ? (
          <Btn iconRight="arrowRight" onClick={goNext}>
            {step === 7 ? (recording ? t('report.continueDraft') : t('report.continueNoRecording')) : t('common.next')}
          </Btn>
        ) : null}
        {step === 8 && hasDraftStep ? (
          <Btn iconRight="arrowRight" onClick={() => setStep(9)} disabled={aiLoading}>
            {t('draft.continue')}
          </Btn>
        ) : null}
        {step === verifyStep ? (
          <Btn iconRight="arrowRight" onClick={submit} disabled={submitting}>
            {submitting ? t('common.loading') : t('report.send')}
          </Btn>
        ) : null}
      </div>
    </Page>
  )
}
