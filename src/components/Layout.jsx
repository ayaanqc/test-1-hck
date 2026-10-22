import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { setRole } from '../lib/store.js'
import Icon from './icons.jsx'
import { Chip } from './Common.jsx'

const ROLES = [
  { id: 'citizen', key: 'role.citizen', home: '/' },
  { id: 'official', key: 'role.official', home: '/office' },
  { id: 'reviewer', key: 'role.reviewer', home: '/review' },
  { id: 'public', key: 'role.public', home: '/record' },
  { id: 'admin', key: 'role.admin', home: '/admin' },
]

const GROUPS = [
  {
    key: 'nav.group.casework',
    items: [
      { to: '/', key: 'nav.home', icon: 'home', end: true },
      { to: '/report', key: 'nav.report', icon: 'report' },
      { to: '/track', key: 'nav.track', icon: 'track' },
    ],
  },
  {
    key: 'nav.group.support',
    items: [
      { to: '/legal', key: 'nav.legal', icon: 'scale' },
      { to: '/record', key: 'nav.public', icon: 'archive' },
    ],
  },
  {
    key: 'nav.group.oversight',
    items: [
      { to: '/office', key: 'nav.office', icon: 'inbox' },
      { to: '/review', key: 'nav.review', icon: 'shield' },
      { to: '/admin', key: 'nav.admin', icon: 'sliders' },
    ],
  },
]

function NavItem({ item, onNavigate }) {
  const { t } = useI18n()
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex min-h-[48px] items-center gap-3 rounded-full px-4 text-base font-medium transition-colors ${
            isActive ? 'bg-ink text-white shadow-soft' : 'text-ink-700 hover:bg-brand-50'
          }`
        }
      >
        <Icon name={item.icon} size={19} className="shrink-0" />
        <span className="truncate">{t(item.key)}</span>
      </NavLink>
    </li>
  )
}

function RoleSelect({ id }) {
  const { t } = useI18n()
  const { session } = useStore()
  const navigate = useNavigate()
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1.5 block">
        {t('role.switch')}
      </label>
      <div className="relative">
        <select
          id={id}
          value={session.role}
          onChange={(e) => {
            const role = ROLES.find((r) => r.id === e.target.value)
            setRole(role.id)
            navigate(role.home)
          }}
          className="w-full min-h-[48px] appearance-none rounded-2xl border border-line-strong bg-white px-3.5 py-2 pr-9 text-base font-medium text-ink focus:border-ink focus:outline-none"
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {t(r.key)}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
      </div>
    </div>
  )
}

function SafetyCard() {
  const { t } = useI18n()
  return (
    <div className="rounded-3xl bg-red-50 p-4 ring-1 ring-inset ring-red-200">
      <p className="flex gap-2 text-sm font-semibold leading-snug text-red-950">
        <Icon name="phone" size={16} className="mt-0.5 shrink-0" />
        {t('danger.line')}
      </p>
      <a
        href="tel:112"
        className="mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-red-800 px-4 text-sm font-bold text-white hover:bg-red-900"
      >
        {t('danger.call')} · 112
      </a>
    </div>
  )
}

function SidebarContent({ onNavigate }) {
  const { t } = useI18n()
  return (
    <div className="flex h-full flex-col gap-5">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-1 py-1">
        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-white">
          ज
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold leading-tight tracking-tight text-ink">{t('app.name')}</span>
          <span className="block truncate text-xs text-ink-400">{t('app.tagline')}</span>
        </span>
      </Link>

      <nav aria-label={t('nav.menu')} className="thin-scroll -mx-1 flex-1 overflow-y-auto px-1">
        {GROUPS.map((group) => (
          <div key={group.key} className="mb-5">
            <p className="label-caps mb-2 px-4">{t(group.key)}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <SafetyCard />

      <div className="space-y-3 border-t border-line pt-4">
        <RoleSelect id="role-switcher" />
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center gap-3 rounded-full px-3 text-base font-medium text-ink-700 hover:bg-brand-50"
        >
          <Icon name="settings" size={19} />
          {t('nav.settings')}
        </Link>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { t } = useI18n()
  const { complaints, session } = useStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const roleLabel = ROLES.find((r) => r.id === session.role)?.key
  const initials = session.role === 'official' ? 'OF' : session.role === 'reviewer' ? 'RV' : session.role === 'admin' ? 'AD' : 'SU'
  const latest = complaints[0]?.id

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-ink"
      >
        {t('common.skip')}
      </a>

      {/* Safety strip: every page, every screen size */}
      <div className="no-print bg-red-800 px-4 py-2 text-white md:hidden">
        <p className="mx-auto flex max-w-xl items-center justify-between gap-3 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Icon name="phone" size={15} />
            {t('danger.line')}
          </span>
          <a href="tel:112" className="inline-flex min-h-[40px] shrink-0 items-center rounded-full border border-white/70 px-3 text-sm font-bold">
            {t('danger.call')}
          </a>
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[1500px] gap-6 p-3 sm:p-4 lg:p-6">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-6 hidden h-[calc(100vh-3rem)] w-[248px] shrink-0 rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-xl md:flex md:flex-col xl:w-[272px] overflow-y-auto thin-scroll">
          <SidebarContent />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="no-print mb-4 flex items-center gap-2 sm:mb-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={open}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink md:hidden"
            >
              <Icon name="menu" size={20} />
            </button>

            <Link to="/" className="flex min-w-0 items-center gap-2 md:hidden">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-base font-bold text-white">
                ज
              </span>
              <span className="truncate text-base font-semibold tracking-tight text-ink">{t('app.name')}</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <Chip tone="neutral" className="hidden sm:inline-flex">
                {t(roleLabel)}
              </Chip>
              <Link
                to="/report"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-soft hover:bg-brand-800"
              >
                <Icon name="plus" size={16} />
                {t('nav.report')}
              </Link>
              <Link
                to="/track"
                aria-label={t('nav.track')}
                title={t('nav.track')}
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-brand-50 sm:inline-flex"
              >
                <Icon name="track" size={18} />
              </Link>
              {latest ? (
                <Link
                  to={`/complaint/${latest}`}
                  aria-label={t('role.citizen')}
                  title={t('role.citizen')}
                  className="hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-brand-50 sm:inline-flex"
                >
                  <Icon name="bell" size={18} />
                </Link>
              ) : null}
              <Link
                to="/settings"
                aria-label={t('nav.settings')}
                title={t('nav.settings')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
              >
                {initials}
              </Link>
            </div>
          </header>

          {children}
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="no-print fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col rounded-r-[28px] border-r border-line bg-white p-4 shadow-lift">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-caps">{t('nav.menu')}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('common.close')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <footer className="no-print mx-auto max-w-[1120px] px-4 pb-10 text-center text-sm text-ink-400">
        <p>{t('app.sample')}</p>
      </footer>
    </div>
  )
}
