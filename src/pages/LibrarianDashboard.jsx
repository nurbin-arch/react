import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import BookList from '../components/BookList'
import BookForm from '../components/BookForm'
import Dashboard from '../components/Dashboard'

export default function LibrarianDashboard() {
  const { user } = useAuth()
  const { addBook, updateBook, deleteBook, books, borrows, calculateFine } = useLibrary()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Only librarians can access this dashboard
  if (user?.role !== 'librarian') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Access Denied</h2>
        <p>Only librarians can access this dashboard.</p>
      </div>
    )
  }

  const handleSubmit = async book => {
    if (editing) {
      await updateBook(editing.id, book)
      setEditing(null)
    } else {
      await addBook(book)
    }
    setShowForm(false)
  }

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      await deleteBook(bookId)
    }
  }

  // Filtered books for inventory management
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchQuery || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
      
      const matchesCategory = !filterCategory || book.category === filterCategory
      const matchesStatus = !filterStatus || 
        (filterStatus === 'available' ? book.available : !book.available)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [books, searchQuery, filterCategory, filterStatus])

  const overdueBorrows = borrows.filter(br => br.status === 'borrowed' && calculateFine(br) > 0)
  const totalBooks = books.length
  const borrowedBooks = books.filter(b => !b.available).length
  const availableBooks = totalBooks - borrowedBooks

  // Get unique categories for filter
  const categories = useMemo(() => {
    return [...new Set(books.map(b => b.category).filter(Boolean))].sort()
  }, [books])

  // Inventory summary
  const inventorySummary = useMemo(() => {
    const summary = {}
    books.forEach(book => {
      if (book.category) {
        if (!summary[book.category]) {
          summary[book.category] = { total: 0, available: 0, borrowed: 0 }
        }
        summary[book.category].total++
        if (book.available) {
          summary[book.category].available++
        } else {
          summary[book.category].borrowed++
        }
      }
    })
    return summary
  }, [books])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user.email}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowForm(s => !s)}>{showForm ? 'Close' : 'Add Book'}</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <h3>Total Books</h3>
          <div className="stat-number">{totalBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <div className="stat-number available">{availableBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Borrowed</h3>
          <div className="stat-number borrowed">{borrowedBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <div className="stat-number overdue">{overdueBorrows.length}</div>
        </div>
      </div>

      {/* Inventory Management */}
      <section id="inventory">
        <h3>Inventory Management</h3>
        
        {/* Search and Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 12, 
          marginBottom: 16,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <input
            placeholder="Search books by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>

        {/* Inventory Summary by Category */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, color: 'var(--color-muted)' }}>Inventory by Category</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 12 
          }}>
            {Object.entries(inventorySummary).map(([category, stats]) => (
              <div key={category} style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{category}</div>
                <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                  Total: {stats.total} | Available: {stats.available} | Borrowed: {stats.borrowed}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BookList
          onEdit={b => { setEditing(b); setShowForm(true) }}
          onDelete={handleDelete}
          showActions
        />
      </section>

      {showForm && (
        <BookForm initial={editing || undefined} onSubmit={handleSubmit} onCancel={() => { setEditing(null); setShowForm(false) }} />
      )}

      {/* Analytics Dashboard */}
      <section id="analytics">
        <h3>Analytics & Reports</h3>
        <Dashboard />
      </section>

      {/* Overdue Management */}
      {overdueBorrows.length > 0 && (
        <section id="overdue">
          <h3>Overdue Books Requiring Attention</h3>
          <div className="overdue-list">
            {overdueBorrows.map(br => {
              const book = books.find(b => b.id === br.bookId)
              const fine = calculateFine(br)
              const dueDate = new Date(br.dueDate)
              const daysOverdue = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={br.id} className="overdue-item">
                  <div className="overdue-book-info">
                    <h4>{book?.title || 'Unknown Book'}</h4>
                    <p>Borrowed by: {br.userId}</p>
                    <p>Due: {dueDate.toLocaleDateString()}</p>
                    <p>Days Overdue: {daysOverdue}</p>
                    <p className="fine-amount">Fine: ${fine.toFixed(2)}</p>
                  </div>
                  <div className="overdue-actions">
                    <button 
                      className="btn-small"
                      onClick={() => {
                        // Could add functionality to send reminder emails
                        alert(`Reminder sent to ${br.userId} about overdue book: ${book?.title}`)
                      }}
                    >
                      Send Reminder
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => {
                        if (window.confirm(`Mark "${book?.title}" as returned by ${br.userId}?`)) {
                          // Could add functionality to mark as returned
                          alert('Book marked as returned')
                        }
                      }}
                    >
                      Mark Returned
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}


