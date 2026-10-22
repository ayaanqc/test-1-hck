// localStorage holds events (append-only). IndexedDB holds evidence files.
// BroadcastChannel keeps other open tabs in sync.
import { SAMPLE_COMPLAINTS, ARCHIVED_COMPLAINTS } from '../data/complaints.js'
import { OFFICES, chainFor } from '../data/authorities.js'
import { makeEvent, verifyChain, sha256Hex } from './hash.js'
import { putEvidence, getEvidence, clearEvidence, fileFingerprint } from './db.js'
import { planEscalations, derive } from './engine.js'

const LS_KEY = 'jawabdehi.data.v1'
const SESSION_KEY = 'jawabdehi.session.v1'
const DATA_VERSION = 3
const DAY = 86400000

const DEFAULT_SETTINGS = { lang: 'en', textSize: 'md', contrast: false }
const DEFAULT_ADMIN = { demoDate: null, audit: [], counter: 4822 }
const DEFAULT_SESSION = { role: 'citizen' }

let state = { ready: false, complaints: [], admin: DEFAULT_ADMIN, settings: DEFAULT_SETTINGS, session: readSession(), version: 0 }
const listeners = new Set()
let channel = null

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return { ...DEFAULT_SESSION, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SESSION }
}

function emit() {
  state = { ...state, version: state.version + 1 }
  for (const fn of listeners) fn()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getSnapshot() {
  return state
}

function iso(base, daysAgo) {
  return new Date(new Date(base).getTime() - daysAgo * DAY).toISOString()
}

function sampleBlobText(key, name) {
  return `Jawabdehi demo evidence file\nkey: ${key}\nname: ${name}\nThis file is made up for the prototype.\n`
}

function defaultExpectedDate(now, expectedInDays) {
  return new Date(new Date(now).getTime() + expectedInDays * DAY).toISOString()
}

// ---------- seed ----------

async function buildComplaint(s, baseNow) {
  const createdAt = iso(baseNow, s.daysAgo)
  const accountCreatedAt = iso(createdAt, s.accountAgeDays ?? 100)
  const chainId = s.chainId || OFFICES.find((o) => o.id === s.officeId)?.chainId || 'municipal'
  const levels = chainFor(s.officeId, chainId)

  const raw = []
  raw.push({
    type: 'submitted',
    at: createdAt,
    by: s.complainant.name,
    byRole: 'citizen',
    details: {
      category: s.category,
      deptId: s.deptId,
      officeId: s.officeId,
      chainId,
      who: s.who,
      when: s.when,
      where: s.where,
      narrative: s.narrative,
      witnesses: s.witnesses || [],
      declaration: true,
      language: 'hi',
      accountCreatedAt,
      accountAgeDays: s.accountAgeDays ?? 100,
      aiAssisted: !!s.aiAssisted,
      aiDraft: s.aiDraft || null,
      corrections: s.corrections || null,
      incidentDate: iso(createdAt, s.incidentDaysAgo ?? 2),
    },
  })

  const evidenceIds = []
  for (const ev of s.evidence || []) {
    const fileId = `${s.id}:${ev.id}`
    const contentKey = ev.sameAs ? `shared:${ev.id}` : `${s.id}:${ev.id}`
    const blob = new Blob([sampleBlobText(contentKey, ev.name)], { type: ev.type })
    const fingerprint = await sha256Hex(await blob.arrayBuffer())
    const lastModified = new Date(new Date(createdAt).getTime() - (ev.fileAgeDays ?? 0) * DAY).toISOString()
    await putEvidence({ id: fileId, blob, name: ev.name, type: ev.type, size: blob.size, lastModified })
    evidenceIds.push(fileId)
    raw.push({
      type: 'evidence_added',
      at: new Date(new Date(createdAt).getTime() + 60 * 1000).toISOString(),
      by: s.complainant.name,
      byRole: 'citizen',
      details: {
        evidenceId: fileId,
        name: ev.name,
        type: ev.type,
        size: blob.size,
        fingerprint,
        lastModified,
        note: ev.note || null,
        recordedAt: createdAt,
      },
    })
  }

  const hasOfficialAction = (s.events || []).some((e) => !['appealed', 'withdrawn', 'restricted'].includes(e.type))
  if (hasOfficialAction) {
    raw.push({
      type: 'update',
      at: new Date(new Date(createdAt).getTime() + 3 * 60 * 60 * 1000).toISOString(),
      by: 'Oversight reviewer (demo)',
      byRole: 'reviewer',
      details: {
        kind: 'redactions_approved',
        removed: ['complainant_name', 'phone', 'witness_names', 'evidence_files'],
        note: {
          en: 'Identifying details and evidence removed from the summary shown to the office.',
          hi: 'कार्यालय को दिखाए गए सारांश से पहचान की जानकारी और सबूत हटाए गए।',
        },
      },
    })
  }

  for (const e of s.events || []) {
    const at = iso(baseNow, e.daysAgo)
    const details = {}
    let type = e.type
    if (type === 'acknowledged') {
      details.office = levels[0].office
    }
    if (type === 'escalated') {
      type = 'escalated'
      details.fromLevel = e.fromLevel
      details.toLevel = e.toLevel
      details.fromOffice = levels[Math.min(e.fromLevel, levels.length - 1)].office
      details.toOffice = levels[Math.min(e.toLevel, levels.length - 1)].office
      details.chainId = chainId
      details.missed = e.missedUpdate ? 'update' : 'respond'
      details.missedDeadline = at
    }
    if (type === 'investigation_started') details.expectedDate = defaultExpectedDate(at, e.expectedInDays ?? 14)
    if (type === 'update') details.note = e.note
    if (type === 'response') details.note = e.note
    if (type === 'information_requested') details.question = e.question
    if (type === 'finding_recorded') {
      details.finding = e.finding
      details.reason = e.reason
    }
    if (type === 'closed') {
      details.reason = e.reason
      details.decision = 'resolved'
    }
    if (type === 'rejected') {
      type = 'closed'
      details.decision = 'rejected'
      details.reason = e.reason
    }
    if (type === 'appealed') details.reason = e.reason
    if (type === 'withdrawn') details.reason = e.reason
    if (type === 'restricted') {
      details.reasonCategory = e.reasonCategory
      details.reason = e.reason
    }
    raw.push({ type, at, by: e.by || (type === 'acknowledged' ? 'Office official (sample)' : 'System (deadline)'), byRole: e.by === s.complainant.name ? 'citizen' : type === 'escalated' ? 'system' : 'official', details })
  }

  raw.sort((a, b) => new Date(a.at) - new Date(b.at) || (a.type === 'submitted' ? -1 : 1))

  let prev = 'GENESIS'
  const events = []
  let seq = 0
  for (const r of raw) {
    seq++
    const ev = await makeEvent(prev, { seq, type: r.type, at: r.at, by: r.by, byRole: r.byRole, details: r.details })
    prev = ev.hash
    events.push(ev)
  }

  return {
    id: s.id,
    deptId: s.deptId,
    officeId: s.officeId,
    chainId,
    category: s.category,
    createdAt,
    archived: !!s.archived,
    accountCreatedAt,
    complainant: s.complainant,
    evidenceIds,
    events,
  }
}

async function seed(now = new Date()) {
  const complaints = []
  for (const s of [...SAMPLE_COMPLAINTS, ...ARCHIVED_COMPLAINTS]) {
    complaints.push(await buildComplaint(s, now))
  }
  complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return complaints
}

// ---------- persistence ----------

function persist({ broadcast = true } = {}) {
  const payload = {
    version: DATA_VERSION,
    complaints: state.complaints,
    admin: state.admin,
    settings: state.settings,
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload))
  } catch (err) {
    console.warn('Could not save to localStorage', err)
  }
  if (broadcast && channel) {
    try { channel.postMessage({ type: 'changed' }) } catch { /* ignore */ }
  }
}

