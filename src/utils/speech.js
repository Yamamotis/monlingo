// ── Filename helper (mesma lógica do scripts/generate-audio.mjs) ──────────────

function textToFilename(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ── Fallback: Web Speech API ───────────────────────────────────────────────────

let frVoice  = null
let ttsReady = false

function pickBestFrVoice(all) {
  const fr = all.filter(v => v.lang.startsWith('fr'))
  if (!fr.length) return null
  const online = fr.find(v => !v.localService)
  if (online) return online
  return fr.find(v => v.lang === 'fr-FR') || fr.find(v => v.lang === 'fr-CA') || fr[0]
}

function loadVoices() {
  const all = window.speechSynthesis.getVoices()
  if (!all.length) return
  frVoice  = pickBestFrVoice(all)
  ttsReady = true
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
}

function speakWithTTS(text, onStart, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  let fired = false
  const go = () => {
    if (fired) return
    fired = true
    if (!ttsReady) loadVoices()
    const utter  = new SpeechSynthesisUtterance(text)
    utter.lang   = 'fr-FR'
    utter.rate   = 0.75
    utter.pitch  = 1.0
    if (frVoice) utter.voice = frVoice
    onStart?.()
    utter.onend   = () => onEnd?.()
    utter.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utter)
  }
  if (ttsReady) go()
  else {
    window.speechSynthesis.addEventListener('voiceschanged', go, { once: true })
    setTimeout(go, 400)
  }
}

// ── Player principal: áudio pré-gerado → fallback TTS ─────────────────────────

const audioCache   = new Map()
let   currentAudio = null

export function speakFrench(text, onStart, onEnd) {
  if (typeof window === 'undefined') return

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  window.speechSynthesis?.cancel()

  const filename = `/audio/${textToFilename(text)}.mp3`

  let audio = audioCache.get(text)
  if (!audio) {
    audio = new Audio(filename)
    audioCache.set(text, audio)
  }

  currentAudio      = audio
  audio.currentTime = 0

  audio.onended = () => { currentAudio = null; onEnd?.() }
  audio.onerror = () => {
    currentAudio = null
    speakWithTTS(text, onStart, onEnd)
  }

  onStart?.()
  audio.play().catch(() => {
    currentAudio = null
    speakWithTTS(text, undefined, onEnd)
  })
}
