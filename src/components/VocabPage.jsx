import { useState } from 'react'
import SpeakButton from './SpeakButton'

function ConjugationTable({ table }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="conj-table">
      <button className="conj-toggle" onClick={() => setOpen(o => !o)}>
        <span>📋 {table.verb}</span>
        <span className="conj-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="conj-rows">
          {table.rows.map(r => (
            <div key={r.pr} className="conj-row">
              <span className="conj-pr">{r.pr}</span>
              <span className="conj-form">{r.form}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VocabPage({ mod, item, onContinue, onExit }) {
  const exerciseCount = mod.exercises?.length ?? 4
  const [flipped, setFlipped] = useState(new Set())

  const toggleFlip = (i) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  return (
    <div className="vocab-page">
      <header className="player-header">
        <button className="btn-close" onClick={onExit}>✕</button>
        <div className="vocab-header-label">
          <span>{mod.icon}</span>
          <span>Módulo {mod.number} — {mod.title}</span>
        </div>
      </header>

      <div className="vocab-body">
        <div className="vocab-intro">
          <h2 className="vocab-title">📚 Vocabulário</h2>
          <p className="vocab-subtitle">
            Toque nos cartões para ver a tradução
          </p>
        </div>

        {/* Flip card grid */}
        <div className="vocab-flip-grid">
          {item.vocabulary.map((v, i) => (
            <div
              key={i}
              className={`vocab-flip-card ${flipped.has(i) ? 'flipped' : ''}`}
              onClick={() => toggleFlip(i)}
            >
              <div className="vocab-flip-inner">
                {/* Front — FR */}
                <div className="vocab-flip-front">
                  <span className="vf-num">{i + 1}</span>
                  <span className="vf-fr">{v.fr}</span>
                  <div
                    className="vf-speak"
                    onClick={e => e.stopPropagation()}
                  >
                    <SpeakButton text={v.fr} size="sm" />
                  </div>
                  <span className="vf-tap-hint">toque ↩</span>
                </div>
                {/* Back — PT */}
                <div className="vocab-flip-back">
                  <span className="vf-pt">{v.pt}</span>
                  {v.sentence && <span className="vf-sentence">«{v.sentence}»</span>}
                  {v.note && <span className="vf-note">💡 {v.note}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grammar note */}
        {item.grammarNote && (
          <div className="grammar-note">
            <span className="grammar-note-icon">📌</span>
            <p className="grammar-note-text">{item.grammarNote}</p>
          </div>
        )}

        {/* Conjugation tables */}
        {item.conjugation?.length > 0 && (
          <div className="conjugation-section">
            <p className="conjugation-title">🔤 Tabelas de Conjugação</p>
            {item.conjugation.map((t, i) => (
              <ConjugationTable key={i} table={t} />
            ))}
          </div>
        )}

        <div className="vocab-cta">
          <p className="vocab-cta-info">
            {exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''} • 10 questões cada
          </p>
          <button className="btn-proceed" onClick={onContinue}>
            Prosseguir para os exercícios →
          </button>
        </div>
      </div>
    </div>
  )
}