function setLocal(patch) {
  state = { ...state, ...patch }
  persist()
  emit()
}

async function loadFromStorage() {
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (data.version !== DATA_VERSION) return null
    return data
  } catch {
    return null
  }
}

let initPromise = null
export function init() {
  if (!initPromise) initPromise = start()
  return initPromise
}

async function start() {
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('jawabdehi') : null
  if (channel) {
    channel.onmessage = async (msg) => {
      if (msg.data && msg.data.type === 'changed') {
        const data = await loadFromStorage()
        if (data) {
          state = { ...state, complaints: data.complaints, admin: data.admin, settings: data.settings, ready: true }
          emit()
        }
      }
    }
  }
  window.addEventListener('storage', async (e) => {
    if (e.key === LS_KEY && e.newValue) {
      const data = JSON.parse(e.newValue)
      state = { ...state, complaints: data.complaints, admin: data.admin, settings: data.settings, ready: true }
      emit()
    }
  })

  let data = await loadFromStorage()
  if (!data) {
    const complaints = await seed(new Date())
    data = { version: DATA_VERSION, complaints, admin: DEFAULT_ADMIN, settings: DEFAULT_SETTINGS }
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }
  state = { ...state, ready: true, complaints: data.complaints, admin: data.admin, settings: data.settings, session: readSession() }
  emit()
  await reconcile(now())
  window.setInterval(() => { reconcile(now()).catch(() => {}) }, 30000)
}

