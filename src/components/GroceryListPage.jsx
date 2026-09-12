import { useState } from 'react'
import { DEFAULT_STORES, OTHER_STORE } from '../state.js'

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function buildBody(storeName, items) {
  const lines = items.map((g) => `- ${capitalize(g.label)}`)
  return `${storeName} list:\n\n${lines.join('\n')}`
}

function mailtoHref(storeName, items, email) {
  const subject = encodeURIComponent(`${storeName} grocery list`)
  const body = encodeURIComponent(buildBody(storeName, items))
  return `mailto:${email}?subject=${subject}&body=${body}`
}

function smsHref(storeName, items, phone) {
  const body = encodeURIComponent(buildBody(storeName, items))
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  const sep = isApple ? '&' : '?'
  return `sms:${phone}${sep}body=${body}`
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
  onAddItem,
  onRemoveItem,
}) {
  const [addingStore, setAddingStore] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newItemText, setNewItemText] = useState('')

  const storeOptions = [...DEFAULT_STORES, ...customStores.map((s) => s.name), OTHER_STORE]
  const emailContacts = contacts.filter((c) => c.email)
  const phoneContacts = contacts.filter((c) => c.phone)

  function handleAddStore(e) {
    e.preventDefault()
    onAddStore(newStoreName)
    setNewStoreName('')
    setAddingStore(false)
  }

  function handleAddItem(e) {
    e.preventDefault()
    if (!newItemText.trim()) return
    onAddItem(newItemText)
    setNewItemText('')
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
          aria-label={`Mark ${group.label} as picked up`}
        />
        <div style={{ flex: 1 }}>
          <div className="name">{group.label}</div>
          {!group.manual && (
            <div className="detail">
              {group.items.map((it, i) => (
                <span key={i}>
                  {it.text} ({it.recipeName})
                  {i < group.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
        <select value={store} onChange={(e) => onAssignStore(group.key, e.target.value)}>
          <option value="">Store…</option>
          {storeOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {group.manual && (
          <button className="iconbtn" onClick={() => onRemoveItem(group.key)} aria-label={`Remove ${group.label}`}>×</button>
        )}
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

      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <input
          style={{ flex: 1 }}
          placeholder="Add an item (e.g. paper towels)…"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <button type="submit" className="btn primary">+ Add item</button>
      </form>

      {groceryList.length === 0 ? (
        <div className="empty-state">Nothing on the list yet — add recipes to the plan, or add an item above.</div>
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
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {emailContacts.map((c) => (
                      <a
                        key={`email-${c.id}`}
                        className="btn small"
                        href={mailtoHref(storeName, unpickedItems, c.email)}
                      >
                        Email {c.name}
                      </a>
                    ))}
                    {phoneContacts.map((c) => (
                      <a
                        key={`text-${c.id}`}
                        className="btn small"
                        href={smsHref(storeName, unpickedItems, c.phone)}
                      >
                        Text {c.name}
                      </a>
                    ))}
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
