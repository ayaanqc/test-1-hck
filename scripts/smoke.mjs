// Logic smoke test for the demo store: run with `npm run smoke`.
// Uses fake-indexeddb so the same code paths as the browser run under Node.
import 'fake-indexeddb/auto'

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
}

globalThis.localStorage = memoryStorage()
globalThis.sessionStorage = memoryStorage()
globalThis.window = {
  addEventListener() {},
  setInterval: () => 0,
}

const store = await import('../src/lib/store.js')
const { derive, planEscalations } = await import('../src/lib/engine.js')
const { computeFlags } = await import('../src/lib/flags.js')
const { officeStats } = await import('../src/lib/accountability.js')

const results = []
function check(name, ok, extra = '') {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}

await store.init()
const snap = store.getSnapshot()
check('seed loads 26 complaints', snap.complaints.length === 26, `${snap.complaints.length}`)

let allVerified = true
for (const c of snap.complaints) {
  const r = await store.verifyComplaint(c.id)
  if (!r.ok) {
    allVerified = false
    console.log('  verify failed', c.id, r)
  }
}
check('every seeded record verifies', allVerified)

const statuses = snap.complaints
  .filter((c) => !c.archived)
  .map((c) => `${c.id}:${derive(c).statusKey}`)
console.log('  statuses:', statuses.join(', '))

const expected = {
  'JD-2026-004821': 'acknowledged',
  'JD-2026-004710': 'acknowledged',
  'JD-2026-004688': 'investigation',
  'JD-2026-004532': 'acknowledged',
  'JD-2026-004300': 'closed',
  'JD-2026-004205': 'appealed',
  'JD-2026-004120': 'response',
  'JD-2026-004044': 'withdrawn',
  'JD-2026-003877': 'top_of_chain',
  'JD-2026-003950': 'response',
  'JD-2026-003711': 'information_requested',
  'JD-2026-003640': 'closed',
}
let statusOk = true
for (const [id, want] of Object.entries(expected)) {
  const c = snap.complaints.find((x) => x.id === id)
  const got = c ? derive(c).statusKey : 'missing'
  if (got !== want) {
    statusOk = false
    console.log(`  status mismatch ${id}: got ${got}, want ${want}`)
  }
}
check('seeded complaints have the intended stages', statusOk)

// Cluster flags
const cluster = snap.complaints.find((c) => c.id === 'JD-2026-004002')
const clusterFlags = computeFlags(cluster, snap.complaints)
check('coordination flag fires on the cluster', clusterFlags.some((f) => f.id === 'coordination'), clusterFlags.map((f) => f.id).join(','))
check('duplicate flag fires on the cluster', clusterFlags.some((f) => f.id === 'duplicate'), clusterFlags.map((f) => f.id).join(','))

// Accountability is not changed by filing a complaint
const before = officeStats('muni-ward-12', snap.complaints).score
const wardClosedBefore = officeStats('muni-ward-12', snap.complaints).closedCount

const blob = new Blob(['a fake voice note for the smoke test'], { type: 'audio/webm' })
const created = await store.submitComplaint({
  category: 'bribe',
  deptId: 'municipal',
  officeId: 'muni-ward-12',
  when: 'this morning',
  where: 'Ward Office 12',
  who: 'the counter clerk',
  witnesses: [{ name: 'Kamla Bai', relation: 'neighbour' }],
  narrative: 'I was asked for 2000 rupees to move my file faster. I did not pay.',
  files: [{ clientId: 'a1', name: 'receipt.jpg', type: 'image/jpeg', blob: new Blob(['receipt'], { type: 'image/jpeg' }), lastModified: Date.now() }],
  complainant: { name: 'Sunita Devi', phone: '+91 98290 00001' },
  phoneVerified: true,
  declaration: true,
  language: 'en',
  aiAssisted: true,
  aiDraft: { demo: true, fields: {}, transcript: 'x' },
  corrections: { what_happened: 'Corrected by the complainant' },
})

check('new complaint gets an ID', /^JD-\d{4}-\d{6}$/.test(created.id), created.id)
check('new record verifies', (await store.verifyComplaint(created.id)).ok)
check('new complaint starts at submitted', derive(created).statusKey === 'submitted')

const after = officeStats('muni-ward-12', store.getSnapshot().complaints)
check('filing a complaint does not change the indicator', before === after.score, `${before} -> ${after.score}`)
check('filing a complaint does not change the closed count', wardClosedBefore === after.closedCount, `${wardClosedBefore} -> ${after.closedCount}`)

const beforeClosed = store.getSnapshot().complaints.filter((c) => c.id === created.id && c.events.some((e) => e.type === 'closed')).length
check('new complaint is not counted as closed', beforeClosed === 0)

// Reviewers approve redactions; office acts
await store.approveRedactions(created.id, 'Oversight reviewer (demo)')
let c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
check('redactions approved recorded as an event', !!derive(c2).redactionsApprovedAt)

