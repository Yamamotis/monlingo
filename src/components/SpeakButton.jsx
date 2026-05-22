import { useState } from 'react'

export default function SpeakButton({ text, size = 'md' }) {
  const [active, setActive] = useState(false)

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang  = 'fr-FR'
    utter.rate  = 0.82
    utter.pitch = 1.0
    setActive(true)
    utter.onend   = () => setActive(false)
    utter.onerror = () => setActive(false)
    window.speechSynthesis.speak(utter)
  }

  return (
    <button
      className={`btn-speak ${size === 'sm' ? 'speak-sm' : ''} ${active ? 'speaking' : ''}`}
      onClick={speak}
      title="Ouvir pronúncia em francês"
      type="button"
    >
      🔊
    </button>
  )
}
