import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase'
import MonlingoLogo from './MonlingoLogo'

const FEATURES = [
  { icon: '🎧', title: 'Áudio nativo',   sub: 'Pronúncia francesa real em cada lição' },
  { icon: '🎯', title: '70 módulos',      sub: 'Do A1 ao C1 — do zero à fluência' },
  { icon: '🔥', title: 'Gamificação',    sub: 'Streaks, XP, conquistas e ranking' },
  { icon: '💬', title: '5 tipos de quiz', sub: 'Escuta, digitação, lacunas e mais' },
]

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LandingScreen() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user')
        setError('Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-screen">

      {/* ── Night hero ──────────────────────────────────── */}
      <div className="landing-night-hero">
        {/* Decorative background tower */}
        <div className="landing-bg-tower" aria-hidden="true">🗼</div>

        {/* Tricolor top stripe */}
        <div className="landing-top-stripe" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="landing-hero-inner">
          <MonlingoLogo className="landing-logo" />

          <h1 className="landing-headline">
            Aprenda <em className="landing-fr-em">francês</em><br/>do jeito certo
          </h1>

          <p className="landing-sub">Do A1 ao C1 · 70 módulos · Áudio real</p>

          <button
            className="btn-google btn-google-landing"
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleIcon />
            {loading ? 'Entrando…' : 'Começar gratuitamente'}
          </button>

          {error && <p className="login-error">⚠ {error}</p>}

          <div className="landing-trust">
            <span>✓ Grátis para começar</span>
            <span className="landing-trust-dot">·</span>
            <span>💎 Premium por R$ 14,99</span>
          </div>
        </div>
      </div>

      {/* ── Features 2×2 ─────────────────────────────────── */}
      <div className="landing-features-grid">
        {FEATURES.map(f => (
          <div key={f.title} className="landing-feat">
            <span className="lf-icon">{f.icon}</span>
            <p className="lf-title">{f.title}</p>
            <p className="lf-sub">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Levels ───────────────────────────────────────── */}
      <div className="landing-levels">
        <p className="landing-section-label">O que você vai aprender</p>
        <div className="landing-levels-grid">
          {[
            { emoji: '🌱', label: 'Iniciante',     desc: '20 módulos · A1', free: true  },
            { emoji: '🌿', label: 'Intermediário', desc: '24 módulos · A2/B1', free: false },
            { emoji: '🏆', label: 'Avançado',      desc: '26 módulos · B2/C1', free: false },
          ].map(l => (
            <div key={l.label} className={`landing-level-chip ${l.free ? 'chip-free' : 'chip-premium'}`}>
              <span>{l.emoji}</span>
              <div>
                <p className="chip-label">{l.label}</p>
                <p className="chip-desc">{l.desc} · {l.free ? 'Grátis' : 'Premium'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium CTA ──────────────────────────────────── */}
      <div className="landing-premium-banner">
        <span className="landing-premium-gem">💎</span>
        <div>
          <p className="landing-premium-title">Acesso completo vitalício</p>
          <p className="landing-premium-price">apenas <strong>R$ 14,99</strong> · pague uma vez</p>
        </div>
      </div>

      <div className="landing-footer">
        <button className="btn-google btn-google-footer" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          {loading ? 'Entrando…' : 'Criar conta grátis'}
        </button>
      </div>

    </div>
  )
}
