import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../lib/useStore.js'
import { Btn, Card, Checkbox, Notice, Page, RadioCard, SectionHeading } from '../components/Common.jsx'
import Icon from '../components/icons.jsx'
import { setSetting } from '../lib/store.js'

const SIZES = [
  { id: 'sm', key: 'settings.size.sm' },
  { id: 'md', key: 'settings.size.md' },
  { id: 'lg', key: 'settings.size.lg' },
]

export default function Settings() {
  const { t } = useI18n()
  const { settings, storage } = useStore()
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
    <Page eyebrow={t('nav.settings')} title={t('settings.title')} back={{ to: '/', label: t('nav.home') }}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="globe" size={17} className="text-ink-500" />
            {t('settings.language')}
          </h2>
          <div className="mt-3 space-y-2">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी' },
            ].map((l) => (
              <RadioCard
                key={l.id}
                id={`lang-${l.id}`}
                name="lang"
                value={l.id}
                checked={settings.lang === l.id}
                onChange={() => setSetting('lang', l.id)}
                title={l.label}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="file" size={17} className="text-ink-500" />
            {t('settings.textSize')}
          </h2>
          <div className="mt-3 space-y-2">
            {SIZES.map((s) => (
              <RadioCard
                key={s.id}
                id={`size-${s.id}`}
                name="size"
                value={s.id}
                checked={settings.textSize === s.id}
                onChange={() => setSetting('textSize', s.id)}
                title={<span className={s.id === 'sm' ? 'text-base' : s.id === 'md' ? 'text-lg' : 'text-xl'}>{t(s.key)}</span>}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="grid" size={17} className="text-ink-500" />
            {t('settings.contrast')}
          </h2>
          <div className="mt-1">
            <Checkbox id="contrast" checked={settings.contrast} onChange={(v) => setSetting('contrast', v)} label={t('settings.contrast')} />
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="mic" size={17} className="text-ink-500" />
            {t('settings.readAloud')}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{t('settings.readAloudHelp')}</p>
          <div className="mt-3">
            <Btn variant="secondary" size="sm" full={false} icon="play" onClick={readAloud}>
              {speaking ? t('settings.stopReading') : t('settings.readAloud')}
            </Btn>
          </div>
        </Card>
      </div>

      <div className="mt-4 space-y-2">
        <Notice tone="info">{t('settings.demoNote')} {t('common.demoOnly')}</Notice>
        {storage && storage.local === false ? <Notice tone="warn">{t('app.memoryMode')}</Notice> : null}
      </div>
    </Page>
  )
}
