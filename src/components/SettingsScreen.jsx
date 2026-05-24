import { useState } from 'react'
import { getSettings, saveSettings } from '../utils/settings'

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`settings-toggle ${checked ? 'toggle-on' : 'toggle-off'}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      type="button"
    >
      <span className="toggle-knob" />
    </button>
  )
}

const FONT_OPTIONS = [
  { value: 'small',  label: 'Pequena', sample: 'Aa' },
  { value: 'normal', label: 'Normal',  sample: 'Aa' },
  { value: 'large',  label: 'Grande',  sample: 'Aa' },
]

export default function SettingsScreen({ onBack }) {
  const [cfg, setCfg] = useState(getSettings)

  const update = (key, val) => {
    const next = saveSettings({ [key]: val })
    setCfg(next)
  }

  return (
    <div className="settings-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          ⚙️ Configurações
        </span>
        <span style={{ visibility: 'hidden' }}>‹ Voltar</span>
      </header>

      <div className="settings-body">

        {/* ── Áudio ─────────────────────────────── */}
        <div className="settings-section">
          <h3 className="settings-section-title">🔊 Áudio</h3>

          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">Som dos exercícios</span>
              <span className="settings-row-desc">Reproduz o áudio das palavras em francês</span>
            </div>
            <Toggle checked={cfg.soundEnabled} onChange={v => update('soundEnabled', v)} />
          </div>

          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">Vibração ao errar</span>
              <span className="settings-row-desc">Feedback tátil quando você erra uma questão</span>
            </div>
            <Toggle checked={cfg.vibrationEnabled} onChange={v => update('vibrationEnabled', v)} />
          </div>
        </div>

        {/* ── Aparência ─────────────────────────── */}
        <div className="settings-section">
          <h3 className="settings-section-title">🔡 Aparência</h3>

          <div className="settings-row settings-row-col">
            <div className="settings-row-text">
              <span className="settings-row-label">Tamanho da fonte</span>
              <span className="settings-row-desc">Ajusta o texto em toda a plataforma</span>
            </div>
            <div className="font-size-picker">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`font-size-btn ${cfg.fontSize === opt.value ? 'font-size-active' : ''}`}
                  onClick={() => update('fontSize', opt.value)}
                  style={{
                    fontSize: opt.value === 'small' ? '13px' : opt.value === 'large' ? '19px' : '16px',
                  }}
                >
                  <span className="font-size-sample">{opt.sample}</span>
                  <span className="font-size-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Info ──────────────────────────────── */}
        <div className="settings-section settings-info">
          <p className="settings-info-text">
            🇫🇷 <strong>Monlingo</strong> — Aprenda francês de verdade
          </p>
          <p className="settings-info-text">Versão 1.0</p>
        </div>

      </div>
    </div>
  )
}
