import { useState, useEffect, useCallback } from 'react'
import { speakFrench, getCurrentPlayText } from '../../utils/speech'

function SoundWave({ active }) {
  return (
    <div className={`sound-wave ${active ? 'wave-active' : ''}`} aria-hidden="true">
      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
        <span key={i} className="wave-bar" style={{ '--base-h': `${h * 4}px`, animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )
}

export default function ListeningExercise({ exercise, answered, onSelect }) {
  const { options, correct, speakFr } = exercise

  const prePlayed = getCurrentPlayText() === speakFr
  const [played,   setPlayed]   = useState(prePlayed)
  const [speaking, setSpeaking] = useState(prePlayed)
  const [selected, setSelected] = useState(null)

  const handlePlay = useCallback(() => {
    speakFrench(speakFr,
      () => { setSpeaking(true); setPlayed(true) },
      () => setSpeaking(false),
    )
  }, [speakFr])

  useEffect(() => {
    if (getCurrentPlayText() !== speakFr) {
      setPlayed(false)
      setSpeaking(false)
      const unlock = setTimeout(() => setPlayed(true), 3000)
      return () => clearTimeout(unlock)
    }
  }, [speakFr])

  useEffect(() => {
    if (!speaking) return
    const id = setInterval(() => {
      if (getCurrentPlayText() !== speakFr) { setSpeaking(false); clearInterval(id) }
    }, 200)
    return () => clearInterval(id)
  }, [speaking, speakFr])

  const getClass = (i) => {
    if (!answered) return `option-btn ${!played ? 'opt-locked' : ''}`
    if (i === correct) return 'option-btn correct'
    if (i === selected) return 'option-btn wrong-selected'
    return 'option-btn wrong-dim'
  }

  const handleSelect = (i) => {
    if (answered || !played) return
    setSelected(i)
    onSelect(i === correct)
  }

  return (
    <div className="listening-exercise">
      <p className="exercise-question">Ouça e selecione a tradução</p>

      {/* Audio card */}
      <div className={`listen-card ${speaking ? 'listen-card-active' : ''}`}>
        <SoundWave active={speaking} />

        <button
          className={`btn-listen-big ${speaking ? 'speaking' : ''} ${!played ? 'unplayed' : ''}`}
          onClick={handlePlay}
          type="button"
          aria-label="Ouvir palavra em francês"
        >
          <span className="btn-listen-icon">🔊</span>
          <span className="btn-listen-label">
            {speaking ? 'Ouvindo…' : played ? 'Ouvir novamente' : 'Toque para ouvir'}
          </span>
        </button>

        <SoundWave active={speaking} />

        {answered && <p className="listen-revealed">{speakFr}</p>}
      </div>

      <div className="options-grid options-1col">
        {options.map((opt, i) => (
          <button
            key={i}
            className={getClass(i)}
            onClick={() => handleSelect(i)}
            disabled={answered || !played}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
