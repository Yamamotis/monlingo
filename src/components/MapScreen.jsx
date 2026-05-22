import { MODULES } from '../data/lessons'

export default function MapScreen({ level, progress, onStart, onBack }) {
  const { completed } = progress
  const levelModules = MODULES.filter(m => level.moduleIds.includes(m.id))

  const totalItems = levelModules.length * 2
  const doneCount  = levelModules.reduce((acc, mod) =>
    acc
    + (completed.includes(mod.lesson.id)     ? 1 : 0)
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
          const lessonDone  = completed.includes(mod.lesson.id)
          const evalDone    = completed.includes(mod.evaluation.id)
          const evalUnlocked = lessonDone
          const modDone     = lessonDone && evalDone
          const modProgress = (lessonDone ? 1 : 0) + (evalDone ? 1 : 0)

          return (
            <div
              key={mod.id}
              className={`module-card mod-open ${modDone ? 'mod-done' : ''}`}
            >
              <div className="module-top">
                <div className="mod-progress-bar">
                  <div
                    className="mod-progress-fill"
                    style={{ width: `${(modProgress / 2) * 100}%`, background: mod.color }}
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
                      : <span className="badge-count">{modProgress}/2</span>
                    }
                  </div>
                </div>
              </div>

              <div className="module-items">
                <button
                  className={`module-item ${lessonDone ? 'item-done' : 'item-active'}`}
                  onClick={() => onStart(mod, mod.lesson)}
                >
                  <span className="item-icon">📖</span>
                  <div className="item-info">
                    <span className="item-label">Aula</span>
                    <span className="item-title">{mod.lesson.title}</span>
                  </div>
                  <span className="item-status">{lessonDone ? '✓' : '→'}</span>
                  <span className="item-xp">+{mod.lesson.xpReward} XP</span>
                </button>

                <button
                  className={`module-item ${evalDone ? 'item-done' : evalUnlocked ? 'item-active' : 'item-locked'}`}
                  onClick={() => evalUnlocked && onStart(mod, mod.evaluation)}
                  disabled={!evalUnlocked}
                >
                  <span className="item-icon">📝</span>
                  <div className="item-info">
                    <span className="item-label">Avaliação</span>
                    <span className="item-title">
                      {evalDone ? 'Concluída' : evalUnlocked ? 'Disponível' : 'Complete a aula primeiro'}
                    </span>
                  </div>
                  <span className="item-status">{evalDone ? '✓' : evalUnlocked ? '→' : '🔒'}</span>
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
