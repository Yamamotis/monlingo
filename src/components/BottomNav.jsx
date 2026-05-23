const TABS = [
  { id: 'levels',      emoji: '🏠', label: 'Início' },
  { id: 'leaderboard', emoji: '🏆', label: 'Ranking' },
  { id: 'profile',     emoji: '👤', label: 'Perfil'  },
]

export default function BottomNav({ current, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bnav-tab ${current === tab.id ? 'bnav-active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-label={tab.label}
        >
          <span className="bnav-icon">{tab.emoji}</span>
          <span className="bnav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
