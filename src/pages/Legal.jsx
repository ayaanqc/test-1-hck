import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { Btn, Card, Checkbox, Field, Notice, Page, SectionHeading, Select } from '../components/Common.jsx'
import { CONFIG } from '../data/config.js'
import { ELIGIBILITY, FORMATS, LANGUAGES, LAWYERS, FREE_OPTIONS, SPECS } from '../data/legalaid.js'
import { money } from '../lib/format.js'

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
    <Page title={t('legal.title')} sub={t('legal.intro')} back={{ to: '/', label: t('nav.home') }}>
      <Card>
        <h2 className="text-xl font-bold">{t('legal.checkTitle')}</h2>
        <p className="mt-1 text-base text-slate-700">{t('legal.checkHelp')}</p>
        <fieldset className="mt-3">
          <legend className="mb-2 text-base font-semibold">{t('legal.criteriaTitle')}</legend>
          {ELIGIBILITY.map((e) => (
            <Checkbox
              key={e.id}
              id={`elig-${e.id}`}
              checked={checked.includes(e.id)}
              onChange={(on) => setChecked((c) => (on ? [...c, e.id] : c.filter((x) => x !== e.id)))}
              label={
                <>
                  <span className="font-semibold">{t(`legal.crit.${e.id}`)}</span>
                  <span className="block text-sm text-slate-700">{t(`legal.crit.${e.id}.desc`)}</span>
                </>
              }
            />
          ))}
        </fieldset>
        <Notice tone="info">{t('legal.incomeLimit', { amount: money(CONFIG.sampleIncomeLimitAnnual, lang) })}</Notice>
        <div className="mt-3">
          <Btn onClick={() => setShown(true)}>{t('legal.checkButton')}</Btn>
        </div>
        {shown ? (
          <div className="mt-3" aria-live="polite">
            <Notice tone={eligible ? 'safe' : 'warn'}>{eligible ? t('legal.eligible') : t('legal.notEligible')}</Notice>
          </div>
        ) : null}
      </Card>

      <SectionHeading>{t('legal.freeFirst')}</SectionHeading>
      <ul className="space-y-3">
        {FREE_OPTIONS.map((o) => (
          <li key={o.id}>
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold">{tt(o.name)}</h3>
                <span className="rounded-full border-2 border-emerald-700 bg-emerald-50 px-2 py-0.5 text-sm font-bold">
                  {t('legal.cost.gov_aid')}
                </span>
              </div>
              <p className="mt-1 text-base text-slate-700">{tt(o.where)}</p>
              <p className="mt-2 text-base">{t(`legal.options.${o.id}.apply`)}</p>
              {o.id === 'dlsa' ? (
                <p className="mt-2 text-base">
                  <strong>{t('legal.bring')}:</strong> {t('legal.options.dlsa.bring')}
                </p>
              ) : null}
              {o.phone ? (
                <p className="mt-2">
                  <a className="text-base font-semibold text-brand-700 underline" href={`tel:${o.phone}`}>
                    ☎ {t('legal.call', { phone: o.phone })}
                  </a>
                </p>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-slate-700">{t('legal.notLegalAdvice')}</p>

      <SectionHeading>{t('legal.directory')}</SectionHeading>
      <p className="text-base text-slate-700">{t('legal.directoryHelp')}</p>
      <Card className="mt-2">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('legal.filterCity')} htmlFor="f-city">
            <Select id="f-city" value={city} onChange={setCity}>
              <option value="">{t('legal.filterAll')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('legal.filterSpec')} htmlFor="f-spec">
            <Select id="f-spec" value={spec} onChange={setSpec}>
              <option value="">{t('legal.filterAll')}</option>
              {SPECS.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('legal.filterLang')} htmlFor="f-lang">
            <Select id="f-lang" value={lg} onChange={setLg}>
              <option value="">{t('legal.filterAll')}</option>
              {LANGUAGES.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('legal.filterFormat')} htmlFor="f-format">
            <Select id="f-format" value={format} onChange={setFormat}>
              <option value="">{t('legal.filterAll')}</option>
              {FORMATS.map((s) => (
                <option key={s.id} value={s.id}>{tt(s.label)}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <p className="mt-3 text-base font-semibold">{t('legal.results', { n: results.length })}</p>
      {!results.length ? <Notice tone="info">{t('legal.noResults')}</Notice> : null}
      <ul className="mt-2 space-y-3">
        {results.map((l) => (
          <li key={l.id}>
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold">{l.name}</h3>
                <span
                  className={`rounded-full border-2 px-2 py-0.5 text-sm font-bold ${
                    l.cost === 'gov_aid'
                      ? 'border-emerald-700 bg-emerald-50'
                      : l.cost === 'free_consult'
                        ? 'border-brand-700 bg-brand-50'
                        : 'border-slate-500 bg-slate-100'
                  }`}
                >
                  {t(`legal.cost.${l.cost}`)}
                </span>
              </div>
              <p className="mt-1 text-base text-slate-700">{l.city} · {l.langs.map((x) => tt(LANGUAGES.find((y) => y.id === x)?.label)).join(', ')}</p>
              <p className="text-base text-slate-700">
                {l.specs.map((s) => tt(SPECS.find((x) => x.id === s)?.label)).join(' · ')}
              </p>
              <p className="text-base text-slate-700">
                {l.formats.map((f) => tt(FORMATS.find((x) => x.id === f)?.label)).join(' · ')}
              </p>
              <p className="mt-1 text-base">{tt(l.note)}</p>
            </Card>
          </li>
        ))}
      </ul>

      <SectionHeading>{t('legal.seeRoutes')}</SectionHeading>
      <Card>
        <Btn to="/next-steps" variant="secondary">{t('next.title')}</Btn>
      </Card>
    </Page>
  )
}
