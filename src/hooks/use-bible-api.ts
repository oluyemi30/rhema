/**
 * Bible API Hook
 * Fetches verses from the free Bible API at cdn.jsdelivr.net
 */

const API_BASE = "https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles"

// Available Bible versions
export const BIBLE_VERSIONS = {
  en: "en-kjv",      // English King James Version
  yo: "yo-ycb",      // Yoruba Contemporary Bible (if available, fallback to en)
  ig: "ig-bib",      // Igbo Bible (if available, fallback to en)
  ha: "ha-bib",      // Hausa Bible (if available, fallback to en)
  pcm: "en-kjv",     // Nigerian Pidgin (no official version, use English)
}

// Common scripture references with Nigerian translations
// Used as fallback when API doesn't have Nigerian versions
export const NIGERIAN_TRANSLATIONS: Record<string, {
  ref: string
  book: string
  chapter: number
  verse: number
  en: string
  yo: string
  ig: string
  ha: string
  pcm: string
}> = {
  "john-3-16": {
    ref: "John 3:16",
    book: "john",
    chapter: 3,
    verse: 16,
    en: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    yo: "Nitori Olorun fe araiye tobi ti o fi Omo bibi re kanso fun, ki enikeni ti o ba gba a gbo ma ba segbe, sugbon ki o le ni iye ainipekun.",
    ig: "Nitori na Chineke huru uwa n'anya nke ukwuu, nke mere o jiri nye otu Nwa ya naan'oge, ka onye obula nke kwere na ya ghara ila n'iyi kama o nwee ndu ebighi ebi.",
    ha: "Gama Allah ya so duniya har ya bada Dansa na musamman, domin duk wanda ya gaskata da shi kada ya hallaka, amma ya samu rai madawwami.",
    pcm: "Because God love dis world well well, na im make E give im only Son, so dat anybody wey believe am no go die, but go get life wey no go end.",
  },
  "psalm-23-1": {
    ref: "Psalm 23:1",
    book: "psalms",
    chapter: 23,
    verse: 1,
    en: "The LORD is my shepherd; I shall not want.",
    yo: "Oluwa li oluso aguntan mi; emi ki yio se alaini.",
    ig: "Onyenwe anyi bu onye ozuzu aturu m; agaghi m ano na mkpa.",
    ha: "Ubangiji shine makiyayina; ba zan rasa komai ba.",
    pcm: "God na my shepherd; I no go lack anything.",
  },
  "philippians-4-13": {
    ref: "Philippians 4:13",
    book: "philippians",
    chapter: 4,
    verse: 13,
    en: "I can do all things through Christ which strengtheneth me.",
    yo: "Mo le se ohun gbogbo nipase Kristi ti o fun mi ni agbara.",
    ig: "Enwere m ike ime ihe niile site na Kraist onye na enye m ume.",
    ha: "Ina iya yin duka abubuwa ta wurin Kristi wanda yake karfafa ni.",
    pcm: "I fit do everything through Christ wey dey give me power.",
  },
  "jeremiah-29-11": {
    ref: "Jeremiah 29:11",
    book: "jeremiah",
    chapter: 29,
    verse: 11,
    en: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
    yo: "Nitori mo mo ero ti mo n ro si yin, ni Oluwa wi, ero alafia, ki i se ero ibi, lati fi ipari ti o dara fun yin.",
    ig: "Nitori amaara m echiche nke m na-eche banyere unu, ka Onyenwe anyi siri kwuo, echiche udo, osughi nke ihe ojoo, iji nye unu nchekwube.",
    ha: "Gama na san tunanin da nake tunani game da ku, in ji Ubangiji, tunanin zaman lafiya, ba na mugunta ba, don in ba ku bege a karshe.",
    pcm: "I know the plans wey I get for una, na wetin God talk, plans of peace, no be bad plans, to give una future and hope.",
  },
  "romans-8-28": {
    ref: "Romans 8:28",
    book: "romans",
    chapter: 8,
    verse: 28,
    en: "And we know that all things work together for good to them that love God.",
    yo: "Awa si mo pe ohun gbogbo n sise po fun rere awon ti o feran Olorun.",
    ig: "Anyi makwaara na ihe niile na-aruko oru maka odimma ndi huru Chineke n'anya.",
    ha: "Mun kuma san cewa dukan abubuwa suna aiki tare don alheri ga wadanda suke son Allah.",
    pcm: "We know say everything dey work together for good for people wey love God.",
  },
  "proverbs-3-5": {
    ref: "Proverbs 3:5",
    book: "proverbs",
    chapter: 3,
    verse: 5,
    en: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    yo: "Fi okan re gbogbo gbekele Oluwa; ma si te ara re mole le oye ara re lori.",
    ig: "Tukwasi Onyenwe anyi obi gi niile; atula isi gi n'echiche nke onwe gi.",
    ha: "Ka ka dogara ga Ubangiji da dukan zuciyarka; kada ka dogara ga hankalinka.",
    pcm: "Trust God with all your heart; no lean on your own understanding.",
  },
  "isaiah-41-10": {
    ref: "Isaiah 41:10",
    book: "isaiah",
    chapter: 41,
    verse: 10,
    en: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.",
    yo: "Ma beru, nitori mo wa pelu re; ma foya, nitori emi ni Olorun re.",
    ig: "Atula egwu; nitori m no n'ebe i no: egbughikwala onwe gi; nitori abu m Chineke gi.",
    ha: "Kada ka ji tsoro; gama ina tare da kai: kada ka damu; gama ni ne Allahnka.",
    pcm: "No fear; because I dey with you: no worry; because I be your God.",
  },
  "matthew-6-33": {
    ref: "Matthew 6:33",
    book: "matthew",
    chapter: 6,
    verse: 33,
    en: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    yo: "Sugbon e ko wa ijoba Olorun ati ododo re, ao si fi gbogbo nkan wonyi kun yin.",
    ig: "Ma bu uo, choronua alaeze Chineke na ezi omume ya, a ga-atinyekwara unu ihe ndia niile.",
    ha: "Amma ku fara neman mulkin Allah da adalcinsa, za a kuma kara muku duk wadannan abubuwa.",
    pcm: "But first find God kingdom and His righteousness; and all these things go come to you.",
  },
}

