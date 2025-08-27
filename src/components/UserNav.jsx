import { NavLink } from 'react-router-dom'
import { useLibrary } from '../contexts/LibraryContext'
import { useAuth } from '../contexts/AuthContext'

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

export default function UserNav() {
  const { borrows } = useLibrary()
  const { user } = useAuth()
  const myCount = borrows.filter(b => b.userId === user?.id && !b.returnedAt).length
  return (
    <>
      <li><NavLink to="/student">Dashboard</NavLink></li>
      <li><a href="#browse">Browse</a></li>
      <li><a href="#my-borrows">My Borrows <Badge>{myCount}</Badge></a></li>
    </>
  )
}


