import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function CompletionScreen({ result, onContinue }) {
  const { item, module: mod, xp } = result
  const isEval = item.type === 'evaluation'

  useEffect(() => {
    confetti({
      particleCount: isEval ? 160 : 100,
      spread: isEval ? 90 : 70,
      origin: { y: 0.55 },
      colors: ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#ffffff'],
      gravity: 0.9,
      scalar: 1.1,
    })
  }, [])

  return (
    <div className="completion-screen">
      <div className="completion-card">
        <div className="completion-icon">{isEval ? '🏆' : '⭐'}</div>

        <div className="completion-mod-tag" style={{ color: mod.color, borderColor: mod.color + '55', background: mod.color + '18' }}>
          {mod.icon} Módulo {mod.number} — {mod.title}
        </div>

        <h1 className="completion-title">
          {isEval ? 'Avaliação Concluída!' : 'Aula Concluída!'}
        </h1>

        <div className="xp-gained">
          <span className="xp-star">⭐</span>
          <span className="xp-amount">+{xp} XP</span>
        </div>

        <div className="completion-stats">
          <div className="stat-box">
            <span className="stat-label">Tipo</span>
            <span className="stat-value">{isEval ? 'Avaliação' : 'Aula'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">XP ganho</span>
            <span className="stat-value">{xp}</span>
          </div>
        </div>

        <button className="btn-complete" onClick={onContinue}>
          Continuar
        </button>
      </div>
    </div>
  )
}
