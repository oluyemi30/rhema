import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, Settings, Hand, BookOpen, Type } from "lucide-react"
import { useWebSpeech } from "@/hooks/use-web-speech"
import { useTts } from "@/hooks/use-tts"
import { cn } from "@/lib/utils"

// Sample Bible verses in Nigerian languages
const bibleVerses: Record<string, { ref: string; en: string; yo: string; ig: string; ha: string; pcm: string }[]> = {
  default: [
    {
      ref: "John 3:16",
      en: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      yo: "Nitori Olorun fe araiye to be ti o fi Omo bibi re kanso fun, ki enikeni ti o ba gba a gbo ma ba segbe, sugbon ki o le ni iye ainipekun.",
      ig: "Nitori na Chineke huru uwa n'anya nke ukwuu, nke mere o jiri nye Oku nwa ya naan'oge, ka onye obula nke kwere na ya ghara ila n'iyi kama o nwee ndu ebighi ebi.",
      ha: "Gama Allah ya so duniya har ya bada Dansa na musamman, domin duk wanda ya gaskata da shi kada ya hallaka, amma ya samu rai madawwami.",
      pcm: "Because God love dis world well well, na im make E give im only Son, so dat anybody wey believe am no go die, but go get life wey no go end.",
    },
    {
      ref: "Psalm 23:1",
      en: "The LORD is my shepherd; I shall not want.",
      yo: "Oluwa li oluṣọ mi; emi ki yio ṣe alaini.",
      ig: "Onyenwe anyi bu onye ozuzu aturu m; agaghi m anọ na mkpa.",
      ha: "Ubangiji shine makiyayina; ba zan rasa komai ba.",
      pcm: "God na my shepherd; I no go lack anything.",
    },
    {
      ref: "Philippians 4:13",
      en: "I can do all things through Christ which strengtheneth me.",
      yo: "Mo le ṣe ohun gbogbo nipase Kristi ti o fun mi ni agbara.",
      ig: "Enwere m ike ime ihe niile site na Kraist onye na enye m ume.",
      ha: "Ina iya yin duka abubuwa ta wurin Kristi wanda yake karfafa ni.",
      pcm: "I fit do everything through Christ wey dey give me power.",
    },
    {
      ref: "Jeremiah 29:11",
      en: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      yo: "Nitori mo mo ero ti mo n ro si yin, ni Oluwa wi, ero alafia, ki i se ero ibi, lati fi ipari ti o dara fun yin.",
      ig: "Nitori amaara m echiche nke m na-eche banyere unu, ka Onyenwe anyi siri kwuo, echiche udo, osughị nke ihe ojoo, iji nye unu nchekwube na njedebe.",
      ha: "Gama na san tunanin da nake tunani game da ku, in ji Ubangiji, tunanin zaman lafiya, ba na mugunta ba, don in ba ku bege a karshe.",
      pcm: "I know the plans wey I get for una, na wetin God talk, plans of peace, no be bad plans, to give una future and hope.",
    },
    {
      ref: "Romans 8:28",
      en: "And we know that all things work together for good to them that love God.",
      yo: "Awa si mo pe ohun gbogbo n sise po fun rere awon ti o feran Olorun.",
      ig: "Anyi makwaara na ihe niile na-arukọ ọrụ maka ọdịmma ndị hụrụ Chineke n'anya.",
      ha: "Mun kuma san cewa dukan abubuwa suna aiki tare don alheri ga wadanda suke son Allah.",
      pcm: "We know say everything dey work together for good for people wey love God.",
    },
  ],
}

// Keywords that trigger scripture lookup
const scriptureKeywords = [
  "god", "jesus", "lord", "praise", "amen", "hallelujah", "glory", 
  "holy", "bless", "grace", "faith", "love", "peace", "pray", "worship",
  "bible", "scripture", "verse", "psalm", "john", "romans"
]

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

function containsScriptureKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return scriptureKeywords.some(keyword => lower.includes(keyword))
}

function getRandomVerse() {
  const verses = bibleVerses.default
  return verses[Math.floor(Math.random() * verses.length)]
}

export function HomePage() {
  const [transcript, setTranscript] = useState("")
  const [selectedLang, setSelectedLang] = useState("en")
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [showSign, setShowSign] = useState(true)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)
  const [currentVerse, setCurrentVerse] = useState<typeof bibleVerses.default[0] | null>(null)
  const [manualInput, setManualInput] = useState("")
  const [showInput, setShowInput] = useState(false)
  
  const webSpeech = useWebSpeech()
  const tts = useTts()

  // Process text input (from speech or typing)
  const processInput = useCallback((text: string) => {
    setTranscript(text)
    
    // Check for sign gesture
    const gesture = getSignGesture(text)
    if (gesture) {
      setCurrentGesture(gesture)
      setTimeout(() => setCurrentGesture(null), 3000)
    }
    
    // Show a Bible verse when religious keywords detected
    if (containsScriptureKeyword(text)) {
      const verse = getRandomVerse()
      setCurrentVerse(verse)
      
      // Speak the verse in selected language
      if (ttsEnabled && tts.isSupported) {
        const verseText = verse[selectedLang as keyof typeof verse] || verse.en
        tts.speak(verseText as string)
      }
    }
  }, [selectedLang, ttsEnabled, tts])

  // Handle new transcripts from speech recognition
  useEffect(() => {
    if (webSpeech.transcript) {
      processInput(webSpeech.transcript)
    }
  }, [webSpeech.transcript, processInput])

  const toggleListening = useCallback(() => {
    if (webSpeech.isListening) {
      webSpeech.stop()
    } else {
      setTranscript("")
      setCurrentVerse(null)
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
    return currentVerse[selectedLang as keyof typeof currentVerse] || currentVerse.en
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
          {currentVerse ? (
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
          ) : transcript ? (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-foreground">{transcript}</p>
              <p className="text-sm text-muted-foreground">
                Say words like &quot;God&quot;, &quot;Jesus&quot;, &quot;praise&quot;, or &quot;amen&quot; to see scriptures
              </p>
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
                placeholder="Type words like God, Jesus, praise..."
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
        For deaf users: Use text input or enable Sign mode for visual gestures
      </footer>
    </div>
  )
}
