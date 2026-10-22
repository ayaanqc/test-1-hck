import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Checkbox, Notice, Page, SectionHeading } from '../components/Common.jsx'
import { setSetting } from '../lib/store.js'

const SIZES = [
  { id: 'sm', key: 'settings.size.sm' },
  { id: 'md', key: 'settings.size.md' },
  { id: 'lg', key: 'settings.size.lg' },
]

export default function Settings() {
  const { t } = useI18n()
  const { settings } = useStore()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel() }, [])

  function readAloud() {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const main = document.getElementById('main')
    const text = (main ? main.innerText : document.body.innerText).slice(0, 3000)
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = settings.lang === 'hi' ? 'hi-IN' : 'en-IN'
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
    setSpeaking(true)
  }

  return (
    <Page title={t('settings.title')} back={{ to: '/', label: t('nav.home') }}>
      <Card>
        <h2 className="text-lg font-bold">{t('settings.language')}</h2>
        <div className="mt-2 space-y-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिंदी' },
          ].map((l) => (
            <label key={l.id} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${settings.lang === l.id ? 'border-brand-700 bg-brand-50' : 'border-slate-300'}`}>
              <input type="radio" name="lang" checked={settings.lang === l.id} onChange={() => setSetting('lang', l.id)} className="h-5 w-5" />
              <span className="text-base font-medium">{l.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <SectionHeading>{t('settings.textSize')}</SectionHeading>
      <Card>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <label key={s.id} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${settings.textSize === s.id ? 'border-brand-700 bg-brand-50' : 'border-slate-300'}`}>
              <input type="radio" name="size" checked={settings.textSize === s.id} onChange={() => setSetting('textSize', s.id)} className="h-5 w-5" />
              <span className={`font-medium ${s.id === 'sm' ? 'text-base' : s.id === 'md' ? 'text-lg' : 'text-xl'}`}>{t(s.key)}</span>
            </label>
          ))}
        </div>
      </Card>

      <SectionHeading>{t('settings.contrast')}</SectionHeading>
      <Card>
        <Checkbox id="contrast" checked={settings.contrast} onChange={(v) => setSetting('contrast', v)} label={t('settings.contrast')} />
      </Card>

      <SectionHeading>{t('settings.readAloud')}</SectionHeading>
      <Card>
        <p className="text-base text-slate-700">{t('settings.readAloudHelp')}</p>
        <div className="mt-2">
          <Btn variant="secondary" onClick={readAloud}>
            🔊 {speaking ? t('settings.stopReading') : t('settings.readAloud')}
          </Btn>
        </div>
      </Card>

      <div className="mt-4">
        <Notice tone="info">{t('settings.demoNote')} {t('common.demoOnly')}</Notice>
      </div>
    </Page>
  )
}
