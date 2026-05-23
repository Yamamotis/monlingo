import { useState, useEffect } from 'react'
import { speakFrench } from '../../utils/speech'

export default function ListeningExercise({ exercise, answered, onSelect }) {
  const { options, correct, speakFr } = exercise
  const [played,   setPlayed]   = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const handlePlay = () => {
    speakFrench(
      speakFr,
      () => { setSpeaking(true); setPlayed(true) },
      () => setSpeaking(false),
    )
  }

  // Auto-play when the question mounts
  useEffect(() => {
    if (speakFr) {
      const t = setTimeout(handlePlay, 300)
      return () => clearTimeout(t)
    }
  }, [speakFr])

  const getClass = (i) => {
    if (!answered) return `option-btn ${!played ? 'opt-locked' : ''}`
    if (i === correct) return 'option-btn correct'
    return 'option-btn wrong-dim'
  }

  return (
    <div className="listening-exercise">
      <p className="exercise-question">Ouça e selecione a tradução</p>

      <div className="listen-center">
        <button
          className={`btn-listen ${speaking ? 'speaking' : ''} ${!played ? 'unplayed' : ''}`}
          onClick={handlePlay}
          type="button"
        >
          🔊
        </button>
        {!played && <p className="listen-hint">Toque para ouvir</p>}
        {answered && <p className="listen-revealed">{speakFr}</p>}
      </div>

      <div className="options-grid options-1col">
        {options.map((opt, i) => (
          <button
            key={i}
            className={getClass(i)}
            onClick={() => !answered && played && onSelect(i === correct)}
            disabled={answered || !played}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
