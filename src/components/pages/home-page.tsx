import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, Settings, Hand, BookOpen, Type, Loader2 } from "lucide-react"
import { useWebSpeech } from "@/hooks/use-web-speech"
import { useTts } from "@/hooks/use-tts"
import { 
  findRelevantVerse, 
  getVerseWithTranslations, 
  getRandomVerseKey,
  type BibleVerse 
} from "@/hooks/use-bible-api"
import { cn } from "@/lib/utils"

// Sign language gestures mapping  
const signGestures: Record<string, string> = {
  god: "🙏",
  jesus: "✝️", 
  amen: "🙌",
  praise: "🙆",
  holy: "👐",
  lord: "👆",
  bless: "🤲",
  glory: "✨",
  peace: "✌️",
  love: "❤️",
  hallelujah: "🙌",
  worship: "🙏",
  pray: "🙏",
  grace: "🤲",
  faith: "💪",
}

const languages = [
  { code: "en", name: "English" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "ha", name: "Hausa" },
  { code: "pcm", name: "Pidgin" },
]

function getSignGesture(text: string): string | null {
  const words = text.toLowerCase().split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "")
    if (signGestures[cleanWord]) return signGestures[cleanWord]
  }
  return null
}

export function HomePage() {
  const [transcript, setTranscript] = useState("")
  const [selectedLang, setSelectedLang] = useState("en")
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [showSign, setShowSign] = useState(true)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [showInput, setShowInput] = useState(false)
  
  const webSpeech = useWebSpeech()
  const tts = useTts()

  // Fetch and display a verse
  const loadVerse = useCallback(async (verseKey: string) => {
    setIsLoading(true)
    try {
      const verse = await getVerseWithTranslations(verseKey)
      if (verse) {
        setCurrentVerse(verse)
        
        // Speak the verse in selected language
        if (ttsEnabled && tts.isSupported) {
          const verseText = verse.text[selectedLang] || verse.text.en
          tts.speak(verseText)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedLang, ttsEnabled, tts])

  // Process text input (from speech or typing)
  const processInput = useCallback(async (text: string) => {
    setTranscript(text)
    
    // Check for sign gesture
    const gesture = getSignGesture(text)
    if (gesture) {
      setCurrentGesture(gesture)
      setTimeout(() => setCurrentGesture(null), 3000)
    }
    
    // Find relevant verse based on keywords
    const verseKey = findRelevantVerse(text)
    if (verseKey) {
      await loadVerse(verseKey)
    }
  }, [loadVerse])

  // Handle new transcripts from speech recognition
  useEffect(() => {
    if (webSpeech.transcript) {
      processInput(webSpeech.transcript)
    }
  }, [webSpeech.transcript, processInput])

  // Load a random verse on mount
  useEffect(() => {
    loadVerse(getRandomVerseKey())
  }, [loadVerse])

  const toggleListening = useCallback(() => {
    if (webSpeech.isListening) {
      webSpeech.stop()
    } else {
      setTranscript("")
      webSpeech.start()
    }
  }, [webSpeech])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      processInput(manualInput.trim())
      setManualInput("")
    }
  }

  // Get verse text in selected language
  const getVerseText = () => {
    if (!currentVerse) return null
    return currentVerse.text[selectedLang] || currentVerse.text.en
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Pentecost AI</h1>
        </div>
        <a 
          href="/dashboard" 
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:gap-2 sm:text-sm"
        >
          <Settings className="size-4" />
          <span className="hidden sm:inline">Advanced</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center gap-6 p-4 sm:justify-center sm:gap-8 sm:p-6">
        
        {/* Sign Language Display */}
        {showSign && (
          <div className={cn(
            "flex size-24 items-center justify-center rounded-full bg-muted transition-all sm:size-32",
            currentGesture && "bg-primary/20 ring-4 ring-primary/30"
          )}>
            {currentGesture ? (
              <span className="animate-bounce text-5xl sm:text-6xl">{currentGesture}</span>
            ) : (
              <Hand className="size-10 text-muted-foreground sm:size-12" />
            )}
          </div>
        )}

        {/* Scripture / Transcript Display */}
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 text-center shadow-lg sm:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading scripture...</span>
            </div>
          ) : currentVerse ? (
            <div className="flex flex-col gap-4">
              {/* Verse Reference */}
              <span className="text-sm font-semibold text-primary">{currentVerse.ref}</span>
              
              {/* Verse Text */}
              <p className="font-serif text-lg leading-relaxed text-foreground sm:text-xl">
                {getVerseText()}
              </p>
              
              {/* Original transcript */}
              {transcript && (
                <p className="text-xs text-muted-foreground">
                  You said: &quot;{transcript}&quot;
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-lg text-muted-foreground sm:text-xl">
                {webSpeech.isListening 
                  ? "Listening... Speak now" 
                  : "Tap the microphone to start"}
              </p>
              <p className="text-sm text-muted-foreground">
                Say religious words to see Bible verses
              </p>
            </div>
          )}
        </div>

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

        {/* Microphone Button */}
        <Button
          size="lg"
          variant={webSpeech.isListening ? "destructive" : "default"}
          className={cn(
            "size-16 rounded-full shadow-lg transition-all sm:size-20",
            webSpeech.isListening && "animate-pulse"
          )}
          onClick={toggleListening}
          disabled={!webSpeech.isSupported}
        >
          {webSpeech.isListening ? (
            <MicOff className="size-6 sm:size-8" />
          ) : (
            <Mic className="size-6 sm:size-8" />
          )}
        </Button>
        
        {!webSpeech.isSupported && (
          <p className="text-center text-sm text-destructive">
            Speech recognition not supported. Use the text input below.
          </p>
        )}

        {/* Manual Input for Deaf Users */}
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(!showInput)}
            className="mb-2 w-full"
          >
            <Type className="mr-2 size-4" />
            {showInput ? "Hide" : "Show"} Text Input (for deaf users)
          </Button>
          
          {showInput && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type words like God, Jesus, love, peace..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          )}
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
      <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground sm:text-sm">
        Bible verses from wldeh/bible-api | For deaf users: Use text input or enable Sign mode
      </footer>
    </div>
  )
}
