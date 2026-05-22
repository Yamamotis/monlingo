import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut }  from 'firebase/auth'
import { doc, getDoc, setDoc }          from 'firebase/firestore'
import { auth, db }                     from './firebase'
import FrFlag             from './components/FrFlag'
import LoginScreen        from './components/LoginScreen'
import LevelSelectScreen  from './components/LevelSelectScreen'
import MapScreen          from './components/MapScreen'
import LessonPlayer       from './components/LessonPlayer'
import CompletionScreen   from './components/CompletionScreen'
import ProfileScreen      from './components/ProfileScreen'

const EMPTY = { completed: [], xp: 0, streak: 0, lastStudyDate: null }

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function App() {
  const [authUser, setAuthUser]         = useState(undefined)
  const [screen, setScreen]             = useState('levels')
  const [activeLevel, setActiveLevel]   = useState(null)
  const [activeModule, setActiveModule] = useState(null)
  const [activeItem, setActiveItem]     = useState(null)
  const [progress, setProgress]         = useState(EMPTY)
  const [lastResult, setLastResult]     = useState(null)
  const [muted, setMuted]               = useState(() => localStorage.getItem('monlingo_muted') === 'true')
  const readyToSave = useRef(false)

  // persist mute preference
  useEffect(() => {
    localStorage.setItem('monlingo_muted', muted)
  }, [muted])

  // auth + load progress
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      readyToSave.current = false
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          setProgress(snap.exists() ? { ...EMPTY, ...snap.data().progress } : EMPTY)
        } catch { setProgress(EMPTY) }
        readyToSave.current = true
      } else {
        setProgress(EMPTY)
      }
      setAuthUser(user ?? null)
    })
    return unsub
  }, [])

  // save progress to Firestore
  useEffect(() => {
    if (!authUser || !readyToSave.current) return
    setDoc(doc(db, 'users', authUser.uid), { progress }, { merge: true }).catch(() => {})
  }, [progress])

  const handleSelectLevel = (level) => { setActiveLevel(level); setScreen('level') }
  const handleBackToLevels = () => setScreen('levels')

  const handleStart = (mod, item) => {
    setActiveModule(mod); setActiveItem(item); setScreen('lesson')
  }

  const handleComplete = (xpGained) => {
    const today = getToday()
    setProgress(prev => {
      const last = prev.lastStudyDate
      let streak = prev.streak ?? 0
      if (last !== today) {
        streak = last === getYesterday() ? streak + 1 : 1
      }
      return {
        ...prev,
        completed: [...new Set([...prev.completed, activeItem.id])],
        xp: prev.xp + xpGained,
        streak,
        lastStudyDate: today,
      }
    })
    setLastResult({ xp: xpGained, item: activeItem, module: activeModule })
    setScreen('completion')
  }

  const handleLogout = () => signOut(auth)
  const toggleMute   = () => setMuted(m => !m)

  if (authUser === undefined) {
    return (
      <div className="app loading-screen">
        <FrFlag size="lg" />
        <p className="loading-text">Carregando…</p>
      </div>
    )
  }

  if (!authUser) return <LoginScreen />

  const sharedProps = { user: authUser, onLogout: handleLogout, muted, onToggleMute: toggleMute }

  return (
    <div className="app">
      {screen === 'levels' && (
        <LevelSelectScreen
          progress={progress}
          onSelect={handleSelectLevel}
          onOpenProfile={() => setScreen('profile')}
          {...sharedProps}
        />
      )}
      {screen === 'level' && activeLevel && (
        <MapScreen
          level={activeLevel}
          progress={progress}
          onStart={handleStart}
          onBack={handleBackToLevels}
          {...sharedProps}
        />
      )}
      {screen === 'lesson' && activeItem && (
        <LessonPlayer
          mod={activeModule}
          item={activeItem}
          onComplete={handleComplete}
          onExit={() => setScreen('level')}
          muted={muted}
          onToggleMute={toggleMute}
        />
      )}
      {screen === 'completion' && lastResult && (
        <CompletionScreen result={lastResult} onContinue={() => setScreen('level')} />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          progress={progress}
          user={authUser}
          onBack={() => setScreen('levels')}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
