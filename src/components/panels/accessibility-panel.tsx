import { useEffect, useState } from "react"
import { PanelHeader } from "@/components/ui/panel-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Accessibility,
  Volume2,
  VolumeX,
  Languages,
  Hand,
  Type,
  Play,
  Square,
  Settings2,
  Send,
  Keyboard,
} from "lucide-react"
import { useAccessibilityStore, type SignLanguageGesture } from "@/stores/accessibility-store"
import { useTranscriptStore } from "@/stores/transcript-store"
import { useTts } from "@/hooks/use-tts"
import { useTranslation } from "@/hooks/use-translation"
import { cn } from "@/lib/utils"

// Gesture to visual representation mapping
const GESTURE_VISUALS: Record<SignLanguageGesture, { emoji: string; label: string }> = {
  idle: { emoji: "🧍", label: "Ready" },
  wave: { emoji: "👋", label: "Hello" },
  praise: { emoji: "🙌", label: "Praise" },
  amen: { emoji: "🙏", label: "Amen" },
  god: { emoji: "☝️", label: "God" },
  jesus: { emoji: "✝️", label: "Jesus" },
  love: { emoji: "🫶", label: "Love" },
  peace: { emoji: "✌️", label: "Peace" },
  pray: { emoji: "🙏", label: "Pray" },
  bless: { emoji: "🤲", label: "Bless" },
  thank: { emoji: "🙏", label: "Thank" },
  bible: { emoji: "📖", label: "Bible" },
  verse: { emoji: "📜", label: "Verse" },
  chapter: { emoji: "📑", label: "Chapter" },
}

// Keywords that trigger sign language gestures
const KEYWORD_GESTURES: Record<string, SignLanguageGesture> = {
  hello: "wave",
  hi: "wave",
  praise: "praise",
  hallelujah: "praise",
  glory: "praise",
  amen: "amen",
  god: "god",
  lord: "god",
  jesus: "jesus",
  christ: "jesus",
  love: "love",
  peace: "peace",
  pray: "pray",
  prayer: "pray",
  bless: "bless",
  blessing: "bless",
  thank: "thank",
  thanks: "thank",
  bible: "bible",
  scripture: "bible",
  verse: "verse",
  chapter: "chapter",
}

function detectGestureFromText(text: string): SignLanguageGesture {
  const lower = text.toLowerCase()
  for (const [keyword, gesture] of Object.entries(KEYWORD_GESTURES)) {
    if (lower.includes(keyword)) {
      return gesture
    }
  }
  return "idle"
}

/**
 * Sign Language Avatar - A visual representation for deaf users
 * Uses CSS animations and gesture-based visuals as MVP
 */
function SignLanguageAvatar({ gesture }: { gesture: SignLanguageGesture }) {
  const visual = GESTURE_VISUALS[gesture]
  
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div 
        className={cn(
          "flex size-24 items-center justify-center rounded-full bg-background text-5xl shadow-lg transition-all duration-300",
          gesture !== "idle" && "animate-pulse scale-110"
        )}
      >
        {visual.emoji}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {visual.label}
      </span>
    </div>
  )
}

/**
 * Large caption display for deaf/hard-of-hearing users
 */
