import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function genCode() {
  return 'MNLG-' + Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export default function AdminScreen({ onBack }) {
  const [codes,    setCodes]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied,   setCopied]   = useState('')

  const loadCodes = async () => {
    setLoading(true)
    try {
      const q    = query(collection(db, 'codes'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setCodes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCodes() }, [])

  const handleGenerate = async () => {
    setCreating(true)
    try {
      let code, exists = true
      while (exists) {
        code = genCode()
        const snap = await getDocs(collection(db, 'codes'))
        exists = snap.docs.some(d => d.id === code)
      }
      await setDoc(doc(db, 'codes', code), {
        createdAt: serverTimestamp(),
        claimedBy: null,
        claimedAt: null,
      })
      await loadCodes()
    } finally {
      setCreating(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  const free  = codes.filter(c => !c.claimedBy)
  const used  = codes.filter(c =>  c.claimedBy)

  return (
    <div className="admin-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">⚙️ Admin — Códigos</span>
      </header>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat-num">{codes.length}</span>
            <span className="admin-stat-label">Total</span>
          </div>
          <div className="admin-stat green">
            <span className="admin-stat-num">{free.length}</span>
            <span className="admin-stat-label">Disponíveis</span>
          </div>
          <div className="admin-stat red">
            <span className="admin-stat-num">{used.length}</span>
            <span className="admin-stat-label">Utilizados</span>
          </div>
        </div>

        <button className="btn-generate" onClick={handleGenerate} disabled={creating}>
          {creating ? '⏳ Gerando…' : '+ Gerar novo código'}
        </button>

        {loading ? (
          <p className="admin-loading">Carregando…</p>
        ) : (
          <div className="admin-codes-list">
            {codes.map(c => (
              <div key={c.id} className={`admin-code-row ${c.claimedBy ? 'code-used' : 'code-free'}`}>
                <div className="code-info">
                  <span className="code-value">{c.id}</span>
                  <span className="code-status">
                    {c.claimedBy
                      ? `✓ Ativado — ${c.claimedBy.slice(0, 8)}…`
                      : '○ Disponível'}
                  </span>
                </div>
                {!c.claimedBy && (
                  <button className="btn-copy" onClick={() => copyCode(c.id)}>
                    {copied === c.id ? '✓ Copiado' : 'Copiar'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
