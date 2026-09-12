import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient.js'
import {
  DAY_KEYS,
  MEAL_SLOTS,
  currentWeekStart,
  addDaysIso,
  emptyPlan,
  normalizePlan,
  deriveGroceryList,
  uid,
} from './state.js'
import Login from './components/Login.jsx'
import Topbar from './components/Topbar.jsx'
import Tabs from './components/Tabs.jsx'
import PlannerPage from './components/PlannerPage.jsx'
import RecipesPage from './components/RecipesPage.jsx'
import GroceryListPage from './components/GroceryListPage.jsx'
import ContactsPage from './components/ContactsPage.jsx'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = not yet resolved, null = logged out
  const [page, setPage] = useState('plan')
  const [recipes, setRecipes] = useState([])
  const [customStores, setCustomStores] = useState([])
  const [contacts, setContacts] = useState([])
  const [weekStart, setWeekStart] = useState(currentWeekStart())
  const [weekRow, setWeekRow] = useState(null) // { id, week_start, plan, checked, stores }
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase
      .from('recipes')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setErrorMsg(error.message)
        else setRecipes(data)
      })
    supabase
      .from('stores')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setErrorMsg(error.message)
        else setCustomStores(data)
      })
    supabase
      .from('contacts')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setErrorMsg(error.message)
        else setContacts(data)
      })
  }, [session])

  useEffect(() => {
    if (!session) return
    loadWeek(weekStart)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, weekStart])

  async function loadWeek(iso) {
    const { data, error } = await supabase.from('week_plans').select('*').eq('week_start', iso).maybeSingle()
    if (error) {
      setErrorMsg(error.message)
      return
    }
    if (data) {
      setWeekRow(data)
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('week_plans')
        .insert({ week_start: iso, plan: emptyPlan(), checked: {}, stores: {}, extra_items: [] })
        .select()
        .single()
      if (insertError) setErrorMsg(insertError.message)
      else setWeekRow(inserted)
    }
  }

  async function persistWeekRow(row) {
    setSaveStatus('saving')
    const { error } = await supabase
      .from('week_plans')
      .update({ plan: row.plan, checked: row.checked, stores: row.stores, extra_items: row.extra_items })
      .eq('id', row.id)
    if (error) {
      setSaveStatus('error')
      setErrorMsg(error.message)
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000)
    }
  }

  function updateWeekRow(mutator) {
    if (!weekRow) return
    const plan = normalizePlan(weekRow.plan)
    mutator(plan)
    const updated = { ...weekRow, plan }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  function assignRecipeToSlot(day, slot, recipeId) {
    updateWeekRow((plan) => {
      if (!plan[day][slot].includes(recipeId)) plan[day][slot] = [...plan[day][slot], recipeId]
    })
  }

  function unassignRecipeFromSlot(day, slot, recipeId) {
    updateWeekRow((plan) => {
      plan[day][slot] = plan[day][slot].filter((id) => id !== recipeId)
    })
  }

  function toggleGroceryItem(key) {
    if (!weekRow) return
    const checked = { ...(weekRow.checked || {}) }
    checked[key] = !checked[key]
    const updated = { ...weekRow, checked }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  function clearGroceryChecks() {
    if (!weekRow) return
    const updated = { ...weekRow, checked: {} }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  function addGroceryItem(text) {
    const trimmed = text.trim()
    if (!trimmed || !weekRow) return
    const extraItems = [...(weekRow.extra_items || []), { id: uid('item'), text: trimmed }]
    const updated = { ...weekRow, extra_items: extraItems }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  function removeGroceryItem(id) {
    if (!weekRow) return
    const extraItems = (weekRow.extra_items || []).filter((item) => item.id !== id)
    const checked = { ...(weekRow.checked || {}) }
    delete checked[id]
    const stores = { ...(weekRow.stores || {}) }
    delete stores[id]
    const updated = { ...weekRow, extra_items: extraItems, checked, stores }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  function assignStoreToItem(key, storeName) {
    if (!weekRow) return
    const stores = { ...(weekRow.stores || {}) }
    stores[key] = storeName
    const updated = { ...weekRow, stores }
    setWeekRow(updated)
    persistWeekRow(updated)
  }

  async function addStore(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (customStores.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return
    const { data, error } = await supabase.from('stores').insert({ name: trimmed }).select().single()
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setCustomStores((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function addContact(contact) {
    const { data, error } = await supabase.from('contacts').insert(contact).select().single()
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setContacts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  async function addRecipe(draft) {
    const { id, ...payload } = draft
    const { data, error } = await supabase.from('recipes').insert(payload).select().single()
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setRecipes((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function updateRecipe(draft) {
    const { id, created_at, updated_at, ...payload } = draft
    const { data, error } = await supabase
      .from('recipes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setRecipes((prev) => prev.map((r) => (r.id === id ? data : r)).sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function deleteRecipe(id) {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    await sweepRecipeFromAllWeeks(id)
    await loadWeek(weekStart)
  }

  async function sweepRecipeFromAllWeeks(recipeId) {
    const { data: rows, error } = await supabase.from('week_plans').select('id, plan')
    if (error || !rows) return
    for (const row of rows) {
      const plan = normalizePlan(row.plan)
      let changed = false
      DAY_KEYS.forEach((day) => {
        MEAL_SLOTS.forEach((slot) => {
          if (plan[day][slot].includes(recipeId)) {
            plan[day][slot] = plan[day][slot].filter((id) => id !== recipeId)
            changed = true
          }
        })
      })
      if (changed) {
        await supabase.from('week_plans').update({ plan }).eq('id', row.id)
      }
    }
  }

  function goToWeek(iso) {
    setWeekRow(null)
    setWeekStart(iso)
  }

  const groceryList = useMemo(() => {
    if (!weekRow) return []
    const derived = deriveGroceryList(recipes, weekRow.plan)
    const manual = (weekRow.extra_items || []).map((item) => ({
      key: item.id,
      label: item.text,
      manual: true,
      items: [{ text: item.text }],
    }))
    return [...derived, ...manual].sort((a, b) => a.label.localeCompare(b.label))
  }, [recipes, weekRow])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (session === undefined) {
    return <div className="empty-state">Loading…</div>
  }

  if (!session) {
    return <Login />
  }

  const isCurrentWeek = weekStart === currentWeekStart()

  return (
    <>
      <Topbar
        weekStart={weekStart}
        isCurrentWeek={isCurrentWeek}
        saveStatus={saveStatus}
        onPrevWeek={() => goToWeek(addDaysIso(weekStart, -7))}
        onNextWeek={() => goToWeek(addDaysIso(weekStart, 7))}
        onCurrentWeek={() => goToWeek(currentWeekStart())}
        onSignOut={handleSignOut}
      />
      <Tabs page={page} onChange={setPage} />

      {errorMsg && <div className="banner error">{errorMsg}</div>}

      {page === 'plan' && weekRow && (
        <PlannerPage
          recipes={recipes}
          plan={weekRow.plan}
          weekStart={weekStart}
          onAssign={assignRecipeToSlot}
          onUnassign={unassignRecipeFromSlot}
        />
      )}

      {page === 'recipes' && (
        <RecipesPage
          recipes={recipes}
          onAddRecipe={addRecipe}
          onUpdateRecipe={updateRecipe}
          onDeleteRecipe={deleteRecipe}
        />
      )}

      {page === 'grocery' && weekRow && (
        <GroceryListPage
          groceryList={groceryList}
          checked={weekRow.checked}
          storeAssignments={weekRow.stores}
          customStores={customStores}
          contacts={contacts}
          onToggle={toggleGroceryItem}
          onClearChecks={clearGroceryChecks}
          onAssignStore={assignStoreToItem}
          onAddStore={addStore}
          onAddItem={addGroceryItem}
          onRemoveItem={removeGroceryItem}
        />
      )}

      {page === 'contacts' && (
        <ContactsPage contacts={contacts} onAddContact={addContact} onDeleteContact={deleteContact} />
      )}
    </>
  )
}
