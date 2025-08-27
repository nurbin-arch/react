import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import BookList from '../components/BookList'
import BookForm from '../components/BookForm'
import Dashboard from '../components/Dashboard'

export default function LibrarianDashboard() {
  const { logout, user } = useAuth()
  const { addBook, updateBook, deleteBook } = useLibrary()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = book => {
    if (editing) {
      updateBook(editing.id, book)
      setEditing(null)
    } else {
      addBook(book)
    }
    setShowForm(false)
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user.email}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowForm(s => !s)}>{showForm ? 'Close' : 'Add Book'}</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {showForm && (
        <BookForm initial={editing || undefined} onSubmit={handleSubmit} onCancel={() => { setEditing(null); setShowForm(false) }} />
      )}

      <section>
        <h3>Inventory</h3>
        <BookList
          onEdit={b => { setEditing(b); setShowForm(true) }}
          onDelete={b => deleteBook(b.id)}
          showActions
        />
      </section>

      <section>
        <Dashboard />
      </section>
    </div>
  )
}


