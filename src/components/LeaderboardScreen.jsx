import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const MEDAL = ['🥇', '🥈', '🥉']

function Podium({ entries, myUid }) {
  // positions: [1st, 2nd, 3rd] → display order: [2nd, 1st, 3rd]
  const order = [1, 0, 2]
  const heights = [70, 100, 55]
  const colors = [
    'linear-gradient(180deg,#C0C0C0,#808080)',
    'linear-gradient(180deg,#FFD700,#B8860B)',
    'linear-gradient(180deg,#CD7F32,#8B4513)',
  ]
  const shadow = [
    '0 0 12px #C0C0C044',
    '0 0 18px #FFD70066',
    '0 0 10px #CD7F3244',
  ]

  return (
    <div className="lb-podium">
      {order.map((rank, col) => {
        const entry = entries[rank]
        if (!entry) return null
        const isMe = entry.id === myUid
        return (
          <div key={rank} className="lb-podium-col">
            {rank === 0 && <span className="lb-podium-crown">👑</span>}
            <p className={`lb-podium-name ${isMe ? 'lb-podium-me' : ''}`}>
              {entry.displayName.split(' ')[0]}
            </p>
            <p className="lb-podium-xp">⭐ {entry.totalXP}</p>
            <div
              className="lb-podium-step"
              style={{
                height: heights[col],
                background: colors[col],
                boxShadow: shadow[col],
              }}
            >
              <span className="lb-podium-medal">{MEDAL[rank]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function LeaderboardScreen({ user, progress, onBack }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const q    = query(collection(db, 'leaderboard'), orderBy('totalXP', 'desc'), limit(10))
        const snap = await getDocs(q)
        setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myName    = user.displayName || user.email.split('@')[0]
  const myTotalXP = progress.xp ?? 0
  const myInTop10 = entries.some(e => e.id === user.uid)

  return (
    <div className="lb-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>🏆 Ranking Geral</span>
        <span style={{ visibility: 'hidden' }}>‹ Voltar</span>
      </header>

      <div className="lb-body">
        {loading && (
          <div className="lb-state">
            <span className="lb-spinner">⏳</span>
            <p>Carregando ranking…</p>
          </div>
        )}

        {error && (
          <div className="lb-state">
            <span>⚠️</span>
            <p>Erro ao carregar. Tente novamente.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {entries.length === 0 ? (
              <div className="lb-state">
                <span>🏁</span>
                <p>Ainda sem dados no ranking.</p>
                <p>Complete um exercício para aparecer aqui!</p>
              </div>
            ) : (
              <>
                {/* Podium — only when 3+ entries */}
                {entries.length >= 3 && (
                  <Podium entries={entries} myUid={user.uid} />
                )}

                <div className="lb-list">
                  {entries.map((entry, i) => {
                    const isMe = entry.id === user.uid
                    return (
                      <div key={entry.id} className={`lb-row ${isMe ? 'lb-me' : ''}`}>
                        <span className={`lb-rank ${i < 3 ? 'lb-medal' : ''}`}>
                          {i < 3 ? MEDAL[i] : `${i + 1}`}
                        </span>
                        <span className="lb-name">
                          {entry.displayName}
                          {isMe && <span className="lb-you-tag">você</span>}
                        </span>
                        <span className="lb-xp">⭐ {entry.totalXP}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {!myInTop10 && (
              <>
                <div className="lb-separator">• • •</div>
                <div className="lb-row lb-me lb-outside">
                  <span className="lb-rank">–</span>
                  <span className="lb-name">
                    {myName}
                    <span className="lb-you-tag">você</span>
                  </span>
                  <span className="lb-xp">⭐ {myTotalXP}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
