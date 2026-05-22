import { useState, useEffect, useRef } from 'react'
import { LEVELS, MODULES } from '../data/lessons'
import FrFlag from './FrFlag'
import MonlingoLogo from './MonlingoLogo'

function AnimatedXP({ value }) {
  const [shown, setShown] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const start = prev.current, end = value
    if (start === end) return
    const t0 = performance.now()
    const dur = 700
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(start + (end - start) * e))
      if (p < 1) requestAnimationFrame(tick)
      else prev.current = end
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span className="xp-num">{shown}</span>
}

export default function LevelSelectScreen({ progress, onSelect, user, onLogout, onOpenProfile, onOpenLeaderboard, onStartReview, onOpenRedeem }) {
  const { completed, xp, streak = 0, wrongWords = [], isPremium = false } = progress
  const username = user?.email?.split('@')[0] ?? ''

  return (
    <div className="levels-screen">
      <header className="map-header">
        <div className="map-logo">
          <FrFlag size="sm" />
          <MonlingoLogo className="logo-name" />
        </div>
        <div className="header-right">
          {streak > 0 && (
            <div className="streak-badge">
              <span>🔥</span>
              <span className="streak-num">{streak}</span>
            </div>
          )}
          <div className="xp-badge">
            <span>⭐</span>
            <AnimatedXP value={xp} />
          </div>
          <button className="btn-leaderboard" onClick={onOpenLeaderboard} title="Ranking">
            🏆
          </button>
          <button className="user-avatar-btn" onClick={onOpenProfile} title="Perfil">
            {username[0]?.toUpperCase()}
          </button>
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
        {wrongWords.length >= 3 && (
          <button className="review-card" onClick={onStartReview}>
            <div className="review-icon-wrap">
              <span>🔄</span>
            </div>
            <div className="level-body">
              <div className="level-top-row">
                <span className="level-name">Revisão Rápida</span>
                <span className="review-count">{wrongWords.length}</span>
              </div>
              <p className="level-sub">Pratique as palavras que você errou</p>
            </div>
            <span className="level-chevron">›</span>
          </button>
        )}
        {LEVELS.map((level, idx) => {
          const noContent    = level.moduleIds.length === 0
          const needsPremium = level.premium && !isPremium
          const prevLevel    = idx > 0 ? LEVELS[idx - 1] : null
          const prevMods     = prevLevel ? MODULES.filter(m => prevLevel.moduleIds.includes(m.id)) : []
          const prevDone     = !prevLevel || prevMods.every(m => completed.includes(m.evaluation.id))
          const locked       = noContent || (!needsPremium && !prevDone)

          const mods   = MODULES.filter(m => level.moduleIds.includes(m.id))
          const total  = mods.length * 4
          const done   = mods.reduce((acc, mod) =>
            acc
            + mod.exercises.reduce((a, ex) => a + (completed.includes(ex.id) ? 1 : 0), 0)
            + (completed.includes(mod.evaluation.id) ? 1 : 0), 0)
          const pct      = total > 0 ? (done / total) * 100 : 0
          const finished = total > 0 && done === total

          if (needsPremium) {
            return (
              <button
                key={level.id}
                className="level-card level-premium-locked"
                onClick={onOpenRedeem}
              >
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
                    ? <span className="level-soon-badge">{noContent ? 'Em breve' : 'Bloqueado'}</span>
                    : <span className="level-progress-text" style={{ color: finished ? level.color : undefined }}>
                        {finished ? '✓ Concluído' : `${done}/${total}`}
                      </span>
                  }
                </div>
                <p className="level-sub">
                  {locked && !noContent
                    ? `Conclua ${prevLevel.name} primeiro`
                    : level.subtitle}
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
