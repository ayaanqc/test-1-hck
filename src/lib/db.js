// Evidence files live in IndexedDB; events only ever store their SHA-256 fingerprint.
// If IndexedDB is blocked (some preview iframes, private modes), files are kept in
// memory for this tab so the app still works. Verification works either way.
const DB_NAME = 'jawabdehi'
const STORE = 'evidence'

let idbBroken = false
const memory = new Map()

function open() {
  return new Promise((resolve, reject) => {
    if (idbBroken) return reject(new Error('IndexedDB unavailable'))
    if (typeof indexedDB === 'undefined' || !indexedDB) return reject(new Error('IndexedDB unavailable'))
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        idbBroken = true
        reject(new Error('IndexedDB timed out'))
      }
    }, 2500)
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
      }
      req.onsuccess = () => {
        clearTimeout(timer)
        if (!settled) {
          settled = true
          resolve(req.result)
        }
      }
      req.onerror = () => {
        clearTimeout(timer)
        if (!settled) {
          settled = true
          idbBroken = true
          reject(req.error || new Error('IndexedDB error'))
        }
      }
      req.onblocked = () => {
        clearTimeout(timer)
        if (!settled) {
          settled = true
          idbBroken = true
          reject(new Error('IndexedDB blocked'))
        }
      }
    } catch (err) {
      clearTimeout(timer)
      idbBroken = true
      reject(err)
    }
  })
}

async function withStore(mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const store = tx.objectStore(STORE)
    const result = fn(store)
    tx.oncomplete = () => resolve(result && 'result' in result ? result.result : true)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function putEvidence(record) {
  try {
    await withStore('readwrite', (store) => store.put(record))
  } catch {
    memory.set(record.id, record)
  }
}

export async function getEvidence(id) {
  if (memory.has(id)) return memory.get(id) || null
  try {
    return await withStore('readonly', (store) => store.get(id))
  } catch {
    return null
  }
}

export async function clearEvidence() {
  memory.clear()
  try {
    await withStore('readwrite', (store) => store.clear())
  } catch {
    /* memory only */
  }
}

export function storageMode() {
  return idbBroken ? 'memory' : 'indexeddb'
}

export async function fileFingerprint(blob) {
  const buf = await blob.arrayBuffer()
  const { sha256Hex } = await import('./hash.js')
  return sha256Hex(buf)
}
