import { LEVELS, MODULES } from '../data/lessons'
import FrFlag from './FrFlag'

export default function LevelSelectScreen({ progress, onSelect, user, onLogout }) {
  const { completed, xp } = progress
  const username = user?.email?.split('@')[0] ?? ''

  return (
    <div className="levels-screen">
      <header className="map-header">
        <div className="map-logo">
          <FrFlag size="sm" />
          <span className="logo-name">Monlingo</span>
        </div>
        <div className="header-right">
          <div className="xp-badge">
            <span>⭐</span>
            <span className="xp-num">{xp} XP</span>
          </div>
          <div className="user-pill">
            <span className="user-name" title={user?.email}>{username}</span>
            <button className="btn-logout" onClick={onLogout} title="Sair">↩</button>
          </div>
        </div>
      </header>

      <div className="map-banner">
        <FrFlag size="md" />
        <div>
          <h2 className="banner-title">Aprenda Francês</h2>
          <p className="banner-sub">Escolha um nível para continuar</p>
        </div>
      </div>

      <div className="levels-list">
        {LEVELS.map(level => {
          const locked = level.moduleIds.length === 0
          const mods = MODULES.filter(m => level.moduleIds.includes(m.id))
          const total = mods.length * 2
          const done  = mods.reduce((acc, mod) =>
            acc
            + (completed.includes(mod.lesson.id)      ? 1 : 0)
            + (completed.includes(mod.evaluation.id)  ? 1 : 0), 0)
          const pct = total > 0 ? (done / total) * 100 : 0
          const finished = total > 0 && done === total

          return (
            <button
              key={level.id}
              className={`level-card ${locked ? 'level-locked' : 'level-open'} ${finished ? 'level-done' : ''}`}
              onClick={() => !locked && onSelect(level)}
              disabled={locked}
            >
              <div
                className="level-icon-wrap"
                style={!locked ? { background: level.color + '20', border: `2px solid ${level.color}55` } : {}}
              >
                <span className="level-icon">{locked ? '🔒' : level.icon}</span>
              </div>

              <div className="level-body">
                <div className="level-top-row">
                  <span className="level-name">{level.name}</span>
                  {locked
                    ? <span className="level-soon-badge">Em breve</span>
                    : <span className="level-progress-text" style={{ color: finished ? level.color : undefined }}>
                        {finished ? '✓ Concluído' : `${done}/${total}`}
                      </span>
                  }
                </div>
                <p className="level-sub">{level.subtitle}</p>
                {!locked && (
                  <div className="level-bar">
                    <div
                      className="level-bar-fill"
                      style={{ width: `${pct}%`, background: level.color }}
                    />
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
