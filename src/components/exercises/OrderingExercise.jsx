import { useState, useEffect } from 'react'
import SpeakButton from '../SpeakButton'

export default function OrderingExercise({ exercise, answered, onSelect }) {
  const { pt, words: initialWords, correct, speakFr } = exercise

  const [bank,   setBank]   = useState(() => initialWords.map((w, i) => ({ w, id: i })))
  const [placed, setPlaced] = useState([])

  // Reset when a new question arrives
  useEffect(() => {
    setBank(initialWords.map((w, i) => ({ w, id: i })))
    setPlaced([])
  }, [pt])

  const place = (item) => {
    if (answered) return
    setBank(b => b.filter(x => x.id !== item.id))
    setPlaced(p => [...p, item])
  }

  const remove = (item) => {
    if (answered) return
    setPlaced(p => p.filter(x => x.id !== item.id))
    setBank(b => [...b, item])
  }

  const check = () => {
    if (!placed.length || answered) return
    const answer = placed.map(x => x.w).join(' ')
    onSelect(answer.toLowerCase() === correct.join(' ').toLowerCase())
  }

  const isCorrect = answered && placed.map(x => x.w).join(' ').toLowerCase() === correct.join(' ').toLowerCase()
  const answerClass = answered ? (isCorrect ? 'ord-answer-ok' : 'ord-answer-err') : 'ord-answer-idle'

  return (
    <div className="ordering-ex">
      <p className="ordering-prompt">Organize as palavras na ordem correta</p>
      <div className="ordering-pt">{pt}</div>

      {/* Answer area */}
      <div className={`ord-answer ${answerClass}`}>
        {placed.length === 0
          ? <span className="ord-placeholder">Toque nas palavras abaixo…</span>
          : placed.map(item => (
            <button
              key={item.id}
              className="word-chip chip-placed"
              onClick={() => remove(item)}
              disabled={answered}
            >
              {item.w}
            </button>
          ))
        }
      </div>

      {answered && !isCorrect && (
        <p className="ord-correct-hint">
          Correto: <strong>{correct.join(' ')}</strong>
        </p>
      )}

      {answered && speakFr && (
        <div className="ord-speak-row">
          <SpeakButton text={speakFr} size="sm" />
          <span className="ord-speak-label">{speakFr}</span>
        </div>
      )}

      {/* Word bank */}
      <div className="ord-bank">
        {bank.map(item => (
          <button
            key={item.id}
            className="word-chip chip-bank"
            onClick={() => place(item)}
            disabled={answered}
          >
            {item.w}
          </button>
        ))}
      </div>

      {!answered && placed.length > 0 && (
        <button className="btn-typing-check" onClick={check}>
          Verificar ✓
        </button>
      )}
    </div>
  )
}
