import { useState, useMemo } from 'react'
import { MODULES, LEVELS } from '../data/lessons'
import MultipleChoice from './exercises/MultipleChoice'
import { playCorrect, playWrong } from '../utils/sounds'

const PLACEMENT_MODULE_IDS = ['m1', 'm3', 'm5', 'm11', 'm16', 'm17', 'm27', 'm28', 'm33', 'm45']

function buildQuestions() {
  return PLACEMENT_MODULE_IDS.map(modId => {
    const mod  = MODULES.find(m => m.id === modId)
    const pool = mod.exercises[0].questions
    return pool[Math.floor(Math.random() * pool.length)]
  })
}

function getUnlockLevelIds(score) {
  if (score <= 3) return []
  if (score <= 5) return ['beginner-1', 'beginner-2']
  if (score <= 7) return ['beginner-1', 'beginner-2', 'beginner-3']
  return ['beginner-1', 'beginner-2', 'beginner-3', 'intermediate-1']
}

function getResultLabel(score) {
  if (score <= 3) return { emoji: '🌱', level: 'Iniciante',       sub: 'Você começa do módulo 1.' }
  if (score <= 5) return { emoji: '📗', level: 'Iniciante 3',     sub: 'Pulamos os primeiros 2 sub-níveis!' }
  if (score <= 7) return { emoji: '⭐', level: 'Intermediário',   sub: 'Você pula todo o Iniciante!' }
  return               { emoji: '🏆', level: 'Intermediário 2',  sub: 'Você pula Iniciante e Intermediário 1!' }
}

export function buildUnlockIds(levelIds) {
  return levelIds.flatMap(lid => {
    const level = LEVELS.find(l => l.id === lid)
    if (!level) return []
    return MODULES
      .filter(m => level.moduleIds.includes(m.id))
      .map(m => m.evaluation.id)
  })
}

export default function PlacementTest({ onComplete, onSkip }) {
  const questions                     = useMemo(buildQuestions, [])
  const [qIdx, setQIdx]               = useState(0)
  const [score, setScore]             = useState(0)
  const [answerPhase, setAnswerPhase] = useState('idle')
  const [isCorrect, setIsCorrect]     = useState(null)
  const [showResult, setShowResult]   = useState(false)
  const [finalScore, setFinalScore]   = useState(0)

  const currentQ = questions[qIdx]

  const handleAnswer = (correct) => {
    setIsCorrect(correct)
    setAnswerPhase('feedback')
    if (correct) playCorrect()
    else         playWrong()
  }

  const handleContinue = () => {
    const newScore = score + (isCorrect ? 1 : 0)
    if (qIdx + 1 >= questions.length) {
      setFinalScore(newScore)
      setShowResult(true)
    } else {
      setScore(newScore)
      setQIdx(q => q + 1)
      setAnswerPhase('idle')
      setIsCorrect(null)
    }
  }

  if (showResult) {
    const label      = getResultLabel(finalScore)
    const unlockIds  = getUnlockLevelIds(finalScore)
    const evalIds    = buildUnlockIds(unlockIds)
    return (
      <div className="placement-screen">
        <div className="placement-result">
          <div className="placement-result-icon">{label.emoji}</div>
          <h2 className="placement-result-title">{finalScore}/{questions.length} acertos</h2>
          <p className="placement-result-level">Começar do: <strong>{label.level}</strong></p>
          <p className="placement-result-sub">{label.sub}</p>
          <button className="btn-placement-confirm" onClick={() => onComplete(evalIds)}>
            Começar daqui →
          </button>
          <button className="btn-placement-zero" onClick={() => onComplete([])}>
            Prefiro começar do zero
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="placement-screen">
      <header className="player-header">
        <button className="btn-close" onClick={onSkip}>✕</button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(qIdx / questions.length) * 100}%`, background: '#CE82FF' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', minWidth: 40, textAlign: 'right' }}>
          {qIdx + 1}/{questions.length}
        </span>
      </header>

      <div className="player-body">
        <div className="exercise-top">
          <div className="lesson-badge" style={{ background: '#CE82FF22', color: '#CE82FF', borderColor: '#CE82FF66' }}>
            <span>🎯</span><span>Teste de Nivelamento</span>
          </div>
          <div className="q-counter-wrap">
            <span className="q-subtitle">Responda no seu melhor nível</span>
            <span className="q-counter">{qIdx + 1} / {questions.length}</span>
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
              : <><span className="fb-icon">✗</span> Resposta: <strong>{currentQ.options[currentQ.correct]}</strong></>
            }
          </div>
          <button className="btn-continue" onClick={handleContinue}>
            {qIdx + 1 >= questions.length ? 'Ver resultado' : 'Continuar'} →
          </button>
        </div>
      )}
    </div>
  )
}
