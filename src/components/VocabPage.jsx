import SpeakButton from './SpeakButton'

export default function VocabPage({ mod, item, onContinue, onExit }) {
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
            Leia com atenção antes de começar os exercícios
          </p>
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
                {v.note && <span className="vocab-note">💡 {v.note}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="vocab-cta">
          <p className="vocab-cta-info">
            3 exercícios • 10 questões cada
          </p>
          <button className="btn-proceed" onClick={onContinue}>
            Prosseguir para os exercícios →
          </button>
        </div>
      </div>
    </div>
  )
}
