import { uid } from '../state.js'

export default function RecipeForm({ draft, isNew, onChange, onSave, onDelete, onCancel }) {
  function set(field, value) {
    onChange({ ...draft, [field]: value })
  }

  function setIngredient(id, text) {
    set(
      'ingredients',
      draft.ingredients.map((ing) => (ing.id === id ? { ...ing, text } : ing))
    )
  }

  function addIngredient() {
    set('ingredients', [...draft.ingredients, { id: uid('ing'), text: '' }])
  }

  function removeIngredient(id) {
    set('ingredients', draft.ingredients.filter((ing) => ing.id !== id))
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="rf-name">Name</label>
        <input id="rf-name" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Recipe name" />
      </div>

      <div className="field">
        <label htmlFor="rf-cuisine">Cuisine (optional)</label>
        <input id="rf-cuisine" value={draft.cuisine} onChange={(e) => set('cuisine', e.target.value)} placeholder="e.g. Mexican" />
      </div>

      <div className="field">
        <label>Ingredients</label>
        {draft.ingredients.map((ing) => (
          <div key={ing.id} className="ingredient-row">
            <input
              value={ing.text}
              onChange={(e) => setIngredient(ing.id, e.target.value)}
              placeholder="e.g. 2 cups flour"
            />
            <button className="iconbtn" onClick={() => removeIngredient(ing.id)} aria-label="Remove ingredient">×</button>
          </div>
        ))}
        <button className="btn small" onClick={addIngredient}>+ Add ingredient</button>
      </div>

      <div className="field">
        <label htmlFor="rf-instructions">Instructions</label>
        <textarea
          id="rf-instructions"
          rows={5}
          value={draft.instructions}
          onChange={(e) => set('instructions', e.target.value)}
          placeholder="How to make it…"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <div>
          {!isNew && (
            <button className="btn danger" onClick={onDelete}>Delete</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={!draft.name.trim()}>Save</button>
        </div>
      </div>
    </div>
  )
}