function CaptionDisplay({ 
  text, 
  translatedText,
  size,
  highContrast,
}: { 
  text: string
  translatedText?: string
  size: "small" | "medium" | "large" | "xlarge"
  highContrast: boolean
}) {
  const sizeClasses = {
    small: "text-lg leading-relaxed",
    medium: "text-xl leading-relaxed",
    large: "text-2xl leading-relaxed",
    xlarge: "text-3xl leading-loose",
  }

  return (
    <div 
      className={cn(
        "flex-1 overflow-y-auto rounded-lg p-4",
        highContrast 
          ? "bg-black text-yellow-300" 
          : "bg-muted/50"
      )}
    >
      {text ? (
        <div className="flex flex-col gap-3">
          <p className={cn(sizeClasses[size], "font-medium")}>
            {text}
          </p>
          {translatedText && translatedText !== text && (
            <p className={cn(
              sizeClasses[size], 
              "border-t border-border pt-3",
              highContrast ? "text-cyan-300" : "text-primary"
            )}>
              {translatedText}
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          Captions will appear here when transcription starts...
        </p>
      )}
    </div>
  )
}

/**
 * Text Input for Demo/Testing - allows deaf users to type input
 * and see the accessibility features in action
 */
function DemoTextInput() {
  const [inputText, setInputText] = useState("")
  const { speak, isSupported } = useTts()
  const { translate } = useTranslation()
  const store = useAccessibilityStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Add to transcript store so it appears in captions
    useTranscriptStore.getState().addSegment({
      id: crypto.randomUUID(),
      text: inputText.trim(),
      is_final: true,
      confidence: 1.0,
      words: [],
      timestamp: Date.now(),
    })

    // Translate if enabled
    if (store.translationEnabled) {
      await translate(inputText)
    }

    // Speak if TTS is enabled
    if (store.ttsEnabled && isSupported) {
      speak(inputText)
    }

    setInputText("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type text to test accessibility..."
        className="h-8 flex-1 text-xs"
      />
      <Button type="submit" size="sm" variant="default">
        <Send className="size-3" />
      </Button>
    </form>
  )
}

/**
 * Accessibility controls panel
 */
function AccessibilityControls() {
  const store = useAccessibilityStore()
  const { speak, stop, isSpeaking, isSupported } = useTts()
  const { translate, getLanguageDisplayName } = useTranslation()
  const currentPartial = useTranscriptStore((s) => s.currentPartial)
  const segments = useTranscriptStore((s) => s.segments)
  const [showSettings, setShowSettings] = useState(false)
  const [showDemoInput, setShowDemoInput] = useState(false)

  const lastText = segments.length > 0 ? segments[segments.length - 1].text : ""

  const handleSpeak = () => {
    const textToSpeak = currentPartial || lastText
    if (textToSpeak) {
      speak(textToSpeak)
    }
  }

  const handleTranslateAndSpeak = async () => {
    const textToTranslate = currentPartial || lastText
    if (textToTranslate) {
      const translated = await translate(textToTranslate)
      speak(translated)
    }
  }

  const languages = [
    { code: "yo", name: "Yoruba" },
    { code: "ig", name: "Igbo" },
    { code: "ha", name: "Hausa" },
    { code: "pcm", name: "Pidgin" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "pt", name: "Portuguese" },
  ]

  return (
    <div className="flex flex-col gap-3 border-t border-border p-3">
      {/* Demo Input for Testing */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDemoInput(!showDemoInput)}
          className="w-full justify-start"
        >
          <Keyboard className="size-3" />
          {showDemoInput ? "Hide" : "Show"} Demo Input (for Deaf Users)
        </Button>
        {showDemoInput && <DemoTextInput />}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {isSupported && (
          <>
            {isSpeaking ? (
              <Button variant="ghost" size="sm" onClick={stop}>
                <Square className="size-3" />
                Stop
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSpeak}>
                <Play className="size-3" />
                Speak
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleTranslateAndSpeak}>
              <Languages className="size-3" />
              Translate &amp; Speak
            </Button>
          </>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 className="size-3" />
          Settings
        </Button>
      </div>

      {/* Language Selection */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Language:</span>
        <Select
          value={store.targetLanguage}
          onValueChange={store.setTargetLanguage}
        >
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex flex-col gap-3 rounded-lg bg-muted/30 p-3">
          {/* Caption Size */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Caption Size</span>
            <Select
              value={store.captionSize}
              onValueChange={(v) => store.setCaptionSize(v as typeof store.captionSize)}
            >
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="xlarge">X-Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">High Contrast</span>
            <Button
              variant={store.highContrastMode ? "default" : "outline"}
              size="xs"
              onClick={() => store.setHighContrastMode(!store.highContrastMode)}
            >
              {store.highContrastMode ? "On" : "Off"}
            </Button>
          </div>

          {/* TTS Speed */}
          {isSupported && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Speech Speed: {store.ttsRate.toFixed(1)}x
              </span>
              <Slider
                value={[store.ttsRate]}
                onValueChange={([v]) => store.setTtsRate(v)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Sign Language Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sign Language Avatar</span>
            <Button
              variant={store.signLanguageEnabled ? "default" : "outline"}
              size="xs"
              onClick={() => store.setSignLanguageEnabled(!store.signLanguageEnabled)}
            >
              {store.signLanguageEnabled ? "On" : "Off"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AccessibilityPanel() {
  const store = useAccessibilityStore()
  const currentPartial = useTranscriptStore((s) => s.currentPartial)
  const segments = useTranscriptStore((s) => s.segments)
  const { translate, translatedText } = useTranslation()
  
  // Get the current text to display
  const currentText = currentPartial || (segments.length > 0 ? segments[segments.length - 1].text : "")
  
  // Auto-translate when text changes
  useEffect(() => {
    if (currentText && store.translationEnabled) {
      translate(currentText)
    }
  }, [currentText, store.translationEnabled, translate])

  // Detect gestures from text
  useEffect(() => {
    if (currentText && store.signLanguageEnabled) {
      const gesture = detectGestureFromText(currentText)
      store.setCurrentGesture(gesture)
      
      // Reset to idle after 2 seconds
      const timer = setTimeout(() => {
        store.setCurrentGesture("idle")
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [currentText, store.signLanguageEnabled, store.setCurrentGesture])

  return (
    <div
      data-slot="accessibility-panel"
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <PanelHeader
        title="Accessibility"
        icon={<Accessibility className="size-3" />}
      >
        <div className="flex items-center gap-1">
          <Button
            variant={store.ttsEnabled ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => store.setTtsEnabled(!store.ttsEnabled)}
            title="Text-to-Speech"
          >
            {store.ttsEnabled ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          </Button>
          <Button
            variant={store.translationEnabled ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => store.setTranslationEnabled(!store.translationEnabled)}
            title="Translation"
          >
            <Languages className="size-3" />
          </Button>
          <Button
            variant={store.signLanguageEnabled ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => store.setSignLanguageEnabled(!store.signLanguageEnabled)}
            title="Sign Language"
          >
            <Hand className="size-3" />
          </Button>
          <Button
            variant={store.showCaptions ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => store.setShowCaptions(!store.showCaptions)}
            title="Captions"
          >
            <Type className="size-3" />
          </Button>
        </div>
      </PanelHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
        {/* Sign Language Avatar */}
        {store.signLanguageEnabled && (
          <SignLanguageAvatar gesture={store.currentGesture} />
        )}

        {/* Caption Display */}
        {store.showCaptions && (
          <CaptionDisplay
            text={currentText}
            translatedText={store.translationEnabled ? translatedText : undefined}
            size={store.captionSize}
            highContrast={store.highContrastMode}
          />
        )}

        {/* Empty state */}
        {!store.signLanguageEnabled && !store.showCaptions && (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            <p>Enable captions or sign language avatar above to see accessibility features.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <AccessibilityControls />
    </div>
  )
}
