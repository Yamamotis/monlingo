const TABS = [
  { id: 'levels',      emoji: '🏠', label: 'Início'  },
  { id: 'leaderboard', emoji: '🏆', label: 'Ranking' },
  { id: 'profile',     emoji: '👤', label: 'Perfil'  },
]

export default function BottomNav({ current, leaderboardUnlocked = true, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {TABS.map(tab => {
        const isLocked = tab.id === 'leaderboard' && !leaderboardUnlocked
        return (
          <button
            key={tab.id}
            className={`bnav-tab ${current === tab.id ? 'bnav-active' : ''} ${isLocked ? 'bnav-locked' : ''}`}
            onClick={() => onNavigate(tab.id)}
            aria-label={tab.label}
          >
            <span className="bnav-icon-wrap">
              <span className="bnav-icon">{tab.emoji}</span>
              {isLocked && <span className="bnav-lock-badge">🔒</span>}
            </span>
            <span className="bnav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
