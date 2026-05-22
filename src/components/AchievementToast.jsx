import { useEffect, useState } from 'react'

async function share(achievement) {
  const text = `Acabei de desbloquear "${achievement.icon} ${achievement.title}" no Monlingo! 🇫🇷`
  const url  = 'https://monlingo.vercel.app'
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Monlingo', text, url })
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`)
      return 'copied'
    }
  } catch { /* cancelled */ }
}

export default function AchievementToast({ achievement, onDone }) {
  const [visible, setVisible] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 3000)
    const done = setTimeout(onDone, 3500)
    return () => { clearTimeout(hide); clearTimeout(done) }
  }, [])

  const handleShare = async () => {
    const result = await share(achievement)
    if (result === 'copied') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
      <button className="btn-toast-share" onClick={handleShare} title="Compartilhar">
        {copied ? <span className="toast-copied">✓</span> : '📤'}
      </button>
    </div>
  )
}
