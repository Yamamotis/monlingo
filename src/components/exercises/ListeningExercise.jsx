import { useState, useEffect, useCallback, useRef } from 'react'
import { speakFrench } from '../../utils/speech'

export default function ListeningExercise({ exercise, answered, onSelect }) {
  const { options, correct, speakFr } = exercise
  const [played,   setPlayed]   = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const playedRef = useRef(false)

  const handlePlay = useCallback(() => {
    speakFrench(
      speakFr,
      () => { setSpeaking(true); setPlayed(true); playedRef.current = true },
      () => setSpeaking(false),
    )
  }, [speakFr])

  // Auto-play ao montar — tenta imediatamente (desbloqueado pelo toque anterior)
  useEffect(() => {
    playedRef.current = false
    setPlayed(false)
    setSpeaking(false)

    // Tenta imediatamente; se falhar, o botão fica visível para o usuário tocar
    const t = setTimeout(handlePlay, 100)
    return () => clearTimeout(t)
  }, [handlePlay])

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
          className={`btn-listen ${speaking ? 'speaking' : ''} ${!played ? 'unplayed pulse-ring' : ''}`}
          onClick={handlePlay}
          type="button"
          aria-label="Ouvir palavra em francês"
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
