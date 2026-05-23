// ── Filename helper (mesma logica do scripts/generate-audio.mjs) ──────────────

function textToFilename(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ── Audio Unlock (iOS / mobile autoplay policy) ───────────────────────────────
// O primeiro gesto do usuario desbloqueia tanto HTMLAudio quanto SpeechSynthesis.

let audioUnlocked = false

export function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true

  // Desbloqueia HTMLAudioElement tocando silencio (data URI)
  const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA')
  silent.play().catch(() => {})

  // Desbloqueia SpeechSynthesis no iOS com utterance vazia
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance('')
    u.volume = 0
    window.speechSynthesis.speak(u)
    window.speechSynthesis.cancel()
  }
}

// Desbloqueia automaticamente no primeiro toque/clique
if (typeof window !== 'undefined') {
  const handler = () => {
    unlockAudio()
    document.removeEventListener('touchstart', handler, true)
    document.removeEventListener('mousedown',  handler, true)
  }
  document.addEventListener('touchstart', handler, { once: true, capture: true })
  document.addEventListener('mousedown',  handler, { once: true, capture: true })
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
    utter.rate   = 0.8
    utter.pitch  = 1.0
    if (frVoice) utter.voice = frVoice
    onStart?.()
    // Timeout de segurança: se onend nunca disparar (iOS silencioso), libera em 5s
    const safety = setTimeout(() => { onEnd?.() }, 5000)
    utter.onend   = () => { clearTimeout(safety); onEnd?.() }
    utter.onerror = () => { clearTimeout(safety); onEnd?.() }
    window.speechSynthesis.speak(utter)
  }
  if (ttsReady) go()
  else {
    window.speechSynthesis.addEventListener('voiceschanged', go, { once: true })
    setTimeout(go, 300)
  }
}

// ── Player principal: audio pre-gerado → fallback TTS ─────────────────────────

let currentAudio     = null
let currentPlayText  = null   // texto do áudio em andamento

export function getCurrentPlayText() { return currentPlayText }

export function speakFrench(text, onStart, onEnd) {
  if (typeof window === 'undefined') return

  // Para qualquer audio em andamento
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  window.speechSynthesis?.cancel()

  currentPlayText = text
  const filename  = '/audio/' + textToFilename(text) + '.mp3'

  // Cria um novo Audio por chamada para evitar conflitos de onended/onerror
  const audio = new Audio(filename)
  currentAudio = audio

  audio.onended = () => {
    if (currentAudio === audio) { currentAudio = null; currentPlayText = null }
    onEnd?.()
  }

  // 404 ou erro no MP3 → fallback TTS
  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null
    speakWithTTS(text, onStart, onEnd)
  }

  // So chama onStart quando o play de fato inicia (evita "played=true" sem som)
  const promise = audio.play()
  if (promise) {
    promise
      .then(() => onStart?.())
      .catch(() => {
        // Bloqueado por autoplay policy → tenta TTS
        if (currentAudio === audio) currentAudio = null
        speakWithTTS(text, onStart, onEnd)
      })
  } else {
    onStart?.()
  }
}
