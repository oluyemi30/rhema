import { useState } from "react"
import { Dashboard } from "@/components/layout/dashboard"
import { HomePage } from "@/components/pages/home-page"
import { useRemoteControl } from "@/hooks/use-remote-control"
import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay"
import { Toaster } from "sonner"

// Check if running in Tauri
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function App() {
  useRemoteControl()
  const [showDashboard, setShowDashboard] = useState(false)
  
  // In Tauri, show the full dashboard. In browser, show simple page
  const showAdvanced = isTauri() || showDashboard

  // Handle navigation from URL
  if (typeof window !== "undefined" && window.location.pathname === "/dashboard") {
    return (
      <>
        <Dashboard />
        <TutorialOverlay />
        <Toaster position="bottom-right" />
      </>
    )
  }

  return (
    <>
      {showAdvanced ? <Dashboard /> : <HomePage />}
      {showAdvanced && <TutorialOverlay />}
      <Toaster position="bottom-right" />
    </>
  )
}

export default App
