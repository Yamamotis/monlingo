import { useState, useRef, useEffect } from 'react'
import AccentKeyboard from '../AccentKeyboard'

function normalize(text) {
  return text.trim().toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[''']/g, '')
    .replace(/\s+/g, ' ')
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => i === 0 ? j : j === 0 ? i : 0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function isAlmostCorrect(input, correct) {
  const a = normalize(input), b = normalize(correct)
  if (a === b) return false
  const tolerance = b.length <= 4 ? 1 : b.length <= 8 ? 2 : 3
  return levenshtein(a, b) <= tolerance
}

const ENCOURAGE = [
  'Não desanime, você está aprendendo! 💪',
  'Errar faz parte — continue tentando! 🌱',
  'Quase lá! Revise e tente de novo. 😊',
  'Todo erro te aproxima do acerto! 🎯',
]

export default function TypingExercise({ exercise, answered, onSelect }) {
  const [value,      setValue]      = useState('')
  const [attempt,    setAttempt]    = useState(null)  // 'correct' | 'almost' | 'wrong'
  const [wrongCount, setWrongCount] = useState(0)
  const [shaking,    setShaking]    = useState(false)
  const inputRef     = useRef(null)
  const encourageRef = useRef(Math.floor(Math.random() * ENCOURAGE.length))

  useEffect(() => {
    if (!answered) {
      setValue('')
      setAttempt(null)
      setWrongCount(0)
      setShaking(false)
      inputRef.current?.focus()
    }
  }, [answered])

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 420)
  }

  const check = () => {
    if (!value.trim() || answered || attempt) return
    const norm    = normalize(value)
    const correct = normalize(exercise.correct)

    if (norm === correct) {
      setAttempt('correct')
      onSelect(true)
    } else if (isAlmostCorrect(value, exercise.correct)) {
      setAttempt('almost')
      onSelect(true)
    } else {
      const newCount = wrongCount + 1
      setWrongCount(newCount)
      triggerShake()

      if (newCount >= 3) {
        // 3ª tentativa errada → falha definitiva
        setAttempt('wrong')
        onSelect(false)
      } else {
        // 1ª ou 2ª tentativa → limpa o campo e permite nova tentativa
        setTimeout(() => setValue(''), 320)
      }
    }
  }

  // Dica: mostrada após a 2ª tentativa errada
  const showHint = wrongCount >= 2 && !attempt && !answered

  const wrapClass = [
    answered
      ? (attempt === 'wrong' ? 'typing-err' : 'typing-ok')
      : '',
    shaking ? 'typing-shake-anim' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="typing-ex">
      <p className="typing-prompt">Como se escreve em francês?</p>
      <div className="typing-pt">{exercise.pt}</div>

      <div className={`typing-input-wrap ${wrapClass}`}>
        <input
          ref={inputRef}
          className="typing-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          disabled={answered || attempt === 'wrong'}
          placeholder="Digite em francês…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {/* Mensagem suave após 1ª tentativa errada */}
      {wrongCount === 1 && !attempt && !answered && (
        <p className="typing-retry-msg">Não foi dessa vez! Tente novamente 💪</p>
      )}

      {/* Dica com a primeira letra após 2ª tentativa errada */}
      {showHint && (
        <div className="typing-hint">
          💡 Começa com <strong>{exercise.correct[0].toUpperCase()}</strong>
          {' '}· {exercise.correct.length} {exercise.correct.length === 1 ? 'letra' : 'letras'}
        </div>
      )}

      {/* Teclado de acentos — visível apenas antes de responder */}
      <AccentKeyboard
        inputRef={inputRef}
        value={value}
        onChange={setValue}
        disabled={answered || !!attempt}
      />

      {answered && attempt === 'almost' && (
        <div className="typing-almost-note">
          <span>✨ Quase certo!</span>
          <span>A forma correta é: <strong>{exercise.correct}</strong></span>
        </div>
      )}

      {answered && attempt === 'wrong' && (
        <div className="typing-wrong-note">
          <p className="typing-encourage">{ENCOURAGE[encourageRef.current]}</p>
        </div>
      )}

      {!answered && !attempt && (
        <button
          className="btn-typing-check"
          onClick={check}
          disabled={!value.trim()}
        >
          {wrongCount > 0 ? 'Tentar novamente →' : 'Verificar ✓'}
        </button>
      )}
    </div>
  )
}
