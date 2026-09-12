import { useState } from 'react'
import { DEFAULT_STORES, OTHER_STORE } from '../state.js'

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function buildBody(storeName, items) {
  const lines = items.map((g) => `- ${capitalize(g.key)}`)
  return `${storeName} list:\n\n${lines.join('\n')}`
}

function shareEmail(storeName, items, email) {
  const subject = encodeURIComponent(`${storeName} grocery list`)
  const body = encodeURIComponent(buildBody(storeName, items))
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
}

function shareText(storeName, items, phone) {
  const body = encodeURIComponent(buildBody(storeName, items))
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  const sep = isApple ? '&' : '?'
  window.location.href = `sms:${phone}${sep}body=${body}`
}

export default function GroceryListPage({
  groceryList,
  checked,
  storeAssignments,
  customStores,
  contacts,
  onToggle,
  onClearChecks,
  onAssignStore,
  onAddStore,
}) {
  const [addingStore, setAddingStore] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')

  const storeOptions = [...DEFAULT_STORES, ...customStores.map((s) => s.name), OTHER_STORE]
  const emailContacts = contacts.filter((c) => c.email)
  const phoneContacts = contacts.filter((c) => c.phone)

  function handleAddStore(e) {
    e.preventDefault()
    onAddStore(newStoreName)
    setNewStoreName('')
    setAddingStore(false)
  }

  const buckets = {}
  groceryList.forEach((g) => {
    const store = storeAssignments?.[g.key] || ''
    const bucketKey = store || ' unassigned'
    if (!buckets[bucketKey]) buckets[bucketKey] = []
    buckets[bucketKey].push(g)
  })
  const bucketKeys = Object.keys(buckets).sort((a, b) => a.localeCompare(b))

  function renderRow(group) {
    const isChecked = !!checked?.[group.key]
    const store = storeAssignments?.[group.key] || ''
    return (
      <div key={group.key} className={`grocery-row ${isChecked ? 'checked' : ''}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(group.key)}
          aria-label={`Mark ${group.key} as picked up`}
        />
        <div style={{ flex: 1 }}>
          <div className="name">{group.key}</div>
          <div className="detail">
            {group.items.map((it, i) => (
              <span key={i}>
                {it.text} ({it.recipeName})
                {i < group.items.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
        <select value={store} onChange={(e) => onAssignStore(group.key, e.target.value)}>
          <option value="">Store…</option>
          {storeOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>Grocery list</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {addingStore ? (
            <form onSubmit={handleAddStore} style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                placeholder="New store name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
              />
              <button type="submit" className="btn small primary">Add</button>
              <button type="button" className="btn small" onClick={() => setAddingStore(false)}>Cancel</button>
            </form>
          ) : (
            <button className="btn small" onClick={() => setAddingStore(true)}>+ Add store</button>
          )}
          {groceryList.length > 0 && (
            <button className="btn small" onClick={onClearChecks}>Clear checks</button>
          )}
        </div>
      </div>

      {groceryList.length === 0 ? (
        <div className="empty-state">Nothing assigned to this week yet — add recipes to the plan to build a list.</div>
      ) : (
        bucketKeys.map((bucketKey) => {
          const isUnassigned = bucketKey === ' unassigned'
          const storeName = isUnassigned ? 'No store chosen' : bucketKey
          const items = buckets[bucketKey]
          const unpickedItems = items.filter((g) => !checked?.[g.key])
          const canShare = !isUnassigned && unpickedItems.length > 0
          return (
            <div key={bucketKey} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <h3 style={{ fontSize: 14 }}>{storeName}</h3>
                {canShare && (emailContacts.length > 0 || phoneContacts.length > 0) && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {emailContacts.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) shareEmail(storeName, unpickedItems, e.target.value)
                          e.target.value = ''
                        }}
                      >
                        <option value="" disabled>Email to…</option>
                        {emailContacts.map((c) => (
                          <option key={c.id} value={c.email}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    {phoneContacts.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) shareText(storeName, unpickedItems, e.target.value)
                          e.target.value = ''
                        }}
                      >
                        <option value="" disabled>Text to…</option>
                        {phoneContacts.map((c) => (
                          <option key={c.id} value={c.phone}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
              <div className="grocery-list">{items.map(renderRow)}</div>
            </div>
          )
        })
      )}
    </div>
  )
}