export function now() {
  return state.admin.demoDate ? new Date(state.admin.demoDate) : new Date()
}

// Append escalations that are due by `at`.
let reconciling = false
export async function reconcile(at = now()) {
  if (reconciling) return
  reconciling = true
  try {
    await reconcileInner(at)
  } finally {
    reconciling = false
  }
}

async function reconcileInner(at) {
  let changed = false
  const next = []
  for (const c of state.complaints) {
    const planned = planEscalations(c, at)
    if (!planned.length) {
      next.push(c)
      continue
    }
    changed = true
    let prev = c.events.length ? c.events[c.events.length - 1].hash : 'GENESIS'
    let seq = c.events.length
    const events = [...c.events]
    for (const ev of planned) {
      seq++
      const full = await makeEvent(prev, {
        seq,
        type: 'escalated',
        at: ev.at,
        by: 'System (deadline)',
        byRole: 'system',
        details: ev.details,
      })
      prev = full.hash
      events.push(full)
    }
    next.push({ ...c, events })
  }
  if (changed) {
    state = { ...state, complaints: next }
    persist()
    emit()
  }
}

export async function appendEvent(complaintId, { type, details, by, byRole }) {
  const at = now().toISOString()
  const next = []
  let found = false
  for (const c of state.complaints) {
    if (c.id !== complaintId) {
      next.push(c)
      continue
    }
    found = true
    const prev = c.events.length ? c.events[c.events.length - 1].hash : 'GENESIS'
    const seq = c.events.length + 1
    const ev = await makeEvent(prev, { seq, type, at, by, byRole, details: details || {} })
    next.push({ ...c, events: [...c.events, ev] })
  }
  if (!found) throw new Error('Complaint not found')
  state = { ...state, complaints: next }
  persist()
  emit()
  return at
}

// ---------- submissions ----------

export async function submitComplaint(input) {
  const at = now()
  const id = `JD-${at.getFullYear()}-${String(state.admin.counter).padStart(6, '0')}`
  const chainId = OFFICES.find((o) => o.id === input.officeId)?.chainId || 'municipal'
  let prev = 'GENESIS'
  const events = []
  let seq = 1
  const submitted = await makeEvent(prev, {
    seq,
    type: 'submitted',
    at: at.toISOString(),
    by: input.complainant.name,
    byRole: 'citizen',
    details: {
      category: input.category,
      deptId: input.deptId,
      officeId: input.officeId,
      chainId,
      who: input.who,
      when: input.when,
      where: input.where,
      narrative: input.narrative,
      witnesses: input.witnesses || [],
      declaration: true,
      language: input.language || 'en',
      accountCreatedAt: at.toISOString(),
      accountAgeDays: 0,
      incidentDate: input.incidentDate || null,
      aiAssisted: !!input.aiAssisted,
      aiDraft: input.aiDraft || null,
      corrections: input.corrections || null,
      phone: input.complainant.phone,
      phoneVerified: !!input.phoneVerified,
      recording: !!input.recording,
    },
  })
  events.push(submitted)
  prev = submitted.hash

  for (const file of input.files || []) {
    const fingerprint = await fileFingerprint(file.blob)
    const fileId = `${id}:${file.clientId}`
    await putEvidence({
      id: fileId,
      blob: file.blob,
      name: file.name,
      type: file.type,
      size: file.blob.size,
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : at.toISOString(),
    })
    seq++
    const ev = await makeEvent(prev, {
      seq,
      type: 'evidence_added',
      at: at.toISOString(),
      by: input.complainant.name,
      byRole: 'citizen',
      details: {
        evidenceId: fileId,
        name: file.name,
        type: file.type,
        size: file.blob.size,
        fingerprint,
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : at.toISOString(),
        note: file.note || null,
        recordedAt: at.toISOString(),
      },
    })
    events.push(ev)
    prev = ev.hash
  }

  const complaint = {
    id,
    deptId: input.deptId,
    officeId: input.officeId,
    chainId,
    category: input.category,
    createdAt: at.toISOString(),
    archived: false,
    accountCreatedAt: at.toISOString(),
    complainant: input.complainant,
    evidenceIds: (input.files || []).map((f) => `${id}:${f.clientId}`),
    events,
  }
  state = {
    ...state,
    complaints: [complaint, ...state.complaints],
    admin: { ...state.admin, counter: state.admin.counter + 1 },
  }
  persist()
  emit()
  return complaint
}

