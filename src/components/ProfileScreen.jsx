import { useState } from 'react'
import { MODULES } from '../data/lessons'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements'
import { getRank, getNextRank } from '../data/ranks'

// ── Gráfico de atividade semanal ─────────────────────────────────────────────
function WeeklyChart({ dailyXP = {} }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const label = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]
    days.push({ key, label, xp: dailyXP[key] ?? 0, isToday: i === 0 })
  }

  const maxXP   = Math.max(...days.map(d => d.xp), 1)
  const totalWk = days.reduce((s, d) => s + d.xp, 0)
  const activeDays = days.filter(d => d.xp > 0).length

  return (
    <div className="weekly-chart">
      <div className="weekly-chart-header">
        <span className="weekly-chart-title">Atividade — 7 dias</span>
        <span className="weekly-chart-total">⭐ {totalWk} XP esta semana</span>
      </div>

      <div className="weekly-bars">
        {days.map((day, idx) => {
          const pct = (day.xp / maxXP) * 100
          return (
            <div key={day.key} className="weekly-bar-col">
              {day.xp > 0 && (
                <span className="weekly-bar-xp">{day.xp}</span>
              )}
              <div className="weekly-bar-track">
                <div
                  className={`weekly-bar-fill ${day.isToday ? 'bar-today' : ''} ${day.xp > 0 ? 'bar-active' : ''}`}
                  style={{
                    height: `${pct}%`,
                    animationDelay: `${idx * 60}ms`,
                  }}
                />
              </div>
              <span className={`weekly-bar-label ${day.isToday ? 'label-today' : ''}`}>
                {day.label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="weekly-chart-sub">
        {activeDays === 0
          ? 'Complete uma lição para aparecer aqui!'
          : `${activeDays} dia${activeDays !== 1 ? 's' : ''} ativo${activeDays !== 1 ? 's' : ''} nesta semana`}
      </p>
    </div>
  )
}

// ── Tela de Perfil ────────────────────────────────────────────────────────────
export default function ProfileScreen({ progress, user, isAdmin, onBack, onLogout, onOpenRedeem, onOpenAdmin, onOpenSettings, onSaveNickname }) {
  const { completed = [], xp = 0, streak = 0, achievements: earned = [], isPremium = false, dailyXP = {}, nickname = '' } = progress
  const rank     = getRank(xp)
  const nextRank = getNextRank(xp)
  const pctToNext = nextRank
    ? Math.round(((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100
  const [achFilter,    setAchFilter]    = useState('all')
  const [editingName,  setEditingName]  = useState(false)
  const [nameInput,    setNameInput]    = useState(nickname)

  const vocabDone  = completed.filter(id => id.endsWith('-vocab')).length
  const evalsDone  = completed.filter(id => id.endsWith('-eval')).length
  const totalMods  = MODULES.length
  const pct        = Math.round((evalsDone / totalMods) * 100)

  const initial  = user.email[0].toUpperCase()
  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="profile-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">Perfil</span>
      </header>

      <div className="profile-body">
        <div className="profile-avatar">{initial}</div>

        {/* Como quer ser chamado */}
        <div className="profile-nickname-wrap">
          {editingName ? (
            <div className="profile-nickname-edit">
              <input
                className="profile-nickname-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Como quer ser chamado?"
                maxLength={24}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') { onSaveNickname?.(nameInput); setEditingName(false) }
                  if (e.key === 'Escape') setEditingName(false)
                }}
              />
              <button className="profile-nickname-save" onClick={() => { onSaveNickname?.(nameInput); setEditingName(false) }}>
                Salvar
              </button>
              <button className="profile-nickname-cancel" onClick={() => { setNameInput(nickname); setEditingName(false) }}>
                ✕
              </button>
            </div>
          ) : (
            <button className="profile-nickname-btn" onClick={() => setEditingName(true)}>
              <span className="profile-nickname-text">
                {nickname || <span className="profile-nickname-placeholder">Como quer ser chamado?</span>}
              </span>
              <span className="profile-nickname-edit-icon">✏️</span>
            </button>
          )}
        </div>

        <p className="profile-email">{user.email}</p>
        {joinDate && <p className="profile-since">Estudando desde {joinDate}</p>}

        {/* ── Rank badge ── */}
        <div className="profile-rank-wrap">
          <div className="profile-rank-badge" style={{ borderColor: rank.color + '88', background: rank.color + '18' }}>
            <span className="profile-rank-icon">{rank.icon}</span>
            <span className="profile-rank-label" style={{ color: rank.color }}>{rank.label}</span>
          </div>
          {nextRank ? (
            <div className="profile-rank-progress">
              <div className="profile-rank-bar">
                <div
                  className="profile-rank-bar-fill"
                  style={{ width: `${pctToNext}%`, background: rank.color }}
                />
              </div>
              <span className="profile-rank-hint">
                {xp} / {nextRank.minXP} XP → {nextRank.icon} {nextRank.label}
              </span>
            </div>
          ) : (
            <span className="profile-rank-max">🏆 Rank máximo!</span>
          )}
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat flame">
            <span className="pstat-icon">🔥</span>
            <span className="pstat-num">{streak}</span>
            <span className="pstat-label">Dias seguidos</span>
          </div>
          <div className="profile-stat gold">
            <span className="pstat-icon">⭐</span>
            <span className="pstat-num">{xp}</span>
            <span className="pstat-label">XP Total</span>
          </div>
          <div className="profile-stat green">
            <span className="pstat-icon">📖</span>
            <span className="pstat-num">{vocabDone}</span>
            <span className="pstat-label">Vocab</span>
          </div>
          <div className="profile-stat blue">
            <span className="pstat-icon">📝</span>
            <span className="pstat-num">{evalsDone}</span>
            <span className="pstat-label">Módulos</span>
          </div>
        </div>

        {/* ── Gráfico de atividade ── */}
        <WeeklyChart dailyXP={dailyXP} />

        <div className="profile-overall">
          <div className="overall-top">
            <span className="overall-label">Progresso geral</span>
            <span className="overall-pct">{pct}%</span>
          </div>
          <div className="overall-bar">
            <div className="overall-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="overall-sub">{evalsDone} de {totalMods} módulos concluídos</p>
        </div>

        {/* ── Conquistas ── */}
        <div className="achievements-section">
          <h3 className="achievements-title">
            Conquistas
            <span className="achievements-count">{earned.length}/{ACHIEVEMENTS.length}</span>
          </h3>

          {/* Filtros por categoria */}
          <div className="ach-filters">
            <button
              className={`ach-filter-btn ${achFilter === 'all' ? 'ach-filter-active' : ''}`}
              onClick={() => setAchFilter('all')}
            >Todas</button>
            <button
              className={`ach-filter-btn ${achFilter === 'earned' ? 'ach-filter-active' : ''}`}
              onClick={() => setAchFilter('earned')}
            >Conquistadas ✓</button>
            {ACHIEVEMENT_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`ach-filter-btn ${achFilter === cat.key ? 'ach-filter-active' : ''}`}
                onClick={() => setAchFilter(cat.key)}
              >{cat.label}</button>
            ))}
          </div>

          <div className="achievements-grid">
            {ACHIEVEMENTS
              .filter(a => {
                if (achFilter === 'earned') return earned.includes(a.id)
                if (achFilter === 'all')    return true
                const cat = ACHIEVEMENT_CATEGORIES.find(c => c.key === achFilter)
                return cat ? cat.ids.includes(a.id) : true
              })
              .sort((a, b) => {
                const da = earned.includes(a.id) ? 1 : 0
                const db = earned.includes(b.id) ? 1 : 0
                return db - da
              })
              .map(a => {
                const done = earned.includes(a.id)
                return (
                  <div key={a.id} className={`achievement-item ${done ? 'ach-done' : 'ach-locked'}`}>
                    <div
                      className="ach-icon-wrap"
                      style={done ? { background: a.color + '22', border: `2px solid ${a.color}55` } : {}}
                    >
                      <span className="ach-icon">{done ? a.icon : '🔒'}</span>
                    </div>
                    <span className="ach-title">{a.title}</span>
                    <span className="ach-desc">{done ? a.desc : a.hint}</span>
                  </div>
                )
              })
            }
          </div>
        </div>

        {isPremium
          ? <div className="premium-active-badge">💎 Acesso Premium ativo</div>
          : <button className="btn-redeem-profile" onClick={onOpenRedeem}>🔓 Ativar código Premium</button>
        }

        <button className="btn-settings-profile" onClick={onOpenSettings}>⚙️ Configurações</button>

        {isAdmin && (
          <button className="btn-admin" onClick={onOpenAdmin}>⚙️ Painel Admin</button>
        )}

        <button className="btn-logout-full" onClick={onLogout}>Sair da conta</button>
      </div>
    </div>
  )
}
