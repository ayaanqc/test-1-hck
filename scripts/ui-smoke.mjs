// Renders every screen in jsdom to catch runtime errors.
// Run with `npm run smoke:ui`.
import 'fake-indexeddb/auto'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
try { Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true }) } catch { /* node 22 provides navigator */ }
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.Event = dom.window.Event
globalThis.localStorage = dom.window.localStorage
globalThis.sessionStorage = dom.window.sessionStorage
globalThis.indexedDB = globalThis.indexedDB || dom.window.indexedDB
dom.window.indexedDB = globalThis.indexedDB
dom.window.scrollTo = () => {}
dom.window.confirm = () => true
globalThis.IS_REACT_ACT_ENVIRONMENT = false

const React = await import('react')
const { createRoot } = await import('react-dom/client')
const { MemoryRouter } = await import('react-router-dom')

const store = await import('../src/lib/store.js')
const Layout = (await import('../src/components/Layout.jsx')).default
const pages = {
  home: (await import('../src/pages/Home.jsx')).default,
  report: (await import('../src/pages/Report.jsx')).default,
  submitted: (await import('../src/pages/Submitted.jsx')).default,
  track: (await import('../src/pages/Track.jsx')).default,
  complaint: (await import('../src/pages/MyComplaint.jsx')).default,
  officeInbox: (await import('../src/pages/OfficeInbox.jsx')).default,
  officeComplaint: (await import('../src/pages/OfficeComplaint.jsx')).default,
  reviewList: (await import('../src/pages/ReviewList.jsx')).default,
  reviewComplaint: (await import('../src/pages/ReviewComplaint.jsx')).default,
  legal: (await import('../src/pages/Legal.jsx')).default,
  nextSteps: (await import('../src/pages/NextSteps.jsx')).default,
  publicRecord: (await import('../src/pages/PublicRecord.jsx')).default,
  publicComplaint: (await import('../src/pages/PublicComplaint.jsx')).default,
  publicOffice: (await import('../src/pages/PublicOffice.jsx')).default,
  accountability: (await import('../src/pages/Accountability.jsx')).default,
  accountabilityHow: (await import('../src/pages/AccountabilityHow.jsx')).default,
  admin: (await import('../src/pages/Admin.jsx')).default,
  settings: (await import('../src/pages/Settings.jsx')).default,
  caseSummary: (await import('../src/pages/CaseSummary.jsx')).default,
}

const { Routes, Route } = await import('react-router-dom')

await store.init()

const cases = [
  ['home', 'home', '/', '/', 'Report a problem'],
  ['report', 'report', '/report', '/report', 'What happened?'],
  ['submitted', 'submitted', '/submitted/JD-2026-004821', '/submitted/:id', 'Complaint ID'],
  ['track', 'track', '/track', '/track', 'Complaint ID'],
  ['complaint', 'complaint', '/complaint/JD-2026-004821', '/complaint/:id', 'My complaint'],
  ['complaint-escalated', 'complaint', '/complaint/JD-2026-004710', '/complaint/:id', 'Timeline'],
  ['complaint-top', 'complaint', '/complaint/JD-2026-003877', '/complaint/:id', 'See next steps outside this system'],
  ['complaint-restricted', 'complaint', '/complaint/JD-2026-004120', '/complaint/:id', 'restricted'],
  ['complaint-closed', 'complaint', '/complaint/JD-2026-004205', '/complaint/:id', 'I disagree with this decision'],
  ['officeInbox', 'officeInbox', '/office', '/office', 'Complaints at'],
  ['officeComplaint', 'officeComplaint', '/office/JD-2026-004821', '/office/:id', 'What you can do'],
  ['officeComplaint-cluster', 'officeComplaint', '/office/JD-2026-004002', '/office/:id', 'Waiting for the reviewer'],
  ['reviewList', 'reviewList', '/review', '/review', 'Cases needing review'],
  ['reviewComplaint', 'reviewComplaint', '/review/JD-2026-004002', '/review/:id', 'Possible coordinated submissions'],
  ['legal', 'legal', '/legal', '/legal', 'Free legal aid options'],
  ['nextSteps', 'nextSteps', '/next-steps', '/next-steps', 'Right to Information'],
  ['nextStepsComplaint', 'nextSteps', '/next-steps/JD-2026-004821', '/next-steps/:id', 'A bribe demand'],
  ['publicRecord', 'publicRecord', '/record', '/record', 'Public record'],
  ['publicComplaint', 'publicComplaint', '/record/JD-2026-004821', '/record/:id', 'Public complaint record'],
  ['publicRestricted', 'publicComplaint', '/record/JD-2026-004120', '/record/:id', 'Restricted from public view'],
  ['publicOffice', 'publicOffice', '/record/office/muni-ward-12', '/record/office/:officeId', 'Accountability indicator'],
  ['publicDept', 'publicOffice', '/record/department/municipal', '/record/department/:deptId', 'Department'],
  ['accountability', 'accountability', '/accountability', '/accountability', 'How this is worked out'],
  ['accountabilityHow', 'accountabilityHow', '/accountability/how?office=muni-ward-12', '/accountability/how', 'The data behind it'],
  ['admin', 'admin', '/admin', '/admin', 'Tamper test'],
  ['settings', 'settings', '/settings', '/settings', 'Text size'],
  ['caseSummary', 'caseSummary', '/case-summary/JD-2026-004300', '/case-summary/:id', 'Case summary'],
  ['notFound', 'publicComplaint', '/record/JD-0000-000000', '/record/:id', 'No public complaint'],
]

const errors = []
dom.window.addEventListener('error', (e) => errors.push(String(e.error || e.message)))
const origError = console.error
console.error = (...args) => {
  const msg = args.map((a) => (a && a.stack ? a.stack : String(a))).join(' ')
  if (!msg.includes('not wrapped in act')) errors.push(msg)
  origError(...args)
}

let passed = 0
for (const [name, pageKey, path, pattern, expected] of cases) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let thrown = null
  try {
    root.render(
      React.createElement(
        MemoryRouter,
        { initialEntries: [path] },
        React.createElement(
          Layout,
          null,
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: pattern, element: React.createElement(pages[pageKey]) }),
          ),
        ),
      ),
    )
    await new Promise((r) => setTimeout(r, 120))
  } catch (err) {
    thrown = err
  }
  const text = container.textContent || ''
  const ok = !thrown && text.length > 40 && (!expected || text.includes(expected))
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${path})  ${thrown ? 'threw ' + thrown.message : `${text.length} chars`}`)
  if (!ok) {
    console.log('   expected text:', expected)
    console.log('   got:', text.slice(0, 240))
  } else {
    passed++
  }
  root.unmount()
  container.remove()
}

// Language switch check: render the same screen in Hindi
const { setSetting } = store
await setSetting('lang', 'hi')
{
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(pages.home)),
  )
  await new Promise((r) => setTimeout(r, 100))
  const text = container.textContent || ''
  const ok = text.includes('समस्या दर्ज करें')
  console.log(`${ok ? 'PASS' : 'FAIL'}  home renders in Hindi`)
  if (ok) passed++
  root.unmount()
  container.remove()
}
await setSetting('lang', 'en')

console.error = origError
console.log(`\n${passed}/${cases.length + 1} screens rendered`)
if (errors.length) {
  console.log('PAGE ERRORS:\n' + errors.slice(0, 12).join('\n---\n'))
}
process.exit(passed === cases.length + 1 && !errors.length ? 0 : 1)