export interface BibleVerse {
  ref: string
  book: string
  chapter: number
  verse: number
  text: Record<string, string>
}

/**
 * Fetch a verse from the Bible API
 */
export async function fetchVerse(
  book: string,
  chapter: number,
  verse: number,
  version: string = "en-kjv"
): Promise<{ verse: string; text: string } | null> {
  try {
    const url = `${API_BASE}/${version}/books/${book}/chapters/${chapter}/verses/${verse}.json`
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Get a verse with all Nigerian language translations
 */
export async function getVerseWithTranslations(verseKey: string): Promise<BibleVerse | null> {
  const localVerse = NIGERIAN_TRANSLATIONS[verseKey]
  if (!localVerse) return null

  // Try to fetch English from API for most up-to-date text
  const apiVerse = await fetchVerse(
    localVerse.book,
    localVerse.chapter,
    localVerse.verse,
    "en-kjv"
  )

  return {
    ref: localVerse.ref,
    book: localVerse.book,
    chapter: localVerse.chapter,
    verse: localVerse.verse,
    text: {
      en: apiVerse?.text || localVerse.en,
      yo: localVerse.yo,
      ig: localVerse.ig,
      ha: localVerse.ha,
      pcm: localVerse.pcm,
    },
  }
}

/**
 * Get a random verse with translations
 */
export function getRandomVerseKey(): string {
  const keys = Object.keys(NIGERIAN_TRANSLATIONS)
  return keys[Math.floor(Math.random() * keys.length)]
}

/**
 * Search for relevant verse based on keywords
 */
export function findRelevantVerse(text: string): string | null {
  const lower = text.toLowerCase()
  
  // Keyword to verse mapping
  const keywordMap: Record<string, string> = {
    "love": "john-3-16",
    "shepherd": "psalm-23-1",
    "strength": "philippians-4-13",
    "strong": "philippians-4-13",
    "plan": "jeremiah-29-11",
    "future": "jeremiah-29-11",
    "hope": "jeremiah-29-11",
    "good": "romans-8-28",
    "work": "romans-8-28",
    "trust": "proverbs-3-5",
    "heart": "proverbs-3-5",
    "fear": "isaiah-41-10",
    "afraid": "isaiah-41-10",
    "seek": "matthew-6-33",
    "kingdom": "matthew-6-33",
    "god": "john-3-16",
    "jesus": "john-3-16",
    "lord": "psalm-23-1",
    "praise": "psalm-23-1",
    "amen": "john-3-16",
    "hallelujah": "psalm-23-1",
    "bless": "proverbs-3-5",
    "glory": "matthew-6-33",
    "peace": "jeremiah-29-11",
    "faith": "proverbs-3-5",
  }

  for (const [keyword, verseKey] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      return verseKey
    }
  }

  // Return random verse if no keyword matched but text contains religious context
  const religiousWords = ["pray", "worship", "holy", "grace", "bible", "scripture", "verse"]
  if (religiousWords.some(word => lower.includes(word))) {
    return getRandomVerseKey()
  }

  return null
}
