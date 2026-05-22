import { useState } from 'react'
import FrFlag from './FrFlag'

const STEPS = [
  {
    visual:  null, // usa FrFlag
    title:   'Bem-vindo ao Monlingo!',
    desc:    'Aprenda francês do zero com vocabulário, exercícios interativos e pronúncia nativa.',
    color:   '#58CC02',
    bg:      '#0d2a10',
  },
  {
    visual:  ['📖', '🎧', '📝'],
    title:   'Como funciona',
    desc:    'Cada módulo tem: uma aula de vocabulário, 3 exercícios (tradução, escrita e escuta) e uma avaliação final.',
    color:   '#1CB0F6',
    bg:      '#0a1e30',
  },
  {
    visual:  ['🔥', '⭐', '🏅'],
    title:   'Mantenha o Ritmo',
    desc:    'Estude todos os dias para manter seu streak, acumular XP e desbloquear conquistas exclusivas.',
    color:   '#FF9600',
    bg:      '#2d1a00',
  },
  {
    visual:  '🚀',
    title:   'Pronto para começar?',
    desc:    '25 módulos te esperam — do vocabulário essencial ao nível intermediário. Vamos lá!',
    color:   '#CE82FF',
    bg:      '#1a0d2a',
    isLast:  true,
  },
]

export default function OnboardingScreen({ onDone, onStartPlacement }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast  = current.isLast

  const next = () => isLast ? onDone() : setStep(s => s + 1)

  return (
    <div className="onboard-screen">
      {!isLast && (
        <button className="onboard-skip" onClick={onDone}>Pular</button>
      )}

      <div key={step} className="onboard-content">
        <div className="onboard-icon-wrap" style={{ background: current.bg, border: `2px solid ${current.color}44` }}>
          {!current.visual ? (
            <FrFlag size="lg" />
          ) : Array.isArray(current.visual) ? (
            <div className="onboard-icon-row">
              {current.visual.map((e, i) => <span key={i}>{e}</span>)}
            </div>
          ) : (
            <span className="onboard-emoji">{current.visual}</span>
          )}
        </div>

        <h1 className="onboard-title">{current.title}</h1>
        <p className="onboard-desc">{current.desc}</p>
      </div>

      <div className="onboard-footer">
        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboard-dot ${i === step ? 'dot-active' : ''} ${i < step ? 'dot-done' : ''}`}
              style={i === step ? { background: current.color } : {}}
            />
          ))}
        </div>
        {isLast ? (
          <div className="onboard-last-actions">
            <button
              className="btn-onboard-next"
              style={{ background: current.color, boxShadow: `0 4px 0 ${current.color}88` }}
              onClick={onDone}
            >
              Começar do zero 🌱
            </button>
            <button className="btn-onboard-placement" onClick={onStartPlacement}>
              🎯 Fazer teste de nivelamento
            </button>
          </div>
        ) : (
          <button
            className="btn-onboard-next"
            style={{ background: current.color, boxShadow: `0 4px 0 ${current.color}88` }}
            onClick={next}
          >
            Próximo →
          </button>
        )}
      </div>
    </div>
  )
}
