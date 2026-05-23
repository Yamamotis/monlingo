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

// ── SRS: unknown → volta em 2 | hard → em 5 | easy 2x → dominado ─────────────
function applyRating(deck, rating) {
  if (!deck.length) return deck
  const [card, ...rest] = deck
  const updated = { ...card, seen: (card.seen ?? 0) + 1 }

  if (rating === 'unknown') {
    const pos = Math.min(2, rest.length)
    return [...rest.slice(0, pos), updated, ...rest.slice(pos)]
  }
  if (rating === 'hard') {
    const pos = Math.min(5, rest.length)
    return [...rest.slice(0, pos), updated, ...rest.slice(pos)]
  }
  // easy: remove após 2x
  updated.easyCount = (card.easyCount ?? 0) + 1
  if (updated.easyCount >= 2) return rest
  return [...rest, updated]
}

export default function FlashcardScreen({ progress, onBack }) {
  const { completed = [] } = progress

  const allCards = useMemo(() => {
    const items = []
    for (const mod of MODULES) {
      if (!completed.includes(mod.exercises[0]?.id)) continue
      for (const v of mod.vocab.vocabulary) {
        items.push({ fr: v.fr, pt: v.pt, note: v.note, modTitle: mod.title, modColor: mod.color, modIcon: mod.icon, seen: 0, easyCount: 0 })
      }
    }
    return items
  }, [completed])

  const totalCards = allCards.length

  const [deck,     setDeck]     = useState(() => shuffle(allCards))
  const [flipped,  setFlipped]  = useState(false)
  const [mastered, setMastered] = useState(0)
  const [stats,    setStats]    = useState({ easy: 0, hard: 0, unknown: 0 })
  const [showDone, setShowDone] = useState(false)

  const card = deck[0]

  const grade = useCallback((rating) => {
    setStats(s => ({ ...s, [rating]: s[rating] + 1 }))
    const next = applyRating(deck, rating)
    if (rating === 'easy' && next.length < deck.length) setMastered(m => m + 1)
    setDeck(next)
    setFlipped(false)
    if (!next.length) setShowDone(true)
  }, [deck])

  const restart = () => {
    setDeck(shuffle(allCards))
    setFlipped(false)
    setMastered(0)
    setStats({ easy: 0, hard: 0, unknown: 0 })
    setShowDone(false)
  }

  if (!totalCards) {
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

  if (showDone) {
    return (
      <div className="flashcard-screen">
        <header className="player-header">
          <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
          <span className="profile-header-title">Flashcards</span>
        </header>
        <div className="fc-done-screen">
          <div className="fc-done-icon">🎉</div>
          <h2 className="fc-done-title">Sessão concluída!</h2>
          <p className="fc-done-sub">Você revisou {totalCards} palavras</p>
          <div className="fc-done-stats">
            <div className="fc-done-stat fc-easy-stat">
              <span className="fc-done-num">{stats.easy}</span>
              <span className="fc-done-label">Fácil 😊</span>
            </div>
            <div className="fc-done-stat fc-hard-stat">
              <span className="fc-done-num">{stats.hard}</span>
              <span className="fc-done-label">Difícil 😐</span>
            </div>
            <div className="fc-done-stat fc-unk-stat">
              <span className="fc-done-num">{stats.unknown}</span>
              <span className="fc-done-label">Não sei 😕</span>
            </div>
          </div>
          <button className="btn-retry" onClick={restart}>Reiniciar 🔀</button>
          <button className="btn-exit-soft" onClick={onBack}>Voltar</button>
        </div>
      </div>
    )
  }

  const pct = totalCards > 0 ? (mastered / totalCards) * 100 : 0

  return (
    <div className="flashcard-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">Flashcards</span>
        <span className="fc-counter">{mastered} / {totalCards} ✓</span>
      </header>

      <div className="flashcard-body">
        <p className="fc-hint">
          {flipped ? '👆 Como você foi com essa palavra?' : 'Toque no cartão para ver a tradução'}
        </p>

        <div className="fc-wrap" onClick={() => !flipped && setFlipped(true)}>
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

        {/* SRS buttons — aparecem após flip */}
        {flipped ? (
          <div className="srs-buttons">
            <button className="srs-btn srs-unknown" onClick={() => grade('unknown')}>
              <span className="srs-icon">😕</span>
              <span className="srs-label">Não sei</span>
            </button>
            <button className="srs-btn srs-hard" onClick={() => grade('hard')}>
              <span className="srs-icon">😐</span>
              <span className="srs-label">Difícil</span>
            </button>
            <button className="srs-btn srs-easy" onClick={() => grade('easy')}>
              <span className="srs-icon">😊</span>
              <span className="srs-label">Fácil</span>
            </button>
          </div>
        ) : (
          <div className="fc-controls">
            <span className="fc-remaining">{deck.length} cartas restantes</span>
            <button className="fc-btn fc-shuffle" onClick={restart} title="Reiniciar">
              🔀 Reiniciar
            </button>
          </div>
        )}

        <div className="fc-progress">
          <div className="fc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
