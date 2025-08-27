import { NavLink } from 'react-router-dom'
import { useLibrary } from '../contexts/LibraryContext'

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

export default function AdminNav() {
  const { books, borrows, calculateFine } = useLibrary()
  const totalBooks = books.length
  const overdueCount = borrows.filter(b => !b.returnedAt && calculateFine(b) > 0).length
  return (
    <>
      <li><NavLink to="/librarian">Dashboard</NavLink></li>
      <li><a href="#inventory">Inventory <Badge>{totalBooks}</Badge></a></li>
      <li><a href="#analytics">Overdue <Badge>{overdueCount}</Badge></a></li>
    </>
  )
}


