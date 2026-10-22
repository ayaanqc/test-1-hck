// Drives the citizen journey through the real screens in jsdom (typed route,
// no microphone): report -> check details -> OTP -> declaration -> receipt.
// Run with `npm run smoke:journey`.
import 'fake-indexeddb/auto'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
try {
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
} catch { /* node provides navigator */ }
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.localStorage = dom.window.localStorage
globalThis.sessionStorage = dom.window.sessionStorage
globalThis.indexedDB = globalThis.indexedDB || dom.window.indexedDB
dom.window.indexedDB = globalThis.indexedDB
dom.window.scrollTo = () => {}
dom.window.confirm = () => true
globalThis.IS_REACT_ACT_ENVIRONMENT = false

const React = await import('react')
const { createRoot } = await import('react-dom/client')
const { MemoryRouter, Routes, Route } = await import('react-router-dom')
const store = await import('../src/lib/store.js')
const Report = (await import('../src/pages/Report.jsx')).default
const Submitted = (await import('../src/pages/Submitted.jsx')).default
const { act } = await import('react')

await store.init()

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
root.render(
  React.createElement(
    MemoryRouter,
    { initialEntries: ['/report'] },
    React.createElement(
      Routes,
      null,
      React.createElement(Route, { path: '/report', element: React.createElement(Report) }),
      React.createElement(Route, { path: '/submitted/:id', element: React.createElement(Submitted) }),
    ),
  ),
)

const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms))
await wait(120)

function setValue(el, value) {
  const proto = el.tagName === 'TEXTAREA'
    ? dom.window.HTMLTextAreaElement.prototype
    : dom.window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
  setter.call(el, value)
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
}

function button(text) {
  return [...container.querySelectorAll('button')].find((b) => (b.textContent || '').includes(text))
}

async function clickButton(text) {
  const b = button(text)
  if (!b) throw new Error(`No button containing "${text}". Buttons: ${[...container.querySelectorAll('button')].map((x) => x.textContent.trim()).join(' | ')}`)
  await act(async () => { b.click() })
  await wait()
}

async function choose(selector) {
  const el = container.querySelector(selector)
  if (!el) throw new Error(`No element ${selector}`)
  await act(async () => { el.click() })
  await wait()
}

const checks = []
function check(name, ok, extra = '') {
  checks.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}

// Step 1: category
await choose('input[name="category"][value="bribe"]')
await clickButton('Next')
check('step 1 -> step 2', container.textContent.includes('Which department?'))

// Step 2: department
await choose('input[name="dept"][value="municipal"]')
await clickButton('Next')
check('step 2 -> step 3', container.textContent.includes('Which office?'))

// Step 3: office
await choose('input[name="office"][value="muni-market"]')
await clickButton('Next')

// Step 4: when (with typing)
setValue(container.querySelector('#when'), 'Yesterday morning around 11')
await wait()
await clickButton('Next')

// Step 5: who
setValue(container.querySelector('#who'), 'The licence clerk at the counter, a man in his forties')
await wait()
await clickButton('Next')

// Step 6: witness (optional, skipped)
await clickButton('Next')

// Step 7: narrative + no recording
setValue(container.querySelector('#narrative'), 'I was asked for 2000 rupees to make my licence renewal move faster. I did not pay.')
await wait()
await clickButton('Continue without a recording')
check('step 7 -> verification', container.textContent.includes('Confirm your phone number'))

// Verify OTP
setValue(container.querySelector('#phone'), '9829000001')
await wait()
await clickButton('Show demo OTP')
setValue(container.querySelector('#otp'), '123456')
await wait()
await clickButton('Verify number')
check('phone verified with demo OTP', container.textContent.includes('Phone number verified'))

// Declaration + submit
await choose('#declaration')
await clickButton('Send my complaint')
await wait(200)

