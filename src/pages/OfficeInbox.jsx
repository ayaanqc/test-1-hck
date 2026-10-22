import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Card, Chip, EmptyState, Notice, Page, Select, StatusPill } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
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

  const waitingCount = rows.filter((r) => !r.d.redactionsApprovedAt && r.d.level === 0).length

  return (
    <Page
      eyebrow={t('role.official')}
      title={t('office.title')}
      sub={t('office.inboxFor', { office: tt(desk.office) })}
      actions={<Chip tone="neutral" icon="inbox">{t('review.openCount', { n: rows.length })}</Chip>}
    >
      <Card>
        <label htmlFor="desk" className="label-caps mb-2 block">
          {t('office.demoDesk')}
        </label>
        <Select id="desk" value={deskKey} onChange={setDeskKey}>
          {ALL_DESKS.map((d) => (
            <option key={d.key} value={d.key}>
              {tt(getDept(d.chainId)?.name)} — {tt(d.office)}
            </option>
          ))}
        </Select>
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-500">
          <Icon name="lock" size={15} className="mt-0.5 shrink-0" />
          {t('office.noIdentity')}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          {t('common.by')}: {session.officialName || 'Neelam Choudhary'} · {t('common.demoOnly')}
        </p>
      </Card>

      {waitingCount ? (
        <div className="mt-3">
          <Notice tone="warn">{t('office.waitingRedaction')} · {waitingCount}</Notice>
        </div>
      ) : null}

      <div className="mt-4">
        {!rows.length ? (
          <EmptyState icon="inbox" title={t('office.empty')}>
            {t('office.noIdentity')}
          </EmptyState>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {rows.map(({ c, d, node }) => {
              const waiting = !d.redactionsApprovedAt && d.level === 0
              return (
                <li key={c.id}>
                  <Link
                    to={`/office/${c.id}`}
                    className="group flex h-full flex-col rounded-4xl border border-line bg-white p-5 shadow-card transition-colors hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-ink-400">{c.id}</p>
                        <p className="mt-1 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{tt(categoryLabel(c.category))}</p>
                      </div>
                      <StatusPill statusKey={d.statusKey} className="shrink-0" />
                    </div>
                    <p className="mt-1 text-sm text-ink-400">
                      {tt(node.office)} · {fmtDate(c.createdAt, lang)}
                    </p>
                    {waiting ? (
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                        <Icon name="alert" size={14} /> {t('office.waitingRedaction')}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <span className="flex items-center gap-1.5 text-sm text-ink-500">
                        <Icon name="clock" size={14} className="text-ink-400" />
                        {d.escalationAt && !d.isClosed ? fmtDate(d.escalationAt, lang) : t('timeline.nothingScheduled')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 group-hover:gap-2">
                        {t('office.open')} <Icon name="arrowRight" size={15} />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Page>
  )
}
