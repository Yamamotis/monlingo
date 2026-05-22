import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut }  from 'firebase/auth'
import { doc }                           from 'firebase/firestore'
import { auth, db }                     from './firebase'
import { doc as fbDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { ACHIEVEMENTS }                 from './data/achievements'
import { buildReviewItem, buildDailyItem, LEVELS, MODULES } from './data/lessons'
import FrFlag             from './components/FrFlag'
import LandingScreen      from './components/LandingScreen'
import SkeletonScreen     from './components/SkeletonScreen'
import LevelSelectScreen  from './components/LevelSelectScreen'
import MapScreen          from './components/MapScreen'
import LessonPlayer       from './components/LessonPlayer'
import CompletionScreen   from './components/CompletionScreen'
import ProfileScreen      from './components/ProfileScreen'
import AchievementToast   from './components/AchievementToast'
import OnboardingScreen   from './components/OnboardingScreen'
import LeaderboardScreen  from './components/LeaderboardScreen'
import RedeemScreen       from './components/RedeemScreen'
import AdminScreen        from './components/AdminScreen'
import CategoryScreen     from './components/CategoryScreen'
import DictionaryScreen  from './components/DictionaryScreen'
import PlacementTest      from './components/PlacementTest'
import LevelUpModal       from './components/LevelUpModal'

const ADMIN_EMAIL  = import.meta.env.VITE_ADMIN_EMAIL ?? ''
const MAX_HEARTS   = 5

// Retorna o slot de 2 horas atual: "2026-05-22-14" para 14:00–15:59
function getHeartsSlot() {
  const now  = new Date()
  const slot = Math.floor(now.getHours() / 2) * 2
  return `${now.toISOString().slice(0, 10)}-${String(slot).padStart(2, '0')}`
}
const EMPTY = {
  completed: [], xp: 0, streak: 0, lastStudyDate: null,
  achievements: [], wrongWords: [], weeklyXP: 0, weekStart: '',
  isPremium: false, hearts: MAX_HEARTS, heartsDate: '',
}
const REVIEW_MOD = { id: 'review', number: 0, title: 'Revisão', icon: '🔄', color: '#1CB0F6' }

function getWeekStart() {
  const d   = new Date()
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`
}

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
  const [screen, setScreen]                 = useState('levels')
  const [activeLevel, setActiveLevel]       = useState(null)
  const [activeModule, setActiveModule]     = useState(null)
  const [activeItem, setActiveItem]         = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [progress, setProgress]             = useState(EMPTY)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [lastResult, setLastResult]         = useState(null)
  const [toastQueue, setToastQueue]         = useState([])
  const [levelUpLevel, setLevelUpLevel]     = useState(null)
  const readyToSave = useRef(false)


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      readyToSave.current = false
      if (user) {
        try {
          const snap = await getDoc(fbDoc(db, 'users', user.uid))
          const slot = getHeartsSlot()
          if (snap.exists()) {
            const saved = snap.data().progress ?? {}
            // Resetar corações se mudou o slot de 2 horas
            const hearts = saved.heartsDate === slot ? (saved.hearts ?? MAX_HEARTS) : MAX_HEARTS
            setProgress({ ...EMPTY, ...saved, onboardingDone: true, hearts, heartsDate: slot })
          } else {
            setProgress({ ...EMPTY, onboardingDone: false, hearts: MAX_HEARTS, heartsDate: slot })
          }
        } catch { setProgress(EMPTY) }
        readyToSave.current = true
        setProgressLoaded(true)
      } else {
        setProgress(EMPTY)
      }
      setAuthUser(user ?? null)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!authUser || !readyToSave.current) return
    setDoc(fbDoc(db, 'users', authUser.uid), { progress }, { merge: true }).catch(() => {})
  }, [progress])

  const handleSelectCategory = (cat)   => { setActiveCategory(cat); setScreen('sublevel') }
  const handleSelectLevel    = (level) => { setActiveLevel(level); setScreen('level') }

  const handleStartDaily = () => {
    const item = buildDailyItem(getToday())
    setActiveModule({ id: 'daily', number: 0, title: 'Missão do Dia', icon: '🎯', color: '#CE82FF' })
    setActiveItem(item)
    setScreen('lesson')
  }

  const handleLoseHeart = () => {
    const slot = getHeartsSlot()
    setProgress(prev => {
      // Se o slot mudou desde a última perda, reseta antes de decrementar
      const current = prev.heartsDate === slot ? (prev.hearts ?? MAX_HEARTS) : MAX_HEARTS
      return { ...prev, hearts: Math.max(0, current - 1), heartsDate: slot }
    })
  }

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

    // Palavras erradas
    const prevWrong = new Set(prev.wrongWords ?? [])
    correct.forEach(w => prevWrong.delete(w))
    wrong.forEach(w => prevWrong.add(w))

    // XP semanal
    const weekStart  = getWeekStart()
    const weeklyXP   = (prev.weekStart === weekStart ? prev.weeklyXP ?? 0 : 0) + xpGained

    const newProgress = {
      ...prev,
      completed:     newCompleted,
      xp:            prev.xp + xpGained,
      streak,
      lastStudyDate: today,
      wrongWords:    [...prevWrong],
      weeklyXP,
      weekStart,
    }

    // Find newly unlocked achievements
    const unlocked = ACHIEVEMENTS.filter(a =>
      !prevAchievements.includes(a.id) && a.check(newProgress)
    )

    newProgress.achievements = [...prevAchievements, ...unlocked.map(a => a.id)]

    setProgress(newProgress)
    if (unlocked.length) setToastQueue(q => [...q, ...unlocked])

    // Detecta level-up (nível inteiro concluído)
    const justFinishedLevel = LEVELS.find(level => {
      if (!level.moduleIds.length) return false
      const mods     = MODULES.filter(m => level.moduleIds.includes(m.id))
      const wasDone  = mods.every(m => prev.completed.includes(m.evaluation.id))
      const nowDone  = mods.every(m => newCompleted.includes(m.evaluation.id))
      return !wasDone && nowDone
    })
    if (justFinishedLevel) setLevelUpLevel(justFinishedLevel)

    if (activeItem.type === 'daily') {
      newProgress.dailyMission = { date: getToday(), completed: true }
    }

    if (activeItem.type === 'exercise') {
      setScreen('level')
    } else {
      setLastResult({
        xp: xpGained, item: activeItem, module: activeModule,
        returnTo: activeItem.type === 'daily' ? 'levels' : 'level',
      })
      setScreen('completion')
    }

    // Atualiza leaderboard público
    setDoc(fbDoc(db, 'leaderboard', authUser.uid), {
      displayName: authUser.displayName || authUser.email.split('@')[0],
      weeklyXP,
      weekStart,
      totalXP: newProgress.xp,
    }).catch(() => {})
  }

  const handleRedeemSuccess = () => {
    setProgress(prev => ({ ...prev, isPremium: true }))
    setScreen('levels')
  }

  const handlePlacementDone = (evalIds) => {
    setProgress(prev => ({
      ...prev,
      completed: [...new Set([...prev.completed, ...evalIds])],
      onboardingDone: true,
    }))
    setScreen('levels')
  }

  const handleToastDone = () => setToastQueue(q => q.slice(1))
  const handleOnboardingDone = () =>
    setProgress(prev => ({ ...prev, onboardingDone: true }))

  const handleLogout    = () => signOut(auth)
  if (authUser === undefined) {
    return (
      <div className="app loading-screen">
        <FrFlag size="lg" />
        <p className="loading-text">Carregando…</p>
      </div>
    )
  }
  if (!authUser) return <LandingScreen />
  if (!progressLoaded) return <SkeletonScreen />

  const shared = { user: authUser, onLogout: handleLogout }

  return (
    <div className="app">
      {screen === 'levels' && !progress.onboardingDone && (
        <OnboardingScreen
          onDone={handleOnboardingDone}
          onStartPlacement={() => setScreen('placement')}
        />
      )}
      {screen === 'placement' && (
        <PlacementTest
          onComplete={handlePlacementDone}
          onSkip={() => { setProgress(prev => ({ ...prev, onboardingDone: true })); setScreen('levels') }}
        />
      )}
      {screen === 'levels' && progress.onboardingDone && (
        <CategoryScreen
          progress={progress}
          onSelectCategory={handleSelectCategory}
          onOpenProfile={() => setScreen('profile')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onStartReview={handleStartReview}
          onStartDaily={handleStartDaily}
          onOpenDictionary={() => setScreen('dictionary')}
          {...shared}
        />
      )}
      {screen === 'sublevel' && activeCategory && (
        <LevelSelectScreen
          category={activeCategory}
          progress={progress}
          onSelect={handleSelectLevel}
          onBack={() => setScreen('levels')}
          onOpenRedeem={() => setScreen('redeem')}
        />
      )}
      {screen === 'level' && activeLevel && (
        <MapScreen
          level={activeLevel}
          progress={progress}
          onStart={handleStart}
          onBack={() => setScreen('sublevel')}
          {...shared}
        />
      )}
      {screen === 'lesson' && activeItem && (
        <LessonPlayer
          mod={activeModule}
          item={activeItem}
          onComplete={handleComplete}
          onLoseHeart={handleLoseHeart}
          hearts={progress.hearts ?? MAX_HEARTS}
          onExit={() => activeItem?.type === 'daily' ? setScreen('levels') : setScreen('level')}
        />
      )}
      {screen === 'completion' && lastResult && (
        <CompletionScreen result={lastResult} onContinue={() => setScreen(lastResult.returnTo ?? 'level')} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen
          user={authUser}
          progress={progress}
          onBack={() => setScreen('levels')}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          progress={progress}
          user={authUser}
          isAdmin={authUser.email === ADMIN_EMAIL}
          onBack={() => setScreen('levels')}
          onLogout={handleLogout}
          onOpenRedeem={() => setScreen('redeem')}
          onOpenAdmin={() => setScreen('admin')}
        />
      )}
      {screen === 'redeem' && (
        <RedeemScreen
          user={authUser}
          onSuccess={handleRedeemSuccess}
          onBack={() => setScreen('levels')}
        />
      )}
      {screen === 'admin' && authUser.email === ADMIN_EMAIL && (
        <AdminScreen onBack={() => setScreen('profile')} />
      )}
      {screen === 'dictionary' && (
        <DictionaryScreen
          progress={progress}
          onBack={() => setScreen('levels')}
        />
      )}

      {/* Level-up modal — rendered above everything */}
      {levelUpLevel && (
        <LevelUpModal
          level={levelUpLevel}
          onContinue={() => setLevelUpLevel(null)}
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
