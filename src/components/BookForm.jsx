import { useEffect, useState } from 'react'
import { CATEGORIES } from '../utils/constants'
import { fetchBookByIsbn, searchBooks } from '../services/bookApi'

export default function BookForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { 
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
    }
  )
  const [loadingApi, setLoadingApi] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

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
        // Show success message
        alert('Book information fetched successfully!')
      } else {
        alert('No book found with this ISBN. Try searching by title or author instead.')
      }
    } catch (error) {
      alert('Error fetching book information. Please try again.')
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
      alert('Error searching for books. Please try again.')
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
    alert('Book information selected!')
  }

  const submit = e => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={submit} className="book-form">
      {/* ISBN Section */}
      <div className="form-section">
        <h4>Book Identification</h4>
        <div className="form-row">
          <div className="form-group">
            <label>ISBN</label>
            <input 
              name="isbn" 
              value={form.isbn} 
              onChange={handleChange}
              placeholder="Enter ISBN to auto-fill book details"
            />
            <button 
              type="button" 
              onClick={handleFetch} 
              disabled={loadingApi || !form.isbn}
              className="btn-small"
            >
              {loadingApi ? 'Fetching…' : 'Auto-fill from ISBN'}
            </button>
          </div>
        </div>
        
        {/* Search Alternative */}
        <div className="form-row">
          <div className="form-group">
            <label>Or search by title/author</label>
            <div className="search-container">
              <input
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                type="button" 
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="btn-small"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                <h5>Search Results:</h5>
                {searchResults.map((book, index) => (
                  <div key={index} className="search-result-item" onClick={() => selectSearchResult(book)}>
                    <div className="result-thumbnail">
                      {book.thumbnail ? (
                        <img src={book.thumbnail} alt={book.title} />
                      ) : (
                        <div className="placeholder-thumbnail">📚</div>
                      )}
                    </div>
                    <div className="result-info">
                      <div className="result-title">{book.title}</div>
                      <div className="result-author">by {book.author}</div>
                      <div className="result-meta">
                        {book.publishedYear && `${book.publishedYear} • `}
                        {book.category && `${book.category} • `}
                        {book.publisher && book.publisher}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="form-section">
        <h4>Basic Information</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Author *</label>
            <input name="author" value={form.author} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Published Year</label>
            <input name="publishedYear" value={form.publishedYear} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="form-section">
        <h4>Additional Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Publisher</label>
            <input name="publisher" value={form.publisher} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Page Count</label>
            <input name="pageCount" value={form.pageCount} onChange={handleChange} type="number" />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Language</label>
            <input name="language" value={form.language} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Thumbnail URL</label>
            <input name="thumbnail" value={form.thumbnail} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Description</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange}
            rows="3"
            placeholder="Book description..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn-primary">Save Book</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  )
}


