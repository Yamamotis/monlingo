import { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'

async function share(item, mod, xp) {
  const type = item.type === 'evaluation' ? 'avaliação' : 'aula'
  const text = `Completei a ${type} "${mod.title}" no Monlingo! +${xp} XP 🇫🇷`
  const url  = 'https://monlingo.vercel.app'
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Monlingo', text, url })
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`)
      return 'copied'
    }
  } catch { /* cancelled */ }
}

// Cubic ease-out para o contador
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

export default function CompletionScreen({ result, onContinue }) {
  const { item, module: mod, xp, alreadyDone, accuracy = 100 } = result

  // Cor e label da precisão
  const accColor  = accuracy >= 90 ? '#58CC02' : accuracy >= 70 ? '#1CB0F6' : accuracy >= 50 ? '#FFC800' : '#FF4B4B'
  const accEmoji  = accuracy >= 90 ? '🌟' : accuracy >= 70 ? '👍' : accuracy >= 50 ? '😅' : '💪'
  const isEval = item.type === 'evaluation'
  const [copied,    setCopied]    = useState(false)
  const [displayXP, setDisplayXP] = useState(0)
  const animRef = useRef(null)

  // ── Confetti ────────────────────────────────────────
  useEffect(() => {
    const colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#ffffff']

    confetti({
      particleCount: isEval ? 130 : 90,
      spread: isEval ? 85 : 65,
      origin: { y: 0.58 },
      colors,
      gravity: 0.85,
      scalar: 1.1,
    })

    if (isEval) {
      // Rajadas laterais extras para avaliação
      setTimeout(() => {
        confetti({ particleCount: 55, angle: 60,  spread: 55, origin: { x: 0,   y: 0.65 }, colors: ['#FFD700','#FFA500','#58CC02'] })
        confetti({ particleCount: 55, angle: 120, spread: 55, origin: { x: 1,   y: 0.65 }, colors: ['#FFD700','#FFA500','#58CC02'] })
      }, 380)
    }
  }, [])

  // ── XP animado ──────────────────────────────────────
  useEffect(() => {
    if (!xp || alreadyDone) return
    const DURATION = 1300
    const start    = performance.now()

    const tick = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / DURATION, 1)
      setDisplayXP(Math.round(xp * easeOut(progress)))
      if (progress < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [xp, alreadyDone])

  const handleShare = async () => {
    const res = await share(item, mod, xp)
    if (res === 'copied') { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

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

        {alreadyDone ? (
          <div className="xp-gained xp-already-done">
            <span className="xp-star">🔄</span>
            <span className="xp-amount xp-zero">Revisão — XP já contabilizado</span>
          </div>
        ) : (
          <div className="xp-gained xp-animated">
            <span className="xp-star">⭐</span>
            <span className="xp-amount">+{displayXP} XP</span>
          </div>
        )}

        <div className="completion-stats">
          <div className="stat-box">
            <span className="stat-label">Tipo</span>
            <span className="stat-value">{isEval ? 'Avaliação' : 'Aula'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">XP ganho</span>
            <span className="stat-value">{xp}</span>
          </div>
          <div className="stat-box stat-accuracy">
            <span className="stat-label">Precisão</span>
            <span className="stat-value stat-acc-value" style={{ color: accColor }}>
              {accEmoji} {accuracy}%
            </span>
          </div>
        </div>

        <button className="btn-complete" onClick={onContinue}>Continuar</button>

        <button className="btn-share-completion" onClick={handleShare}>
          {copied ? '✓ Copiado!' : '📤 Compartilhar progresso'}
        </button>
      </div>
    </div>
  )
}
