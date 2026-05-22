import { MODULES } from '../data/lessons'

export default function ProfileScreen({ progress, user, onBack, onLogout }) {
  const { completed = [], xp = 0, streak = 0 } = progress

  const lessonsDone = completed.filter(id => id.endsWith('-lesson')).length
  const evalsDone   = completed.filter(id => id.endsWith('-eval')).length
  const totalItems  = MODULES.length * 2
  const totalDone   = completed.length

  const initial  = user.email[0].toUpperCase()
  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  const pct = Math.round((totalDone / totalItems) * 100)

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

        <button className="btn-logout-full" onClick={onLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
