import { useState } from 'react'
import { DAY_KEYS, DAY_LABELS, MEAL_SLOTS, MEAL_SLOT_LABELS, addDaysIso, shortDate } from '../state.js'
import RecipePicker from './RecipePicker.jsx'

export default function PlannerPage({ recipes, plan, weekStart, onAssign, onUnassign }) {
  const [openCell, setOpenCell] = useState(null) // { day, slot, top, left }

  function openPicker(e, day, slot) {
    const rect = e.currentTarget.getBoundingClientRect()
    setOpenCell({
      day,
      slot,
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    })
  }

  function handlePick(recipeId) {
    onAssign(openCell.day, openCell.slot, recipeId)
    setOpenCell(null)
  }

  const recipeById = (id) => recipes.find((r) => r.id === id)

  return (
    <div className="card">
      <div className="card-head">
        <h2>This week's plan</h2>
        <span className="desc">Click a slot to add a recipe.</span>
      </div>
      <div className="planner-grid">
        <div className="corner" />
        {DAY_KEYS.map((day, i) => (
          <div key={day} className="daycol-head">
            {DAY_LABELS[day]}
            <div className="mono" style={{ fontWeight: 400, fontSize: 10, marginTop: 2 }}>
              {shortDate(addDaysIso(weekStart, i))}
            </div>
          </div>
        ))}

        {MEAL_SLOTS.map((slot) => (
          <div key={slot} style={{ display: 'contents' }}>
            <div className="slot-label">{MEAL_SLOT_LABELS[slot]}</div>
            {DAY_KEYS.map((day) => {
              const recipeIds = plan?.[day]?.[slot] || []
              return (
                <div key={`${day}-${slot}`} className="plan-cell">
                  {recipeIds.map((id) => {
                    const recipe = recipeById(id)
                    if (!recipe) return null
                    return (
                      <span key={id} className="chip-recipe">
                        {recipe.name}
                        <button onClick={() => onUnassign(day, slot, id)} aria-label={`Remove ${recipe.name}`}>
                          ×
                        </button>
                      </span>
                    )
                  })}
                  <button className="add-slot-btn" onClick={(e) => openPicker(e, day, slot)}>
                    + Add
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {openCell && (
        <RecipePicker
          recipes={recipes}
          position={{ top: openCell.top, left: openCell.left }}
          onPick={handlePick}
          onClose={() => setOpenCell(null)}
        />
      )}
    </div>
  )
}
