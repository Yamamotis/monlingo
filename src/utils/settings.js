// ── Settings singleton — persisted in localStorage ───────────────────────────

const DEFAULTS = {
  soundEnabled:      true,
  vibrationEnabled:  true,
  fontSize:          'normal', // 'small' | 'normal' | 'large'
}

let _s = { ...DEFAULTS }

function _applyFont(size) {
  if (typeof document === 'undefined') return
  const cl = document.documentElement.classList
  cl.remove('font-sm', 'font-lg')
  if (size === 'small') cl.add('font-sm')
  if (size === 'large') cl.add('font-lg')
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem('monlingo_settings')
    if (raw) _s = { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  _applyFont(_s.fontSize)
  return { ..._s }
}

export function saveSettings(updates) {
  _s = { ..._s, ...updates }
  try { localStorage.setItem('monlingo_settings', JSON.stringify(_s)) } catch {}
  if ('fontSize' in updates) _applyFont(_s.fontSize)
  return { ..._s }
}

export function getSettings()       { return { ..._s } }
export function isSoundEnabled()    { return _s.soundEnabled }
export function isVibrationEnabled(){ return _s.vibrationEnabled }
