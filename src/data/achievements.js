import { LEVELS } from './lessons'

const lvlDone = (progress, levelId) => {
  const lvl = LEVELS.find(l => l.id === levelId)
  if (!lvl || !lvl.moduleIds.length) return false
  return lvl.moduleIds.every(mid =>
    progress.completed.includes(`${mid}-lesson`) &&
    progress.completed.includes(`${mid}-eval`)
  )
}

export const ACHIEVEMENTS = [
  // ── Primeiros passos ──────────────────────────
  {
    id: 'first-lesson',
    icon: '🎯',
    title: 'Primeiro Passo',
    desc: 'Concluiu sua primeira aula',
    color: '#58CC02',
    check: p => p.completed.filter(id => id.endsWith('-lesson')).length >= 1,
  },
  {
    id: 'first-eval',
    icon: '📝',
    title: 'Primeiro Teste',
    desc: 'Concluiu sua primeira avaliação',
    color: '#1CB0F6',
    check: p => p.completed.filter(id => id.endsWith('-eval')).length >= 1,
  },

  // ── Aulas ─────────────────────────────────────
  {
    id: 'lessons-5',
    icon: '📖',
    title: 'Estudioso',
    desc: 'Concluiu 5 aulas',
    color: '#58CC02',
    check: p => p.completed.filter(id => id.endsWith('-lesson')).length >= 5,
  },
  {
    id: 'lessons-15',
    icon: '🎓',
    title: 'Graduado',
    desc: 'Concluiu todas as 15 aulas',
    color: '#CE82FF',
    check: p => p.completed.filter(id => id.endsWith('-lesson')).length >= 15,
  },

  // ── Níveis ────────────────────────────────────
  {
    id: 'level-beginner-1',
    icon: '🌱',
    title: 'Iniciante',
    desc: 'Completou o nível Iniciante',
    color: '#58CC02',
    check: p => lvlDone(p, 'beginner-1'),
  },
  {
    id: 'level-beginner-2',
    icon: '📗',
    title: 'Iniciante 2',
    desc: 'Completou o nível Iniciante 2',
    color: '#1CB0F6',
    check: p => lvlDone(p, 'beginner-2'),
  },
  {
    id: 'level-beginner-3',
    icon: '💬',
    title: 'Iniciante 3',
    desc: 'Completou o nível Iniciante 3',
    color: '#CE82FF',
    check: p => lvlDone(p, 'beginner-3'),
  },

  // ── Streak ────────────────────────────────────
  {
    id: 'streak-3',
    icon: '🔥',
    title: 'Na Sequência',
    desc: '3 dias seguidos estudando',
    color: '#FF9600',
    check: p => (p.streak ?? 0) >= 3,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    title: 'Uma Semana',
    desc: '7 dias seguidos estudando',
    color: '#FF4B4B',
    check: p => (p.streak ?? 0) >= 7,
  },
  {
    id: 'streak-30',
    icon: '🔥',
    title: 'Imparável',
    desc: '30 dias seguidos estudando',
    color: '#FFC800',
    check: p => (p.streak ?? 0) >= 30,
  },

  // ── XP ────────────────────────────────────────
  {
    id: 'xp-100',
    icon: '⭐',
    title: '100 XP',
    desc: 'Acumulou 100 pontos de experiência',
    color: '#FFC800',
    check: p => (p.xp ?? 0) >= 100,
  },
  {
    id: 'xp-500',
    icon: '🌟',
    title: '500 XP',
    desc: 'Acumulou 500 pontos de experiência',
    color: '#FFC800',
    check: p => (p.xp ?? 0) >= 500,
  },
  {
    id: 'xp-1000',
    icon: '💫',
    title: '1000 XP',
    desc: 'Acumulou 1000 pontos de experiência',
    color: '#FFC800',
    check: p => (p.xp ?? 0) >= 1000,
  },
]
