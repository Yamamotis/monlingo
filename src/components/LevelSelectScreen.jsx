import { LEVELS, MODULES } from '../data/lessons'

export default function LevelSelectScreen({ category, progress, onSelect, onBack, onOpenRedeem }) {
  const { completed = [], isPremium = false } = progress
  const categoryLevels = LEVELS.filter(l => category.levelIds.includes(l.id))

  return (
    <div className="levels-screen">
      <header className="level-header">
        <button className="btn-back-level" onClick={onBack}>‹ Categorias</button>
        <div className="header-right" style={{ marginLeft: 'auto' }}>
          <div className="xp-badge" style={{ background: category.color + '20', borderColor: category.color + '66', color: category.color }}>
            <span>{category.icon}</span>
            <span className="xp-num">{category.name}</span>
          </div>
        </div>
      </header>

      <div className="map-banner" style={{ background: `linear-gradient(135deg, ${category.color}33, ${category.color}11)` }}>
        <span style={{ fontSize: 36 }}>{category.icon}</span>
        <div>
          <h2 className="banner-title">{category.name}</h2>
          <p className="banner-sub">{category.subtitle}</p>
        </div>
      </div>

      <div className="levels-list">
        {categoryLevels.map((level, idx) => {
          const noContent    = level.moduleIds.length === 0
          const needsPremium = level.premium && !isPremium

          // Sequential lock: check previous level in THIS category
          const prevLevel = idx > 0 ? categoryLevels[idx - 1] : null
          const prevMods  = prevLevel ? MODULES.filter(m => prevLevel.moduleIds.includes(m.id)) : []
          const prevDone  = !prevLevel || prevMods.every(m => completed.includes(m.evaluation.id))
          const locked    = noContent || (!needsPremium && !prevDone)

          const mods     = MODULES.filter(m => level.moduleIds.includes(m.id))
          const total    = mods.length * 4
          const done     = mods.reduce((acc, mod) =>
            acc
            + mod.exercises.reduce((a, ex) => a + (completed.includes(ex.id) ? 1 : 0), 0)
            + (completed.includes(mod.evaluation.id) ? 1 : 0), 0)
          const pct      = total > 0 ? (done / total) * 100 : 0
          const finished = total > 0 && done === total

          if (needsPremium) {
            return (
              <button key={level.id} className="level-card level-premium-locked" onClick={onOpenRedeem}>
                <div className="level-icon-wrap level-icon-premium">
                  <span className="level-icon">💎</span>
                </div>
                <div className="level-body">
                  <div className="level-top-row">
                    <span className="level-name">{level.name}</span>
                    <span className="level-premium-badge">Premium</span>
                  </div>
                  <p className="level-sub">{level.subtitle}</p>
                </div>
                <span className="level-chevron">›</span>
              </button>
            )
          }

          return (
            <button
              key={level.id}
              className={`level-card ${locked ? 'level-locked' : 'level-open'} ${finished ? 'level-done' : ''}`}
              onClick={() => !locked && onSelect(level)}
              disabled={locked}
            >
              <div className="level-icon-wrap" style={!locked ? { background: level.color + '20', border: `2px solid ${level.color}55` } : {}}>
                <span className="level-icon">{locked ? '🔒' : level.icon}</span>
              </div>
              <div className="level-body">
                <div className="level-top-row">
                  <span className="level-name">{level.name}</span>
                  {locked
                    ? <span className="level-soon-badge">{noContent ? 'Em breve' : 'Bloqueado'}</span>
                    : <span className="level-progress-text" style={{ color: finished ? level.color : undefined }}>
                        {finished ? '✓ Concluído' : `${done}/${total}`}
                      </span>
                  }
                </div>
                <p className="level-sub">
                  {locked && !noContent ? `Conclua ${prevLevel.name} primeiro` : level.subtitle}
                </p>
                {!locked && (
                  <div className="level-bar">
                    <div className="level-bar-fill" style={{ width: `${pct}%`, background: level.color }} />
                  </div>
                )}
              </div>
              {!locked && <span className="level-chevron">›</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
