import { useState, useRef } from 'react'

export default function MatchingExercise({ exercise, answered, onSelect }) {
  const { pairs } = exercise

  // Shuffle right column once on mount
  const [rightItems] = useState(() => [...pairs].sort(() => Math.random() - 0.5))

  const [selectedLeft, setSelectedLeft] = useState(null) // index in pairs[]
  const [matchedLeft,  setMatchedLeft]  = useState(() => new Set())
  const [wrongLeft,    setWrongLeft]    = useState(null)  // index
  const [wrongRight,   setWrongRight]   = useState(null)  // pt string
  const [allDone,      setAllDone]      = useState(false)
  const hadMistake = useRef(false)

  const matchedPts = new Set([...matchedLeft].map(i => pairs[i].pt))

  const handleLeft = (i) => {
    if (answered || allDone || matchedLeft.has(i) || wrongLeft !== null) return
    setSelectedLeft(prev => prev === i ? null : i)
  }

  const handleRight = (ptWord) => {
    if (answered || allDone || selectedLeft === null || wrongLeft !== null) return
    if (matchedPts.has(ptWord)) return

    if (ptWord === pairs[selectedLeft].pt) {
      // ✅ Correct match
      const next = new Set(matchedLeft)
      next.add(selectedLeft)
      setMatchedLeft(next)
      setSelectedLeft(null)
      if (next.size === pairs.length) {
        setAllDone(true)
        setTimeout(() => onSelect(true), 500)
      }
    } else {
      // ❌ Wrong match — brief shake then reset
      hadMistake.current = true
      setWrongLeft(selectedLeft)
      setWrongRight(ptWord)
      setTimeout(() => {
        setWrongLeft(null)
        setWrongRight(null)
        setSelectedLeft(null)
      }, 700)
    }
  }

  return (
    <div className="matching-exercise">
      <p className="exercise-question">Conecte francês com português</p>

      <div className="matching-cols">
        {/* Left column — French */}
        <div className="matching-col">
          {pairs.map((pair, i) => {
            const isDone     = matchedLeft.has(i)
            const isSelected = selectedLeft === i
            const isWrong    = wrongLeft === i
            return (
              <button
                key={i}
                type="button"
                className={[
                  'matching-chip',
                  isDone     ? 'chip-done'                  : '',
                  isWrong    ? 'chip-wrong chip-shake'       : '',
                  isSelected ? 'chip-selected'               : '',
                  !isDone && !isWrong && !isSelected ? 'chip-idle' : '',
                ].join(' ')}
                onClick={() => handleLeft(i)}
                disabled={answered || isDone || wrongLeft !== null}
              >
                {pair.fr}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="matching-divider" aria-hidden="true">
          {pairs.map((_, i) => (
            <div key={i} className={`matching-line ${matchedLeft.has(i) ? 'line-done' : ''}`} />
          ))}
        </div>

        {/* Right column — Portuguese (shuffled) */}
        <div className="matching-col">
          {rightItems.map((pair, i) => {
            const isDone   = matchedPts.has(pair.pt)
            const isWrong  = wrongRight === pair.pt
            const inactive = selectedLeft === null && !isDone
            return (
              <button
                key={i}
                type="button"
                className={[
                  'matching-chip',
                  isDone   ? 'chip-done'                 : '',
                  isWrong  ? 'chip-wrong chip-shake'     : '',
                  inactive ? 'chip-inactive'             : '',
                  !isDone && !isWrong && !inactive ? 'chip-idle' : '',
                ].join(' ')}
                onClick={() => handleRight(pair.pt)}
                disabled={answered || isDone || wrongLeft !== null}
              >
                {pair.pt}
              </button>
            )
          })}
        </div>
      </div>

      {allDone && (
        <div className="matching-success">
          🎯 Todas combinadas!
        </div>
      )}
    </div>
  )
}
