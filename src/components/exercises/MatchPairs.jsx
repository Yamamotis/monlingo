import { useState, useMemo, useEffect } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchPairs({ exercise, onComplete }) {
  const { pairs } = exercise

  const leftItems = useMemo(
    () => shuffle(pairs.map((p, i) => ({ text: p.pt, idx: i }))),
    []
  )
  const rightItems = useMemo(
    () => shuffle(pairs.map((p, i) => ({ text: p.fr, idx: i }))),
    []
  )

  const [leftActive, setLeftActive] = useState(null)
  const [matched, setMatched] = useState(new Set())
  const [wrongLeft, setWrongLeft] = useState(null)
  const [wrongRight, setWrongRight] = useState(null)

  useEffect(() => {
    if (matched.size === pairs.length) {
      setTimeout(() => onComplete(), 400)
    }
  }, [matched.size])

  const handleLeft = (pos) => {
    if (matched.has(leftItems[pos].idx) || wrongLeft !== null) return
    setLeftActive(prev => (prev === pos ? null : pos))
  }

  const handleRight = (pos) => {
    if (matched.has(rightItems[pos].idx) || wrongLeft !== null) return
    if (leftActive === null) return

    const isMatch = leftItems[leftActive].idx === rightItems[pos].idx
    if (isMatch) {
      const newMatched = new Set([...matched, leftItems[leftActive].idx])
      setMatched(newMatched)
      setLeftActive(null)
    } else {
      const savedLeft = leftActive
      setWrongLeft(savedLeft)
      setWrongRight(pos)
      setLeftActive(null)
      setTimeout(() => {
        setWrongLeft(null)
        setWrongRight(null)
      }, 600)
    }
  }

  const leftClass = (pos) => {
    const idx = leftItems[pos].idx
    if (matched.has(idx)) return 'match-btn matched'
    if (wrongLeft === pos) return 'match-btn wrong'
    if (leftActive === pos) return 'match-btn active'
    return 'match-btn'
  }

  const rightClass = (pos) => {
    const idx = rightItems[pos].idx
    if (matched.has(idx)) return 'match-btn matched'
    if (wrongRight === pos) return 'match-btn wrong'
    return 'match-btn'
  }

  return (
    <div className="match-exercise">
      <p className="exercise-question">{exercise.instruction}</p>
      <div className="match-columns">
        <div className="match-col">
          {leftItems.map((item, pos) => (
            <button
              key={pos}
              className={leftClass(pos)}
              onClick={() => handleLeft(pos)}
              disabled={matched.has(item.idx)}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rightItems.map((item, pos) => (
            <button
              key={pos}
              className={rightClass(pos)}
              onClick={() => handleRight(pos)}
              disabled={matched.has(item.idx)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
