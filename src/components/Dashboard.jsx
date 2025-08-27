import { useMemo } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { formatDate } from '../utils/date'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export default function Dashboard() {
  const { books, borrows, calculateFine } = useLibrary()

  const topBooks = useMemo(() => {
    const counts = new Map()
    for (const br of borrows) {
      counts.set(br.bookId, (counts.get(br.bookId) || 0) + 1)
    }
    const rows = books.map(b => ({ 
      name: b.title, 
      count: counts.get(b.id) || 0,
      category: b.category,
      author: b.author
    }))
    return rows.sort((a, b) => b.count - a.count).slice(0, 8)
  }, [books, borrows])

  const categoryStats = useMemo(() => {
    const categoryCounts = new Map()
    const categoryBorrows = new Map()
    
    // Count books per category
    books.forEach(book => {
      if (book.category) {
        categoryCounts.set(book.category, (categoryCounts.get(book.category) || 0) + 1)
      }
    })
    
    // Count borrows per category
    borrows.forEach(borrow => {
      const book = books.find(b => b.id === borrow.bookId)
      if (book?.category) {
        categoryBorrows.set(book.category, (categoryBorrows.get(book.category) || 0) + 1)
      }
    })
    
    return Array.from(categoryCounts.keys()).map(category => ({
      name: category,
      books: categoryCounts.get(category),
      borrows: categoryBorrows.get(category) || 0,
      popularity: ((categoryBorrows.get(category) || 0) / categoryCounts.get(category)).toFixed(2)
    })).sort((a, b) => b.borrows - a.borrows)
  }, [books, borrows])

  const overdueTrends = useMemo(() => {
    const monthlyData = new Map()
    const now = new Date()
    
    // Group overdue books by month
    borrows.forEach(borrow => {
      if (!borrow.returnedAt && calculateFine(borrow) > 0) {
        const dueDate = new Date(borrow.dueDate)
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
      }
    })
    
    // Create last 6 months of data
    const result = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      result.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        overdue: monthlyData.get(monthKey) || 0
      })
    }
    
    return result
  }, [borrows, calculateFine])

  const borrowingPatterns = useMemo(() => {
    const monthlyBorrows = new Map()
    const now = new Date()
    
    // Group borrows by month
    borrows.forEach(borrow => {
      const borrowDate = new Date(borrow.borrowedAt)
      const monthKey = `${borrowDate.getFullYear()}-${String(borrowDate.getMonth() + 1).padStart(2, '0')}`
      monthlyBorrows.set(monthKey, (monthlyBorrows.get(monthKey) || 0) + 1)
    })
    
    // Create last 6 months of data
    const result = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      result.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        borrows: monthlyBorrows.get(monthKey) || 0
      })
    }
    
    return result
  }, [borrows])

  const overdue = useMemo(() => {
    return borrows.filter(br => !br.returnedAt && calculateFine(br) > 0)
  }, [borrows, calculateFine])

  const totalFines = useMemo(() => {
    return overdue.reduce((sum, br) => sum + calculateFine(br), 0)
  }, [overdue, calculateFine])

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <h3>Total Borrows</h3>
          <div className="stat-number">{borrows.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active Loans</h3>
          <div className="stat-number">{borrows.filter(br => !br.returnedAt).length}</div>
        </div>
        <div className="stat-card">
          <h3>Overdue Items</h3>
          <div className="stat-number overdue">{overdue.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fines</h3>
          <div className="stat-number overdue">${totalFines.toFixed(2)}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* Most Borrowed Books */}
        <div className="chart-container">
          <h3>Most Borrowed Books</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topBooks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Borrows']}
                  labelFormatter={(label) => `${label} (${topBooks.find(b => b.name === label)?.author})`}
                />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Popularity */}
        <div className="chart-container">
          <h3>Category Popularity</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryStats.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, borrows }) => `${name}: ${borrows}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="borrows"
                >
                  {categoryStats.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Borrows']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue Trends */}
        <div className="chart-container">
          <h3>Overdue Trends (6 Months)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={overdueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Overdue Items']} />
                <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Borrowing Patterns */}
        <div className="chart-container">
          <h3>Borrowing Patterns (6 Months)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={borrowingPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Borrows']} />
                <Line type="monotone" dataKey="borrows" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Overdue Table */}
      {overdue.length > 0 && (
        <div className="chart-container">
          <h3>Overdue Details</h3>
          <table width="100%">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map(br => {
                const book = books.find(b => b.id === br.bookId)
                const dueDate = new Date(br.dueDate)
                const daysOverdue = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={br.id}>
                    <td>{book?.title || 'Unknown'}</td>
                    <td>{br.userId}</td>
                    <td>{formatDate(br.dueDate)}</td>
                    <td>{daysOverdue} days</td>
                    <td>${calculateFine(br).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


