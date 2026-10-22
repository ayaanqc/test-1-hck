// All AI work happens through /api/ai. The key stays on the server.
// With no key, prepared demo results are returned and labelled "demo result".
import { DEMO_DRAFT, DEMO_TRANSCRIPT } from '../data/demoAi.js'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function post(payload) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`)
  return res.json()
}

function demoResult() {
  return {
    demo: true,
    transcript: {
      text: DEMO_TRANSCRIPT,
      segments: DEMO_TRANSCRIPT.segments,
    },
    fields: DEMO_DRAFT.fields,
    notes: DEMO_DRAFT.notes,
  }
}

export async function prepareDraft({ blob, language = 'en' }) {
  try {
    let audioBase64 = null
    if (blob) audioBase64 = await blobToBase64(blob)
    const transcribed = await post({
      task: 'transcribe',
      audioBase64,
      mimeType: blob ? blob.type : null,
      language,
    })
    if (!transcribed || transcribed.demo || !transcribed.transcript) return demoResult()
    const drafted = await post({ task: 'draft', transcript: transcribed.transcript, language })
    if (!drafted || drafted.demo || !drafted.fields) return demoResult()
    return {
      demo: false,
      transcript: { text: transcribed.transcript, segments: transcribed.segments || [] },
      fields: drafted.fields,
      notes: drafted.notes || null,
    }
  } catch {
    // No key, no server or a network problem: the app still works.
    return demoResult()
  }
}

export { demoResult }
