import { useState } from 'react'

export default function ContactsPage({ contacts, onAddContact, onDeleteContact }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAddContact({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    setName('')
    setEmail('')
    setPhone('')
  }

  async function handleDelete(contact) {
    if (!window.confirm(`Remove "${contact.name}" from your contacts?`)) return
    await onDeleteContact(contact.id)
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>Contacts</h2>
        <span className="desc">People you can email or text a store's grocery list to.</span>
      </div>

      <div className="recipe-list" style={{ marginBottom: 18 }}>
        {contacts.length === 0 && <div className="empty-state">No contacts yet — add one below.</div>}
        {contacts.map((c) => (
          <div key={c.id} className="rowline" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div className="detail" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {c.email || '—'} {c.phone && `· ${c.phone}`}
              </div>
            </div>
            <button className="iconbtn" onClick={() => handleDelete(c)} aria-label={`Remove ${c.name}`}>×</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: '1 1 140px' }}>
            <label htmlFor="c-name">Name</label>
            <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Partner" required />
          </div>
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="c-email">Email (optional)</label>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="field" style={{ flex: '1 1 160px' }}>
            <label htmlFor="c-phone">Phone (optional)</label>
            <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15551234567" />
          </div>
        </div>
        <button type="submit" className="btn primary">+ Add contact</button>
      </form>
    </div>
  )
}
