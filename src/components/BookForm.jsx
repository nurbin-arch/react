import { useEffect, useState } from 'react'
import { CATEGORIES } from '../utils/constants'
import { fetchBookByIsbn } from '../services/bookApi'

export default function BookForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { title: '', author: '', isbn: '', category: '', publishedYear: '', thumbnail: '' }
  )
  const [loadingApi, setLoadingApi] = useState(false)

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
    const data = await fetchBookByIsbn(form.isbn)
    if (data) setForm(prev => ({ ...prev, ...data }))
    setLoadingApi(false)
  }

  const submit = e => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={submit} className="book-form">
      <div>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />
      </div>
      <div>
        <label>Author</label>
        <input name="author" value={form.author} onChange={handleChange} required />
      </div>
      <div>
        <label>ISBN</label>
        <input name="isbn" value={form.isbn} onChange={handleChange} />
        <button type="button" onClick={handleFetch} disabled={loadingApi}>
          {loadingApi ? 'Fetching…' : 'Auto-fill'}
        </button>
      </div>
      <div>
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Published Year</label>
        <input name="publishedYear" value={form.publishedYear} onChange={handleChange} />
      </div>
      <div>
        <label>Thumbnail URL</label>
        <input name="thumbnail" value={form.thumbnail} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Save</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}


