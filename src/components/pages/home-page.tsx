import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, Settings, Hand } from "lucide-react"
import { useWebSpeech } from "@/hooks/use-web-speech"
import { useTts } from "@/hooks/use-tts"
import { cn } from "@/lib/utils"

// Nigerian language translations for common phrases
const translations: Record<string, Record<string, string>> = {
  yo: { // Yoruba
    "god": "Olorun",
    "jesus": "Jesu",
    "amen": "Amin",
    "praise": "Iyin",
    "holy": "Mimo",
    "lord": "Oluwa",
    "bless": "Bukun",
    "glory": "Ogo",
    "peace": "Alafia",
    "love": "Ife",
  },
  ig: { // Igbo
    "god": "Chukwu",
    "jesus": "Jesu",
    "amen": "Amen",
    "praise": "Otito",
    "holy": "Nso",
    "lord": "Onyenwe",
    "bless": "Gozi",
    "glory": "Otito",
    "peace": "Udo",
    "love": "Ihunanya",
  },
  ha: { // Hausa
    "god": "Allah",
    "jesus": "Yesu",
    "amen": "Amin",
    "praise": "Yabo",
    "holy": "Mai Tsarki",
    "lord": "Ubangiji",
    "bless": "Albarka",
    "glory": "Daukaka",
    "peace": "Salama",
    "love": "Kauna",
  },
  pcm: { // Nigerian Pidgin
    "god": "God",
    "jesus": "Jesus",
    "amen": "Amen",
    "praise": "Praise",
    "holy": "Holy",
    "lord": "Oga",
    "bless": "Bless",
    "glory": "Glory",
    "peace": "Peace",
    "love": "Love",
  },
}

// Sign language gestures mapping
const signGestures: Record<string, string> = {
  "god": "🙏",
  "jesus": "✝️",
  "amen": "🙌",
  "praise": "🙆",
  "holy": "👐",
  "lord": "👆",
  "bless": "🤲",
  "glory": "✨",
  "peace": "✌️",
  "love": "❤️",
  "hallelujah": "🙌",
  "worship": "🙏",
  "pray": "🙏",
  "grace": "🤲",
  "faith": "💪",
}

const languages = [
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "ha", name: "Hausa" },
  { code: "pcm", name: "Pidgin" },
]

function getSignGesture(text: string): string | null {
  const words = text.toLowerCase().split(/\s+/)
  for (const word of words) {
    if (signGestures[word]) return signGestures[word]
  }
  return null
}

function translateText(text: string, targetLang: string): string {
  const dict = translations[targetLang]
  if (!dict) return text
  
  let result = text
  for (const [eng, trans] of Object.entries(dict)) {
    const regex = new RegExp(`\\b${eng}\\b`, "gi")
    result = result.replace(regex, trans)
  }
  return result
}

export function HomePage() {
  const [transcript, setTranscript] = useState("")
  const [selectedLang, setSelectedLang] = useState("yo")
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [showSign, setShowSign] = useState(true)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)
  
  const webSpeech = useWebSpeech()
  const tts = useTts()
  
  // Handle new transcripts
  useEffect(() => {
    if (webSpeech.transcript) {
      setTranscript(webSpeech.transcript)
      
      // Check for sign gesture
      const gesture = getSignGesture(webSpeech.transcript)
      if (gesture) {
        setCurrentGesture(gesture)
        setTimeout(() => setCurrentGesture(null), 2000)
      }
      
      // Auto-speak translation if enabled
      if (ttsEnabled && tts.isSupported) {
        const translated = translateText(webSpeech.transcript, selectedLang)
        tts.speak(translated)
      }
    }
  }, [webSpeech.transcript, selectedLang, ttsEnabled, tts])

  const toggleListening = useCallback(() => {
    if (webSpeech.isListening) {
      webSpeech.stop()
    } else {
      webSpeech.start()
    }
  }, [webSpeech])

  const translatedText = transcript ? translateText(transcript, selectedLang) : ""

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Pentecost AI</h1>
        <a 
          href="/dashboard" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Settings className="size-4" />
          Advanced
        </a>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        
        {/* Sign Language Display */}
        {showSign && (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
            {currentGesture ? (
              <span className="animate-pulse text-6xl">{currentGesture}</span>
            ) : (
              <Hand className="size-12 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Scripture / Transcript Display */}
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          {transcript ? (
            <div className="flex flex-col gap-4">
              {/* Original Text */}
              <p className="text-lg text-muted-foreground">{transcript}</p>
              
              {/* Translated Text */}
              <p className="text-2xl font-serif font-medium text-foreground">
                {translatedText}
              </p>
              
              {/* Language Badge */}
              <span className="mx-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {languages.find(l => l.code === selectedLang)?.name}
              </span>
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">
              {webSpeech.isListening 
                ? "Listening... Speak now" 
                : "Tap the microphone to start"}
            </p>
          )}
        </div>

        {/* Microphone Button */}
        <Button
          size="lg"
          variant={webSpeech.isListening ? "destructive" : "default"}
          className={cn(
            "size-20 rounded-full shadow-lg transition-all",
            webSpeech.isListening && "animate-pulse"
          )}
          onClick={toggleListening}
          disabled={!webSpeech.isSupported}
        >
          {webSpeech.isListening ? (
            <MicOff className="size-8" />
          ) : (
            <Mic className="size-8" />
          )}
        </Button>
        
        {!webSpeech.isSupported && (
          <p className="text-sm text-destructive">
            Speech recognition not supported in this browser
          </p>
        )}

        {/* Language Selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLang === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLang(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={cn(ttsEnabled && "text-primary")}
          >
            {ttsEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span className="ml-2">Audio</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSign(!showSign)}
            className={cn(showSign && "text-primary")}
          >
            <Hand className="size-4" />
            <span className="ml-2">Sign</span>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        For deaf users: Enable Sign mode to see visual gestures
      </footer>
    </div>
  )
}
