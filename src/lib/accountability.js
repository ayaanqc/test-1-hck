// The accountability indicator is worked out only from:
//   1. responsiveness (acknowledged on time, responded on time)
//   2. meeting service deadlines (closed within resolveDays)
//   3. substantiated findings recorded through review
// Only CLOSED complaints are used, so filing a new complaint never changes it.
import { CONFIG } from '../data/config.js'
import { derive } from './engine.js'
import { OFFICES, DEPARTMENTS } from '../data/authorities.js'

const W = CONFIG.indicatorWeights
const DAY = 86400000

function days(from, to) {
  return (new Date(to) - new Date(from)) / DAY
}

function firstAck(c) {
  return c.events.find((e) => e.type === 'acknowledged') || null
}

function firstResponse(c) {
  return c.events.find((e) => e.type === 'response') || null
}

function closedEvent(c) {
  for (let i = c.events.length - 1; i >= 0; i--) {
    if (c.events[i].type === 'closed') return c.events[i]
    if (c.events[i].type === 'reopened') return null
  }
  return null
}

function findingOf(c) {
  for (let i = c.events.length - 1; i >= 0; i--) {
    if (c.events[i].type === 'finding_recorded') return c.events[i].details.finding
    if (c.events[i].type === 'reopened') return null
  }
  return null
}

export function complaintStats(c) {
  const ack = firstAck(c)
  const resp = firstResponse(c)
  const closed = closedEvent(c)
  return {
    ackDays: ack ? days(c.createdAt, ack.at) : null,
    ackOnTime: ack ? days(c.createdAt, ack.at) <= CONFIG.ackDays : false,
    respondDays: resp ? days(c.createdAt, resp.at) : null,
    respondOnTime: resp ? days(c.createdAt, resp.at) <= CONFIG.respondDays : false,
    closed,
    resolveDays: closed ? days(c.createdAt, closed.at) : null,
    deadlineMet: closed ? days(c.createdAt, closed.at) <= CONFIG.resolveDays : false,
    finding: findingOf(c),
    closedWithReason: !!closed,
  }
}

function median(values) {
  const v = values.filter((x) => x != null).sort((a, b) => a - b)
  if (!v.length) return null
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

export function officeStats(officeId, complaints) {
  const all = complaints.filter((c) => c.officeId === officeId)
  const closed = all.filter((c) => c.events.some((e) => e.type === 'closed'))
  let ack = 0
  let resp = 0
  let deadline = 0
  let substantiated = 0
  for (const c of closed) {
    const s = complaintStats(c)
    if (s.ackOnTime) ack++
    if (s.respondOnTime) resp++
    if (s.deadlineMet) deadline++
    if (s.finding === 'substantiated') substantiated++
  }
  const n = closed.length
  const parts = {
    acknowledgedShare: n ? ack / n : 0,
    respondedShare: n ? resp / n : 0,
    deadlineShare: n ? deadline / n : 0,
    findingShare: n ? substantiated / n : 0,
  }
  const weighted =
    parts.acknowledgedShare * W.acknowledged +
    parts.respondedShare * W.responded +
    parts.deadlineShare * W.deadlines +
    parts.findingShare * W.findings
  const byStatus = {}
  for (const c of all) {
    const k = derive(c).statusKey
    byStatus[k] = (byStatus[k] || 0) + 1
  }
  return {
    officeId,
    office: OFFICES.find((o) => o.id === officeId),
    total: all.length,
    closedCount: n,
    acknowledged: all.filter((c) => c.events.some((e) => e.type === 'acknowledged')).length,
    responded: all.filter((c) => c.events.some((e) => e.type === 'response')).length,
    findings: {
      substantiated: all.filter((c) => findingOf(c) === 'substantiated').length,
      not_substantiated: all.filter((c) => findingOf(c) === 'not_substantiated').length,
      no_finding: all.filter((c) => findingOf(c) === 'no_finding_possible').length,
    },
    medianAckDays: median(all.map((c) => complaintStats(c).ackDays)),
    medianRespondDays: median(all.map((c) => complaintStats(c).respondDays)),
    parts,
    score: Math.round(weighted * 100),
    byStatus,
    counts: { ack, resp, deadline, substantiated },
    enoughData: n >= CONFIG.minClosedComplaintsForIndicator,
  }
}

export function departmentStats(deptId, complaints) {
  const offices = OFFICES.filter((o) => o.deptId === deptId)
  return offices.map((o) => officeStats(o.id, complaints))
}

export function departmentInfo(deptId) {
  return DEPARTMENTS.find((d) => d.id === deptId) || null
}

// The exact numbers behind an office's indicator, for the "How this is worked out" page.
export function indicatorBreakdown(officeId, complaints) {
  const stats = officeStats(officeId, complaints)
  const closed = complaints.filter((c) => c.officeId === officeId && c.events.some((e) => e.type === 'closed'))
  const rows = closed.map((c) => {
    const s = complaintStats(c)
    return {
      id: c.id,
      ackOnTime: s.ackOnTime,
      ackDays: s.ackDays,
      respondOnTime: s.respondOnTime,
      respondDays: s.respondDays,
      deadlineMet: s.deadlineMet,
      resolveDays: s.resolveDays,
      substantiated: s.finding === 'substantiated',
    }
  })
  return { stats, rows }
}
