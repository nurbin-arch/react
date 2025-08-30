import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { formatDate } from '../utils/date'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const { books, borrows, returnBook, calculateFine } = useLibrary()

  const myBorrows = useMemo(() => {
    return borrows.filter(br => br.userId === user.id)
  }, [borrows, user.id])

  // Personal analytics
  const personalStats = useMemo(() => {
    const totalBorrowed = myBorrows.length
    const currentlyBorrowed = myBorrows.filter(br => br.status === 'borrowed').length
    const returned = myBorrows.filter(br => br.status === 'returned').length
    const overdue = myBorrows.filter(br => br.status === 'borrowed' && calculateFine(br) > 0).length
    const totalFines = myBorrows.reduce((sum, br) => sum + calculateFine(br), 0)
    
    // Reading preferences
    const categoryCounts = new Map()
    myBorrows.forEach(br => {
      const book = books.find(b => b.id === br.bookId)
      if (book?.category) {
        categoryCounts.set(book.category, (categoryCounts.get(book.category) || 0) + 1)
      }
    })
    const favoriteCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    
    return {
      totalBorrowed,
      currentlyBorrowed,
      returned,
      overdue,
      totalFines,
      favoriteCategory
    }
  }, [myBorrows, books, calculateFine])

  // Notifications and alerts
  const notifications = useMemo(() => {
    const alerts = []
    
    // Due date alerts
    myBorrows
      .filter(br => br.status === 'borrowed')
      .forEach(br => {
        const now = new Date()
        const due = new Date(br.dueDate)
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        
        if (daysLeft <= 0) {
          const fine = calculateFine(br)
          alerts.push({
            type: 'overdue',
            title: 'Book Overdue!',
            message: `${books.find(b => b.id === br.bookId)?.title || 'Book'} is overdue. Fine: $${fine.toFixed(2)}`,
            priority: 'high',
            bookId: br.bookId,
            borrowId: br.id
          })
        } else if (daysLeft <= 3) {
          alerts.push({
            type: 'due-soon',
            title: 'Due Soon',
            message: `${books.find(b => b.id === br.bookId)?.title || 'Book'} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            priority: 'medium',
            bookId: br.bookId,
            borrowId: br.id
          })
        }
      })
    
    // Reservation status (if any books are unavailable but user might want)
    const unavailableBooks = books.filter(b => !b.available)
    if (unavailableBooks.length > 0) {
      alerts.push({
        type: 'reservation',
        title: 'Books Available for Reservation',
        message: `${unavailableBooks.length} book${unavailableBooks.length !== 1 ? 's' : ''} are currently borrowed but will be available soon`,
        priority: 'low',
        action: 'browse'
      })
    }
    
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [myBorrows, books, calculateFine])

  // Membership status
  const membershipStatus = useMemo(() => {
    const totalBorrows = myBorrows.length
    const activeBorrows = myBorrows.filter(br => br.status === 'borrowed').length
    const overdueCount = myBorrows.filter(br => br.status === 'borrowed' && calculateFine(br) > 0).length
    const totalFines = myBorrows.reduce((sum, br) => sum + calculateFine(br), 0)
    
    let status = 'Good Standing'
    let statusClass = 'status-good'
    let description = 'Your account is in good standing'
    
    if (overdueCount > 0) {
      status = 'Overdue Items'
      statusClass = 'status-warning'
      description = `You have ${overdueCount} overdue book${overdueCount !== 1 ? 's' : ''}`
    }
    
    if (totalFines > 10) {
      status = 'Fines Due'
      statusClass = 'status-danger'
      description = `You have outstanding fines of $${totalFines.toFixed(2)}`
    }
    
    if (activeBorrows >= 5) {
      status = 'Borrowing Limit'
      statusClass = 'status-info'
      description = 'You have reached the maximum number of borrowed books (5)'
    }
    
    return {
      status,
      statusClass,
      description,
      totalBorrows,
      activeBorrows,
      overdueCount,
      totalFines,
      maxBorrows: 5,
      remainingBorrows: Math.max(0, 5 - activeBorrows)
    }
  }, [myBorrows, calculateFine])

  const handleReturn = async (borrowId) => {
    try {
      const result = await returnBook({ borrowId })
      if (!result.ok) {
        alert(result.error || 'Failed to return book')
      }
    } catch (error) {
      console.error('Return error:', error)
      alert('Failed to return book. Please try again.')
    }
  }

  const getBorrowStatus = (borrow) => {
    if (borrow.status === 'returned') return { status: 'returned', label: 'Returned', class: 'returned' }
    
    const now = new Date()
    const due = new Date(borrow.dueDate)
    const isOverdue = now > due
    
    if (isOverdue) {
      const fine = calculateFine(borrow)
      return { 
        status: 'overdue', 
        label: `Overdue ($${fine.toFixed(2)})`, 
        class: 'overdue',
        fine 
      }
    }
    
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    return { 
      status: 'active', 
      label: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, 
      class: 'active' 
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hi, {user.email}</h2>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <section className="notifications-section">
          <h3>🔔 Notifications & Alerts</h3>
          <div className="notifications-grid">
            {notifications.map((alert, index) => (
              <div key={index} className={`notification-card ${alert.priority}`}>
                <div className="notification-header">
                  <span className={`notification-icon ${alert.type}`}>
                    {alert.type === 'overdue' ? '⚠️' : 
                     alert.type === 'due-soon' ? '⏰' : '📚'}
                  </span>
                  <span className={`notification-priority ${alert.priority}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
                <h4 className="notification-title">{alert.title}</h4>
                <p className="notification-message">{alert.message}</p>
                {alert.action === 'browse' && (
                  <button 
                    onClick={() => window.location.href = '/books'}
                    className="btn btn-small"
                  >
                    Browse Books
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile Section */}
      <section className="profile-section">
        <h3>👤 Profile & Membership</h3>
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <h4>{user.name || user.email}</h4>
                <p className="profile-email">{user.email}</p>
                <p className="profile-role">Role: {user.role === 'student' ? 'Student' : 'Librarian'}</p>
                <p className="profile-member-since">
                  Member since: {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="membership-card">
            <div className="membership-header">
              <h4>📋 Membership Status</h4>
              <span className={`membership-status ${membershipStatus.statusClass}`}>
                {membershipStatus.status}
              </span>
            </div>
            <p className="membership-description">{membershipStatus.description}</p>
            <div className="membership-stats">
              <div className="membership-stat">
                <span className="stat-label">Active Borrows:</span>
                <span className="stat-value">{membershipStatus.activeBorrows}/{membershipStatus.maxBorrows}</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Remaining:</span>
                <span className="stat-value">{membershipStatus.remainingBorrows} books</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Total Borrows:</span>
                <span className="stat-value">{membershipStatus.totalBorrows}</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Outstanding Fines:</span>
                <span className={`stat-value ${membershipStatus.totalFines > 0 ? 'overdue' : ''}`}>
                  ${membershipStatus.totalFines.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Reading Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <h3>Total Borrowed</h3>
          <div className="stat-number">{personalStats.totalBorrowed}</div>
        </div>
        <div className="stat-card">
          <h3>Currently Reading</h3>
          <div className="stat-number available">{personalStats.currentlyBorrowed}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{personalStats.returned}</div>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <div className="stat-number overdue">{personalStats.overdue}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fines</h3>
          <div className="stat-number overdue">${personalStats.totalFines.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h3>Favorite Genre</h3>
          <div className="stat-number">{personalStats.favoriteCategory}</div>
        </div>
      </div>

      <section id="browse">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Browse Books</h3>
          <a href="/books" className="btn btn-primary">
            Browse All Books
          </a>
        </div>
        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
          Discover our collection and borrow books instantly. Click "Browse All Books" to explore the full BookNest.
        </p>
      </section>

      <section id="my-borrows">
        <h3>My Borrowing History</h3>
        {myBorrows.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
            You haven't borrowed any books yet. Start browsing to find something interesting!
          </p>
        ) : (
          <div className="borrows-grid">
            {myBorrows.map(br => {
              const book = books.find(b => b.id === br.bookId)
              const borrowStatus = getBorrowStatus(br)
              
              return (
                <div key={br.id} className="borrow-card">
                  <div className="borrow-cover">
                    {book?.thumbnail ? (
                      <img src={book.thumbnail} alt={book?.title} />
                    ) : (
                      <div className="book-placeholder">📚</div>
                    )}
                    <div className={`borrow-status ${borrowStatus.class}`}>
                      {borrowStatus.label}
                    </div>
                  </div>
                  <div className="borrow-info">
                    <h4>{book?.title || 'Unknown Book'}</h4>
                    <p className="book-author">by {book?.author || 'Unknown Author'}</p>
                    <p className="borrow-meta">
                      <strong>Borrowed:</strong> {formatDate(br.borrowDate)}<br />
                      <strong>Due:</strong> {formatDate(br.dueDate)}<br />
                      {borrowStatus.fine && (
                        <strong style={{ color: 'var(--color-danger)' }}>
                          Fine: ${borrowStatus.fine.toFixed(2)}
                        </strong>
                      )}
                    </p>
                    <div className="borrow-actions">
                      {br.status === 'borrowed' ? (
                        <button 
                          onClick={() => handleReturn(br.id)}
                          className="btn-small"
                        >
                          Return Book
                        </button>
                      ) : (
                        <span className="returned-badge">Returned on {formatDate(br.returnDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Reading Recommendations */}
      {personalStats.favoriteCategory !== 'None' && (
        <section id="recommendations">
          <h3>Recommended for You</h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>
            Based on your preference for <strong>{personalStats.favoriteCategory}</strong> books
          </p>
          <div className="books-grid">
            {books
              .filter(b => b.category === personalStats.favoriteCategory && b.available)
              .slice(0, 4)
              .map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover">
                    {book.thumbnail ? (
                      <img src={book.thumbnail} alt={book.title} />
                    ) : (
                      <div className="book-placeholder">📚</div>
                    )}
                    <div className="book-status available">Available</div>
                  </div>
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-meta">{book.category} • {book.publishedYear}</p>
                    <div className="book-actions">
                      <a href="/books" className="btn btn-small">
                        Browse
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}


