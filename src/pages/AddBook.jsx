import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { useNavigate } from 'react-router-dom'
import { fetchBookByIsbn, searchBooks } from '../services/bookApi'
import { CATEGORIES } from '../utils/constants'

export default function AddBook() {
  const { user } = useAuth()
  const { addBook } = useLibrary()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publishedYear: '',
    thumbnail: '',
    description: '',
    pageCount: '',
    publisher: '',
    language: ''
  })
  
  const [loadingApi, setLoadingApi] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only librarians can access this page
  if (user?.role !== 'librarian') {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>Only librarians can add books to BookNest.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFetch = async () => {
    if (!form.isbn) return
    
    setLoadingApi(true)
    try {
      const data = await fetchBookByIsbn(form.isbn)
      if (data) {
        setForm(prev => ({ ...prev, ...data }))
        showSuccessMessage('Book information fetched successfully!')
      } else {
        showErrorMessage('No book found with this ISBN. Try searching by title or author instead.')
      }
    } catch (error) {
      showErrorMessage('Error fetching book information. Please try again.')
      console.error('Fetch error:', error)
    } finally {
      setLoadingApi(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const results = await searchBooks(searchQuery, 10)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      showErrorMessage('Error searching for books. Please try again.')
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const selectSearchResult = (book) => {
    setForm(prev => ({
      ...prev,
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      publishedYear: book.publishedYear || '',
      thumbnail: book.thumbnail || '',
      description: book.description || '',
      pageCount: book.pageCount || '',
      publisher: book.publisher || '',
      language: book.language || ''
    }))
    setShowSearchResults(false)
    setSearchQuery('')
    setSearchResults([])
    showSuccessMessage('Book information selected!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.title || !form.author) {
      showErrorMessage('Title and Author are required fields.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const bookData = {
        ...form,
        available: true
      }
      
      const result = await addBook(bookData)
      if (result.ok) {
        showSuccessMessage(`Successfully added "${form.title}" to BookNest!`)
        setTimeout(() => {
          navigate('/books')
        }, 1500)
      } else {
        showErrorMessage(result.error || 'Failed to add book')
      }
    } catch (error) {
      console.error('Add book error:', error)
      showErrorMessage('Failed to add book. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement('div')
    toast.className = 'toast toast-success'
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  const showErrorMessage = (message) => {
    const toast = document.createElement('div')
    toast.className = 'toast toast-error'
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  return (
    <div className="add-book-page">
      <div className="page-header">
        <button onClick={() => navigate('/books')} className="back-btn">
          ← Back to Books
        </button>
        <h1>Add New Book</h1>
        <p>Add books to BookNest using Google Books API or manual entry</p>
      </div>

      <div className="add-book-container">
        {/* Google Books Integration */}
        <div className="google-books-section">
          <div className="section-header">
            <h2>🔍 Google Books Integration</h2>
            <p className="api-status">
              {import.meta.env.VITE_GOOGLE_BOOKS_API_KEY 
                ? '✅ Using Google Books API with API key (higher rate limits)' 
                : '⚠️ Using Google Books API without API key (limited to 100 requests/day)'
              }
            </p>
          </div>

          {/* ISBN Auto-fill */}
          <div className="isbn-section">
            <h3>Quick ISBN Lookup</h3>
            <div className="isbn-controls">
              <input 
                name="isbn" 
                value={form.isbn} 
                onChange={handleChange}
                placeholder="Enter ISBN to auto-fill book details..."
                className="isbn-input"
              />
              <button 
                type="button" 
                onClick={handleFetch} 
                disabled={loadingApi || !form.isbn}
                className="btn-fetch"
              >
                {loadingApi ? (
                  <>
                    <span className="loading-spinner"></span>
                    Fetching...
                  </>
                ) : (
                  '🔍 Auto-fill from ISBN'
                )}
              </button>
            </div>
          </div>

          {/* Search Alternative */}
          <div className="search-section">
            <h3>Search by Title/Author</h3>
            <div className="search-controls">
              <input
                placeholder="Search for books on Google Books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button 
                type="button" 
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="btn-search"
              >
                {searching ? (
                  <>
                    <span className="loading-spinner"></span>
                    Searching...
                  </>
                ) : (
                  '🔍 Search Google Books'
                )}
              </button>
            </div>
            
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                <div className="results-header">
                  <h4>Search Results ({searchResults.length} books found)</h4>
                  <button 
                    onClick={() => setShowSearchResults(false)}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="google-books-grid">
                  {searchResults.map((book, index) => (
                    <div key={index} className="google-book-card" onClick={() => selectSearchResult(book)}>
                      <div className="book-cover">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt={book.title} />
                        ) : (
                          <div className="book-placeholder">📚</div>
                        )}
                      </div>
                      <div className="book-info">
                        <h4>{book.title}</h4>
                        <p className="book-author">by {book.author}</p>
                        <p className="book-meta">
                          {book.category && `${book.category} • `}
                          {book.publishedYear && `${book.publishedYear} • `}
                          {book.pageCount && `${book.pageCount} pages`}
                        </p>
                        {book.description && (
                          <p className="book-description">
                            {book.description.length > 100 
                              ? `${book.description.substring(0, 100)}...` 
                              : book.description
                            }
                          </p>
                        )}
                        <div className="select-hint">Click to select this book</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Book Form */}
        <div className="manual-form-section">
          <div className="section-header">
            <h2>✏️ Manual Book Entry</h2>
            <p>Fill in book details manually or edit auto-filled information</p>
          </div>

          <form onSubmit={handleSubmit} className="book-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    placeholder="Enter book title..."
                  />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input 
                    name="author" 
                    value={form.author} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    placeholder="Enter author name..."
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input 
                    name="isbn" 
                    value={form.isbn} 
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter ISBN..."
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Published Year</label>
                  <input 
                    name="publishedYear" 
                    value={form.publishedYear} 
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 2023"
                  />
                </div>
                <div className="form-group">
                  <label>Page Count</label>
                  <input 
                    name="pageCount" 
                    value={form.pageCount} 
                    onChange={handleChange}
                    type="number"
                    className="form-input"
                    placeholder="e.g., 350"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section">
              <h3>Additional Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Publisher</label>
                  <input 
                    name="publisher" 
                    value={form.publisher} 
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter publisher..."
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input 
                    name="language" 
                    value={form.language} 
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., English"
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Thumbnail URL</label>
                <input 
                  name="thumbnail" 
                  value={form.thumbnail} 
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter book cover image URL..."
                />
              </div>
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange}
                  rows="4"
                  className="form-textarea"
                  placeholder="Enter book description..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Adding Book...
                  </>
                ) : (
                  '📚 Add Book to BookNest'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/books')}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
