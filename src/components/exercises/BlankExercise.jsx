import { useState, useEffect, useRef } from 'react'
import SpeakButton from '../SpeakButton'

// Palavras que não devem ser usadas como blank (artigos, preposições comuns)
const STOP = new Set([
  'le','la','les','un','une','des','de','du','en','à','au','aux',
  'je','tu','il','elle','nous','vous','ils','elles','on',
  'me','ma','mon','se','te','ta','ton','sa','son',
  'ne','pas','et','ou','mais','que','qui','ce','ça',
  'est','sont','a','ont','ai','as','suis','es',
  "j'","c'","l'","n'","d'","m'","s'","t'",
])

function pickBlankWord(sentence) {
  const words = sentence.split(' ')
  if (words.length === 1) return { word: sentence, idx: 0, wordNorm: sentence.toLowerCase() }

  // Remove pontuação para comparar, mas mantém original
  const candidates = words.map((w, i) => {
    const norm = w.toLowerCase().replace(/[.,!?;:'"«»]/g, '').replace(/^(l'|d'|j'|n'|s'|m'|t'|c')/, '')
    return { w, i, norm }
  }).filter(x => !STOP.has(x.norm) && x.norm.length > 2)

  if (!candidates.length) return { word: words[words.length - 1], idx: words.length - 1, wordNorm: words[words.length - 1].toLowerCase() }

  // Prefere a palavra mais longa que não seja stop word
  const best = candidates.sort((a, b) => b.norm.length - a.norm.length)[0]
  return { word: best.w, idx: best.i, wordNorm: best.norm }
}

export default function BlankExercise({ exercise, answered, onSelect }) {
  const { prompt, sentence, correct, hint, speakFr } = exercise
  const [value, setValue] = useState('')
  const [attempt, setAttempt] = useState(null) // 'correct' | 'wrong'
  const inputRef = useRef(null)

  useEffect(() => {
    setValue('')
    setAttempt(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [prompt])

  // Mostra a sentença com ___ substituído pelo input
  const parts = sentence.split('___')

  // Normalização idêntica ao TypingExercise: ligaduras + diacríticos + pontuação
  const normalizeBlank = s =>
    s.trim().toLowerCase()
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[.,!?;:'"«»''']/g, '')

  const submit = () => {
    if (!value.trim() || attempt) return
    const ok = normalizeBlank(value) === normalizeBlank(correct)
    setAttempt(ok ? 'correct' : 'wrong')
    onSelect(ok)
  }

  const handleKey = e => { if (e.key === 'Enter') submit() }

  return (
    <div className="blank-exercise">
      <p className="blank-prompt">{prompt}</p>

      <div className="blank-sentence-wrap">
        <span className="blank-sentence-part">{parts[0]}</span>
        <input
          ref={inputRef}
          className={`blank-input ${attempt === 'correct' ? 'blank-correct' : attempt === 'wrong' ? 'blank-wrong' : ''}`}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={!!attempt || answered}
          placeholder={hint ? `${hint}___` : '___'}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {parts[1] && <span className="blank-sentence-part">{parts[1]}</span>}
      </div>

      {speakFr && (
        <div className="blank-speak">
          <SpeakButton text={speakFr} size="sm" />
        </div>
      )}

      {attempt === 'wrong' && (
        <p className="blank-correction">
          Resposta correta: <strong>{correct}</strong>
        </p>
      )}

      {!attempt && !answered && (
        <button
          className="blank-submit"
          onClick={submit}
          disabled={!value.trim()}
        >
          Verificar ✓
        </button>
      )}
    </div>
  )
}
