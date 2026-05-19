import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { hydrateSettings } from "@/stores/settings-store"
import { hydrateBibleStore, initBiblePersistence } from "@/stores/bible-store"
import { hydrateBroadcastThemes } from "@/stores/broadcast-store"

// Check if running in Tauri
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window

async function init() {
  // Only try Tauri APIs if in Tauri environment
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    // Webview reloads do NOT restart the Rust backend, so any STT pipeline
    // left running from the previous webview session still has
    // `stt_active = true`. Reset the backend to a clean state on boot.
    await invoke("stop_transcription").catch(() => {})
  }
  
  // Hydrate stores (these work in browser too with localStorage fallback)
  await Promise.all([
    hydrateSettings().catch(() => {}),
    hydrateBibleStore().catch(() => {}),
    hydrateBroadcastThemes().catch(() => {}),
  ])
  
  if (isTauri) {
    await initBiblePersistence().catch(() => {})
  }
}

init().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>
  )
})
