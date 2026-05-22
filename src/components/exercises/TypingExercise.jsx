import { useState, useRef, useEffect } from 'react'
import SpeakButton from '../SpeakButton'

function normalize(text) {
  return text.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['‘’]/g, '')
    .replace(/\s+/g, ' ')
}

export default function TypingExercise({ exercise, answered, onSelect }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!answered) inputRef.current?.focus()
  }, [answered])

  const check = () => {
    if (!value.trim() || answered) return
    const correct = normalize(exercise.correct) === normalize(value)
    onSelect(correct)
  }

  const isCorrect = answered && normalize(exercise.correct) === normalize(value)

  return (
    <div className="typing-ex">
      <p className="typing-prompt">Como se escreve em francês?</p>
      <div className="typing-pt">{exercise.pt}</div>

      <div className={`typing-input-wrap ${answered ? (isCorrect ? 'typing-ok' : 'typing-err') : ''}`}>
        <input
          ref={inputRef}
          className="typing-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          disabled={answered}
          placeholder="Digite em francês…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {answered && exercise.speakFr && (
          <SpeakButton text={exercise.speakFr} size="sm" />
        )}
      </div>

      {answered && !isCorrect && (
        <p className="typing-correct-answer">
          Resposta correta: <strong>{exercise.correct}</strong>
        </p>
      )}

      {!answered && (
        <button
          className="btn-typing-check"
          onClick={check}
          disabled={!value.trim()}
        >
          Verificar ✓
        </button>
      )}
    </div>
  )
}
