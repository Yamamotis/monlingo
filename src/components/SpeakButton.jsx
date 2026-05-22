import { useState } from 'react'
import { speakFrench } from '../utils/speech'

export default function SpeakButton({ text, size = 'md' }) {
  const [active, setActive] = useState(false)

  const speak = () => {
    speakFrench(
      text,
      () => setActive(true),
      () => setActive(false),
    )
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
