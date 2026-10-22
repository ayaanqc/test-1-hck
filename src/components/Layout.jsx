import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { setRole } from '../lib/store.js'

const ROLES = [
  { id: 'citizen', key: 'role.citizen', home: '/' },
  { id: 'official', key: 'role.official', home: '/office' },
  { id: 'reviewer', key: 'role.reviewer', home: '/review' },
  { id: 'public', key: 'role.public', home: '/record' },
  { id: 'admin', key: 'role.admin', home: '/admin' },
]

export default function Layout({ children }) {
  const { t } = useI18n()
  const { session } = useStore()
  const navigate = useNavigate()
  const nav = [
    { to: '/', key: 'nav.home' },
    { to: '/report', key: 'nav.report' },
    { to: '/track', key: 'nav.track' },
    { to: '/legal', key: 'nav.legal' },
    { to: '/record', key: 'nav.public' },
    { to: '/office', key: 'nav.office' },
    { to: '/review', key: 'nav.review' },
    { to: '/admin', key: 'nav.admin' },
    { to: '/settings', key: 'nav.settings' },
  ]

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-base focus:font-bold focus:text-brand-800"
      >
        {t('common.skip')}
      </a>

      {/* Safety line, on every page */}
      <div className="no-print sticky top-0 z-40 w-full bg-red-800 px-3 py-2 text-white">
        <p className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 text-base font-semibold">
          <span>☎ {t('danger.line')}</span>
          <a href="tel:112" className="inline-flex min-h-[48px] items-center rounded border-2 border-white px-3 py-1 text-base font-bold text-white">
            {t('danger.call')}
          </a>
        </p>
      </div>

      <header className="no-print border-b-2 border-slate-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-3 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-xl font-black text-white">
              ज
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold leading-tight text-brand-800">{t('app.name')}</span>
              <span className="block truncate text-sm text-slate-700">{t('app.tagline')}</span>
            </span>
          </Link>
          <div className="ml-auto">
            <label htmlFor="role-switch" className="block text-xs font-semibold text-slate-700">
              {t('role.switch')}
            </label>
            <select
              id="role-switch"
              value={session.role}
              onChange={(e) => {
                const role = ROLES.find((r) => r.id === e.target.value)
                setRole(role.id)
                navigate(role.home)
              }}
              className="min-h-[48px] rounded-lg border-2 border-slate-400 bg-white px-2 py-1 text-sm font-semibold"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.key)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <nav aria-label={t('nav.menu')} className="mx-auto max-w-xl overflow-x-auto px-2 pb-2">
          <ul className="flex gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `flex min-h-[48px] items-center rounded-lg px-3 py-2 text-base font-semibold ${
                      isActive ? 'bg-brand-700 text-white' : 'text-brand-800 hover:bg-brand-50'
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {children}

      <footer className="no-print mx-auto max-w-xl px-4 pb-10 text-center text-sm text-slate-700">
        <p>{t('app.sample')}</p>
      </footer>
    </div>
  )
}
