import { useMemo } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { formatDate } from '../utils/date'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { books, borrows, calculateFine } = useLibrary()

  const topBooks = useMemo(() => {
    const counts = new Map()
    for (const br of borrows) {
      counts.set(br.bookId, (counts.get(br.bookId) || 0) + 1)
    }
    const rows = books.map(b => ({ name: b.title, count: counts.get(b.id) || 0 }))
    return rows.sort((a, b) => b.count - a.count).slice(0, 5)
  }, [books, borrows])

  const overdue = useMemo(() => {
    return borrows.filter(br => !br.returnedAt && calculateFine(br) > 0)
  }, [borrows, calculateFine])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h3>Most Borrowed Books</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={topBooks}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h3>Overdue Items</h3>
        <table width="100%">
          <thead>
            <tr>
              <th>Book</th>
              <th>Due</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {overdue.map(br => {
              const book = books.find(b => b.id === br.bookId)
              return (
                <tr key={br.id}>
                  <td>{book?.title}</td>
                  <td>{formatDate(br.dueDate)}</td>
                  <td>${calculateFine(br).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


