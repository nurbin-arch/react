import { useMemo, useState } from 'react'
import { useLibrary } from '../contexts/LibraryContext'

export default function BookList({ onEdit, onDelete, onBorrow, showActions = true }) {
  const { books } = useLibrary()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [year, setYear] = useState('')

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

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Search title/author/ISBN/category" value={query} onChange={e => setQuery(e.target.value)} />
        <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <select value={availability} onChange={e => setAvailability(e.target.value)}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
        </select>
        <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)} />
      </div>
      <table width="100%">
        <thead>
          <tr>
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
          {filtered.map(b => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.isbn}</td>
              <td>{b.category}</td>
              <td>{b.publishedYear}</td>
              <td>{b.available ? 'Available' : 'Borrowed'}</td>
              {showActions && (
                <td style={{ display: 'flex', gap: 6 }}>
                  {onBorrow && b.available && <button onClick={() => onBorrow(b)}>Borrow</button>}
                  {onEdit && <button onClick={() => onEdit(b)}>Edit</button>}
                  {onDelete && <button onClick={() => onDelete(b)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


