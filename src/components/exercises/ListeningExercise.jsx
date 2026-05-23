import { useState, useEffect, useCallback } from 'react'
import { speakFrench, getCurrentPlayText } from '../../utils/speech'

export default function ListeningExercise({ exercise, answered, onSelect }) {
  const { options, correct, speakFr } = exercise

  // Se o pai já pré-tocou este áudio (dentro do event handler de clique),
  // começa com played/speaking=true — sem precisar de auto-play no useEffect
  const prePlayed = getCurrentPlayText() === speakFr
  const [played,   setPlayed]   = useState(prePlayed)
  const [speaking, setSpeaking] = useState(prePlayed)

  const handlePlay = useCallback(() => {
    speakFrench(
      speakFr,
      () => { setSpeaking(true); setPlayed(true) },
      () => setSpeaking(false),
    )
  }, [speakFr])

  useEffect(() => {
    // Se o áudio não foi pré-tocado, reseta estado e aguarda o toque do usuário.
    // Fallback de 3s libera as opções para não travar o exercício.
    if (getCurrentPlayText() !== speakFr) {
      setPlayed(false)
      setSpeaking(false)
      const unlock = setTimeout(() => setPlayed(true), 3000)
      return () => clearTimeout(unlock)
    }
  }, [speakFr])

  // Detecta o fim do áudio pré-tocado (sem onEnd ligado) via polling leve.
  // Limpa o estado "speaking" quando o áudio para.
  useEffect(() => {
    if (!speaking) return
    const id = setInterval(() => {
      if (getCurrentPlayText() !== speakFr) {
        setSpeaking(false)
        clearInterval(id)
      }
    }, 200)
    return () => clearInterval(id)
  }, [speaking, speakFr])

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
