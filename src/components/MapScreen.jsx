import { MODULES } from '../data/lessons'

const EX_ICONS = ['✏️', '🔄', '🎧']

export default function MapScreen({ level, progress, onStart, onBack }) {
  const { completed } = progress
  const levelModules  = MODULES.filter(m => level.moduleIds.includes(m.id))

  const totalItems = levelModules.length * 4
  const doneCount  = levelModules.reduce((acc, mod) =>
    acc
    + mod.exercises.reduce((a, ex) => a + (completed.includes(ex.id) ? 1 : 0), 0)
    + (completed.includes(mod.evaluation.id) ? 1 : 0), 0)

  return (
    <div className="map-screen">
      <header className="level-header">
        <button className="btn-back-level" onClick={onBack}>‹ Níveis</button>
        <div className="header-right" style={{ marginLeft: 'auto' }}>
          <div
            className="xp-badge"
            style={{ background: level.color + '20', borderColor: level.color + '66', color: level.color }}
          >
            <span>{level.icon}</span>
            <span className="xp-num">{level.name}</span>
          </div>
        </div>
      </header>

      <div className="map-banner" style={{ background: `linear-gradient(135deg, ${level.color}33, ${level.color}11)` }}>
        <span style={{ fontSize: 36 }}>{level.icon}</span>
        <div>
          <h2 className="banner-title">{level.name}</h2>
          <p className="banner-sub">{doneCount} de {totalItems} itens concluídos</p>
        </div>
      </div>

      <div className="modules-list">
        {levelModules.map((mod) => {
          const ex1Done  = completed.includes(mod.exercises[0].id)
          const ex2Done  = completed.includes(mod.exercises[1].id)
          const ex3Done  = completed.includes(mod.exercises[2].id)
          const evalDone = completed.includes(mod.evaluation.id)
          const modProgress = [ex1Done, ex2Done, ex3Done, evalDone].filter(Boolean).length
          const modDone = modProgress === 4

          return (
            <div key={mod.id} className={`module-card mod-open ${modDone ? 'mod-done' : ''}`}>
              <div className="module-top">
                <div className="mod-progress-bar">
                  <div
                    className="mod-progress-fill"
                    style={{ width: `${(modProgress / 4) * 100}%`, background: mod.color }}
                  />
                </div>
                <div className="module-header">
                  <div
                    className="mod-icon-wrap"
                    style={{ background: mod.color + '22', border: `2px solid ${mod.color}` }}
                  >
                    <span className="mod-icon">{mod.icon}</span>
                  </div>
                  <div className="mod-meta">
                    <span className="mod-number">Módulo {mod.number}</span>
                    <h3 className="mod-title">{mod.title}</h3>
                    <p className="mod-desc">{mod.description}</p>
                  </div>
                  <div className="mod-badge">
                    {modDone
                      ? <span className="badge-done">✓</span>
                      : <span className="badge-count">{modProgress}/4</span>
                    }
                  </div>
                </div>
              </div>

              <div className="module-items">
                {/* Vocabulário — sempre acessível, 0 XP */}
                <button
                  className="module-item item-vocab"
                  onClick={() => onStart(mod, mod.vocab)}
                >
                  <span className="item-icon">📖</span>
                  <div className="item-info">
                    <span className="item-label">Vocabulário</span>
                    <span className="item-title">{mod.title}</span>
                  </div>
                  <span className="item-status">→</span>
                  <span className="item-xp item-xp-free">Estudo</span>
                </button>

                {/* 3 Exercícios */}
                {mod.exercises.map((ex, i) => {
                  const prevDone = i === 0 ? true : completed.includes(mod.exercises[i - 1].id)
                  const thisDone = completed.includes(ex.id)
                  return (
                    <button
                      key={ex.id}
                      className={`module-item ${thisDone ? 'item-done' : prevDone ? 'item-active' : 'item-locked'}`}
                      onClick={() => prevDone && onStart(mod, ex)}
                      disabled={!prevDone}
                    >
                      <span className="item-icon">{EX_ICONS[i]}</span>
                      <div className="item-info">
                        <span className="item-label">{ex.title}</span>
                        <span className="item-title">{ex.subtitle}</span>
                      </div>
                      <span className="item-status">{thisDone ? '✓' : prevDone ? '→' : '🔒'}</span>
                      <span className="item-xp">+{ex.xpReward} XP</span>
                    </button>
                  )
                })}

                {/* Avaliação */}
                <button
                  className={`module-item ${evalDone ? 'item-done' : ex3Done ? 'item-active' : 'item-locked'}`}
                  onClick={() => ex3Done && onStart(mod, mod.evaluation)}
                  disabled={!ex3Done}
                >
                  <span className="item-icon">📝</span>
                  <div className="item-info">
                    <span className="item-label">Avaliação</span>
                    <span className="item-title">
                      {evalDone ? 'Concluída' : ex3Done ? 'Disponível' : 'Complete os exercícios primeiro'}
                    </span>
                  </div>
                  <span className="item-status">{evalDone ? '✓' : ex3Done ? '→' : '🔒'}</span>
                  <span className="item-xp">+{mod.evaluation.xpReward} XP</span>
                </button>
              </div>
            </div>
          )
        })}

        <div className="map-footer">
          <span>🎉</span>
          <p>Fim do nível {level.name}!</p>
        </div>
      </div>
    </div>
  )
}