check('receipt screen shown', container.textContent.includes('Your complaint is filed'))
const latest = store.getSnapshot().complaints[0]
const latestIsNew = latest && latest.events.find((e) => e.type === 'submitted')?.details.category === 'bribe' && latest.complainant.phone === '9829000001'
check('complaint stored in the record', !!latestIsNew, latest?.id)
check('receipt shows the complaint ID', container.textContent.includes(latest.id))
check('new record verifies', (await store.verifyComplaint(latest.id)).ok)

// The office cannot act until the reviewer approves redactions
const d = (await import('../src/lib/engine.js')).derive(latest)
check('redactions still need reviewer approval', !d.redactionsApprovedAt)
check('complaint starts with the right office', d.level === 0 && latest.officeId === 'muni-market')

// ---- Scenario B: the recording path, using the built-in sample recording ----
root.unmount()
container.remove()

const container2 = document.createElement('div')
document.body.appendChild(container2)
const root2 = createRoot(container2)
root2.render(
  React.createElement(
    MemoryRouter,
    { initialEntries: ['/report'] },
    React.createElement(
      Routes,
      null,
      React.createElement(Route, { path: '/report', element: React.createElement(Report) }),
      React.createElement(Route, { path: '/submitted/:id', element: React.createElement(Submitted) }),
    ),
  ),
)
await wait(120)

const c2 = container2
function button2(text) {
  return [...c2.querySelectorAll('button')].find((b) => (b.textContent || '').includes(text))
}
async function click2(text) {
  const b = button2(text)
  if (!b) throw new Error(`No button "${text}" in scenario B. Have: ${[...c2.querySelectorAll('button')].map((x) => x.textContent.trim()).join(' | ')}`)
  await act(async () => { b.click() })
  await wait(60)
}
function set2(selector, value) {
  const el = c2.querySelector(selector)
  if (!el) throw new Error(`No ${selector} in scenario B`)
  const proto = el.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
}

await act(async () => { c2.querySelector('input[name="category"][value="bribe"]').click() })
await wait()
await click2('Next')
await act(async () => { c2.querySelector('input[name="dept"][value="municipal"]').click() })
await wait()
await click2('Next')
await act(async () => { c2.querySelector('input[name="office"][value="muni-market"]').click() })
await wait()
await click2('Next')
set2('#when', 'Yesterday morning')
await wait()
await click2('Next')
set2('#who', 'The licence clerk at the counter')
await wait()
await click2('Next')
await click2('Next')
await click2('Use the sample recording')
set2('#narrative', 'I recorded what happened.')
await wait()
await click2('Prepare my report')
await wait(300)

check('AI draft step opens', c2.textContent.includes('AI draft'))
check('AI draft is labelled as a demo result', c2.textContent.includes('Demo result') || c2.textContent.includes('prepared demo result'))
check('draft cites the recording', c2.textContent.includes('From the recording at'))

await click2('Correct this field')
set2('#corr-what_happened', 'My corrected version of what happened.')
await wait()
await click2('Save')
check('correction is kept next to the AI version', c2.textContent.includes('Your correction'))

await click2('Continue to verification')
set2('#phone', '9829000002')
await wait()
await click2('Show demo OTP')
set2('#otp', '123456')
await wait()
await click2('Verify number')
await act(async () => { c2.querySelector('#declaration').click() })
await wait()
await click2('Send my complaint')
await wait(250)

check('recording-path complaint is filed', c2.textContent.includes('Your complaint is filed'))
const newest = store.getSnapshot().complaints[0]
check('AI draft and corrections are stored', !!newest?.events.find((e) => e.type === 'submitted')?.details.aiDraft?.demo)
check(
  'complainant correction is stored alongside the AI version',
  newest?.events.find((e) => e.type === 'submitted')?.details.corrections?.what_happened === 'My corrected version of what happened.',
)
check('recording path record verifies', (await store.verifyComplaint(newest.id)).ok)

const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} journey checks passed`)
process.exit(failed.length ? 1 : 0)
