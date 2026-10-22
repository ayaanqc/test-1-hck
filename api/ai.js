// Server endpoint for AI drafting and transcription.
// The provider key is read here only, never in the frontend.
// With no key set, the client falls back to prepared demo results.

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

function send(res, code, obj) {
  res.statusCode = code
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

function parseJson(text) {
  if (!text) throw new Error('Empty response')
  const cleaned = String(text).replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1))
    throw new Error('Could not read the model response as JSON')
  }
}

const DRAFT_INSTRUCTION = `You help a citizen in India turn their own account of a problem with a government office into a structured complaint draft.

Rules:
- NEVER guess. If something was not said or written, use the exact value "not_stated".
- Do not decide whether the complaint is true. Do not use words like guilty, corrupt or accused.
- Use neutral words: "the complainant says", "allegation", "complaint".
- Every field must include a source. If the value comes from a quote in the recording, set source to {"kind":"quote","t":"<mm:ss>","quote":"<exact quote>"}. If the value comes from a document, use {"kind":"document","document":"<file name>","page":"<page or n/a>"}. If nothing was stated, set source to {"kind":"not_stated"} and the value to "not_stated".
- Write the values in the language given by "language" (BCP-47: "en" or "hi").

Return JSON only, in this exact shape:
{
  "fields": {
    "what_happened": {"value": "...", "source": {...}},
    "when": {"value": "...", "source": {...}},
    "where": {"value": "...", "source": {...}},
    "who": {"value": "...", "source": {...}},
    "what_was_asked": {"value": "...", "source": {...}},
    "evidence": {"value": "...", "source": {...}},
    "timeline": {"value": "...", "source": {...}}
  },
  "notes": "one short sentence about anything that was unclear"
}`

async function callGemini(parts, { json = true } = {}) {
  const key = process.env.GEMINI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: 'application/json' } : {}) },
  }
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`Gemini error ${r.status}`)
  const data = await r.json()
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  return text
}

async function geminiTranscribe(audioBase64, mimeType, language) {
  const prompt = `Transcribe this recording exactly, in the language it is spoken (${language}). Then list the sentences with timestamps.
Return JSON only: {"transcript": "full text", "segments": [{"t": "mm:ss", "text": "..."}]}`
  const text = await callGemini([
    { text: prompt },
    { inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } },
  ])
  const parsed = parseJson(text)
  return { transcript: String(parsed.transcript || ''), segments: Array.isArray(parsed.segments) ? parsed.segments : [] }
}

async function geminiDraft(transcript, language) {
  const text = await callGemini([
    { text: `${DRAFT_INSTRUCTION}\n\nlanguage: ${language}\n\nTranscript of the complainant's recording:\n${transcript}` },
  ])
  return parseJson(text)
}

async function openaiTranscribe(audioBase64, mimeType) {
  const key = process.env.OPENAI_API_KEY
  const bytes = Buffer.from(audioBase64, 'base64')
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mimeType || 'audio/webm' }), 'recording.webm')
  form.append('model', 'whisper-1')
  form.append('response_format', 'json')
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: form,
  })
  if (!r.ok) throw new Error(`OpenAI transcription error ${r.status}`)
  const data = await r.json()
  return { transcript: String(data.text || ''), segments: [] }
}

async function openaiDraft(transcript, language) {
  const key = process.env.OPENAI_API_KEY
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DRAFT_INSTRUCTION },
        { role: 'user', content: `language: ${language}\n\nTranscript:\n${transcript}` },
      ],
    }),
  })
  if (!r.ok) throw new Error(`OpenAI error ${r.status}`)
  const data = await r.json()
  return parseJson(data.choices?.[0]?.message?.content || '')
}

export default async function handler(req, res) {
  if (!res.statusCode) res.statusCode = 200
  if (req.method && req.method !== 'POST') {
    return send(res, 405, { error: 'Use POST' })
  }

  let payload = req.body
  try {
    if (typeof payload === 'string') payload = JSON.parse(payload || '{}')
    if (payload && payload.body && typeof payload.body === 'string') payload = JSON.parse(payload.body)
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' })
  }
  payload = payload || {}

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const hasGemini = !!process.env.GEMINI_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  if (!hasGemini && !hasOpenAI) {
    // The client shows its prepared demo result and labels it "demo result".
    return send(res, 200, { demo: true, reason: 'no_key' })
  }

  if (payload.task === 'transcribe' && (!payload.audioBase64 || payload.audioBase64.length < 64)) {
    return send(res, 200, { demo: true, reason: 'no_audio' })
  }

  try {
    if (payload.task === 'transcribe') {
      const out =
        provider === 'openai' && hasOpenAI
          ? await openaiTranscribe(payload.audioBase64, payload.mimeType)
          : await geminiTranscribe(payload.audioBase64, payload.mimeType, payload.language || 'en')
      return send(res, 200, { demo: false, ...out })
    }

    if (payload.task === 'draft') {
      const transcript = String(payload.transcript || '').slice(0, 20000)
      if (!transcript.trim()) return send(res, 200, { demo: true, reason: 'empty_transcript' })
      const out =
        provider === 'openai' && hasOpenAI
          ? await openaiDraft(transcript, payload.language || 'en')
          : await geminiDraft(transcript, payload.language || 'en')
      return send(res, 200, { demo: false, fields: out.fields || out, notes: out.notes || null })
    }

    return send(res, 400, { error: 'Unknown task' })
  } catch (err) {
    // Fail safe: the app keeps working, labelled as a demo result.
    return send(res, 200, { demo: true, reason: 'provider_error', message: String(err && err.message ? err.message : err) })
  }
}
