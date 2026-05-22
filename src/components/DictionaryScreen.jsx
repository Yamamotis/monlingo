import { useState, useMemo } from 'react'
import { MODULES } from '../data/lessons'
import SpeakButton from './SpeakButton'

export default function DictionaryScreen({ progress, onBack }) {
  const { completed = [] } = progress
  const [search, setSearch] = useState('')

  const learnedVocab = useMemo(() => {
    const items = []
    for (const mod of MODULES) {
      const started = completed.includes(mod.exercises[0]?.id)
      if (!started) continue
      for (const v of mod.vocab.vocabulary) {
        items.push({ ...v, modTitle: mod.title, modIcon: mod.icon, modColor: mod.color })
      }
    }
    return items
  }, [completed])

  const filtered = useMemo(() => {
    if (!search.trim()) return learnedVocab
    const q = search.toLowerCase()
    return learnedVocab.filter(v =>
      v.fr.toLowerCase().includes(q) || v.pt.toLowerCase().includes(q)
    )
  }, [learnedVocab, search])

  return (
    <div className="dict-screen">
      <header className="player-header">
        <button className="btn-back-level" onClick={onBack}>‹ Voltar</button>
        <span className="profile-header-title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          📖 Meu Dicionário
        </span>
        <span style={{ visibility: 'hidden' }}>‹ Voltar</span>
      </header>

      <div className="dict-body">
        <div className="dict-stats">
          <span className="dict-count">
            <strong>{learnedVocab.length}</strong> palavras aprendidas
          </span>
        </div>

        <div className="dict-search-wrap">
          <input
            className="dict-search"
            type="text"
            placeholder="🔍 Buscar em francês ou português…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="dict-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="dict-empty">
            <span>🔍</span>
            <p>Nenhuma palavra encontrada.</p>
          </div>
        ) : (
          <div className="dict-list">
            {filtered.map((v, i) => (
              <div key={i} className="dict-row">
                <div className="dict-row-main">
                  <div className="dict-fr-wrap">
                    <span className="dict-fr">{v.fr}</span>
                    <SpeakButton text={v.fr} size="sm" />
                  </div>
                  <span className="dict-pt">{v.pt}</span>
                </div>
                {v.sentence && (
                  <p className="dict-sentence">"{v.sentence}"</p>
                )}
                {v.note && (
                  <p className="dict-note">💡 {v.note}</p>
                )}
                <span
                  className="dict-mod-tag"
                  style={{ background: v.modColor + '22', color: v.modColor, borderColor: v.modColor + '44' }}
                >
                  {v.modIcon} {v.modTitle}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
