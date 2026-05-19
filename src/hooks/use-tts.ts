import { useCallback, useEffect, useRef } from "react"
import { useAccessibilityStore } from "@/stores/accessibility-store"

// Language code to BCP-47 voice locale mapping
const LANGUAGE_VOICE_MAP: Record<string, string[]> = {
  en: ["en-US", "en-GB", "en-NG"],
  yo: ["yo-NG", "en-NG", "en-US"], // Fallback to Nigerian English then US English
  ig: ["ig-NG", "en-NG", "en-US"],
  ha: ["ha-NG", "en-NG", "en-US"],
  pcm: ["en-NG", "en-US"], // Nigerian Pidgin uses Nigerian English voice
  es: ["es-ES", "es-MX", "es-US"],
  fr: ["fr-FR", "fr-CA"],
  pt: ["pt-BR", "pt-PT"],
}

export function useTts() {
  const store = useAccessibilityStore()
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Get available voices
  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (!synthRef.current) return []
    return synthRef.current.getVoices()
  }, [])

  // Find best voice for a language
  const findVoiceForLanguage = useCallback((langCode: string): SpeechSynthesisVoice | null => {
    const voices = getVoices()
    const preferredLocales = LANGUAGE_VOICE_MAP[langCode] || ["en-US"]
    
    for (const locale of preferredLocales) {
      const voice = voices.find(v => v.lang.startsWith(locale.split("-")[0]))
      if (voice) return voice
    }
    
    // Fallback to any available voice
    return voices[0] || null
  }, [getVoices])

  // Speak text
  const speak = useCallback((text: string, language?: string) => {
    if (!synthRef.current || !text.trim()) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Set voice based on language
    const lang = language || store.targetLanguage
    const voice = findVoiceForLanguage(lang)
    if (voice) {
      utterance.voice = voice
    }

    // Apply settings
    utterance.rate = store.ttsRate
    utterance.pitch = store.ttsPitch
    utterance.volume = store.ttsVolume

    // Event handlers
    utterance.onstart = () => {
      store.setIsSpeaking(true)
    }

    utterance.onend = () => {
      store.setIsSpeaking(false)
    }

    utterance.onerror = () => {
      store.setIsSpeaking(false)
    }

    synthRef.current.speak(utterance)
  }, [store, findVoiceForLanguage])

  // Stop speaking
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      store.setIsSpeaking(false)
    }
  }, [store])

  // Pause speaking
  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause()
    }
  }, [])

  // Resume speaking
  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume()
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    getVoices,
    findVoiceForLanguage,
    isSpeaking: store.isSpeaking,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
  }
}
