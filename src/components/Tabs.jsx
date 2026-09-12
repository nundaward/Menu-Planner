const PAGES = [
  { key: 'plan', label: 'Plan' },
  { key: 'recipes', label: 'Recipes' },
  { key: 'grocery', label: 'Grocery List' },
  { key: 'contacts', label: 'Contacts' },
]

export default function Tabs({ page, onChange }) {
  return (
    <div className="tabs">
      {PAGES.map((p) => (
        <button
          key={p.key}
          className={`tab ${page === p.key ? 'active' : ''}`}
          onClick={() => onChange(p.key)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
