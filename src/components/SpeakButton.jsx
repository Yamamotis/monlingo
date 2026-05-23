import { useState, useEffect } from 'react'
import { speakFrench, getCurrentPlayText } from '../utils/speech'

export default function SpeakButton({ text, size = 'md' }) {
  // Detecta se o pai já pré-tocou este áudio no handler de clique
  const prePlayed = getCurrentPlayText() === text
  const [active, setActive] = useState(prePlayed)

  // Detecta o fim do áudio pré-tocado via polling leve (mesmo padrão do ListeningExercise)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      if (getCurrentPlayText() !== text) {
        setActive(false)
        clearInterval(id)
      }
    }, 200)
    return () => clearInterval(id)
  }, [active, text])

  // Ao trocar de questão, reseta estado
  useEffect(() => {
    const preNow = getCurrentPlayText() === text
    setActive(preNow)
  }, [text])

  const speak = () => {
    speakFrench(text, () => setActive(true), () => setActive(false))
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
