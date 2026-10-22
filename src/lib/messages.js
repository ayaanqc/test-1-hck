// One place builds the sentence used whenever a deadline is missed, so the
// fairness wording is identical on every screen.
export function escalationKey(missed) {
  return (
    {
      ack: 'timeline.escalatedAck',
      respond: 'timeline.escalatedRespond',
      resolve: 'timeline.escalatedResolve',
      update: 'timeline.escalatedUpdate',
      info: 'timeline.escalatedInfo',
    }[missed] || 'timeline.escalatedRespond'
  )
}

export function escalationSentence(ev, t, tt, fmtDate) {
  const d = ev.details || {}
  return t(escalationKey(d.missed), {
    to: tt(d.toOffice) || '—',
    from: tt(d.fromOffice) || '—',
    date: fmtDate(d.missedDeadline),
  })
}
