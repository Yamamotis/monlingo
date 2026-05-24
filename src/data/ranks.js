// ── XP Rank system ────────────────────────────────────────────────────────────

export const RANKS = [
  { id: 'bronze',   label: 'Bronze',   minXP: 0,    icon: '🥉', color: '#cd7f32' },
  { id: 'prata',    label: 'Prata',    minXP: 500,  icon: '🥈', color: '#a8a9ad' },
  { id: 'ouro',     label: 'Ouro',     minXP: 1500, icon: '🥇', color: '#FFD700' },
  { id: 'platina',  label: 'Platina',  minXP: 3500, icon: '💎', color: '#b9f2ff' },
  { id: 'diamante', label: 'Diamante', minXP: 7000, icon: '💠', color: '#1CB0F6' },
]

/** Returns the rank the user currently holds */
export function getRank(xp) {
  let rank = RANKS[0]
  for (const r of RANKS) { if (xp >= r.minXP) rank = r }
  return rank
}

/** Returns the next rank, or null if already at max */
export function getNextRank(xp) {
  return RANKS.find(r => r.minXP > xp) ?? null
}
