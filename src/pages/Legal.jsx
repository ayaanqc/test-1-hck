import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { Btn, Card, Checkbox, Chip, Notice, Page, Select, SectionHeading } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { CONFIG } from '../data/config.js'
import { ELIGIBILITY, FORMATS, LANGUAGES, LAWYERS, FREE_OPTIONS, SPECS } from '../data/legalaid.js'
import { money } from '../lib/format.js'

const FREE_ICONS = {
  dlsa: 'scale',
  nalsa_helpline: 'phone',
  telelaw: 'globe',
  nyaya_bandhu: 'users',
  clinic: 'file',
}

export default function Legal() {
  const { t, tt, lang } = useI18n()
  const [checked, setChecked] = useState([])
  const [shown, setShown] = useState(false)
  const [city, setCity] = useState('')
  const [spec, setSpec] = useState('')
  const [lg, setLg] = useState('')
  const [format, setFormat] = useState('')

  const eligible = checked.length > 0
  const cities = useMemo(() => [...new Set(LAWYERS.map((l) => l.city))], [])
  const results = LAWYERS.filter(
    (l) =>
      (!city || l.city === city) &&
      (!spec || l.specs.includes(spec)) &&
      (!lg || l.langs.includes(lg)) &&
      (!format || l.formats.includes(format)),
  )

  return (
    <Page
      title={t('legal.title')}
      sub={t('legal.intro')}
      actions={<Chip tone="safe" icon="scale">{t('legal.freeFirst')}</Chip>}
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold tracking-tight">{t('legal.checkTitle')}</h2>
          <p className="mt-1 text-sm text-ink-500">{t('legal.checkHelp')}</p>
          <fieldset className="mt-4">
            <legend className="label-caps mb-2">{t('legal.criteriaTitle')}</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {ELIGIBILITY.map((e) => (
                <Checkbox
                  key={e.id}
                  id={`elig-${e.id}`}
                  checked={checked.includes(e.id)}
                  onChange={(on) => setChecked((c) => (on ? [...c, e.id] : c.filter((x) => x !== e.id)))}
                  label={
                    <>
                      <span className="text-base font-medium">{t(`legal.crit.${e.id}`)}</span>
                      <span className="block text-xs text-ink-400">{t(`legal.crit.${e.id}.desc`)}</span>
                    </>
                  }
                />
              ))}
            </div>
          </fieldset>
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-xs text-ink-500">
            <Icon name="info" size={14} className="mt-0.5 shrink-0" />
            {t('legal.incomeLimit', { amount: money(CONFIG.sampleIncomeLimitAnnual, lang) })}
          </p>
          <div className="mt-4">
            <Btn onClick={() => setShown(true)} icon="check">{t('legal.checkButton')}</Btn>
          </div>
        </Card>

        <div className="space-y-3">
          {shown ? (
            <Notice tone={eligible ? 'safe' : 'warn'} icon={eligible ? 'check' : 'info'}>
              {eligible ? t('legal.eligible') : t('legal.notEligible')}
            </Notice>
          ) : (
            <Card>
              <p className="label-caps">{t('legal.bring')}</p>
              <p className="mt-1.5 text-base text-ink-700">{t('legal.bringList')}</p>
            </Card>
          )}
          <Card className="bg-ink text-white">
            <p className="text-sm text-white/65">{t('app.name')} · {t('legal.title')}</p>
            <p className="mt-2 text-base text-white/85">{t('legal.anyone')}</p>
            <a
              href="tel:15100"
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-base font-semibold text-ink hover:bg-white/90"
            >
              <Icon name="phone" size={17} />
              {t('legal.call', { phone: '15100' })}
            </a>
          </Card>
        </div>
      </div>

      <SectionHeading>{t('legal.freeFirst')}</SectionHeading>
      <ul className="grid gap-3 lg:grid-cols-2">
        {FREE_OPTIONS.map((o) => (
          <li key={o.id}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                  <Icon name={FREE_ICONS[o.id] || 'scale'} size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug">{tt(o.name)}</h3>
                  <p className="mt-0.5 text-sm text-ink-500">{tt(o.where)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip tone="safe">{t('legal.cost.gov_aid')}</Chip>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{t(`legal.options.${o.id}.apply`)}</p>
              {o.id === 'dlsa' ? (
                <p className="mt-2 text-sm text-ink-500">
                  <strong className="text-ink-700">{t('legal.bring')}:</strong> {t('legal.options.dlsa.bring')}
                </p>
              ) : null}
              {o.phone ? (
                <a href={`tel:${o.phone}`} className="mt-auto inline-flex items-center gap-1.5 pt-3 text-base font-semibold text-ink underline decoration-line-strong underline-offset-4">
                  <Icon name="phone" size={15} />
                  {t('legal.call', { phone: o.phone })}
                </a>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-400">{t('legal.notLegalAdvice')}</p>

      <SectionHeading
        action={
          <span className="text-sm text-ink-400">{t('legal.results', { n: results.length })}</span>
        }
      >
        {t('legal.directory')}
      </SectionHeading>
      <p className="mb-3 text-sm text-ink-500">{t('legal.directoryHelp')}</p>

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="f-city" className="label-caps mb-1.5 block">{t('legal.filterCity')}</label>
            <Select id="f-city" value={city} onChange={setCity}>
              <option value="">{t('legal.filterAll')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="f-spec" className="label-caps mb-1.5 block">{t('legal.filterSpec')}</label>
            <Select id="f-spec" value={spec} onChange={setSpec}>
              <option value="">{t('legal.filterAll')}</option>
              {SPECS.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="f-lang" className="label-caps mb-1.5 block">{t('legal.filterLang')}</label>
            <Select id="f-lang" value={lg} onChange={setLg}>
              <option value="">{t('legal.filterAll')}</option>
              {LANGUAGES.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="f-format" className="label-caps mb-1.5 block">{t('legal.filterFormat')}</label>
            <Select id="f-format" value={format} onChange={setFormat}>
              <option value="">{t('legal.filterAll')}</option>
              {FORMATS.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {!results.length ? <Notice tone="info">{t('legal.noResults')}</Notice> : null}
      <ul className="grid gap-3 lg:grid-cols-2">
        {results.map((l) => (
          <li key={l.id}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug">{l.name}</h3>
                <Chip
                  tone={l.cost === 'gov_aid' ? 'safe' : l.cost === 'free_consult' ? 'neutral' : 'neutral'}
                  className="shrink-0"
                >
                  {t(`legal.cost.${l.cost}`)}
                </Chip>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {l.city} · {l.langs.map((x) => tt(LANGUAGES.find((y) => y.id === x)?.label)).join(', ')}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {l.specs.map((s) => tt(SPECS.find((x) => x.id === s)?.label)).join(' · ')}
              </p>
              <p className="text-sm text-ink-500">
                {l.formats.map((f) => tt(FORMATS.find((x) => x.id === f)?.label)).join(' · ')}
              </p>
              <p className="mt-2 text-sm text-ink-700">{tt(l.note)}</p>
            </Card>
          </li>
        ))}
      </ul>

      <SectionHeading>{t('legal.seeRoutes')}</SectionHeading>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold">{t('next.title')}</p>
            <p className="text-sm text-ink-400">{t('next.intro')}</p>
          </div>
          <Btn to="/next-steps" variant="secondary" size="sm" full={false} iconRight="arrowRight">
            {t('next.allRoutes')}
          </Btn>
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold">{t('acc.title')}</p>
            <p className="text-sm text-ink-400">{t('acc.how')}</p>
          </div>
          <Btn to="/accountability" variant="secondary" size="sm" full={false} iconRight="arrowRight">
            {t('public.howWorked')}
          </Btn>
        </Card>
      </div>

      <p className="mt-4 text-xs text-ink-400">{t('legal.notLegalAdvice')}</p>
    </Page>
  )
}
