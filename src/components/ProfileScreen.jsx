import { MODULES } from '../data/lessons'
import { ACHIEVEMENTS } from '../data/achievements'

export default function ProfileScreen({ progress, user, onBack, onLogout }) {
  const { completed = [], xp = 0, streak = 0, achievements: earned = [] } = progress

  const lessonsDone = completed.filter(id => id.endsWith('-lesson')).length
  const evalsDone   = completed.filter(id => id.endsWith('-eval')).length
  const totalItems  = MODULES.length * 2
  const totalDone   = completed.length
  const pct         = Math.round((totalDone / totalItems) * 100)

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
            <span className="pstat-num">{lessonsDone}</span>
            <span className="pstat-label">Aulas</span>
          </div>
          <div className="profile-stat blue">
            <span className="pstat-icon">📝</span>
            <span className="pstat-num">{evalsDone}</span>
            <span className="pstat-label">Avaliações</span>
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
          <p className="overall-sub">{totalDone} de {totalItems} itens concluídos</p>
        </div>

        {/* ── Conquistas ── */}
        <div className="achievements-section">
          <h3 className="achievements-title">
            Conquistas
            <span className="achievements-count">{earned.length}/{ACHIEVEMENTS.length}</span>
          </h3>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(a => {
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
                  {done && <span className="ach-desc">{a.desc}</span>}
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn-logout-full" onClick={onLogout}>Sair da conta</button>
      </div>
    </div>
  )
}
