import { useCallback, useRef, useEffect, useState } from "react"
import { useTranscriptStore } from "@/stores/transcript-store"

/**
 * Check if we're running in a Tauri environment
 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

/**
 * Check if Web Speech API is available
 */
function isWebSpeechSupported(): boolean {
  return typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
}

/**
 * Get the SpeechRecognition constructor
 */
function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null
  return (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || 
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition || null
}

/**
 * Web Speech API-based speech recognition for browser testing.
 * This is a fallback when Tauri APIs are not available.
 */
export function useWebSpeech() {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const transcriptStore = useTranscriptStore

  const isSupported = !isTauri() && isWebSpeechSupported()

  const start = useCallback(async () => {
    if (!isSupported) {
      console.warn("[v0] Web Speech API not supported or running in Tauri")
      return
    }

    const SpeechRecognitionConstructor = getSpeechRecognition()
    if (!SpeechRecognitionConstructor) return

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognitionConstructor()
    recognitionRef.current = recognition

    // Configure
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    // Update store on start
    transcriptStore.getState().setConnectionStatus("connecting")

    recognition.onstart = () => {
      isListeningRef.current = true
      setIsListening(true)
      transcriptStore.getState().setTranscribing(true)
      transcriptStore.getState().setConnectionStatus("connected")
    }

    recognition.onresult = (event) => {
      const store = transcriptStore.getState()
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      // Update partial (interim) results
      if (interimTranscript) {
        store.setPartial(interimTranscript)
        setTranscript(interimTranscript)
      }

      // Add final segments
      if (finalTranscript) {
        const trimmed = finalTranscript.trim()
        setTranscript(trimmed)
        store.addSegment({
          id: crypto.randomUUID(),
          text: trimmed,
          is_final: true,
          confidence: event.results[event.results.length - 1][0].confidence || 0.9,
          words: [],
          timestamp: Date.now(),
        })
      }
    }

    recognition.onerror = (event) => {
      console.error("[v0] Web Speech error:", event.error)
      transcriptStore.getState().setConnectionStatus("error")
      
      // Auto-restart on certain errors
      if (event.error === "no-speech" && isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch {
              // Ignore if already started
            }
          }
        }, 100)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch {
              // Ignore if already started
            }
          }
        }, 100)
      } else {
        setIsListening(false)
        transcriptStore.getState().setTranscribing(false)
        transcriptStore.getState().setConnectionStatus("disconnected")
      }
    }

    // Start listening
    try {
      recognition.start()
    } catch (e) {
      console.error("[v0] Failed to start Web Speech:", e)
      transcriptStore.getState().setConnectionStatus("error")
    }
  }, [isSupported, transcriptStore])

  const stop = useCallback(async () => {
    isListeningRef.current = false
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    transcriptStore.getState().setTranscribing(false)
    transcriptStore.getState().setPartial("")
    transcriptStore.getState().setConnectionStatus("disconnected")
  }, [transcriptStore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isListeningRef.current = false
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    start,
    stop,
    isSupported,
    isListening,
    transcript,
    isTauri: isTauri(),
  }
}
