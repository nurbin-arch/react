import { NavLink, useNavigate } from 'react-router-dom'
import { useLibrary } from '../contexts/LibraryContext'

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

export default function AdminNav() {
  const { books, borrows, calculateFine } = useLibrary()
  const navigate = useNavigate()
  const totalBooks = books.length
  const overdueCount = borrows.filter(b => !b.returnedAt && calculateFine(b) > 0).length
  
  const handleInventoryClick = () => {
    console.log('Inventory button clicked, navigating to books tab')
    // Navigate to librarian dashboard with books tab active
    navigate('/librarian?tab=books')
  }
  
  const handleOverdueClick = () => {
    console.log('Overdue button clicked, navigating to reports tab')
    // Navigate to librarian dashboard with reports tab active (for overdue items)
    navigate('/librarian?tab=reports')
  }
  
  return (
    <>
      <li><NavLink to="/librarian">Dashboard</NavLink></li>
      <li>
        <button 
          onClick={handleInventoryClick}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Inventory <Badge>{totalBooks}</Badge>
        </button>
      </li>
      <li>
        <button 
          onClick={handleOverdueClick}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Overdue <Badge>{overdueCount}</Badge>
        </button>
      </li>
    </>
  )
}


