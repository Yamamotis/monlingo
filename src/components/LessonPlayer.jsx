import { useState } from 'react'
import VocabPage from './VocabPage'
import MultipleChoice from './exercises/MultipleChoice'
import { playCorrect, playWrong } from '../utils/sounds'

export default function LessonPlayer({ mod, item, onComplete, onExit, muted, onToggleMute }) {
  const isEval = item.type === 'evaluation'

  // Lessons have 3 exercises; evaluations have a single "exercise" from questions array
  const exercises = isEval
    ? [{ number: 1, title: 'Avaliação', subtitle: '10 questões finais', questions: item.questions }]
    : item.exercises

  const [phase, setPhase]           = useState(isEval ? 'exercise' : 'vocab')
  const [exIdx, setExIdx]           = useState(0)
  const [qIdx, setQIdx]             = useState(0)
  const [lives, setLives]           = useState(3)
  const [answerPhase, setAnswerPhase] = useState('idle') // 'idle' | 'feedback'
  const [isCorrect, setIsCorrect]   = useState(null)

  const currentEx = exercises[exIdx]
  const currentQ  = currentEx?.questions[qIdx]
  const totalQ    = currentEx?.questions.length ?? 0

  const handleAnswer = (correct) => {
    setIsCorrect(correct)
    if (correct) {
      if (!muted) playCorrect()
      setAnswerPhase('feedback')
    } else {
      if (!muted) playWrong()
      const next = lives - 1
      setLives(next)
      if (next <= 0) setPhase('failed')
      else setAnswerPhase('feedback')
    }
  }

  const handleContinue = () => {
    const nextQ = qIdx + 1
    if (nextQ >= totalQ) {
      const nextEx = exIdx + 1
      if (nextEx >= exercises.length) {
        onComplete(item.xpReward)
      } else {
        setPhase('ex-done')
      }
    } else {
      setQIdx(nextQ)
      setAnswerPhase('idle')
      setIsCorrect(null)
    }
  }

  const startNextExercise = () => {
    setExIdx(e => e + 1)
    setQIdx(0)
    setLives(3)
    setAnswerPhase('idle')
    setIsCorrect(null)
    setPhase('exercise')
  }

  const handleRetry = () => {
    setQIdx(0)
    setLives(3)
    setAnswerPhase('idle')
    setIsCorrect(null)
    setPhase('exercise')
  }

  // ── Vocab page ─────────────────────────────────
  if (phase === 'vocab') {
    return (
      <VocabPage mod={mod} item={item} onContinue={() => setPhase('exercise')} onExit={onExit} />
    )
  }

  // ── Failed ──────────────────────────────────────
  if (phase === 'failed') {
    return (
      <div className="player-screen failed-screen">
        <div className="failed-card">
          <div className="failed-icon">💔</div>
          <h2>Sem corações!</h2>
          <p>Não desanime — você consegue!</p>
          <button className="btn-retry" onClick={handleRetry}>Tentar novamente</button>
          <button className="btn-exit-soft" onClick={onExit}>Sair</button>
        </div>
      </div>
    )
  }

  // ── Between exercises ────────────────────────────
  if (phase === 'ex-done') {
    const nextEx = exercises[exIdx + 1]
    return (
      <div className="player-screen ex-done-screen">
        <div className="ex-done-card">
          <div className="ex-done-icon">🎉</div>
          <h2>{currentEx.title} concluído!</h2>

          <div className="ex-dots">
            {exercises.map((_, i) => (
              <div key={i} className={`ex-dot ${i <= exIdx ? 'dot-done' : 'dot-pending'}`} />
            ))}
          </div>

          {nextEx && (
            <div className="next-ex-info">
              <span className="next-label">A seguir:</span>
              <span className="next-title">{nextEx.title} — {nextEx.subtitle}</span>
            </div>
          )}

          <button
            className="btn-retry"
            style={{ background: mod.color, boxShadow: `0 4px 0 ${mod.color}99` }}
            onClick={startNextExercise}
          >
            Próximo exercício →
          </button>
        </div>
      </div>
    )
  }

  // ── Exercise player ──────────────────────────────
  const progressPct = (qIdx / totalQ) * 100
  const barColor    = isEval ? '#FFC800' : mod.color

  return (
    <div className="player-screen">
      <header className="player-header">
        <button className="btn-close" onClick={onExit}>✕</button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: barColor }} />
        </div>
        <div className="hearts">
          {[1, 2, 3].map(n => (
            <span key={n} className={n <= lives ? 'heart full' : 'heart empty'}>
              {n <= lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <button className="btn-mute" onClick={onToggleMute} title={muted ? 'Ativar sons' : 'Silenciar'}>
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      <div className="player-body">
        <div className="exercise-top">
          <div
            className={`lesson-badge ${isEval ? 'eval-badge' : ''}`}
            style={!isEval ? { background: mod.color + '22', color: mod.color, borderColor: mod.color + '66' } : {}}
          >
            <span>{isEval ? '📝' : mod.icon}</span>
            <span>Módulo {mod.number} — {currentEx.title}</span>
          </div>
          <div className="q-counter-wrap">
            <span className="q-subtitle">{currentEx.subtitle}</span>
            <span className="q-counter">{qIdx + 1} / {totalQ}</span>
          </div>
        </div>

        <MultipleChoice
          exercise={currentQ}
          answered={answerPhase === 'feedback'}
          isCorrect={isCorrect}
          onSelect={handleAnswer}
        />
      </div>

      {answerPhase === 'feedback' && (
        <div className={`feedback-bar ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
          <div className="fb-text">
            {isCorrect
              ? <><span className="fb-icon">✓</span> Correto!</>
              : <><span className="fb-icon">✗</span> Errado! Resposta: <strong>{currentQ.options[currentQ.correct]}</strong></>
            }
          </div>
          <button className="btn-continue" onClick={handleContinue}>
            {qIdx + 1 >= totalQ ? 'Finalizar' : 'Continuar'} →
          </button>
        </div>
      )}
    </div>
  )
}
