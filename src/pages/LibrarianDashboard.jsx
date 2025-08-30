import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { useLocation } from 'react-router-dom'
import BookList from '../components/BookList'
import BookForm from '../components/BookForm'
import Dashboard from '../components/Dashboard'
import { formatDate } from '../utils/date'

export default function LibrarianDashboard() {
  const { user } = useAuth()
  const { addBook, updateBook, deleteBook, books, borrows, calculateFine } = useLibrary()
  const location = useLocation()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabParam = urlParams.get('tab')
    console.log('URL search:', location.search, 'Tab param:', tabParam)
    if (tabParam && ['overview', 'books', 'members', 'transactions', 'reports', 'notifications', 'profile'].includes(tabParam)) {
      console.log('Setting active tab to:', tabParam)
      setActiveTab(tabParam)
    }
  }, [location.search])

  // All hooks and calculations must be done before any conditional returns
  const overdueBorrows = useMemo(() => 
    borrows.filter(br => br.status === 'borrowed' && calculateFine(br) > 0), 
    [borrows, calculateFine]
  )
  
  const totalBooks = useMemo(() => books.length, [books])
  const borrowedBooks = useMemo(() => books.filter(b => !b.available).length, [books])
  const availableBooks = useMemo(() => totalBooks - borrowedBooks, [totalBooks, borrowedBooks])

  // Get unique categories for filter
  const categories = useMemo(() => {
    return [...new Set(books.map(b => b.category).filter(Boolean))].sort()
  }, [books])

  // Inventory summary
  const inventorySummary = useMemo(() => {
    const summary = {}
    books.forEach(book => {
      if (book.category) {
        if (!summary[book.category]) {
          summary[book.category] = { total: 0, available: 0, borrowed: 0 }
        }
        summary[book.category].total++
        if (book.available) {
          summary[book.category].available++
        } else {
          summary[book.category].borrowed++
        }
      }
    })
    return summary
  }, [books])

  // Librarian profile and stats
  const librarianStats = useMemo(() => {
    const totalUsers = borrows.reduce((acc, br) => {
      if (!acc.includes(br.userId)) acc.push(br.userId)
      return acc
    }, []).length
    
    const totalBorrows = borrows.length
    const activeBorrows = borrows.filter(br => br.status === 'borrowed').length
    const overdueCount = overdueBorrows.length
    const totalFines = overdueBorrows.reduce((sum, br) => sum + calculateFine(br), 0)
    
    return {
      totalUsers,
      totalBorrows,
      activeBorrows,
      overdueCount,
      totalFines,
      totalBooks,
      availableBooks,
      borrowedBooks
    }
  }, [borrows, overdueBorrows, calculateFine, totalBooks, availableBooks, borrowedBooks])

  // Popular books analysis
  const popularBooks = useMemo(() => {
    const bookBorrowCounts = {}
    borrows.forEach(br => {
      if (!bookBorrowCounts[br.bookId]) {
        bookBorrowCounts[br.bookId] = 0
      }
      bookBorrowCounts[br.bookId]++
    })
    
    return Object.entries(bookBorrowCounts)
      .map(([bookId, count]) => ({
        book: books.find(b => b.id === bookId),
        borrowCount: count
      }))
      .filter(item => item.book)
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5)
  }, [books, borrows])

  // User management data
  const users = useMemo(() => {
    const userIds = [...new Set(borrows.map(br => br.userId))]
    return userIds.map(userId => {
      const userBorrows = borrows.filter(br => br.userId === userId)
      const activeBorrows = userBorrows.filter(br => br.status === 'borrowed')
      const overdueBorrows = activeBorrows.filter(br => calculateFine(br) > 0)
      const totalFines = overdueBorrows.reduce((sum, br) => sum + calculateFine(br), 0)
      
      return {
        id: userId,
        borrowCount: userBorrows.length,
        activeBorrows: activeBorrows.length,
        overdueCount: overdueBorrows.length,
        totalFines
      }
    }).sort((a, b) => b.borrowCount - a.borrowCount)
  }, [borrows, calculateFine])

  // System notifications
  const systemNotifications = useMemo(() => {
    const notifications = []
    
    // Overdue books alert
    if (overdueBorrows.length > 0) {
      notifications.push({
        type: 'overdue',
        title: 'Overdue Books Alert',
        message: `${overdueBorrows.length} book${overdueBorrows.length !== 1 ? 's' : ''} are overdue with total fines of Rs. ${overdueBorrows.reduce((sum, br) => sum + calculateFine(br), 0).toFixed(2)}`,
        priority: 'high'
      })
    }
    
    // Low inventory alert
    if (availableBooks < 10) {
      notifications.push({
        type: 'inventory',
        title: 'Low Inventory Alert',
        message: `Only ${availableBooks} books available. Consider adding more books.`,
        priority: 'medium'
      })
    }
    
    // High demand books
    if (popularBooks.length > 0 && popularBooks[0].borrowCount > 5) {
      notifications.push({
        type: 'popular',
        title: 'High Demand Books',
        message: `${popularBooks[0].book.title} has been borrowed ${popularBooks[0].borrowCount} times. Consider adding more copies.`,
        priority: 'low'
      })
    }
    
    return notifications
  }, [overdueBorrows, availableBooks, popularBooks, calculateFine])

  // Filtered books for inventory management
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchQuery || 
        (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.isbn && book.isbn.includes(searchQuery))
      
      const matchesCategory = !filterCategory || book.category === filterCategory
      const matchesStatus = !filterStatus || 
        (filterStatus === 'available' ? book.available : !book.available)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [books, searchQuery, filterCategory, filterStatus])

  // Only librarians can access this dashboard
  if (user?.role !== 'librarian') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Access Denied</h2>
        <p>Only librarians can access this dashboard.</p>
      </div>
    )
  }

  const handleSubmit = async book => {
    if (editing) {
      await updateBook(editing.id, book)
      setEditing(null)
    } else {
      await addBook(book)
    }
    setShowForm(false)
  }

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      await deleteBook(bookId)
    }
  }

  const renderOverview = () => (
    <div className="dashboard-section">
      <h3>📊 Dashboard Overview</h3>
      
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '24px' }}>
        <div className="stat-card">
          <h3>Total Books</h3>
          <div className="stat-number">{totalBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <div className="stat-number available">{availableBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Borrowed</h3>
          <div className="stat-number borrowed">{borrowedBooks}</div>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <div className="stat-number overdue">{overdueBorrows.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fines</h3>
          <div className="stat-number overdue">
            Rs. ${overdueBorrows.reduce((sum, br) => sum + calculateFine(br), 0).toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <div className="stat-number">{categories.length}</div>
        </div>
      </div>

      {/* Popular Books */}
      <div className="overview-section">
        <h4>🔥 Most Popular Books</h4>
        <div className="popular-books-grid">
          {popularBooks.map((item, index) => (
            <div key={item.book.id} className="popular-book-card">
              <div className="popular-book-rank">#{index + 1}</div>
              <div className="popular-book-cover">
                {item.book.thumbnail ? (
                  <img src={item.book.thumbnail} alt={item.book.title} />
                ) : (
                  <div className="book-placeholder">📚</div>
                )}
              </div>
              <div className="popular-book-info">
                <h5>{item.book.title}</h5>
                <p>by {item.book.author}</p>
                <div className="popular-book-stats">
                  <span className="borrow-count">📖 {item.borrowCount} borrows</span>
                  <span className={`availability ${item.book.available ? 'available' : 'borrowed'}`}>
                    {item.book.available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="overview-section">
        <h4>📚 Books by Category</h4>
        <div className="category-stats-grid">
          {Object.entries(inventorySummary).map(([category, stats]) => (
            <div key={category} className="category-stat-card">
              <h5>{category}</h5>
              <div className="category-numbers">
                <span className="total">{stats.total}</span>
                <span className="available">{stats.available}</span>
                <span className="borrowed">{stats.borrowed}</span>
              </div>
              <div className="category-labels">
                <span>Total</span>
                <span>Available</span>
                <span>Borrowed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBooks = () => (
    <div className="dashboard-section">
      <h3>📚 Books Management</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ minWidth: '300px' }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-select"
            style={{ minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ minWidth: '120px' }}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn btn-primary btn-large">
          <span style={{ fontSize: '1.2rem' }}>{showForm ? '✖️' : '➕'}</span>
          {showForm ? 'Close Form' : 'Add New Book'}
        </button>
      </div>

      {showForm && (
        <div className="book-form-container">
          <BookForm initial={editing} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <BookList 
        books={filteredBooks}
        onEdit={setEditing}
        onDelete={handleDelete}
        showActions={true}
      />
    </div>
  )

  const renderMembers = () => (
    <div className="dashboard-section">
      <h3>👥 Members Management</h3>
      
      <div className="members-overview">
        <div className="member-stats">
          <div className="member-stat">
            <span className="stat-label">Total Members:</span>
            <span className="stat-value">{librarianStats.totalUsers}</span>
          </div>
          <div className="member-stat">
            <span className="stat-label">Active Borrowers:</span>
            <span className="stat-value">{librarianStats.activeBorrows}</span>
          </div>
          <div className="member-stat">
            <span className="stat-label">Members with Overdue:</span>
            <span className="stat-value">{users.filter(u => u.overdueCount > 0).length}</span>
          </div>
        </div>
      </div>

      <div className="members-table-container">
        <h4>Member Activity</h4>
        <div className="members-table">
          <div className="table-header">
            <div className="table-cell">Member ID</div>
            <div className="table-cell">Total Borrows</div>
            <div className="table-cell">Active</div>
            <div className="table-cell">Overdue</div>
            <div className="table-cell">Fines (Rs.)</div>
            <div className="table-cell">Status</div>
          </div>
          {users.map(user => (
            <div key={user.id} className="table-row">
              <div className="table-cell">{user.id}</div>
              <div className="table-cell">{user.borrowCount}</div>
              <div className="table-cell">{user.activeBorrows}</div>
              <div className="table-cell">{user.overdueCount}</div>
              <div className="table-cell">Rs. ${user.totalFines.toFixed(2)}</div>
              <div className="table-cell">
                <span className={`status-badge ${user.overdueCount > 0 ? 'overdue' : 'good'}`}>
                  {user.overdueCount > 0 ? 'Overdue' : 'Good'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTransactions = () => (
    <div className="dashboard-section">
      <h3>💳 Transactions Management</h3>
      
      <div className="transactions-overview">
        <div className="transaction-stats">
          <div className="transaction-stat">
            <span className="stat-label">Total Transactions:</span>
            <span className="stat-value">{librarianStats.totalBorrows}</span>
          </div>
          <div className="transaction-stat">
            <span className="stat-label">Active Loans:</span>
            <span className="stat-value">{librarianStats.activeBorrows}</span>
          </div>
          <div className="transaction-stat">
            <span className="stat-label">Overdue Items:</span>
            <span className="stat-value">{librarianStats.overdueCount}</span>
          </div>
          <div className="transaction-stat">
            <span className="stat-label">Total Fines (Rs.):</span>
            <span className="stat-value">Rs. ${librarianStats.totalFines.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h4>Recent Transactions</h4>
        <div className="transactions-list">
          {borrows.slice(0, 10).map(borrow => {
            const book = books.find(b => b.id === borrow.bookId)
            const fine = calculateFine(borrow)
            const isOverdue = borrow.status === 'borrowed' && fine > 0
            
            return (
              <div key={borrow.id} className={`transaction-item ${isOverdue ? 'overdue' : ''}`}>
                <div className="transaction-book">
                  <div className="book-cover-thumb">
                    {book?.thumbnail ? (
                      <img src={book.thumbnail} alt={book?.title} />
                    ) : (
                      <div className="book-placeholder-thumb">📚</div>
                    )}
                  </div>
                  <div className="transaction-details">
                    <h5>{book?.title || 'Unknown Book'}</h5>
                    <p>User ID: {borrow.userId}</p>
                    <p>Borrowed: {formatDate(borrow.borrowDate)}</p>
                    <p>Due: {formatDate(borrow.dueDate)}</p>
                  </div>
                </div>
                <div className="transaction-status">
                  <span className={`status-badge ${borrow.status}`}>
                    {borrow.status === 'borrowed' ? (isOverdue ? 'Overdue' : 'Active') : 'Returned'}
                  </span>
                  {isOverdue && (
                    <div className="fine-amount">Fine: Rs. ${fine.toFixed(2)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="dashboard-section">
      <h3>📈 Reports & Analytics</h3>
      
      <div className="reports-grid">
        <div className="report-card">
          <h4>📊 Borrowing Trends</h4>
          <div className="report-content">
            <div className="trend-item">
              <span className="trend-label">Most Active Day:</span>
              <span className="trend-value">Monday</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Average Loan Duration:</span>
              <span className="trend-value">14 days</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Return Rate:</span>
              <span className="trend-value">
                {borrows.length > 0 ? Math.round((borrows.filter(br => br.status === 'returned').length / borrows.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h4>🎯 Category Performance</h4>
          <div className="report-content">
            {Object.entries(inventorySummary)
              .sort((a, b) => b[1].borrowed - a[1].borrowed)
              .slice(0, 5)
              .map(([category, stats]) => (
                <div key={category} className="category-performance">
                  <span className="category-name">{category}</span>
                  <span className="category-usage">{stats.borrowed}/{stats.total}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="report-card">
          <h4>💰 Financial Summary (in Rupees)</h4>
          <div className="report-content">
            <div className="financial-item">
              <span className="financial-label">Total Fines Generated (Rs.):</span>
              <span className="financial-value">Rs. ${librarianStats.totalFines.toFixed(2)}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Average Fine (Rs.):</span>
              <span className="financial-value">
                Rs. ${overdueBorrows.length > 0 ? (librarianStats.totalFines / overdueBorrows.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Fine Collection Rate:</span>
              <span className="financial-value">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Overdue Table */}
      {overdueBorrows.length > 0 && (
        <div className="report-card" style={{ marginTop: '20px' }}>
          <h4>⚠️ Overdue Items Details</h4>
          <div className="report-content">
            <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-elev-2)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Book</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Borrower</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Days Overdue</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Fine (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {overdueBorrows.map(br => {
                  const book = books.find(b => b.id === br.bookId)
                  const dueDate = new Date(br.dueDate)
                  const daysOverdue = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={br.id} style={{ borderBottom: '1px solid var(--color-elev-1)' }}>
                      <td style={{ padding: '12px' }}>{book?.title || 'Unknown'}</td>
                      <td style={{ padding: '12px' }}>{br.userId}</td>
                      <td style={{ padding: '12px' }}>{formatDate(br.dueDate)}</td>
                      <td style={{ padding: '12px', color: 'var(--color-danger)', fontWeight: 'bold' }}>{daysOverdue} days</td>
                      <td style={{ padding: '12px', color: 'var(--color-danger)', fontWeight: 'bold' }}>Rs. ${calculateFine(br).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderNotifications = () => (
    <div className="dashboard-section">
      <h3>🔔 System Notifications</h3>
      
      {systemNotifications.length === 0 ? (
        <div className="no-notifications">
          <p>🎉 All systems are running smoothly! No alerts at this time.</p>
        </div>
      ) : (
        <div className="notifications-grid">
          {systemNotifications.map((notification, index) => (
            <div key={index} className={`notification-card ${notification.priority}`}>
              <div className="notification-header">
                <span className={`notification-icon ${notification.type}`}>
                  {notification.type === 'overdue' ? '⚠️' : 
                   notification.type === 'inventory' ? '📦' : '📚'}
                </span>
                <span className={`notification-priority ${notification.priority}`}>
                  {notification.priority.toUpperCase()}
                </span>
              </div>
              <h4 className="notification-title">{notification.title}</h4>
              <p className="notification-message">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderProfile = () => (
    <div className="dashboard-section">
      <h3>⚙️ Profile & Settings</h3>
      
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">📚</div>
            <div className="profile-info">
              <h4>{user.name || user.email}</h4>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Role: Librarian</p>
              <p className="profile-member-since">
                Member since: {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h4>🔧 Account Settings</h4>
          <div className="settings-list">
            <div className="setting-item">
              <span className="setting-label">Email Notifications:</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Overdue Alerts:</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Inventory Reports:</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slitch"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">User Activity Logs:</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slitch"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="system-info">
        <h4>🖥️ System Information</h4>
        <div className="system-details">
          <div className="system-item">
            <span className="system-label">Database:</span>
            <span className="system-value">JSON Server v1.0</span>
          </div>
          <div className="system-item">
            <span className="system-label">API Endpoints:</span>
            <span className="system-value">3 (users, books, borrows)</span>
          </div>
          <div className="system-item">
            <span className="system-label">Last Backup:</span>
            <span className="system-value">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="system-item">
            <span className="system-label">System Status:</span>
            <span className="system-value status-good">Online</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="librarian-dashboard">
      {/* Profile Section */}
      <section className="profile-section">
        <h3>👤 Librarian Profile & System Overview</h3>
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">📚</div>
              <div className="profile-info">
                <h4>{user.name || user.email}</h4>
                <p className="profile-email">{user.email}</p>
                <p className="profile-role">Role: Librarian</p>
                <p className="profile-member-since">
                  Member since: {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="membership-card">
            <div className="membership-header">
              <h4>📊 System Statistics</h4>
              <span className="membership-status status-good">
                Active
              </span>
            </div>
            <p className="membership-description">Library management system overview and statistics</p>
            <div className="membership-stats">
              <div className="membership-stat">
                <span className="stat-label">Total Users:</span>
                <span className="stat-value">{librarianStats.totalUsers}</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Total Books:</span>
                <span className="stat-value">{librarianStats.totalBooks}</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Active Borrows:</span>
                <span className="stat-value">{librarianStats.activeBorrows}</span>
              </div>
              <div className="membership-stat">
                <span className="stat-label">Overdue Items:</span>
                <span className={`stat-value ${librarianStats.overdueCount > 0 ? 'overdue' : ''}`}>
                  {librarianStats.overdueCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 Books
        </button>
        <button 
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members
        </button>
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💳 Transactions
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'books' && renderBooks()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  )
}


