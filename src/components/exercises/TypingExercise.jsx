import { useState, useRef, useEffect } from 'react'

function normalize(text) {
  return text.trim().toLowerCase()
    // Ligaduras latinas comuns no francês: œ→oe, æ→ae
    // Isso faz "soeur" = "sœur", "coeur" = "cœur", etc.
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    // Remove diacríticos (acentos, cedilha, trema…): é→e, ç→c, â→a etc.
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

// Tolerância proporcional ao comprimento da palavra normalizada
function isAlmostCorrect(input, correct) {
  const a = normalize(input), b = normalize(correct)
  if (a === b) return false
  // ≤4 letras: 1 erro  |  5-8 letras: 2 erros  |  9+ letras: 3 erros
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
  const [value,   setValue]   = useState('')
  const [attempt, setAttempt] = useState(null) // 'correct' | 'almost' | 'wrong'
  const inputRef = useRef(null)
  const encourageRef = useRef(Math.floor(Math.random() * ENCOURAGE.length))

  useEffect(() => {
    if (!answered) { setValue(''); setAttempt(null); inputRef.current?.focus() }
  }, [answered])

  const check = () => {
    if (!value.trim() || answered) return
    const norm    = normalize(value)
    const correct = normalize(exercise.correct)

    if (norm === correct) {
      setAttempt('correct')
      onSelect(true)
    } else if (isAlmostCorrect(value, exercise.correct)) {
      setAttempt('almost')
      onSelect(true) // conta como certo mas mostra correção
    } else {
      setAttempt('wrong')
      onSelect(false)
    }
  }

  const wrapClass = answered
    ? attempt === 'wrong' ? 'typing-err' : 'typing-ok'
    : ''

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
          disabled={answered}
          placeholder="Digite em francês…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

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
