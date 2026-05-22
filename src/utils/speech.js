// Voz francesa cacheada globalmente — carregada uma vez
let frVoice = null
let ready   = false

function loadVoices() {
  const all = window.speechSynthesis.getVoices()
  if (!all.length) return
  frVoice =
    all.find(v => v.lang === 'fr-FR') ||
    all.find(v => v.lang === 'fr-CA') ||
    all.find(v => v.lang.startsWith('fr')) ||
    null
  ready = true
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  // Chrome/Android carrega vozes de forma assíncrona
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
}

/**
 * Fala um texto em francês.
 * @param {string}   text
 * @param {Function} onStart  - chamado quando a fala começa
 * @param {Function} onEnd    - chamado quando a fala termina ou dá erro
 */
export function speakFrench(text, onStart, onEnd) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  let fired = false

  const go = () => {
    if (fired) return
    fired = true

    // Tenta uma última vez encontrar a voz caso ainda não esteja pronta
    if (!ready) loadVoices()

    const utter      = new SpeechSynthesisUtterance(text)
    utter.lang       = 'fr-FR'
    utter.rate       = 0.82
    utter.pitch      = 1.0
    if (frVoice) utter.voice = frVoice   // seleciona explicitamente no iOS

    onStart?.()
    utter.onend   = () => onEnd?.()
    utter.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utter)
  }

  if (ready) {
    go()
  } else {
    // Aguarda voiceschanged (Android Chrome) com fallback de 400 ms (iOS)
    window.speechSynthesis.addEventListener('voiceschanged', go, { once: true })
    setTimeout(go, 400)
  }
}
