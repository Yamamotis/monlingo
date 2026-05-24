function ctx() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

function note(ac, freq, startOffset, duration, volume = 0.28) {
  const osc  = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = 'sine'
  osc.frequency.value = freq
  const t = ac.currentTime + startOffset
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration)
}

function _cfg() {
  try { return JSON.parse(localStorage.getItem('monlingo_settings') ?? '{}') } catch { return {} }
}

// Ascending two-note ding — G5 → C6
export function playCorrect() {
  if (_cfg().soundEnabled === false) return
  try {
    const ac = ctx()
    note(ac, 784,  0,    0.5)
    note(ac, 1046, 0.11, 0.5)
    setTimeout(() => ac.close(), 1500)
  } catch (_) {}
}

// Descending tone — Eb4 → G3
export function playWrong() {
  const cfg = _cfg()
  try {
    if (cfg.vibrationEnabled !== false) navigator.vibrate?.(80)
    if (cfg.soundEnabled === false) return
    const ac  = ctx()
    const osc  = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(311, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(196, ac.currentTime + 0.38)
    gain.gain.setValueAtTime(0, ac.currentTime)
    gain.gain.linearRampToValueAtTime(0.26, ac.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + 0.45)
    setTimeout(() => ac.close(), 1000)
  } catch (_) {}
}
