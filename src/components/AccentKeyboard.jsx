// Teclado virtual de acentos franceses para exercícios de digitação
const ACCENTS = ['é','è','ê','ë','à','â','ù','û','ü','î','ï','ô','ç','œ','æ']

/**
 * @param {object} props
 * @param {React.RefObject} props.inputRef  - ref do <input> alvo
 * @param {string}          props.value     - valor atual do input
 * @param {function}        props.onChange  - setter do valor (setValue)
 * @param {boolean}         props.disabled  - esconde o teclado quando true
 */
export default function AccentKeyboard({ inputRef, value, onChange, disabled }) {
  if (disabled) return null

  const insert = (char) => {
    const el = inputRef?.current
    if (!el) {
      onChange(value + char)
      return
    }
    const start  = el.selectionStart ?? value.length
    const end    = el.selectionEnd   ?? value.length
    const newVal = value.slice(0, start) + char + value.slice(end)
    onChange(newVal)
    // Restaura foco e posição do cursor após a inserção
    setTimeout(() => {
      try {
        el.focus()
        el.setSelectionRange(start + 1, start + 1)
      } catch { /* silent */ }
    }, 0)
  }

  return (
    <div className="accent-kb" role="group" aria-label="Caracteres especiais">
      {ACCENTS.map(c => (
        <button
          key={c}
          type="button"
          className="accent-key"
          aria-label={`inserir ${c}`}
          // onPointerDown previne o blur do input antes de registrar selectionStart/End
          onPointerDown={e => { e.preventDefault(); insert(c) }}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
