import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function getWeekStart() {
  const d   = new Date()
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`
}

function getWeekRange() {
  const [y, m, dd] = getWeekStart().split('-').map(Number)
  const start = new Date(y, m-1, dd)
  const end   = new Date(y, m-1, dd+6)
  const fmt   = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(start)} a ${fmt(end)}`
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardScreen({ user, progress, onBack }) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const q    = query(collection(db, 'leaderboard'), orderBy('weeklyXP', 'desc'), limit(10))
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

  const myName       = user.displayName || user.email.split('@')[0]
  const myWeeklyXP   = progress.weeklyXP ?? 0
  const myInTop10    = entries.some(e => e.id === user.uid)

  return (
    <div className="lb-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">🏆 Ranking Semanal</span>
      </header>

      <div className="lb-body">
        <div className="lb-week-banner">
          <span className="lb-week-icon">📅</span>
          <span className="lb-week-text">Semana de {getWeekRange()}</span>
        </div>

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
                <p>Ainda sem dados esta semana.</p>
                <p>Complete uma aula para aparecer aqui!</p>
              </div>
            ) : (
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
                      <span className="lb-xp">⭐ {entry.weeklyXP}</span>
                    </div>
                  )
                })}
              </div>
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
                  <span className="lb-xp">⭐ {myWeeklyXP}</span>
                </div>
              </>
            )}

            <p className="lb-reset-info">🔄 O ranking reinicia toda segunda-feira</p>
          </>
        )}
      </div>
    </div>
  )
}
