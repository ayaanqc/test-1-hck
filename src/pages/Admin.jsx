import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Chip, Field, Notice, Page, SectionHeading, Select, TextInput } from '../components/Common.jsx'
import { now, resetDemo, setDemoDate, stepDemoDate, tamperEvent, tamperEvidence } from '../lib/store.js'
import { fmtDateTime } from '../lib/format.js'
import { CONFIG } from '../data/config.js'
import Icon from '../components/icons.jsx'

export default function Admin() {
  const { t, lang } = useI18n()
  const { admin, complaints } = useStore()
  const [dateInput, setDateInput] = useState(new Date(now()).toISOString().slice(0, 10))
  const [target, setTarget] = useState(complaints[1]?.id || complaints[0]?.id || '')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function doReset() {
    if (!window.confirm(t('admin.resetConfirm'))) return
    setBusy(true)
    await resetDemo()
    setBusy(false)
    setMessage(t('admin.reset'))
  }

  return (
    <Page
      eyebrow={t('role.admin')}
      title={t('admin.title')}
      sub={t('common.demoOnly')}
      actions={<Chip tone="neutral" icon="clock">{fmtDateTime(now().toISOString(), lang)}</Chip>}
    >
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-ink-500"><Icon name="clock" size={16} /></span>
          {t('admin.demoDate')}
        </h2>
        <p className="mt-1 text-base">{t('admin.demoDateHelp')}</p>
        <p className="mt-2 text-base font-semibold">{t('admin.now', { date: fmtDateTime(now().toISOString(), lang) })}</p>
        <p className="text-sm text-ink-500">{t('admin.currentDate')}: {admin.demoDate ? fmtDateTime(admin.demoDate, lang) : t('admin.realDate')}</p>
        <div className="mt-3 space-y-2">
          <Btn onClick={() => stepDemoDate(CONFIG.demoDateStepDays)}>+{CONFIG.demoDateStepDays} {t('admin.step')}</Btn>
          <Field label={t('admin.setDate')} htmlFor="demo-date">
            <TextInput id="demo-date" type="date" value={dateInput} onChange={setDateInput} />
          </Field>
          <Btn variant="secondary" onClick={() => setDemoDate(new Date(dateInput + 'T10:00:00').toISOString())}>
            {t('admin.setDate')}
          </Btn>
          <Btn variant="quiet" onClick={() => setDemoDate(null)}>{t('admin.clearDate')}</Btn>
        </div>
      </Card>

      <SectionHeading action={<Icon name="alert" size={16} className="text-ink-400" />}>{t('admin.tamper')}</SectionHeading>
      <Card>
        <p className="text-base">{t('admin.tamperHelp')}</p>
        <Field label={t('admin.chooseComplaint')} htmlFor="tamper-target">
          <Select id="tamper-target" value={target} onChange={setTarget}>
            {complaints.filter((c) => c.events.length).slice(0, 20).map((c) => (
              <option key={c.id} value={c.id}>{c.id}</option>
            ))}
          </Select>
        </Field>
        <div className="space-y-2">
          <Btn
            variant="warning"
            disabled={!target}
            onClick={async () => {
              const r = await tamperEvent(target)
              if (r) setMessage(t('admin.tamperDone', { seq: r.seq, id: r.complaintId }))
            }}
          >
            {t('admin.tamperButton')}
          </Btn>
          <Btn
            variant="warning"
            disabled={!target}
            onClick={async () => {
              const r = await tamperEvidence(target)
              if (r) setMessage(t('admin.tamperEvidenceDone', { name: r.name, id: r.complaintId }))
            }}
          >
            {t('admin.tamperEvidence')}
          </Btn>
        </div>
        {message ? (
          <div className="mt-3">
            <Notice tone="warn">{message}</Notice>
          </div>
        ) : null}
        {target ? (
          <p className="mt-2 text-base">
            <Link to={`/review/${target}`} className="font-semibold text-ink underline decoration-line-strong underline-offset-4">
              {t('common.viewComplaint')}
            </Link>
          </p>
        ) : null}
      </Card>

      <SectionHeading>{t('admin.reset')}</SectionHeading>
      <Card>
        <p className="text-base">{t('admin.resetHelp')}</p>
        <div className="mt-2">
          <Btn variant="danger" onClick={doReset} disabled={busy}>{t('admin.reset')}</Btn>
        </div>
      </Card>

      <SectionHeading action={<Icon name="file" size={16} className="text-ink-400" />}>{t('admin.audit')}</SectionHeading>
      <Card>
        <p className="text-sm text-ink-500">{t('admin.auditHelp')}</p>
        {admin.audit.length ? (
          <ol className="mt-2 space-y-2">
            {[...admin.audit].reverse().map((a, i) => (
              <li key={i} className="border-b border-slate-200 pb-2">
                <p className="text-sm text-ink-500">{fmtDateTime(a.at, lang)}</p>
                <p className="text-base font-semibold">{a.action}</p>
                <p className="text-base">{a.detail}</p>
                <p className="text-sm text-ink-500">{t('common.by')}: {a.by}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-base">{t('admin.noAudit')}</p>
        )}
        <p className="mt-3 text-sm text-ink-500">{t('admin.noDelete')}</p>
      </Card>
    </Page>
  )
}
