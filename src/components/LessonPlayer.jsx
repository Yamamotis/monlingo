import { useState } from 'react'
import VocabPage        from './VocabPage'
import MultipleChoice   from './exercises/MultipleChoice'
import ListeningExercise from './exercises/ListeningExercise'
import { playCorrect, playWrong } from '../utils/sounds'

export default function LessonPlayer({ mod, item, onComplete, onExit, muted, onToggleMute }) {
  const skipVocab = item.type === 'evaluation' || item.type === 'review'
  const isEval    = item.type === 'evaluation'

  const exercises = skipVocab && item.type !== 'review'
    ? [{ number: 1, title: 'Avaliação', subtitle: '10 questões finais', questions: item.questions }]
    : item.exercises

  const [phase, setPhase]           = useState(skipVocab ? 'exercise' : 'vocab')
  const [exIdx, setExIdx]           = useState(0)
  const [qIdx, setQIdx]             = useState(0)
  const [lives, setLives]           = useState(3)
  const [answerPhase, setAnswerPhase] = useState('idle')
  const [isCorrect, setIsCorrect]   = useState(null)

  // Rastreamento de palavras erradas / certas para o modo revisão
  const [sessionWrong,   setSessionWrong]   = useState(new Set())
  const [sessionCorrect, setSessionCorrect] = useState(new Set())

  const currentEx = exercises[exIdx]
  const currentQ  = currentEx?.questions[qIdx]
  const totalQ    = currentEx?.questions.length ?? 0

  const handleAnswer = (correct) => {
    const speakFr = currentQ?.speakFr
    setIsCorrect(correct)

    if (correct) {
      if (!muted) playCorrect()
      if (speakFr) setSessionCorrect(prev => { const s = new Set(prev); s.add(speakFr); return s })
      setAnswerPhase('feedback')
    } else {
      if (!muted) playWrong()
      if (speakFr) setSessionWrong(prev => new Set([...prev, speakFr]))
      const next = lives - 1
      setLives(next)
      if (next <= 0) setPhase('failed')
      else setAnswerPhase('feedback')
    }
  }

  const handleContinue = () => {
    const nextQ  = qIdx + 1
    if (nextQ >= totalQ) {
      const nextEx = exIdx + 1
      if (nextEx >= exercises.length) {
        onComplete(item.xpReward, { wrong: [...sessionWrong], correct: [...sessionCorrect] })
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
    setExIdx(e => e + 1); setQIdx(0)
    setLives(3); setAnswerPhase('idle'); setIsCorrect(null)
    setPhase('exercise')
  }

  const handleRetry = () => {
    setQIdx(0); setLives(3); setAnswerPhase('idle'); setIsCorrect(null)
    setPhase('exercise')
  }

  if (phase === 'vocab') {
    return <VocabPage mod={mod} item={item} onContinue={() => setPhase('exercise')} onExit={onExit} />
  }

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

  const barColor  = isEval ? '#FFC800' : item.type === 'review' ? '#1CB0F6' : mod.color
  const badgeIcon = isEval ? '📝' : item.type === 'review' ? '🔄' : mod.icon
  const badgeName = isEval ? 'Avaliação' : item.type === 'review' ? 'Revisão Rápida' : currentEx.title

  return (
    <div className="player-screen">
      <header className="player-header">
        <button className="btn-close" onClick={onExit}>✕</button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(qIdx / totalQ) * 100}%`, background: barColor }} />
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
            style={!isEval && item.type !== 'review'
              ? { background: mod.color + '22', color: mod.color, borderColor: mod.color + '66' }
              : item.type === 'review' ? { background: '#0a1e30', color: '#1CB0F6', borderColor: '#1CB0F644' } : {}}
          >
            <span>{badgeIcon}</span>
            <span>{item.type !== 'review' ? `Módulo ${mod.number} — ` : ''}{badgeName}</span>
          </div>
          <div className="q-counter-wrap">
            <span className="q-subtitle">{currentEx.subtitle}</span>
            <span className="q-counter">{qIdx + 1} / {totalQ}</span>
          </div>
        </div>

        {currentQ?.type === 'listening' ? (
          <ListeningExercise
            key={`${exIdx}-${qIdx}`}
            exercise={currentQ}
            answered={answerPhase === 'feedback'}
            onSelect={handleAnswer}
          />
        ) : (
          <MultipleChoice
            exercise={currentQ}
            answered={answerPhase === 'feedback'}
            isCorrect={isCorrect}
            onSelect={handleAnswer}
          />
        )}
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
