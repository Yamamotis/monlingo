let frVoice = null
let ready   = false

function pickBestFrVoice(all) {
  const fr = all.filter(v => v.lang.startsWith('fr'))
  if (!fr.length) return null

  // 1ª escolha: voz online/enhanced (não local) — soa natural no iOS e Android
  const online = fr.find(v => !v.localService)
  if (online) return online

  // 2ª escolha: fr-FR local
  // 3ª escolha: fr-CA local
  // 4ª escolha: qualquer voz francesa
  return fr.find(v => v.lang === 'fr-FR')
      || fr.find(v => v.lang === 'fr-CA')
      || fr[0]
}

function loadVoices() {
  const all = window.speechSynthesis.getVoices()
  if (!all.length) return
  frVoice = pickBestFrVoice(all)
  ready   = true
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
}

/**
 * Fala um texto em francês usando a melhor voz disponível.
 */
export function speakFrench(text, onStart, onEnd) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  let fired = false

  const go = () => {
    if (fired) return
    fired = true

    if (!ready) loadVoices()

    const utter  = new SpeechSynthesisUtterance(text)
    utter.lang   = 'fr-FR'
    utter.rate   = 0.75   // mais devagar = pronúncia mais clara
    utter.pitch  = 1.0
    if (frVoice) utter.voice = frVoice

    onStart?.()
    utter.onend   = () => onEnd?.()
    utter.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utter)
  }

  if (ready) {
    go()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', go, { once: true })
    setTimeout(go, 400)
  }
}
