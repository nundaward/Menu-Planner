export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
export const MEAL_SLOTS = ['dinner']
export const MEAL_SLOT_LABELS = { dinner: 'Dinner' }
export const DEFAULT_STORES = ['NF', 'Target', 'Jewel', 'Whole Foods']
export const OTHER_STORE = 'Other'

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dateToIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDaysIso(iso, days) {
  const date = isoToDate(iso)
  date.setDate(date.getDate() + days)
  return dateToIso(date)
}

export function currentWeekStart() {
  const today = new Date()
  const day = today.getDay() // 0 = Sun ... 6 = Sat
  const mondayOffset = day === 0 ? -6 : 1 - day
  today.setDate(today.getDate() + mondayOffset)
  return dateToIso(today)
}

export function shortDate(iso) {
  const date = isoToDate(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function weekLabel(weekStartIso) {
  const endIso = addDaysIso(weekStartIso, 6)
  return `${shortDate(weekStartIso)} – ${shortDate(endIso)}`
}

export function emptyPlan() {
  const plan = {}
  DAY_KEYS.forEach((day) => {
    plan[day] = {}
    MEAL_SLOTS.forEach((slot) => {
      plan[day][slot] = []
    })
  })
  return plan
}

export function normalizePlan(plan) {
  const normalized = emptyPlan()
  DAY_KEYS.forEach((day) => {
    MEAL_SLOTS.forEach((slot) => {
      const value = plan?.[day]?.[slot]
      normalized[day][slot] = Array.isArray(value) ? value : []
    })
  })
  return normalized
}

const UNIT_PREFIX = /^[\d./\s]+(cups?|tbsp|tablespoons?|tsp|teaspoons?|lbs?|pounds?|oz|ounces?|cloves?|cans?|g|kg|ml|l|pinch(es)?|slices?|bunch(es)?)\b\s*/i

export function normalizeIngredientText(text) {
  const trimmed = (text || '').trim().toLowerCase()
  const stripped = trimmed.replace(UNIT_PREFIX, '').trim()
  return (stripped || trimmed).replace(/\s+/g, ' ').replace(/,$/, '')
}

export function deriveGroceryList(recipes, plan) {
  const groups = new Map()
  DAY_KEYS.forEach((day) => {
    MEAL_SLOTS.forEach((slot) => {
      const recipeIds = plan?.[day]?.[slot] || []
      recipeIds.forEach((recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId)
        if (!recipe) return
        ;(recipe.ingredients || []).forEach((ing) => {
          if (!ing.text?.trim()) return
          const key = normalizeIngredientText(ing.text)
          if (!groups.has(key)) groups.set(key, { key, label: key, manual: false, items: [] })
          groups.get(key).items.push({ recipeId, recipeName: recipe.name, text: ing.text })
        })
      })
    })
  })
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key))
}