// ---------- reviewer ----------

export function approveRedactions(complaintId, reviewerName) {
  return appendEvent(complaintId, {
    type: 'update',
    by: reviewerName,
    byRole: 'reviewer',
    details: {
      kind: 'redactions_approved',
      removed: ['complainant_name', 'phone', 'witness_names', 'evidence_files'],
      note: {
        en: 'The reviewer checked the summary sent to the office: name, phone number, witness names and evidence were removed.',
        hi: 'समीक्षक ने कार्यालय को भेजे गए सारांश की जाँच की: नाम, फ़ोन नंबर, गवाह के नाम और सबूत हटाए गए।',
      },
    },
  })
}

export function recordFinding(complaintId, { finding, reason, by }) {
  return appendEvent(complaintId, {
    type: 'finding_recorded',
    by,
    byRole: 'reviewer',
    details: { finding, reason },
  })
}

export function closeComplaint(complaintId, { reason, decision, by }) {
  return appendEvent(complaintId, {
    type: 'closed',
    by,
    byRole: 'reviewer',
    details: { reason, decision },
  })
}

export function restrictComplaint(complaintId, { reasonCategory, reason, by }) {
  return appendEvent(complaintId, {
    type: 'restricted',
    by,
    byRole: 'reviewer',
    details: { reasonCategory, reason },
  })
}

export function liftRestriction(complaintId, { reason, by }) {
  return appendEvent(complaintId, {
    type: 'restricted',
    by,
    byRole: 'reviewer',
    details: { lifted: true, reason, reasonCategory: 'lifted' },
  })
}

export function withdrawComplaint(complaintId, { reason, by }) {
  return appendEvent(complaintId, {
    type: 'withdrawn',
    by,
    byRole: 'citizen',
    details: { reason },
  })
}

export function requestCorrection(complaintId, { reason, changes, by }) {
  return appendEvent(complaintId, {
    type: 'corrected',
    by,
    byRole: 'reviewer',
    details: { reason, changes },
  })
}

export function appealComplaint(complaintId, { reason, by }) {
  return appendEvent(complaintId, {
    type: 'appealed',
    by,
    byRole: 'citizen',
    details: { reason },
  })
}

export function reopenComplaint(complaintId, { reason, by }) {
  return appendEvent(complaintId, {
    type: 'reopened',
    by,
    byRole: 'reviewer',
    details: { reason },
  })
}

export function addComplainantInfo(complaintId, { note, by }) {
  return appendEvent(complaintId, {
    type: 'update',
    by,
    byRole: 'citizen',
    details: { note, answersInfo: true, fromComplainant: true },
  })
}

// ---------- office ----------

export function acknowledge(complaintId, by) {
  return appendEvent(complaintId, { type: 'acknowledged', by, byRole: 'official', details: {} })
}

export function startInvestigation(complaintId, { expectedDate, by }) {
  return appendEvent(complaintId, {
    type: 'investigation_started',
    by,
    byRole: 'official',
    details: { expectedDate },
  })
}

export function postUpdate(complaintId, { note, by, expectedDate }) {
  return appendEvent(complaintId, {
    type: 'update',
    by,
    byRole: 'official',
    details: { note, expectedDate: expectedDate || null },
  })
}

export function requestInfo(complaintId, { question, by }) {
  return appendEvent(complaintId, {
    type: 'information_requested',
    by,
    byRole: 'official',
    details: { question },
  })
}

export function officialResponse(complaintId, { note, by }) {
  return appendEvent(complaintId, { type: 'response', by, byRole: 'official', details: { note } })
}

export function requestTransfer(complaintId, { toOfficeId, toOffice, reason, by }) {
  return appendEvent(complaintId, {
    type: 'transferred',
    by,
    byRole: 'official',
    details: { toOfficeId, toOffice, reason },
  })
}

// ---------- verification ----------

