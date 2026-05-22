import SpeakButton from '../SpeakButton'

export default function MultipleChoice({ exercise, answered, isCorrect, onSelect }) {
  const { question, options, correct, speakFr } = exercise

  const getClass = (i) => {
    if (!answered) return 'option-btn'
    if (i === correct) return 'option-btn correct'
    return 'option-btn wrong-dim'
  }

  const isPhrase = options.some(o => o.length > 22)

  return (
    <div className="mc-exercise">
      <div className="question-header">
        <p className="exercise-question">{question}</p>
        {speakFr && <SpeakButton text={speakFr} />}
      </div>
      <div className={`options-grid ${isPhrase ? 'options-1col' : ''}`}>
        {options.map((opt, i) => (
          <button
            key={i}
            className={getClass(i)}
            onClick={() => !answered && onSelect(i === correct)}
            disabled={answered}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
