import { useState, useMemo, useCallback } from 'react'
import { MODULES } from '../data/lessons'
import SpeakButton from './SpeakButton'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardScreen({ progress, onBack }) {
  const { completed = [] } = progress

  const allCards = useMemo(() => {
    const items = []
    for (const mod of MODULES) {
      if (!completed.includes(mod.exercises[0]?.id)) continue
      for (const v of mod.vocab.vocabulary) {
        items.push({ fr: v.fr, pt: v.pt, note: v.note, modTitle: mod.title, modColor: mod.color, modIcon: mod.icon })
      }
    }
    return items
  }, [completed])

  const [deck,    setDeck]    = useState(() => shuffle(allCards))
  const [idx,     setIdx]     = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = deck[idx]
  const total = deck.length

  const go = useCallback((dir) => {
    setFlipped(false)
    setTimeout(() => setIdx(i => Math.max(0, Math.min(total - 1, i + dir))), 150)
  }, [total])

  const reshuffle = () => {
    setDeck(shuffle(allCards))
    setIdx(0)
    setFlipped(false)
  }

  if (!total) {
    return (
      <div className="flashcard-screen">
        <header className="player-header">
          <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
          <span className="profile-header-title">Flashcards</span>
        </header>
        <div className="flashcard-empty">
          <p>Complete alguns exercícios primeiro para liberar o vocabulário.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flashcard-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">Flashcards</span>
        <span className="fc-counter">{idx + 1} / {total}</span>
      </header>

      <div className="flashcard-body">
        <p className="fc-hint">{flipped ? 'Tradução' : 'Toque para ver a tradução'}</p>

        <div className="fc-wrap" onClick={() => setFlipped(f => !f)}>
          <div className={`fc-card ${flipped ? 'fc-flipped' : ''}`}>
            {/* Front — French */}
            <div className="fc-face fc-front" style={{ borderColor: card.modColor + '66' }}>
              <span className="fc-mod-tag" style={{ color: card.modColor }}>
                {card.modIcon} {card.modTitle}
              </span>
              <p className="fc-word">{card.fr}</p>
              <div onClick={e => e.stopPropagation()}>
                <SpeakButton text={card.fr} size="md" />
              </div>
            </div>
            {/* Back — Portuguese */}
            <div className="fc-face fc-back" style={{ borderColor: card.modColor + '66' }}>
              <span className="fc-mod-tag" style={{ color: card.modColor }}>
                {card.modIcon} {card.modTitle}
              </span>
              <p className="fc-word fc-pt">{card.pt}</p>
              {card.note && <p className="fc-note">💡 {card.note}</p>}
            </div>
          </div>
        </div>

        <div className="fc-controls">
          <button
            className="fc-btn fc-prev"
            onClick={() => go(-1)}
            disabled={idx === 0}
          >‹ Anterior</button>

          <button className="fc-btn fc-shuffle" onClick={reshuffle} title="Embaralhar">
            🔀
          </button>

          <button
            className="fc-btn fc-next"
            onClick={() => go(1)}
            disabled={idx === total - 1}
          >Próximo ›</button>
        </div>

        <div className="fc-progress">
          <div className="fc-progress-fill" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
