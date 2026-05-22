import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut }  from 'firebase/auth'
import { doc, getDoc, setDoc }          from 'firebase/firestore'
import { auth, db }                     from './firebase'
import { ACHIEVEMENTS }                 from './data/achievements'
import { buildReviewItem }              from './data/lessons'
import FrFlag             from './components/FrFlag'
import LoginScreen        from './components/LoginScreen'
import LevelSelectScreen  from './components/LevelSelectScreen'
import MapScreen          from './components/MapScreen'
import LessonPlayer       from './components/LessonPlayer'
import CompletionScreen   from './components/CompletionScreen'
import ProfileScreen      from './components/ProfileScreen'
import AchievementToast   from './components/AchievementToast'
import OnboardingScreen   from './components/OnboardingScreen'

const EMPTY = { completed: [], xp: 0, streak: 0, lastStudyDate: null, achievements: [], wrongWords: [] }
const REVIEW_MOD = { id: 'review', number: 0, title: 'Revisão', icon: '🔄', color: '#1CB0F6' }

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
  const [toastQueue, setToastQueue]     = useState([])
  const readyToSave = useRef(false)

  useEffect(() => { localStorage.setItem('monlingo_muted', muted) }, [muted])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      readyToSave.current = false
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            // Usuário existente — marca onboarding como já feito
            setProgress({ ...EMPTY, ...snap.data().progress, onboardingDone: true })
          } else {
            // Novo usuário — verá o onboarding
            setProgress({ ...EMPTY, onboardingDone: false })
          }
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

  const handleSelectLevel = (level) => { setActiveLevel(level); setScreen('level') }

  const handleStart = (mod, item) => {
    setActiveModule(mod); setActiveItem(item); setScreen('lesson')
  }

  const handleStartReview = () => {
    const item = buildReviewItem(progress.wrongWords ?? [])
    if (!item) return
    setActiveModule(REVIEW_MOD)
    setActiveItem(item)
    setScreen('lesson')
  }

  const handleComplete = (xpGained, wordStats = { wrong: [], correct: [] }) => {
    const { wrong = [], correct = [] } = wordStats
    const today     = getToday()
    const yesterday = getYesterday()

    // Compute full new progress synchronously (for achievement checking)
    const prev     = progress
    const last     = prev.lastStudyDate
    let   streak   = prev.streak ?? 0
    if (last !== today) streak = last === yesterday ? streak + 1 : 1

    const newCompleted    = [...new Set([...prev.completed, activeItem.id])]
    const prevAchievements = prev.achievements ?? []

    // Atualiza palavras erradas: remove as acertadas, adiciona as novas erradas
    const prevWrong = new Set(prev.wrongWords ?? [])
    correct.forEach(w => prevWrong.delete(w))
    wrong.forEach(w => prevWrong.add(w))

    const newProgress = {
      ...prev,
      completed:     newCompleted,
      xp:            prev.xp + xpGained,
      streak,
      lastStudyDate: today,
      wrongWords:    [...prevWrong],
    }

    // Find newly unlocked achievements
    const unlocked = ACHIEVEMENTS.filter(a =>
      !prevAchievements.includes(a.id) && a.check(newProgress)
    )

    newProgress.achievements = [...prevAchievements, ...unlocked.map(a => a.id)]

    setProgress(newProgress)
    if (unlocked.length) setToastQueue(q => [...q, ...unlocked])
    setLastResult({ xp: xpGained, item: activeItem, module: activeModule })
    setScreen('completion')
  }

  const handleToastDone = () => setToastQueue(q => q.slice(1))
  const handleOnboardingDone = () =>
    setProgress(prev => ({ ...prev, onboardingDone: true }))

  const handleLogout    = () => signOut(auth)
  const toggleMute      = () => setMuted(m => !m)

  if (authUser === undefined) {
    return (
      <div className="app loading-screen">
        <FrFlag size="lg" />
        <p className="loading-text">Carregando…</p>
      </div>
    )
  }
  if (!authUser) return <LoginScreen />

  const shared = { user: authUser, onLogout: handleLogout, muted, onToggleMute: toggleMute }

  return (
    <div className="app">
      {screen === 'levels' && !progress.onboardingDone && (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}
      {screen === 'levels' && progress.onboardingDone && (
        <LevelSelectScreen
          progress={progress}
          onSelect={handleSelectLevel}
          onOpenProfile={() => setScreen('profile')}
          onStartReview={handleStartReview}
          {...shared}
        />
      )}
      {screen === 'level' && activeLevel && (
        <MapScreen
          level={activeLevel}
          progress={progress}
          onStart={handleStart}
          onBack={() => setScreen('levels')}
          {...shared}
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

      {/* Achievement toasts — rendered above everything */}
      {toastQueue.length > 0 && (
        <AchievementToast
          key={toastQueue[0].id}
          achievement={toastQueue[0]}
          onDone={handleToastDone}
        />
      )}
    </div>
  )
}
