import { useCallback, useRef } from "react"
import { useAccessibilityStore } from "@/stores/accessibility-store"

// Simple translation dictionary for common worship phrases
// In production, this would call an AI translation API
const WORSHIP_PHRASES: Record<string, Record<string, string>> = {
  // Yoruba translations
  yo: {
    "praise the lord": "E yin Oluwa",
    "hallelujah": "Hallelujah",
    "amen": "Amin",
    "god is good": "Olorun dara",
    "thank you jesus": "E se Jesu",
    "in jesus name": "Ni oruko Jesu",
    "the lord is my shepherd": "Oluwa ni oluṣo aguntan mi",
    "for god so loved the world": "Nitori Ọlọrun fẹ araiye tobẹẹ",
    "glory to god": "Ogo fun Ọlọrun",
    "holy spirit": "Ẹmi Mimo",
    "the word of god": "Oro Ọlọrun",
    "bible": "Bibeli",
    "verse": "Ese",
    "chapter": "Ori",
    "read": "Ka",
    "pray": "Gbadura",
    "faith": "Igbagbo",
    "grace": "Oore-ofe",
    "mercy": "Aanu",
    "peace": "Alafia",
    "love": "Ife",
    "bless": "Bukun",
    "worship": "Ijosin",
  },
  // Igbo translations
  ig: {
    "praise the lord": "Too Onyenweanyị",
    "hallelujah": "Aleluya",
    "amen": "Amen",
    "god is good": "Chineke dị mma",
    "thank you jesus": "Imeela Jisọs",
    "in jesus name": "N'aha Jisọs",
    "the lord is my shepherd": "Onyenweanyị bụ onye ọzụzụ atụrụ m",
    "for god so loved the world": "N'ihi na Chukwu hụrụ ụwa n'anya",
    "glory to god": "Otito dịrị Chineke",
    "holy spirit": "Mụọ Nsọ",
    "the word of god": "Okwu Chineke",
    "bible": "Akwụkwọ Nsọ",
    "verse": "Amaokwu",
    "chapter": "Isi",
    "read": "Gụọ",
    "pray": "Kpee ekpere",
    "faith": "Okwukwe",
    "grace": "Amara",
    "mercy": "Ebere",
    "peace": "Udo",
    "love": "Ịhụnanya",
    "bless": "Gọzie",
    "worship": "Ofufe",
  },
  // Hausa translations
  ha: {
    "praise the lord": "Yabi Ubangiji",
    "hallelujah": "Halleluyah",
    "amen": "Amin",
    "god is good": "Allah mai kyau ne",
    "thank you jesus": "Na gode Yesu",
    "in jesus name": "Cikin sunan Yesu",
    "the lord is my shepherd": "Ubangiji ne makiyayin na",
    "for god so loved the world": "Don Allah ya ƙaunaci duniya",
    "glory to god": "Ɗaukaka ga Allah",
    "holy spirit": "Ruhu Mai Tsarki",
    "the word of god": "Maganar Allah",
    "bible": "Littafi Mai Tsarki",
    "verse": "Aya",
    "chapter": "Sura",
    "read": "Karanta",
    "pray": "Yi addu'a",
    "faith": "Bangaskiya",
    "grace": "Alheri",
    "mercy": "Jinƙai",
    "peace": "Salama",
    "love": "Ƙauna",
    "bless": "Albarka",
    "worship": "Ibada",
  },
  // Nigerian Pidgin translations
  pcm: {
    "praise the lord": "Praise di Lord",
    "hallelujah": "Hallelujah",
    "amen": "Amen",
    "god is good": "God dey good",
    "thank you jesus": "Thank you Jesus",
    "in jesus name": "For Jesus name",
    "the lord is my shepherd": "Di Lord na my shepherd",
    "for god so loved the world": "Because God love di world so tey",
    "glory to god": "Glory dey for God",
    "holy spirit": "Holy Spirit",
    "the word of god": "Di word of God",
    "bible": "Bible",
    "verse": "Verse",
    "chapter": "Chapter",
    "read": "Read",
    "pray": "Pray",
    "faith": "Faith",
    "grace": "Grace",
    "mercy": "Mercy",
    "peace": "Peace",
    "love": "Love",
    "bless": "Bless",
    "worship": "Worship",
  },
}

// Basic word-by-word translation function
function translateText(text: string, targetLang: string): string {
  const dict = WORSHIP_PHRASES[targetLang]
  if (!dict) return text
  
  let result = text.toLowerCase()
  
  // Sort phrases by length (longest first) to match multi-word phrases first
  const phrases = Object.keys(dict).sort((a, b) => b.length - a.length)
  
  for (const phrase of phrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi")
    result = result.replace(regex, dict[phrase])
  }
  
  return result
}

export function useTranslation() {
  const store = useAccessibilityStore()
  const abortRef = useRef<AbortController | null>(null)

  const translate = useCallback(async (text: string, targetLang?: string): Promise<string> => {
    const lang = targetLang || store.targetLanguage
    
    // Cancel any pending translation
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()
    
    store.setIsTranslating(true)
    
    try {
      // For MVP, use local dictionary translation
      // In production, this would call OpenAI or Google Translate API
      const translated = translateText(text, lang)
      store.setTranslatedText(translated)
      return translated
    } finally {
      store.setIsTranslating(false)
    }
  }, [store])

  const getLanguageDisplayName = useCallback((code: string): string => {
    const names: Record<string, string> = {
      en: "English",
      yo: "Yoruba",
      ig: "Igbo", 
      ha: "Hausa",
      pcm: "Pidgin",
      es: "Spanish",
      fr: "French",
      pt: "Portuguese",
    }
    return names[code] || code.toUpperCase()
  }, [])

  return {
    translate,
    getLanguageDisplayName,
    translatedText: store.translatedText,
    isTranslating: store.isTranslating,
    targetLanguage: store.targetLanguage,
    setTargetLanguage: store.setTargetLanguage,
  }
}
