import { useState } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const ERRORS = {
  invalid:      'Código inválido. Verifique e tente novamente.',
  claimed:      'Este código já foi utilizado por outra pessoa.',
  'already-yours': 'Você já ativou este código anteriormente.',
}

export default function RedeemScreen({ user, onSuccess, onBack }) {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const normalized = code.trim().toUpperCase()
    if (!normalized) return

    setLoading(true)
    try {
      const ref  = doc(db, 'codes', normalized)
      const snap = await getDoc(ref)

      if (!snap.exists()) throw new Error('invalid')

      const data = snap.data()
      if (data.claimedBy === user.uid) throw new Error('already-yours')
      if (data.claimedBy !== null)     throw new Error('claimed')

      await updateDoc(ref, {
        claimedBy: user.uid,
        claimedAt: serverTimestamp(),
      })

      onSuccess()
    } catch (err) {
      setError(ERRORS[err.message] || 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="redeem-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">Ativar Premium</span>
      </header>

      <div className="redeem-body">
        <div className="redeem-hero">
          <span className="redeem-icon">🔓</span>
          <h2 className="redeem-title">Ativar acesso Premium</h2>
          <p className="redeem-sub">
            Digite o código que você recebeu para desbloquear todos os níveis do Monlingo.
          </p>
        </div>

        <form className="redeem-form" onSubmit={handleSubmit}>
          <input
            className="redeem-input"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Ex: MNLG-AB3X7K"
            maxLength={12}
            autoCapitalize="characters"
            spellCheck={false}
          />
          {error && <p className="redeem-error">⚠ {error}</p>}
          <button className="btn-redeem" type="submit" disabled={loading || !code.trim()}>
            {loading ? 'Verificando…' : 'Ativar agora'}
          </button>
        </form>

        <div className="redeem-features">
          <p className="redeem-features-title">O que está incluído:</p>
          <ul className="redeem-features-list">
            <li>✅ Intermediário 2, 3 e 4</li>
            <li>✅ Avançado 1, 2, 3 e 4</li>
            <li>✅ 52 módulos extras</li>
            <li>✅ Acesso vitalício</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
