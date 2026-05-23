import { useState, useEffect, useCallback } from 'react'
import { speakFrench } from '../../utils/speech'

// Tempo máximo esperando o áudio — após isso, libera as opções de qualquer forma
const UNLOCK_TIMEOUT = 3500

export default function ListeningExercise({ exercise, answered, onSelect }) {
  const { options, correct, speakFr } = exercise
  const [played,   setPlayed]   = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const handlePlay = useCallback(() => {
    speakFrench(
      speakFr,
      () => { setSpeaking(true); setPlayed(true) },  // onStart: som confirmado
      () => { setSpeaking(false) },                   // onEnd
    )
  }, [speakFr])

  useEffect(() => {
    setPlayed(false)
    setSpeaking(false)

    // Tenta auto-play; se o navegador bloquear, o botão fica pulsando
    const autoPlay = setTimeout(handlePlay, 150)

    // Fallback: depois de UNLOCK_TIMEOUT, libera as opções mesmo sem ouvir
    // Evita o usuário ficar travado em browsers que bloqueiam tudo
    const unlock   = setTimeout(() => setPlayed(true), UNLOCK_TIMEOUT)

    return () => { clearTimeout(autoPlay); clearTimeout(unlock) }
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
          className={`btn-listen ${speaking ? 'speaking' : ''} ${!played ? 'unplayed' : ''}`}
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
