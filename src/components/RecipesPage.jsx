import { useState } from 'react'
import { uid } from '../state.js'
import RecipeForm from './RecipeForm.jsx'

function blankRecipe() {
  return {
    id: null,
    name: '',
    cuisine: '',
    tags: [],
    ingredients: Array.from({ length: 5 }, () => ({ id: uid('ing'), text: '' })),
    instructions: '',
  }
}

export default function RecipesPage({ recipes, onAddRecipe, onUpdateRecipe, onDeleteRecipe }) {
  const [selectedId, setSelectedId] = useState(null) // recipe id, 'new', or null
  const [draft, setDraft] = useState(null)
  const [filter, setFilter] = useState('')

  const sorted = [...recipes].sort((a, b) => a.name.localeCompare(b.name))
  const filtered = sorted.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))

  function selectRecipe(recipe) {
    setSelectedId(recipe.id)
    setDraft({ ...recipe, ingredients: recipe.ingredients.map((i) => ({ ...i })) })
  }

  function startNew() {
    setSelectedId('new')
    setDraft(blankRecipe())
  }

  function cancelEdit() {
    setSelectedId(null)
    setDraft(null)
  }

  async function handleSave() {
    if (!draft.name.trim()) return
    if (selectedId === 'new') {
      await onAddRecipe(draft)
    } else {
      await onUpdateRecipe(draft)
    }
    cancelEdit()
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${draft.name}"? This also removes it from any weeks it's assigned to.`)) return
    await onDeleteRecipe(draft.id)
    cancelEdit()
  }

  return (
    <div className="card recipes-layout">
      <div>
        <div className="field">
          <input placeholder="Search recipes…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="recipe-list">
          {filtered.map((r) => (
            <button
              key={r.id}
              className={`recipe-list-item ${selectedId === r.id ? 'active' : ''}`}
              onClick={() => selectRecipe(r)}
            >
              <span className="name">{r.name}</span>
              {r.cuisine && <span className="badge">{r.cuisine}</span>}
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-state">No recipes found.</div>}
        </div>
        <button className="btn primary" style={{ marginTop: 12, width: '100%' }} onClick={startNew}>
          + New Recipe
        </button>
      </div>

      <div>
        {draft ? (
          <RecipeForm
            draft={draft}
            isNew={selectedId === 'new'}
            onChange={setDraft}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={cancelEdit}
          />
        ) : (
          <div className="empty-state">Select a recipe, or add a new one.</div>
        )}
      </div>
    </div>
  )
}
