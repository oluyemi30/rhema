import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SignLanguageGesture = 
  | "idle"
  | "wave"
  | "praise"
  | "amen"
  | "god"
  | "jesus"
  | "love"
  | "peace"
  | "pray"
  | "bless"
  | "thank"
  | "bible"
  | "verse"
  | "chapter"

interface AccessibilityState {
  // TTS settings
  ttsEnabled: boolean
  ttsVoice: string | null
  ttsRate: number
  ttsPitch: number
  ttsVolume: number
  isSpeaking: boolean
  
  // Translation settings
  translationEnabled: boolean
  targetLanguage: string // yo, ig, ha, pcm, es, fr, pt
  translatedText: string
  isTranslating: boolean
  
  // Sign language settings
  signLanguageEnabled: boolean
  currentGesture: SignLanguageGesture
  showCaptions: boolean
  captionSize: "small" | "medium" | "large" | "xlarge"
  highContrastMode: boolean
  
  // Actions
  setTtsEnabled: (enabled: boolean) => void
  setTtsVoice: (voice: string | null) => void
  setTtsRate: (rate: number) => void
  setTtsPitch: (pitch: number) => void
  setTtsVolume: (volume: number) => void
  setIsSpeaking: (speaking: boolean) => void
  
  setTranslationEnabled: (enabled: boolean) => void
  setTargetLanguage: (lang: string) => void
  setTranslatedText: (text: string) => void
  setIsTranslating: (translating: boolean) => void
  
  setSignLanguageEnabled: (enabled: boolean) => void
  setCurrentGesture: (gesture: SignLanguageGesture) => void
  setShowCaptions: (show: boolean) => void
  setCaptionSize: (size: "small" | "medium" | "large" | "xlarge") => void
  setHighContrastMode: (enabled: boolean) => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      // TTS defaults
      ttsEnabled: false,
      ttsVoice: null,
      ttsRate: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 1.0,
      isSpeaking: false,
      
      // Translation defaults
      translationEnabled: false,
      targetLanguage: "yo", // Default to Yoruba
      translatedText: "",
      isTranslating: false,
      
      // Sign language defaults
      signLanguageEnabled: false,
      currentGesture: "idle",
      showCaptions: true,
      captionSize: "large",
      highContrastMode: false,
      
      // TTS actions
      setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),
      setTtsVoice: (voice) => set({ ttsVoice: voice }),
      setTtsRate: (rate) => set({ ttsRate: rate }),
      setTtsPitch: (pitch) => set({ ttsPitch: pitch }),
      setTtsVolume: (volume) => set({ ttsVolume: volume }),
      setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
      
      // Translation actions
      setTranslationEnabled: (enabled) => set({ translationEnabled: enabled }),
      setTargetLanguage: (lang) => set({ targetLanguage: lang }),
      setTranslatedText: (text) => set({ translatedText: text }),
      setIsTranslating: (translating) => set({ isTranslating: translating }),
      
      // Sign language actions
      setSignLanguageEnabled: (enabled) => set({ signLanguageEnabled: enabled }),
      setCurrentGesture: (gesture) => set({ currentGesture: gesture }),
      setShowCaptions: (show) => set({ showCaptions: show }),
      setCaptionSize: (size) => set({ captionSize: size }),
      setHighContrastMode: (enabled) => set({ highContrastMode: enabled }),
    }),
    {
      name: "rhema-accessibility",
      partialize: (state) => ({
        ttsEnabled: state.ttsEnabled,
        ttsVoice: state.ttsVoice,
        ttsRate: state.ttsRate,
        ttsPitch: state.ttsPitch,
        ttsVolume: state.ttsVolume,
        translationEnabled: state.translationEnabled,
        targetLanguage: state.targetLanguage,
        signLanguageEnabled: state.signLanguageEnabled,
        showCaptions: state.showCaptions,
        captionSize: state.captionSize,
        highContrastMode: state.highContrastMode,
      }),
    }
  )
)
