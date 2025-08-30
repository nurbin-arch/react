import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { formatDate } from '../utils/date'

export default function BooksBrowse() {
  const { user } = useAuth()
  const { books, borrows, borrowBook, calculateFine } = useLibrary()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [year, setYear] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [borrowing, setBorrowing] = useState(null)


  // Role-based permissions
  const canBorrow = user?.role === 'student' || user?.role === 'librarian'
  const canAddBooks = user?.role === 'librarian'

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

  const handleInstantBorrow = async (book) => {
    if (!canBorrow) {
      alert('You do not have permission to borrow books.')
      return
    }

    if (!book.available) {
      alert('This book is not available for borrowing.')
      return
    }

    setBorrowing(book.id)
    
    try {
      console.log('Attempting to borrow book:', { bookId: book.id, userId: user.id })
      const result = await borrowBook({ bookId: book.id, userId: user.id, days: 14 })
      console.log('Borrow result:', result)
      
      if (result.ok) {
        alert(`Successfully borrowed "${book.title}"! Due date: ${formatDate(result.borrow.dueDate)}`)
      } else {
        alert(result.error || 'Failed to borrow book')
      }
    } catch (error) {
      console.error('Borrow error:', error)
      alert('Failed to borrow book. Please try again.')
    } finally {
      setBorrowing(null)
    }
  }

  const getBookStatus = (book) => {
    if (!book.available) {
      const borrow = borrows.find(br => br.bookId === book.id && br.status === 'borrowed')
      if (borrow) {
        const fine = calculateFine(borrow)
        if (fine > 0) {
          return { status: 'overdue', label: `Overdue (Rs. ${fine.toFixed(2)})`, class: 'overdue' }
        }
        const dueDate = new Date(borrow.dueDate)
        const now = new Date()
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
        return { 
          status: 'borrowed', 
          label: `Borrowed (${daysLeft} days left)`, 
          class: 'borrowed' 
        }
      }
      return { status: 'unavailable', label: 'Unavailable', class: 'unavailable' }
    }
    return { status: 'available', label: 'Available', class: 'available' }
  }



  if (viewMode === 'grid') {
    return (
      <div className="books-browse">
        {/* Header */}
        <div className="browse-header">
          <h2>Browse Books</h2>
          <p>Discover and borrow from our collection of {books.length} books</p>
        </div>

                       {/* Add Book Section (Librarians Only) */}
        {canAddBooks && (
          <div className="add-book-section">
            <div className="add-book-content">
              <div className="add-book-info">
                <h3>📚 Add New Books</h3>
                <p>Use Google Books API to search and add books to BookNest, or enter details manually</p>
              </div>
              <a href="/add-book" className="btn-add-book">
                ➕ Add New Book
              </a>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="browse-filters">
          <div className="search-bar">
            <input 
              placeholder="Search by title, author, ISBN, or category..." 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
            <select value={availability} onChange={e => setAvailability(e.target.value)} className="filter-select">
              <option value="">All Books</option>
              <option value="available">Available Only</option>
              <option value="borrowed">Borrowed Only</option>
            </select>
            
            <select value={year} onChange={e => setYear(e.target.value)} className="filter-select">
              <option value="">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            
            <button 
              type="button" 
              onClick={() => setViewMode('table')}
              className="view-toggle"
            >
              Table View
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span>{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</span>
          {query && <span> • Searching for "{query}"</span>}
          {category && <span> • Category: {category}</span>}
        </div>

        {/* Books Grid */}
        <div className="books-grid">
          {filtered.map(book => {
            const bookStatus = getBookStatus(book)
            const isBorrowing = borrowing === book.id
            
            return (
              <div key={book.id} className="book-card">
                <div className="book-cover">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} />
                  ) : (
                    <div className="book-placeholder">📚</div>
                  )}
                  <div className={`book-status ${bookStatus.class}`}>
                    {bookStatus.label}
                  </div>
                </div>
                
                <div className="book-info">
                  <h4 className="book-title">{book.title}</h4>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-meta">
                    {book.category} • {book.publishedYear}
                    {book.pageCount && ` • ${book.pageCount} pages`}
                  </p>
                  
                  {book.description && (
                    <p className="book-description">
                      {book.description.length > 100 
                        ? `${book.description.substring(0, 100)}...` 
                        : book.description
                      }
                    </p>
                  )}
                  
                  <div className="book-actions">
                    {canBorrow && book.available ? (
                      <button 
                        onClick={() => handleInstantBorrow(book)}
                        disabled={isBorrowing}
                        className={`borrow-btn ${isBorrowing ? 'borrowing' : ''}`}
                      >
                        {isBorrowing ? (
                          <>
                            <span className="loading-spinner"></span>
                            Borrowing...
                          </>
                        ) : (
                          'Borrow Now'
                        )}
                      </button>
                    ) : (
                      <div className="book-status-message">
                        {!canBorrow && 'Login to borrow'}
                        {!book.available && bookStatus.label}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No books found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    )
  }

  // Table View
  return (
    <div className="books-browse">
      <div className="browse-header">
        <h2>Browse Books</h2>
        <p>Discover and borrow from our collection of {books.length} books</p>
      </div>

             {/* Add Book Section (Librarians Only) */}
       {canAddBooks && (
         <div className="add-book-section">
           <div className="add-book-content">
             <div className="add-book-info">
               <h3>📚 Add New Books</h3>
               <p>Use Google Books API to search and add books, or enter details manually</p>
             </div>
             <a href="/add-book" className="btn-add-book">
               ➕ Add New Book
             </a>
           </div>
         </div>
       )}

      <div className="browse-filters">
        <div className="search-bar">
          <input 
            placeholder="Search by title, author, ISBN, or category..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="filter-select">
            <option value="">All Books</option>
            <option value="available">Available Only</option>
            <option value="borrowed">Borrowed Only</option>
          </select>
          
          <select value={year} onChange={e => setYear(e.target.value)} className="filter-select">
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          
          <button 
            type="button" 
            onClick={() => setViewMode('grid')}
            className="view-toggle"
          >
            Grid View
          </button>
        </div>
      </div>

      <div className="results-summary">
        <span>{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</span>
        {query && <span> • Searching for "{query}"</span>}
        {category && <span> • Category: {category}</span>}
      </div>
      
      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(book => {
              const bookStatus = getBookStatus(book)
              const isBorrowing = borrowing === book.id
              
              return (
                <tr key={book.id} className="book-row">
                  <td className="book-cover-cell">
                    {book.thumbnail ? (
                      <img 
                        src={book.thumbnail} 
                        alt={book.title} 
                        className="book-cover-thumb"
                      />
                    ) : (
                      <div className="book-placeholder-thumb">📚</div>
                    )}
                  </td>
                  <td className="book-title-cell">
                    <div className="book-title">{book.title}</div>
                    {book.isbn && <div className="book-isbn">ISBN: {book.isbn}</div>}
                  </td>
                  <td className="book-author-cell">{book.author}</td>
                  <td className="book-category-cell">{book.category}</td>
                  <td className="book-year-cell">{book.publishedYear}</td>
                  <td className="book-status-cell">
                    <span className={`status-badge ${bookStatus.class}`}>
                      {bookStatus.label}
                    </span>
                  </td>
                  <td className="book-action-cell">
                    {canBorrow && book.available ? (
                      <button 
                        onClick={() => handleInstantBorrow(book)}
                        disabled={isBorrowing}
                        className={`borrow-btn-small ${isBorrowing ? 'borrowing' : ''}`}
                      >
                        {isBorrowing ? 'Borrowing...' : 'Borrow'}
                      </button>
                    ) : (
                      <span className="action-disabled">
                        {!canBorrow ? 'Login to borrow' : bookStatus.label}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No books found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  )
}
