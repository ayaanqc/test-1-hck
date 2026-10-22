import { useSyncExternalStore } from 'react'
import en from './en.js'
import hi from './hi.js'
import { getSnapshot, subscribe } from '../lib/store.js'

const DICTS = { en, hi }

export function translate(lang, key, vars) {
  const dict = DICTS[lang] || DICTS.en
  let value = dict[key]
  if (value === undefined) value = DICTS.en[key]
  if (value === undefined) return key
  if (typeof value === 'string' && vars) {
    return value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? `{${k}}` : String(vars[k])))
  }
  return value
}

// Picks the current language from a bilingual {en, hi} object kept in src/data.
export function pickLang(obj, lang) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] ?? obj.en ?? ''
}

export function currentLang() {
  return getSnapshot().settings.lang
}

export function useI18n() {
  const snap = useSyncExternalStore(subscribe, getSnapshot)
  const lang = snap.settings.lang
  return {
    lang,
    t: (key, vars) => translate(lang, key, vars),
    tt: (obj) => pickLang(obj, lang),
    raw: (key) => translate(lang, key),
  }
}
