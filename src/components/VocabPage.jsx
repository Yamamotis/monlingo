import SpeakButton from './SpeakButton'
import { useState } from 'react'

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
          <p className="vocab-subtitle">Leia com atenção antes de começar os exercícios</p>
        </div>

        <div className="vocab-table">
          {item.vocabulary.map((v, i) => (
            <div key={i} className="vocab-row">
              <div className="vocab-left">
                <span className="vocab-num">{i + 1}</span>
                <span className="vocab-fr">{v.fr}</span>
                <SpeakButton text={v.fr} size="sm" />
              </div>
              <span className="vocab-arrow">→</span>
              <div className="vocab-right">
                <span className="vocab-pt">{v.pt}</span>
                {v.sentence && <span className="vocab-sentence">"{v.sentence}"</span>}
                {v.note && <span className="vocab-note">💡 {v.note}</span>}
              </div>
            </div>
          ))}
        </div>

        {item.grammarNote && (
          <div className="grammar-note">
            <span className="grammar-note-icon">📌</span>
            <p className="grammar-note-text">{item.grammarNote}</p>
          </div>
        )}

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
