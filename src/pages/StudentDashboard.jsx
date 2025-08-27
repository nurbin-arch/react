import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import BookList from '../components/BookList'
import BorrowForm from '../components/BorrowForm'
import { formatDate } from '../utils/date'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const { books, borrows, borrowBook, returnBook, calculateFine } = useLibrary()
  const [selected, setSelected] = useState(null)
  const [showBorrow, setShowBorrow] = useState(false)

  const myBorrows = useMemo(() => borrows.filter(br => br.userId === user.id), [borrows, user.id])

  const startBorrow = book => {
    setSelected(book)
    setShowBorrow(true)
  }

  const confirmBorrow = days => {
    borrowBook({ bookId: selected.id, userId: user.id, days })
    setShowBorrow(false)
    setSelected(null)
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hi, {user.email}</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <section>
        <h3>Browse Books</h3>
        <BookList onBorrow={startBorrow} showActions />
        {showBorrow && (
          <BorrowForm onSubmit={confirmBorrow} onCancel={() => setShowBorrow(false)} />
        )}
      </section>

      <section>
        <h3>My Borrowed Books</h3>
        <table width="100%">
          <thead>
            <tr>
              <th>Title</th>
              <th>Borrowed</th>
              <th>Due</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {myBorrows.map(br => (
              <tr key={br.id}>
                <td>{books.find(b => b.id === br.bookId)?.title || ''}</td>
                <td>{formatDate(br.borrowedAt)}</td>
                <td>{formatDate(br.dueDate)}</td>
                <td>${calculateFine(br).toFixed(2)}</td>
                <td>
                  {!br.returnedAt ? (
                    <button onClick={() => returnBook({ borrowId: br.id })}>Return</button>
                  ) : (
                    'Returned'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )

  // no inner hooks; data pulled at top-level
}


