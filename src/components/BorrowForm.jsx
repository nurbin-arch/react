import { useState } from 'react'

export default function BorrowForm({ onSubmit, onCancel, defaultDays = 14 }) {
  const [days, setDays] = useState(defaultDays)

  const submit = e => {
    e.preventDefault()
    onSubmit?.(Number(days))
  }

  return (
    <form onSubmit={submit} className="borrow-form">
      <label>Days</label>
      <input type="number" min="1" value={days} onChange={e => setDays(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Borrow</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}


