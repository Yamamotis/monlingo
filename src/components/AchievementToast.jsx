import { useEffect, useState } from 'react'

export default function AchievementToast({ achievement, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 3000)
    const done = setTimeout(onDone, 3500)
    return () => { clearTimeout(hide); clearTimeout(done) }
  }, [])

  return (
    <div className={`achievement-toast ${visible ? 'toast-in' : 'toast-out'}`}>
      <div className="toast-icon-wrap" style={{ background: achievement.color + '22', border: `2px solid ${achievement.color}55` }}>
        <span className="toast-icon">{achievement.icon}</span>
      </div>
      <div className="toast-body">
        <span className="toast-label">🏅 Conquista desbloqueada!</span>
        <span className="toast-title">{achievement.title}</span>
        <span className="toast-desc">{achievement.desc}</span>
      </div>
    </div>
  )
}
