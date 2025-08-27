import { useMemo, useState } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { useAuth } from '../contexts/AuthContext'

export default function BookList({ onEdit, onDelete, onBorrow, showActions = true }) {
  const { books } = useLibrary()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [year, setYear] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  // Role-based permissions
  const canEdit = user?.role === 'librarian'
  const canDelete = user?.role === 'librarian'
  const canBorrow = user?.role === 'student' || user?.role === 'librarian'

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchesQuery = [b.title, b.author, b.isbn, b.category]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(query.toLowerCase()))
      const matchesCategory = !category || b.category === category
      const matchesAvailability =
        !availability || (availability === 'available' ? b.available : !b.available)
      const matchesYear = !year || String(b.publishedYear) === String(year)
      return matchesQuery && matchesCategory && matchesAvailability && matchesYear
    })
  }, [books, query, category, availability, year])

  const categories = useMemo(() => {
    const cats = [...new Set(books.map(b => b.category).filter(Boolean))]
    return cats.sort()
  }, [books])

  const years = useMemo(() => {
    const yrs = [...new Set(books.map(b => b.publishedYear).filter(Boolean))]
    return yrs.sort((a, b) => b - a)
  }, [books])

  if (viewMode === 'grid') {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          <input 
            placeholder="Search title/author/ISBN/category" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={availability} onChange={e => setAvailability(e.target.value)}>
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button 
            type="button" 
            onClick={() => setViewMode('table')}
            className="btn-small"
          >
            Table View
          </button>
        </div>
        
        <div className="books-grid">
          {filtered.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.thumbnail ? (
                  <img src={book.thumbnail} alt={book.title} />
                ) : (
                  <div className="book-placeholder">📚</div>
                )}
                <div className={`book-status ${book.available ? 'available' : 'borrowed'}`}>
                  {book.available ? 'Available' : 'Borrowed'}
                </div>
              </div>
              <div className="book-info">
                <h4>{book.title}</h4>
                <p className="book-author">by {book.author}</p>
                <p className="book-meta">{book.category} • {book.publishedYear}</p>
                {showActions && (
                  <div className="book-actions">
                    {canBorrow && onBorrow && book.available && (
                      <button onClick={() => onBorrow(book)} className="btn-small">
                        Borrow
                      </button>
                    )}
                    {canEdit && onEdit && (
                      <button onClick={() => onEdit(book)} className="btn-small">
                        Edit
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button onClick={() => onDelete(book.id)} className="btn-small btn-danger">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <input 
          placeholder="Search title/author/ISBN/category" 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={availability} onChange={e => setAvailability(e.target.value)}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button 
          type="button" 
          onClick={() => setViewMode('grid')}
          className="btn-small"
        >
          Grid View
        </button>
      </div>
      
      <table width="100%">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Category</th>
            <th>Year</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.map(book => (
            <tr key={book.id}>
              <td>
                {book.thumbnail ? (
                  <img 
                    src={book.thumbnail} 
                    alt={book.title} 
                    style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <div style={{ width: 40, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    📚
                  </div>
                )}
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.category}</td>
              <td>{book.publishedYear}</td>
              <td>
                <span className={`book-status ${book.available ? 'available' : 'borrowed'}`}>
                  {book.available ? 'Available' : 'Borrowed'}
                </span>
              </td>
              {showActions && (
                <td style={{ display: 'flex', gap: 6 }}>
                  {canBorrow && onBorrow && book.available && <button onClick={() => onBorrow(book)} className="btn-small">Borrow</button>}
                  {canEdit && onEdit && <button onClick={() => onEdit(book)} className="btn-small">Edit</button>}
                  {canDelete && onDelete && <button onClick={() => onDelete(book.id)} className="btn-small btn-danger">Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


