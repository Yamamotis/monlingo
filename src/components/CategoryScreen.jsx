import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, LEVELS, MODULES } from '../data/lessons'
import FrFlag from './FrFlag'
import MonlingoLogo from './MonlingoLogo'

function AnimatedXP({ value }) {
  const [shown, setShown] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const start = prev.current, end = value
    if (start === end) return
    const t0 = performance.now(), dur = 700
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

function getYesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function getToday() { return new Date().toISOString().slice(0, 10) }

export default function CategoryScreen({
  progress, user,
  onSelectCategory, onOpenProfile, onOpenLeaderboard, onStartReview, onStartDaily, onOpenDictionary,
}) {
  const { completed = [], xp = 0, streak = 0, wrongWords = [], lastStudyDate,
          hearts = 5, dailyMission, isPremium = false } = progress
  const today           = getToday()
  const dailyDone       = dailyMission?.date === today && dailyMission?.completed
  const username     = user?.email?.split('@')[0] ?? ''
  const streakAtRisk = streak > 0 && lastStudyDate === getYesterday()

  return (
    <div className="category-screen">
      <header className="map-header">
        <div className="map-logo">
          <FrFlag size="sm" />
          <MonlingoLogo className="logo-name" />
        </div>
        <div className="header-right">
          <div className="xp-badge">
            <span>⭐</span>
            <AnimatedXP value={xp} />
          </div>
          <div className={`hearts-badge ${isPremium ? 'hearts-premium' : ''}`} title={isPremium ? 'Vidas ilimitadas' : `${hearts}/5 corações`}>
            <span>{isPremium ? '💜' : '❤️'}</span>
            <span className="streak-num">{isPremium ? '∞' : hearts}</span>
          </div>
          <button className="user-avatar-btn" onClick={onOpenProfile} title="Perfil">
            {username[0]?.toUpperCase()}
          </button>
        </div>
      </header>

      {streakAtRisk && (
        <div className="streak-risk-banner">
          🔥 Não perca sua sequência de <strong>{streak} dia{streak !== 1 ? 's' : ''}</strong>! Estude hoje.
        </div>
      )}

      <div className="category-hero">
        <FrFlag size="md" />
        <div>
          <h2 className="banner-title">Aprenda Francês</h2>
          <p className="banner-sub">Escolha uma categoria para continuar</p>
        </div>
      </div>

      <div className="category-list">
        {/* Missão do Dia */}
        <button
          className={`daily-mission-card ${dailyDone ? 'daily-done' : ''} ${!isPremium ? 'daily-locked' : ''}`}
          onClick={isPremium && !dailyDone ? onStartDaily : undefined}
          disabled={!isPremium || dailyDone}
        >
          <div className="daily-icon-wrap">
            <span>{!isPremium ? '🔒' : dailyDone ? '✅' : '🎯'}</span>
          </div>
          <div className="level-body">
            <div className="level-top-row">
              <span className="level-name">Missão do Dia</span>
              {!isPremium
                ? <span className="level-premium-badge">Premium</span>
                : <span className="daily-xp">{dailyDone ? 'Concluída' : '+50 XP'}</span>
              }
            </div>
            <p className="level-sub">
              {!isPremium
                ? 'Exclusivo para assinantes Premium'
                : dailyDone
                  ? 'Volte amanhã para uma nova missão!'
                  : '8 questões · exercício especial diário'}
            </p>
          </div>
          {isPremium && !dailyDone && <span className="level-chevron">›</span>}
        </button>

        {wrongWords.length >= 3 && (
          <button className="review-card" onClick={onStartReview}>
            <div className="review-icon-wrap"><span>🔄</span></div>
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

        {CATEGORIES.map((cat, idx) => {
          const catLevels = LEVELS.filter(l => cat.levelIds.includes(l.id))
          const catMods   = catLevels.flatMap(l => MODULES.filter(m => l.moduleIds.includes(m.id)))
          const total     = catMods.length * 4
          const done      = catMods.reduce((acc, mod) =>
            acc
            + mod.exercises.reduce((a, ex) => a + (completed.includes(ex.id) ? 1 : 0), 0)
            + (completed.includes(mod.evaluation.id) ? 1 : 0), 0)
          const pct      = total > 0 ? (done / total) * 100 : 0
          const finished = total > 0 && done === total

          // Trava sequencial: categoria só abre quando a anterior estiver 100% concluída
          const prevCat      = idx > 0 ? CATEGORIES[idx - 1] : null
          const prevCatMods  = prevCat
            ? LEVELS.filter(l => prevCat.levelIds.includes(l.id))
                    .flatMap(l => MODULES.filter(m => l.moduleIds.includes(m.id)))
            : []
          const prevFinished = !prevCat || prevCatMods.every(m => completed.includes(m.evaluation.id))
          const locked       = !prevFinished

          if (locked) {
            return (
              <div key={cat.id} className="category-card cat-locked">
                <div className="cat-icon-wrap cat-icon-locked">
                  <span className="cat-icon">🔒</span>
                </div>
                <div className="cat-body">
                  <div className="cat-top-row">
                    <span className="cat-name">{cat.name}</span>
                    <span className="level-soon-badge">Bloqueado</span>
                  </div>
                  <p className="cat-subtitle">Conclua {prevCat.name} primeiro</p>
                </div>
              </div>
            )
          }

          return (
            <button
              key={cat.id}
              className={`category-card ${finished ? 'cat-done' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              <div className="cat-icon-wrap" style={{ background: cat.color + '22', border: `2px solid ${cat.color}55` }}>
                <span className="cat-icon">{cat.icon}</span>
              </div>
              <div className="cat-body">
                <div className="cat-top-row">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-progress" style={{ color: finished ? cat.color : undefined }}>
                    {finished ? '✓ Concluído' : `${done}/${total}`}
                  </span>
                </div>
                <p className="cat-subtitle">{cat.subtitle}</p>
                <div className="cat-bar">
                  <div className="cat-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
                </div>
              </div>
              <span className="cat-chevron">›</span>
            </button>
          )
        })}

        {/* Card de Dicionário */}
        <button className="dictionary-card" onClick={onOpenDictionary}>
          <div className="lb-card-icon-wrap" style={{ background: '#1CB0F622', border: '2px solid #1CB0F655' }}>
            <span>📖</span>
          </div>
          <div className="level-body">
            <div className="level-top-row">
              <span className="level-name">Meu Dicionário</span>
              <span className="dict-card-badge">Vocabulário</span>
            </div>
            <p className="level-sub">Todas as palavras que você já aprendeu</p>
          </div>
          <span className="level-chevron">›</span>
        </button>

        {/* Card de Ranking */}
        <button className="leaderboard-card" onClick={onOpenLeaderboard}>
          <div className="lb-card-icon-wrap">
            <span>🏆</span>
          </div>
          <div className="level-body">
            <div className="level-top-row">
              <span className="level-name">Ranking Global</span>
              <span className="lb-card-badge">Top 10</span>
            </div>
            <p className="level-sub">Veja sua posição entre todos os alunos</p>
          </div>
          <span className="level-chevron">›</span>
        </button>
      </div>
    </div>
  )
}
