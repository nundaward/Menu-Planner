import { useEffect, useRef, useState } from 'react'

export default function RecipePicker({ recipes, position, onPick, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <div className="picker-backdrop" onMouseDown={onClose} />
      <div className="picker-popover" style={{ top: position.top, left: position.left }} onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {recipes.length === 0 && (
          <div className="picker-empty">No recipes yet — add one on the Recipes tab.</div>
        )}
        {recipes.length > 0 && filtered.length === 0 && (
          <div className="picker-empty">No matches.</div>
        )}
        {filtered.map((r) => (
          <button key={r.id} className="picker-item" onClick={() => onPick(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
    </>
  )
}
