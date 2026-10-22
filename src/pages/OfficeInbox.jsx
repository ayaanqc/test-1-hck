import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Notice, Page, Select, StatusPill } from '../components/Common.jsx'
import { ALL_DESKS, categoryLabel, currentNode, getDept } from '../data/authorities.js'
import { derive } from '../lib/engine.js'
import { fmtDate } from '../lib/format.js'

export default function OfficeInbox() {
  const { t, tt, lang } = useI18n()
  const { complaints, session } = useStore()
  const [deskKey, setDeskKey] = useState('municipal:0')
  const desk = ALL_DESKS.find((d) => d.key === deskKey) || ALL_DESKS[0]

  const rows = useMemo(() => {
    return complaints
      .map((c) => {
        const d = derive(c)
        return { c, d, node: currentNode(c, d) }
      })
      .filter((r) => r.node && r.node.chainLevel === desk.chainLevel && r.c.chainId === desk.chainId)
      .sort((a, b) => new Date(b.c.createdAt) - new Date(a.c.createdAt))
  }, [complaints, desk])

  return (
    <Page title={t('office.title')} sub={t('office.inboxFor', { office: tt(desk.office) })}>
      <Card className="mb-4">
        <label htmlFor="desk" className="mb-1 block text-base font-semibold">
          {t('role.official')} — {t('office.demoDesk')}
        </label>
        <Select id="desk" value={deskKey} onChange={setDeskKey}>
          {ALL_DESKS.map((d) => (
            <option key={d.key} value={d.key}>
              {tt(getDept(d.chainId)?.name)} — {tt(d.office)}
            </option>
          ))}
        </Select>
        <p className="mt-2 text-base">{t('office.noIdentity')}</p>
        <p className="mt-2 text-sm text-slate-700">
          {t('common.by')}: {session.officialName || 'Neelam Choudhary'} · {t('common.demoOnly')}
        </p>
      </Card>

      {!rows.length ? <Notice tone="info">{t('office.empty')}</Notice> : null}

      <ul className="space-y-3">
        {rows.map(({ c, d, node }) => {
          const waiting = !d.redactionsApprovedAt && d.level === 0
          return (
            <li key={c.id}>
              <Link
                to={`/office/${c.id}`}
                className="block rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-brand-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-extrabold">{c.id}</p>
                  <StatusPill statusKey={d.statusKey} />
                </div>
                <p className="mt-1 text-base text-slate-700">
                  {tt(node.office)} · {fmtDate(c.createdAt, lang)}
                </p>
                <p className="mt-1 text-base font-semibold">{tt(categoryLabel(c.category))}</p>
                {waiting ? <p className="mt-1 text-sm font-semibold text-amber-900">⚠ {t('office.waitingRedaction')}</p> : null}
                {d.escalationAt && !d.isClosed ? (
                  <p className="mt-1 text-sm text-slate-700">
                    {t('office.deadline')}: {fmtDate(d.escalationAt, lang)}
                  </p>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </Page>
  )
}
