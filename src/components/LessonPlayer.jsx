import { useState } from 'react'
import VocabPage         from './VocabPage'
import MultipleChoice    from './exercises/MultipleChoice'
import ListeningExercise from './exercises/ListeningExercise'
import TypingExercise    from './exercises/TypingExercise'
import OrderingExercise  from './exercises/OrderingExercise'
import BlankExercise     from './exercises/BlankExercise'
import { playCorrect, playWrong } from '../utils/sounds'
import { speakFrench } from '../utils/speech'

// Pré-toca o áudio de uma questão de escuta dentro do event handler de clique,
// para satisfazer a autoplay policy do iOS Safari.
function prePlayListening(q) {
  if (q?.type === 'listening' && q?.speakFr) {
    speakFrench(q.speakFr, undefined, undefined)
  }
}

export default function LessonPlayer({ mod, item, onComplete, onLoseHeart, hearts = 5, isPremium = false, onExit, onOpenRedeem }) {
  const isVocab  = item.type === 'vocab'
  const isEval   = item.type === 'evaluation'
  const isReview = item.type === 'review'
  const isDaily  = item.type === 'daily'

  const exercises = isVocab ? [] : (isReview || isDaily)
    ? item.exercises
    : isEval
    ? [{ number: 1, title: 'Avaliação', subtitle: '10 questões finais', questions: item.questions }]
    : [{ number: item.number, title: item.title, subtitle: item.subtitle, questions: item.questions }]

  const [phase, setPhase]             = useState(isVocab ? 'vocab' : 'exercise')
  const [exIdx, setExIdx]             = useState(0)
  const [qIdx, setQIdx]               = useState(0)
  const [lives, setLives]             = useState(3)
  const [answerPhase, setAnswerPhase] = useState('idle')
  const [isCorrect, setIsCorrect]     = useState(null)

  const [sessionWrong,   setSessionWrong]   = useState(new Set())
  const [sessionCorrect, setSessionCorrect] = useState(new Set())

  const currentEx = exercises[exIdx]
  const currentQ  = currentEx?.questions[qIdx]
  const totalQ    = currentEx?.questions.length ?? 0

  const handleAnswer = (correct) => {
    const speakFr = currentQ?.speakFr
    setIsCorrect(correct)
    if (correct) {
      playCorrect()
      if (speakFr) setSessionCorrect(prev => { const s = new Set(prev); s.add(speakFr); return s })
      setAnswerPhase('feedback')
    } else {
      playWrong()
      if (speakFr) setSessionWrong(prev => new Set([...prev, speakFr]))
      onLoseHeart?.()
      const next = lives - 1
      setLives(next)
      // Premium: só falha por vidas do exercício (não por vidas globais)
      const globalOut = !isPremium && hearts - 1 <= 0
      if (next <= 0 || globalOut) setPhase('failed')
      else setAnswerPhase('feedback')
    }
  }

  const handleContinue = () => {
    const nextQIdx = qIdx + 1
    if (nextQIdx >= totalQ) {
      const nextExIdx = exIdx + 1
      if (nextExIdx >= exercises.length) {
        onComplete(item.xpReward, { wrong: [...sessionWrong], correct: [...sessionCorrect] })
      } else {
        // Pré-toca o 1º áudio do próximo exercício enquanto ainda estamos no handler de clique
        prePlayListening(exercises[nextExIdx]?.questions?.[0])
        setPhase('ex-done')
      }
    } else {
      // Pré-toca o áudio da próxima questão enquanto ainda estamos no handler de clique
      prePlayListening(currentEx.questions[nextQIdx])
      setQIdx(nextQIdx)
      setAnswerPhase('idle')
      setIsCorrect(null)
    }
  }

  const startNextExercise = () => {
    const nextExIdx = exIdx + 1
    // Pré-toca o 1º áudio do próximo exercício dentro do handler de clique
    prePlayListening(exercises[nextExIdx]?.questions?.[0])
    setExIdx(e => e + 1); setQIdx(0)
    setLives(3); setAnswerPhase('idle'); setIsCorrect(null)
    setPhase('exercise')
  }

  const handleRetry = () => {
    setQIdx(0); setLives(3); setAnswerPhase('idle'); setIsCorrect(null)
    setPhase('exercise')
  }

  if (phase === 'vocab') {
    return <VocabPage mod={mod} item={item} onContinue={onExit} onExit={onExit} />
  }

  if (phase === 'failed') {
    if (!isPremium) {
      return (
        <div className="player-screen failed-screen">
          <div className="failed-card failed-upsell">
            <div className="failed-icon">💔</div>
            <h2 className="upsell-title">Suas vidas acabaram!</h2>
            <p className="upsell-sub">Com o Premium você tem vidas ilimitadas e nunca precisa parar.</p>

            <ul className="upsell-perks">
              <li>💜 Vidas ilimitadas</li>
              <li>🎯 Missão do dia exclusiva</li>
              <li>🏆 Acesso a todos os 70 módulos</li>
              <li>⭐ Acesso vitalício por R$ 14,99</li>
            </ul>

            <button className="btn-upsell-buy" onClick={onOpenRedeem}>
              Seja Premium — R$ 14,99
            </button>
            <button className="btn-retry" onClick={handleRetry}>Tentar novamente</button>
            <button className="btn-exit-soft" onClick={onExit}>Sair</button>
          </div>
        </div>
      )
    }
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

  const barColor  = isEval ? '#FFC800' : isDaily ? '#CE82FF' : isReview ? '#1CB0F6' : mod.color
  const badgeIcon = isEval ? '📝' : isDaily ? '🎯' : isReview ? '🔄' : mod.icon
  const badgeName = isEval ? 'Avaliação' : isDaily ? 'Missão do Dia' : isReview ? 'Revisão Rápida' : currentEx.title

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
        ) : currentQ?.type === 'typing' ? (
          <TypingExercise
            key={`${exIdx}-${qIdx}`}
            exercise={currentQ}
            answered={answerPhase === 'feedback'}
            onSelect={handleAnswer}
          />
        ) : currentQ?.type === 'ordering' ? (
          <OrderingExercise
            key={`${exIdx}-${qIdx}`}
            exercise={currentQ}
            answered={answerPhase === 'feedback'}
            onSelect={handleAnswer}
          />
        ) : currentQ?.type === 'blank' ? (
          <BlankExercise
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
              : <>
                  <span className="fb-icon">✗</span> Não foi dessa vez!{' '}
                  A resposta é:{' '}
                  <strong>
                    {currentQ?.type === 'typing' || currentQ?.type === 'blank'
                      ? currentQ.correct
                      : currentQ?.options?.[currentQ?.correct]}
                  </strong>
                </>
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