export async function verifyComplaint(complaintId) {
  const c = state.complaints.find((x) => x.id === complaintId)
  if (!c) return { ok: false, missing: true }
  const chain = await verifyChain(c.events)
  if (!chain.ok) {
    return { ok: false, kind: 'event', seq: chain.seq, index: chain.index, reason: chain.reason, count: c.events.length }
  }
  for (const ev of c.events) {
    if (ev.type !== 'evidence_added') continue
    const rec = await getEvidence(ev.details.evidenceId)
    if (!rec) {
      return { ok: false, kind: 'evidence', seq: ev.seq, name: ev.details.name, reason: 'missing' }
    }
    const digest = await fileFingerprint(rec.blob)
    if (digest !== ev.details.fingerprint) {
      return { ok: false, kind: 'evidence', seq: ev.seq, name: ev.details.name, reason: 'fingerprint' }
    }
  }
  return { ok: true, count: c.events.length }
}

// ---------- admin / settings ----------

export async function setDemoDate(isoDate, adminName = 'Admin (demo)') {
  const at = new Date().toISOString()
  const audit = [
    ...state.admin.audit,
    { at, action: 'set_demo_date', detail: isoDate || 'real today', by: adminName },
  ]
  state = { ...state, admin: { ...state.admin, demoDate: isoDate, audit } }
  persist()
  emit()
  await reconcile(isoDate ? new Date(isoDate) : new Date())
}

export async function stepDemoDate(days = 5) {
  const base = now()
  const next = new Date(base.getTime() + days * DAY).toISOString()
  await setDemoDate(next)
}

export function setSetting(key, value) {
  state = { ...state, settings: { ...state.settings, [key]: value } }
  persist()
  emit()
}

export function setRole(role) {
  state = { ...state, session: { ...state.session, role } }
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.session)) } catch { /* ignore */ }
  emit()
}

export function setOfficialName(name) {
  state = { ...state, session: { ...state.session, officialName: name } }
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.session)) } catch { /* ignore */ }
  emit()
}

export async function resetDemo() {
  localStorage.removeItem(LS_KEY)
  await clearEvidence()
  const complaints = await seed(new Date())
  state = {
    ...state,
    complaints,
    admin: { ...DEFAULT_ADMIN, audit: [{ at: new Date().toISOString(), action: 'reset_demo', detail: 'All demo data reset', by: 'Admin (demo)' }] },
    ready: true,
  }
  persist()
  emit()
}

export async function tamperEvent(complaintId) {
  const idx = state.complaints.findIndex((c) => c.id === complaintId)
  if (idx < 0) return null
  const c = state.complaints[idx]
  const target = c.events[c.events.length - 1]
  const nextEvents = c.events.map((ev, i) =>
    i === c.events.length - 1
      ? { ...ev, details: { ...ev.details, tamperNote: 'Changed directly in storage by the Admin tamper test.' } }
      : ev,
  )
  const next = [...state.complaints]
  next[idx] = { ...c, events: nextEvents }
  state = {
    ...state,
    complaints: next,
    admin: {
      ...state.admin,
      audit: [
        ...state.admin.audit,
        { at: new Date().toISOString(), action: 'tamper_test', detail: `${c.id} entry #${target.seq} changed directly in storage`, by: 'Admin (demo)' },
      ],
    },
  }
  persist()
  emit()
  return { complaintId: c.id, seq: target.seq }
}

export async function tamperEvidence(complaintId) {
  const c = state.complaints.find((x) => x.id === complaintId)
  if (!c) return null
  const ev = c.events.find((x) => x.type === 'evidence_added')
  if (!ev) return null
  const rec = await getEvidence(ev.details.evidenceId)
  if (!rec) return null
  const blob = new Blob([`This file was replaced by the tamper test.\nOriginal: ${ev.details.name}\n`], { type: rec.type || 'text/plain' })
  await putEvidence({ ...rec, blob, size: blob.size })
  state = {
    ...state,
    admin: {
      ...state.admin,
      audit: [
        ...state.admin.audit,
        { at: new Date().toISOString(), action: 'tamper_evidence', detail: `${c.id} evidence "${ev.details.name}" replaced in storage`, by: 'Admin (demo)' },
      ],
    },
  }
  persist()
  emit()
  return { complaintId: c.id, seq: ev.seq, name: ev.details.name }
}

// helper: current office label for a complaint
export function currentOffice(c) {
  return derive(c).officeNow
}
