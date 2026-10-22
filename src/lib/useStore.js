import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from './store.js'

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useComplaint(id) {
  const store = useStore()
  return { store, complaint: store.complaints.find((c) => c.id === id) || null }
}
