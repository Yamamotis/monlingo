import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase'
import FrFlag from './FrFlag'
import MonlingoLogo from './MonlingoLogo'

const ERRORS = {
  'auth/invalid-email':        'E-mail inválido.',
  'auth/user-not-found':       'Usuário não encontrado.',
  'auth/wrong-password':       'Senha incorreta.',
  'auth/invalid-credential':   'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/weak-password':        'Senha muito fraca (mínimo 6 caracteres).',
  'auth/too-many-requests':    'Muitas tentativas. Tente novamente em breve.',
  'auth/popup-closed-by-user': 'Login cancelado.',
}

export default function LoginScreen() {
  const [mode, setMode]         = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleError = (err) =>
    setError(ERRORS[err.code] || `Erro: ${err.code ?? err.message}`)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email)
        setResetSent(true)
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const signInGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const setForgot = () => { setMode('forgot'); setError(''); setResetSent(false) }
  const backToLogin = () => { setMode('login'); setError(''); setResetSent(false) }
  const toggle      = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }

  return (
    <div className="login-screen">
      <div className="login-card">

        <div className="login-brand">
          <FrFlag size="lg" />
          <MonlingoLogo className="login-title" />
          <p className="login-sub">
            {mode === 'forgot' ? 'Recuperar senha' : 'Aprenda francês do zero'}
          </p>
        </div>

        {/* ── Modo: recuperar senha ── */}
        {mode === 'forgot' ? (
          <form className="login-form" onSubmit={submit}>
            {resetSent ? (
              <div className="reset-success">
                <span className="reset-icon">✉️</span>
                <p>Link enviado para <strong>{email}</strong>!</p>
                <p className="reset-hint">Verifique sua caixa de entrada e o spam.</p>
              </div>
            ) : (
              <>
                <div className="field-group">
                  <label className="field-label">E-mail</label>
                  <input
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {error && <p className="login-error">⚠ {error}</p>}
                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? '⏳ Enviando…' : 'Enviar link de recuperação'}
                </button>
              </>
            )}
            <button type="button" className="login-toggle" onClick={backToLogin}>
              ← Voltar ao login
            </button>
          </form>
        ) : (
          <>
            {/* ── Google ── */}
            <button className="btn-google" onClick={signInGoogle} disabled={loading}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>

            <div className="login-divider"><span>ou</span></div>

            {/* ── E-mail / senha ── */}
            <form className="login-form" onSubmit={submit}>
              <div className="field-group">
                <label className="field-label">E-mail</label>
                <input
                  type="email"
                  className="field-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field-group">
                <div className="field-label-row">
                  <label className="field-label">Senha</label>
                  {mode === 'login' && (
                    <button type="button" className="forgot-link" onClick={setForgot}>
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="field-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              {error && <p className="login-error">⚠ {error}</p>}
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? '⏳ Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            <button className="login-toggle" onClick={toggle}>
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
