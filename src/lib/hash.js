// Hash chain helpers.
// Each event stores SHA-256(previous event hash + canonical JSON of this event's content).

export async function sha256Hex(input) {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function canonicalJSON(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(canonicalJSON).join(',') + ']'
  const keys = Object.keys(value).sort()
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJSON(value[k])).join(',') + '}'
}

// The content that is hashed. seq/type/at/by/byRole/details are all covered,
// so changing any of them is detected.
export function eventContent(ev) {
  return {
    seq: ev.seq,
    type: ev.type,
    at: ev.at,
    by: ev.by,
    byRole: ev.byRole,
    details: ev.details || {},
  }
}

export async function makeEvent(prevHash, ev) {
  const hash = await sha256Hex((prevHash || 'GENESIS') + canonicalJSON(eventContent(ev)))
  return { ...ev, prevHash: prevHash || 'GENESIS', hash }
}

export async function verifyChain(events) {
  let prev = 'GENESIS'
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    const expected = await sha256Hex((prev || 'GENESIS') + canonicalJSON(eventContent(ev)))
    if (ev.prevHash !== (prev || 'GENESIS')) {
      return { ok: false, index: i, seq: ev.seq, reason: 'link' }
    }
    if (expected !== ev.hash) {
      return { ok: false, index: i, seq: ev.seq, reason: 'hash' }
    }
    prev = ev.hash
  }
  return { ok: true, count: events.length }
}
