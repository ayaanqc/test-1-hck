// Derives the current state of a complaint from its append-only event list,
// and plans deadline escalations. Nothing here rewrites an event.
import { CONFIG } from '../data/config.js'
import { chainFor, chainLength, officeAtLevel } from '../data/authorities.js'

const DAY = 86400000

export function addDays(date, n) {
  return new Date(new Date(date).getTime() + n * DAY)
}

export function derive(c) {
  const levels = chainFor(c.officeId, c.chainId)
  const lastLevel = levels.length - 1
  let level = 0
  let levelEnteredAt = c.createdAt
  let ackedAt = null
  let respondedAt = null
  let investigation = null
  let info = null
  let lastEscalatedAt = null
  let closedEvent = null
  let appealedAt = null
  let withdrawnAt = null
  let restriction = null
  let findingEvent = null
  let officeId = c.officeId
  let corrections = []
  let redactionsApprovedAt = null
  let lastUpdate = null

  for (const ev of c.events) {
    const d = ev.details || {}
    switch (ev.type) {
      case 'acknowledged':
        ackedAt = ev.at
        break
      case 'response':
        respondedAt = ev.at
        break
      case 'investigation_started':
        investigation = { startedAt: ev.at, expectedDate: d.expectedDate || null, lastAt: ev.at }
        break
      case 'update':
        lastUpdate = ev.at
        if (d.kind === 'redactions_approved') redactionsApprovedAt = ev.at
        if (investigation && ev.byRole === 'official') investigation = { ...investigation, lastAt: ev.at }
        if (d.answersInfo) info = null
        break
      case 'information_requested':
        info = { at: ev.at, question: d.question || '' }
        break
      case 'escalated':
        level = d.toLevel
        levelEnteredAt = ev.at
        ackedAt = null
        respondedAt = null
        investigation = null
        info = null
        lastEscalatedAt = ev.at
        break
      case 'transferred':
        officeId = d.toOfficeId || officeId
        levelEnteredAt = ev.at
        ackedAt = null
        respondedAt = null
        investigation = null
        info = null
        break
      case 'finding_recorded':
        findingEvent = { at: ev.at, finding: d.finding, reason: d.reason, by: ev.by }
        break
      case 'closed':
        closedEvent = { at: ev.at, reason: d.reason, decision: d.decision || 'resolved', by: ev.by }
        break
      case 'appealed':
        appealedAt = ev.at
        break
      case 'reopened':
        closedEvent = null
        appealedAt = null
        levelEnteredAt = ev.at
        ackedAt = null
        respondedAt = null
        break
      case 'withdrawn':
        withdrawnAt = ev.at
        break
      case 'restricted':
        restriction = d.lifted ? null : { at: ev.at, reasonCategory: d.reasonCategory, reason: d.reason, by: ev.by }
        break
      case 'corrected':
        corrections.push({ at: ev.at, reason: d.reason, changes: d.changes, by: ev.by })
        break
      default:
        break
    }
  }

  const atTop = level >= lastLevel
  const officeNow = officeAtLevel({ officeId, chainId: c.chainId }, level)
  const officeIdNow = chainFor(officeId, c.chainId)[level]?.key
    ? chainFor(officeId, c.chainId)[level]
    : null
  void officeIdNow

  const ackDue = addDays(levelEnteredAt, CONFIG.ackDays)
  const respondDue = addDays(levelEnteredAt, CONFIG.respondDays)
  const resolveDue = addDays(levelEnteredAt, CONFIG.resolveDays)

  const stopped = !!withdrawnAt || !!closedEvent || (appealedAt && !closedEvent)
  const appealPending = !!appealedAt && !closedEvent

  let escalationAt = null
  let escalationKind = null

  if (!stopped && !atTop) {
    if (info) {
      escalationAt = addDays(info.at, CONFIG.infoResponseDays)
      escalationKind = 'info'
    } else if (investigation) {
      escalationAt = addDays(investigation.lastAt, CONFIG.updateIntervalDays)
      escalationKind = 'update'
    } else if (!ackedAt) {
      escalationAt = ackDue
      escalationKind = 'ack'
    } else if (!respondedAt) {
      escalationAt = respondDue
      escalationKind = 'respond'
    } else {
      escalationAt = resolveDue
      escalationKind = 'resolve'
    }
  }

  let statusKey = 'submitted'
  if (withdrawnAt) statusKey = 'withdrawn'
  else if (closedEvent && appealedAt && new Date(appealedAt) >= new Date(closedEvent.at)) statusKey = 'appealed'
  else if (closedEvent && closedEvent.decision === 'rejected') statusKey = 'rejected'
  else if (closedEvent) statusKey = 'closed'
  else if (atTop) statusKey = 'top_of_chain'
  else if (info) statusKey = 'information_requested'
  else if (investigation) statusKey = 'investigation'
  else if (respondedAt) statusKey = 'response'
  else if (lastEscalatedAt && (!ackedAt || lastEscalatedAt > ackedAt)) statusKey = 'escalated'
  else if (ackedAt) statusKey = 'acknowledged'
  else statusKey = 'submitted'

  const effective = (field) => {
    let value = c[field]
    for (const corr of corrections) if (corr.changes && corr.changes[field] !== undefined) value = corr.changes[field]
    return value
  }

  return {
    level,
    lastLevel,
    atTop,
    levels,
    officeNow,
    ackedAt,
    respondedAt,
    lastEscalatedAt,
    investigation,
    info,
    findingEvent,
    closedEvent,
    appealedAt,
    withdrawnAt,
    restriction,
    corrections,
    redactionsApprovedAt,
    lastUpdate,
    ackDue,
    respondDue,
    resolveDue,
    escalationAt,
    escalationKind,
    statusKey,
    effective,
    isClosed: !!closedEvent,
  }
}

// Ordered escalation events that should exist by `now`.
export function planEscalations(c, now) {
  const planned = []
  let copy = { ...c, events: [...c.events] }
  let derived = derive(copy)
  let guard = 0
  while (
    !derived.isClosed &&
    !derived.withdrawnAt &&
    !derived.appealedAt &&
    derived.escalationAt &&
    new Date(derived.escalationAt) <= new Date(now) &&
    !derived.atTop &&
    guard < 12
  ) {
    guard++
    const toLevel = derived.level + 1
    const fromOffice = officeAtLevel(copy, derived.level)
    const toOffice = officeAtLevel(copy, toLevel)
    const at = new Date(derived.escalationAt)
    const ev = {
      type: 'escalated',
      at: at.toISOString(),
      details: {
        fromLevel: derived.level,
        toLevel,
        fromOffice,
        toOffice,
        missed: derived.escalationKind,
        missedDeadline: at.toISOString(),
        chainId: c.chainId,
      },
    }
    planned.push(ev)
    copy = { ...copy, events: [...copy.events, { ...ev, seq: copy.events.length + 1, by: 'System (deadline)', byRole: 'system' }] }
    derived = derive(copy)
  }
  return planned
}

export function chainNameFor(c) {
  return chainLength(c.chainId)
}

export function isOverdue(date, now) {
  return date ? new Date(date).getTime() <= new Date(now).getTime() : false
}

export { DAY }
