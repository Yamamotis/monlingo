import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function LevelUpModal({ level, onContinue }) {
  useEffect(() => {
    const fire = (angle, origin) =>
      confetti({ angle, spread: 60, particleCount: 80, origin, colors: [level.color, '#fff', '#FFD700'] })
    fire(60,  { x: 0, y: 0.8 })
    fire(120, { x: 1, y: 0.8 })
    setTimeout(() => { fire(80, { x: 0.1, y: 0.7 }); fire(100, { x: 0.9, y: 0.7 }) }, 300)
  }, [])

  return (
    <div className="levelup-overlay">
      <div className="levelup-card">
        <div className="levelup-icon" style={{ background: level.color + '22', border: `3px solid ${level.color}` }}>
          <span>{level.icon}</span>
        </div>
        <p className="levelup-label">NÍVEL CONCLUÍDO</p>
        <h2 className="levelup-title">{level.name}</h2>
        <p className="levelup-sub">Incrível! Você completou todos os módulos.</p>
        <button
          className="btn-levelup-continue"
          style={{ background: level.color, boxShadow: `0 4px 0 ${level.color}99` }}
          onClick={onContinue}
        >
          Continuar 🚀
        </button>
      </div>
    </div>
  )
}
