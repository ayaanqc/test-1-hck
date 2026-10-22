// Storage that never throws. Some preview iframes block localStorage entirely;
// in that case we keep working in memory for this tab instead of hanging.
function makeStorage(kind) {
  const mem = new Map()
  let available = false
  try {
    const s = globalThis[kind]
    if (s) {
      const probe = '__jawabdehi_probe__'
      s.setItem(probe, '1')
      s.removeItem(probe)
      available = true
    }
  } catch {
    available = false
  }

  return {
    get available() {
      return available
    },
    getItem(key) {
      if (available) {
        try {
          return globalThis[kind].getItem(key)
        } catch {
          available = false
        }
      }
      return mem.has(key) ? mem.get(key) : null
    },
    setItem(key, value) {
      if (available) {
        try {
          globalThis[kind].setItem(key, value)
          return
        } catch {
          available = false
        }
      }
      mem.set(key, String(value))
    },
    removeItem(key) {
      if (available) {
        try {
          globalThis[kind].removeItem(key)
        } catch {
          available = false
        }
      }
      mem.delete(key)
    },
  }
}

export const local = makeStorage('localStorage')
export const session = makeStorage('sessionStorage')
