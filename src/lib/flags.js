// Flags for the reviewer. A flag means "worth a closer look". It is never proof.
// The AI never decides whether something is true.
import { CONFIG } from '../data/config.js'

function tokens(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2),
  )
}

export function similarity(a, b) {
  const A = tokens(a)
  const B = tokens(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const w of A) if (B.has(w)) inter++
  return inter / new Set([...A, ...B]).size
}

function narrativeText(c) {
  const sub = c.events.find((e) => e.type === 'submitted')
  const n = sub?.details?.narrative
  if (!n) return ''
  return typeof n === 'string' ? n : `${n.en || ''} ${n.hi || ''}`
}

function fingerprints(c) {
  return c.events.filter((e) => e.type === 'evidence_added').map((e) => e.details.fingerprint)
}

export function computeFlags(c, allComplaints, now = new Date()) {
  const flags = []
  const others = allComplaints.filter((o) => o.id !== c.id && !o.archived)
  const myFps = fingerprints(c)
  const myText = narrativeText(c)
  const submitted = c.events.find((e) => e.type === 'submitted')
  const details = submitted?.details || {}

  // 1. Possible duplicate
  const dupes = []
  for (const o of others) {
    const shared = fingerprints(o).filter((fp) => myFps.includes(fp))
    const sim = similarity(myText, narrativeText(o))
    if (shared.length) dupes.push({ id: o.id, why: 'sameFingerprint', sim })
    else if (sim >= CONFIG.duplicateSimilarity) dupes.push({ id: o.id, why: 'similarText', sim })
  }
  if (dupes.length) {
    flags.push({
      id: 'duplicate',
      reason: {
        en: `Looks similar to ${dupes.map((d) => d.id).join(', ')}. ${
          dupes.some((d) => d.why === 'sameFingerprint') ? 'The same evidence file fingerprint appears in both.' : 'The wording is very close.'
        } Worth a closer look, not proof of anything.`,
        hi: `${dupes.map((d) => d.id).join(', ')} से मिलता-जुलता लगता है। ${
          dupes.some((d) => d.why === 'sameFingerprint') ? 'दोनों में एक ही सबूत फ़ाइल का फ़िंगरप्रिंट है।' : 'शब्द बहुत मिलते हैं।'
        } यह ध्यान देने योग्य है, किसी बात का सबूत नहीं।`,
      },
      related: dupes.map((d) => d.id),
    })
  }

  // 2. Possible coordinated submissions
  const createdAt = new Date(c.createdAt).getTime()
  const cluster = allComplaints.filter((o) => {
    if (o.id === c.id || o.archived) return false
    const sameOffice = o.officeId === c.officeId
    const near = Math.abs(new Date(o.createdAt).getTime() - createdAt) <= CONFIG.coordinationWindowHours * 3600000
    const similar = similarity(myText, narrativeText(o)) >= 0.5 || fingerprints(o).some((fp) => myFps.includes(fp))
    const newAccount = (o.events.find((e) => e.type === 'submitted')?.details?.accountAgeDays ?? 999) <= CONFIG.newAccountDays
    return sameOffice && near && similar && newAccount
  })
  if (cluster.length + 1 >= CONFIG.coordinationMinComplaints) {
    flags.push({
      id: 'coordination',
      reason: {
        en: `${cluster.length + 1} similar complaints against the same office arrived within ${CONFIG.coordinationWindowHours} hour from new accounts: ${[c.id, ...cluster.map((x) => x.id)].join(', ')}. This is worth a closer look. It does not mean any of them is false.`,
        hi: `एक ही कार्यालय के खिलाफ़ ${cluster.length + 1} मिलती-जुलती शिकायतें ${CONFIG.coordinationWindowHours} घंटे के भीतर नए खातों से आईं: ${[c.id, ...cluster.map((x) => x.id)].join(', ')}. यह ध्यान देने योग्य है। इसका मतलब यह नहीं कि कोई भी शिकायत झूठी है।`,
      },
      related: cluster.map((x) => x.id),
    })
  }

  // 3. Missing information
  const gaps = []
  if (!myFps.length) gaps.push({ en: 'no evidence file', hi: 'कोई सबूत फ़ाइल नहीं' })
  if (!(details.witnesses || []).length) gaps.push({ en: 'no witness', hi: 'कोई गवाह नहीं' })
  if (myText.length < 90) gaps.push({ en: 'a short description', hi: 'विवरण छोटा' })
  if (!details.when || !details.who) gaps.push({ en: 'when or who is blank', hi: 'कब या कौन खाली है' })
  if (gaps.length) {
    flags.push({
      id: 'missing',
      reason: {
        en: `Missing information: ${gaps.map((g) => g.en).join(', ')}. The reviewer may ask the complainant for more, or continue without it.`,
        hi: `जानकारी कम है: ${gaps.map((g) => g.hi).join(', ')}. समीक्षक शिकायतकर्ता से और जानकारी माँग सकते हैं, या इसके बिना आगे बढ़ सकते हैं।`,
      },
    })
  }

  // 4. Inconsistent dates
  const dateProblems = []
  if (details.incidentDate) {
    const inc = new Date(details.incidentDate)
    if (inc > new Date(c.createdAt)) dateProblems.push({ en: 'the reported incident date is after the complaint was filed', hi: 'बताई गई घटना की तारीख शिकायत दर्ज होने के बाद की है' })
  }
  for (const ev of c.events) {
    if (new Date(ev.at) > new Date(now)) dateProblems.push({ en: `entry #${ev.seq} is dated in the future`, hi: `प्रविष्टि #${ev.seq} की तारीख भविष्य में है` })
  }
  if (dateProblems.length) {
    flags.push({
      id: 'dates',
      reason: {
        en: `Possible date problem: ${dateProblems.map((d) => d.en).join('; ')}. Worth checking with the complainant.`,
        hi: `तारीख में संभावित गड़बड़ी: ${dateProblems.map((d) => d.hi).join('; ')}. शिकायतकर्ता से पुष्टि करना ठीक रहेगा।`,
      },
    })
  }

  // 5. Evidence file details that don't match the reported date
  const mismatch = []
  for (const ev of c.events) {
    if (ev.type !== 'evidence_added') continue
    const added = new Date(ev.at)
    const modified = ev.details.lastModified ? new Date(ev.details.lastModified) : null
    if (modified && modified > added) {
      mismatch.push({
        en: `"${ev.details.name}" says it was last changed on ${modified.toLocaleDateString()}, after the complaint was filed`,
        hi: `"${ev.details.name}" के अनुसार वह ${modified.toLocaleDateString()} को बदली गई, शिकायत दर्ज होने के बाद`,
      })
    }
    if (details.incidentDate && modified) {
      const gap = (new Date(details.incidentDate) - modified) / 86400000
      if (gap > 365) {
        mismatch.push({
          en: `"${ev.details.name}" was last changed more than a year before the date you gave`,
          hi: `"${ev.details.name}" आपकी बताई तारीख से एक वर्ष से अधिक पहले बदली गई थी`,
        })
      }
    }
  }
  if (mismatch.length) {
    flags.push({
      id: 'evidence_date',
      reason: {
        en: `Evidence file details do not match the reported date: ${mismatch.map((m) => m.en).join('; ')}. This is worth a closer look. It does not decide anything.`,
        hi: `सबूत फ़ाइल का विवरण बताई गई तारीख से मेल नहीं खाता: ${mismatch.map((m) => m.hi).join('; ')}. यह ध्यान देने योग्य है। इससे कुछ तय नहीं होता।`,
      },
    })
  }

  return flags
}
