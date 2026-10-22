import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { useStore } from './lib/useStore.js'
import { init, retryInit } from './lib/store.js'
import Home from './pages/Home.jsx'
import Report from './pages/Report.jsx'
import Submitted from './pages/Submitted.jsx'
import Track from './pages/Track.jsx'
import MyComplaint from './pages/MyComplaint.jsx'
import OfficeInbox from './pages/OfficeInbox.jsx'
import OfficeComplaint from './pages/OfficeComplaint.jsx'
import ReviewList from './pages/ReviewList.jsx'
import ReviewComplaint from './pages/ReviewComplaint.jsx'
import Legal from './pages/Legal.jsx'
import NextSteps from './pages/NextSteps.jsx'
import PublicRecord from './pages/PublicRecord.jsx'
import PublicComplaint from './pages/PublicComplaint.jsx'
import PublicOffice from './pages/PublicOffice.jsx'
import Accountability from './pages/Accountability.jsx'
import AccountabilityHow from './pages/AccountabilityHow.jsx'
import Admin from './pages/Admin.jsx'
import Settings from './pages/Settings.jsx'
import CaseSummary from './pages/CaseSummary.jsx'
import { Page, Notice } from './components/Common.jsx'
import { useI18n } from './i18n/index.js'

const TEXT_SIZE_PX = { sm: '16px', md: '18px', lg: '20px' }

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  const { t } = useI18n()
  return (
    <Page title={t('common.notFound')}>
      <Notice tone="warn">{t('common.notFound')}</Notice>
      <p className="mt-3">
        <Link to="/" className="font-semibold text-brand-700 underline">{t('nav.home')}</Link>
      </p>
    </Page>
  )
}

function Shell() {
  const store = useStore()
  const { settings, ready, initError } = store
  const { t } = useI18n()
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('hc', !!settings.contrast)
    document.documentElement.style.fontSize = TEXT_SIZE_PX[settings.textSize] || '16px'
  }, [settings.contrast, settings.textSize])

  useEffect(() => {
    init().catch((err) => console.error('Could not start the demo', err))
    const timer = setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p role="status" className="text-base font-semibold">{t('app.name')}…</p>
        {slow ? (
          <div className="mt-4">
            <p className="text-base">{t('app.slowStart')}</p>
            <button
              type="button"
              onClick={() => retryInit()}
              className="mt-3 inline-flex min-h-[48px] items-center rounded-xl border-2 border-brand-700 px-4 py-2 text-base font-semibold text-brand-700"
            >
              {t('app.retry')}
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  if (initError) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">{t('app.initFailed')}</h1>
        <p className="mt-2 text-base">{t('app.slowStart')}</p>
        <p className="mt-2 break-all text-sm text-slate-700">{String(initError)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => retryInit()}
            className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-brand-700 bg-brand-700 px-4 py-2 text-base font-semibold text-white"
          >
            {t('app.retry')}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-400 px-4 py-2 text-base font-semibold"
          >
            {t('app.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/submitted/:id" element={<Submitted />} />
          <Route path="/track" element={<Track />} />
          <Route path="/complaint/:id" element={<MyComplaint />} />
          <Route path="/office" element={<OfficeInbox />} />
          <Route path="/office/:id" element={<OfficeComplaint />} />
          <Route path="/review" element={<ReviewList />} />
          <Route path="/review/:id" element={<ReviewComplaint />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/next-steps" element={<NextSteps />} />
          <Route path="/next-steps/:id" element={<NextSteps />} />
          <Route path="/record" element={<PublicRecord />} />
          <Route path="/record/office/:officeId" element={<PublicOffice />} />
          <Route path="/record/department/:deptId" element={<PublicOffice />} />
          <Route path="/record/:id" element={<PublicComplaint />} />
          <Route path="/accountability" element={<Accountability />} />
          <Route path="/accountability/how" element={<AccountabilityHow />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/case-summary/:id" element={<CaseSummary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
