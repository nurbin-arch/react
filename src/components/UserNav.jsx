import { NavLink } from 'react-router-dom'
import { useLibrary } from '../contexts/LibraryContext'
import { useAuth } from '../contexts/AuthContext'

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

export default function UserNav() {
  const { borrows } = useLibrary()
  const { user } = useAuth()
  const myCount = borrows.filter(b => b.userId === user?.id && b.status === 'borrowed').length
  return (
    <>
      <li><NavLink to="/student">Dashboard</NavLink></li>
      <li><NavLink to="/books">Browse Books</NavLink></li>
      <li><NavLink to="/student#my-borrows">My Borrows <Badge>{myCount}</Badge></NavLink></li>
    </>
  )
}