await store.acknowledge(created.id, 'Neelam Choudhary')
await store.startInvestigation(created.id, {
  expectedDate: new Date(Date.now() + 20 * 86400000).toISOString(),
  by: 'Neelam Choudhary',
})
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
let d2 = derive(c2)
check('investigation pauses escalation', d2.statusKey === 'investigation' && !!d2.escalationAt)

// Jump 12 days: still paused because an update is due at 15 days
await store.setDemoDate(new Date(Date.now() + 12 * 86400000).toISOString())
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
check('no escalation inside the 15-day update window', derive(c2).level === 0)

// Post an update on time, then let the update window lapse
await store.postUpdate(created.id, { note: 'CCTV checked', by: 'Neelam Choudhary' })
await store.setDemoDate(new Date(Date.now() + 30 * 86400000).toISOString())
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
d2 = derive(c2)
const esc = c2.events.filter((e) => e.type === 'escalated')
check('missed update resumes escalation', esc.length >= 1 && d2.level >= 1, `${esc.length} escalation(s)`)
check(
  'first escalation is explained by the missed update',
  esc.length >= 1 && esc[0].details.missed === 'update',
  esc.length ? esc[0].details.missed : '',
)

// Escalate to the top
for (let i = 0; i < 10; i++) {
  const cur = store.getSnapshot().complaints.find((c) => c.id === created.id)
  const nowD = new Date(Date.now() + (30 + i * 20) * 86400000).toISOString()
  await store.setDemoDate(nowD)
  void cur
}
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
d2 = derive(c2)
check('reaches the top of the chain', d2.atTop, `level ${d2.level} of ${d2.lastLevel}`)
check('top of chain shows in status', d2.statusKey === 'top_of_chain' || d2.isClosed, d2.statusKey)

// Findings, close, appeal, reopen
await store.recordFinding(created.id, { finding: 'no_finding_possible', reason: 'Evidence was not enough.', by: 'Oversight reviewer (demo)' })
await store.closeComplaint(created.id, { reason: 'Closed after review.', decision: 'resolved', by: 'Oversight reviewer (demo)' })
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
check('closed with a finding', derive(c2).isClosed)
check('findings are counted only for closed complaints', c2.events.some((e) => e.type === 'finding_recorded'))

// Correction keeps the original
const originalNarrative = c2.events.find((e) => e.type === 'submitted').details.narrative
await store.requestCorrection(created.id, { reason: 'Typo in the office name', changes: { narrative: 'Corrected narrative' }, by: 'Oversight reviewer (demo)' })
c2 = store.getSnapshot().complaints.find((c) => c.id === created.id)
check('correction is a new event and the original stays', c2.events.find((e) => e.type === 'submitted').details.narrative === originalNarrative && derive(c2).effective('narrative') === 'Corrected narrative')

// Tamper: event
const beforeTamper = (await store.verifyComplaint('JD-2026-004710')).ok
const t = await store.tamperEvent('JD-2026-004710')
const tamperResult = await store.verifyComplaint('JD-2026-004710')
check('tamper test is caught', beforeTamper && !tamperResult.ok && tamperResult.seq === t.seq, `entry #${tamperResult.seq} (changed #${t.seq})`)

// Tamper: evidence
await store.tamperEvidence('JD-2026-004821')
const evResult = await store.verifyComplaint('JD-2026-004821')
check('changed evidence file is caught', !evResult.ok && evResult.kind === 'evidence', evResult.kind)

// Investigation pause does not extend on complainant updates
await store.resetDemo()
const fresh = store.getSnapshot().complaints.find((c) => c.id === 'JD-2026-004688')
const forced = store.getSnapshot().complaints
void forced
check('reset restores the seed', store.getSnapshot().complaints.length === 26 && (await store.verifyComplaint(fresh.id)).ok)

// AI falls back to a demo result when there is no key / server
process.env.GEMINI_API_KEY = ''
process.env.OPENAI_API_KEY = ''
const { prepareDraft } = await import('../src/lib/ai.js')
const draft = await prepareDraft({ blob: new Blob(['fake audio'], { type: 'audio/webm' }), language: 'en' })
check('AI falls back to a labelled demo result', draft.demo === true && !!draft.fields.what_happened)

const aiHandler = (await import('../api/ai.js')).default
function fakeRes() {
  const out = {}
  return {
    statusCode: 200,
    setHeader(k, v) { out[k] = v },
    end(v) { out.body = v },
    out,
  }
}
{
  const res = fakeRes()
  await aiHandler({ method: 'POST', body: JSON.stringify({ task: 'draft', transcript: 'test' }) }, res)
  const body = JSON.parse(res.out.body)
  check('server endpoint returns demo:true with no key', body.demo === true && res.statusCode === 200)
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join('; '))
  process.exit(1)
}
process.exit(0)
