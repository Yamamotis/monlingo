import { useState } from 'react'
import { MODULES } from '../data/lessons'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements'

export default function ProfileScreen({ progress, user, isAdmin, onBack, onLogout, onOpenRedeem, onOpenAdmin }) {
  const { completed = [], xp = 0, streak = 0, achievements: earned = [], isPremium = false } = progress
  const [achFilter, setAchFilter] = useState('all')

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
        <p className="profile-email">{user.email}</p>
        {joinDate && <p className="profile-since">Estudando desde {joinDate}</p>}

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
              // Ordenar: desbloqueadas primeiro
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

        {isAdmin && (
          <button className="btn-admin" onClick={onOpenAdmin}>⚙️ Painel Admin</button>
        )}

        <button className="btn-logout-full" onClick={onLogout}>Sair da conta</button>
      </div>
    </div>
  )
}
