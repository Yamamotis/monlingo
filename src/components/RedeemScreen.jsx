import { useState } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CODE_ERRORS = {
  invalid:        'Código inválido. Verifique e tente novamente.',
  claimed:        'Este código já foi utilizado por outra pessoa.',
  'already-yours':'Você já ativou este código anteriormente.',
}

export default function RedeemScreen({ user, onSuccess, onBack }) {
  const [buying,      setBuying]      = useState(false)
  const [buyError,    setBuyError]    = useState('')
  const [showCode,    setShowCode]    = useState(false)
  const [code,        setCode]        = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError,   setCodeError]   = useState('')

  const handleBuy = async () => {
    setBuyError('')
    setBuying(true)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Erro desconhecido')
      window.location.href = data.url
    } catch (err) {
      setBuyError(err.message || 'Não foi possível iniciar o pagamento. Tente novamente.')
      setBuying(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setCodeError('')
    const normalized = code.trim().toUpperCase()
    if (!normalized) return

    setCodeLoading(true)
    try {
      const ref  = doc(db, 'codes', normalized)
      const snap = await getDoc(ref)

      if (!snap.exists()) throw new Error('invalid')
      const data = snap.data()
      if (data.claimedBy === user.uid) throw new Error('already-yours')
      if (data.claimedBy !== null)     throw new Error('claimed')

      await updateDoc(ref, { claimedBy: user.uid, claimedAt: serverTimestamp() })
      onSuccess()
    } catch (err) {
      setCodeError(CODE_ERRORS[err.message] || 'Erro inesperado. Tente novamente.')
    } finally {
      setCodeLoading(false)
    }
  }

  return (
    <div className="redeem-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title">Assinar Premium</span>
      </header>

      <div className="redeem-body">
        <div className="redeem-hero">
          <span className="redeem-icon">💎</span>
          <h2 className="redeem-title">Monlingo Premium</h2>
          <p className="redeem-sub">
            Desbloqueie todos os 70 módulos e aprenda francês do A1 ao C1.
          </p>
        </div>

        <div className="redeem-features">
          <ul className="redeem-features-list">
            <li>✅ Intermediário 2, 3 e 4</li>
            <li>✅ Avançado 1, 2, 3 e 4</li>
            <li>✅ Missão do dia exclusiva</li>
            <li>✅ Vidas ilimitadas</li>
            <li>✅ Acesso vitalício</li>
          </ul>
        </div>

        <button
          className="btn-buy-premium"
          onClick={handleBuy}
          disabled={buying}
        >
          {buying ? 'Redirecionando…' : 'Comprar por R$ 14,99'}
        </button>
        {buyError && <p className="redeem-error">⚠ {buyError}</p>}

        <p className="redeem-safe-note">🔒 Pagamento seguro via Mercado Pago</p>

        <button
          className="btn-have-code"
          onClick={() => setShowCode(v => !v)}
        >
          {showCode ? 'Ocultar' : 'Já tenho um código de acesso'}
        </button>

        {showCode && (
          <form className="redeem-form" onSubmit={handleCodeSubmit}>
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
            {codeError && <p className="redeem-error">⚠ {codeError}</p>}
            <button className="btn-redeem" type="submit" disabled={codeLoading || !code.trim()}>
              {codeLoading ? 'Verificando…' : 'Ativar código'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
