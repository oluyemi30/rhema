import { useEffect, useRef } from "react"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"

// Check if we're running in a Tauri environment
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function useTauriEvent<T>(
  event: string,
  handler: (payload: T) => void
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    // Skip if not in Tauri environment
    if (!isTauri()) return

    // Track whether this effect has been cleaned up.
    // React StrictMode unmounts/remounts effects, and the listen() Promise
    // may resolve after cleanup — the cancelled flag prevents stale listeners.
    let cancelled = false
    let unlisten: UnlistenFn | undefined

    listen<T>(event, (e) => {
      if (!cancelled) {
        handlerRef.current(e.payload)
      }
    }).then((fn) => {
      if (cancelled) {
        // Effect was already cleaned up before the listener registered — remove it immediately
        fn()
      } else {
        unlisten = fn
      }
    })

    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [event])
}
