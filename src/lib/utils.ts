import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get display name for a language code
 */
export function getLanguageDisplayName(code: string): string {
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    // Nigerian languages
    yo: "Yoruba",
    ig: "Igbo",
    ha: "Hausa",
    pcm: "Nigerian Pidgin",
  }
  return languageNames[code] || code.toUpperCase()
}
