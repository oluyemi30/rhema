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

  // Handle navigation from URL - show dashboard if path is /dashboard or in Tauri
  const showDashboard = 
    isTauri() || 
    (typeof window !== "undefined" && window.location.pathname === "/dashboard")

  if (showDashboard) {
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
      <HomePage />
      <Toaster position="bottom-right" />
    </>
  )
}

export default App
