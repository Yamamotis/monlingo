import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut }  from 'firebase/auth'
import { doc, getDoc, setDoc }          from 'firebase/firestore'
import { auth, db }                     from './firebase'
import FrFlag          from './components/FrFlag'
import LoginScreen     from './components/LoginScreen'
import LevelSelectScreen from './components/LevelSelectScreen'
import MapScreen       from './components/MapScreen'
import LessonPlayer    from './components/LessonPlayer'
import CompletionScreen from './components/CompletionScreen'

const EMPTY = { completed: [], xp: 0 }

export default function App() {
  const [authUser, setAuthUser]         = useState(undefined)
  const [screen, setScreen]             = useState('levels')
  const [activeLevel, setActiveLevel]   = useState(null)
  const [activeModule, setActiveModule] = useState(null)
  const [activeItem, setActiveItem]     = useState(null)
  const [progress, setProgress]         = useState(EMPTY)
  const [lastResult, setLastResult]     = useState(null)
  const readyToSave = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      readyToSave.current = false
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          setProgress(snap.exists() ? (snap.data().progress ?? EMPTY) : EMPTY)
        } catch { setProgress(EMPTY) }
        readyToSave.current = true
      } else {
        setProgress(EMPTY)
      }
      setAuthUser(user ?? null)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!authUser || !readyToSave.current) return
    setDoc(doc(db, 'users', authUser.uid), { progress }, { merge: true }).catch(() => {})
  }, [progress])

  const handleSelectLevel = (level) => {
    setActiveLevel(level)
    setScreen('level')
  }

  const handleStart = (mod, item) => {
    setActiveModule(mod)
    setActiveItem(item)
    setScreen('lesson')
  }

  const handleComplete = (xpGained) => {
    setProgress(prev => ({
      completed: [...new Set([...prev.completed, activeItem.id])],
      xp: prev.xp + xpGained,
    }))
    setLastResult({ xp: xpGained, item: activeItem, module: activeModule })
    setScreen('completion')
  }

  const handleExitLesson  = () => setScreen('level')
  const handleExitCompletion = () => setScreen('level')
  const handleBackToLevels = () => setScreen('levels')
  const handleLogout = () => signOut(auth)

  if (authUser === undefined) {
    return (
      <div className="app loading-screen">
        <FrFlag size="lg" />
        <p className="loading-text">Carregando…</p>
      </div>
    )
  }

  if (!authUser) return <LoginScreen />

  return (
    <div className="app">
      {screen === 'levels' && (
        <LevelSelectScreen
          progress={progress}
          onSelect={handleSelectLevel}
          user={authUser}
          onLogout={handleLogout}
        />
      )}
      {screen === 'level' && activeLevel && (
        <MapScreen
          level={activeLevel}
          progress={progress}
          onStart={handleStart}
          onBack={handleBackToLevels}
        />
      )}
      {screen === 'lesson' && activeItem && (
        <LessonPlayer
          mod={activeModule}
          item={activeItem}
          onComplete={handleComplete}
          onExit={handleExitLesson}
        />
      )}
      {screen === 'completion' && lastResult && (
        <CompletionScreen result={lastResult} onContinue={handleExitCompletion} />
      )}
    </div>
  )
}
