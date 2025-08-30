import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { differenceInCalendarDays, addDays, isAfter } from 'date-fns'
import { DAILY_FINE } from '../utils/constants'
import { booksAPI, borrowsAPI } from '../services/api'

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([])
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [bks, brs] = await Promise.all([booksAPI.getAll(), borrowsAPI.getAll()])
        setBooks(Array.isArray(bks) ? bks : [])
        setBorrows(Array.isArray(brs) ? brs : [])
      } catch (error) {
        console.error('Failed to load library data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addBook = async book => {
    try {
      const created = await booksAPI.create(book)
      setBooks(prev => [...prev, created])
      return { ok: true, book: created }
    } catch (error) {
      console.error('Failed to add book:', error)
      return { ok: false, error: error.message }
    }
  }

  const updateBook = async (id, updates) => {
    try {
      const updated = await booksAPI.update(id, updates)
      setBooks(prev => prev.map(b => (b.id === id ? updated : b)))
      return { ok: true, book: updated }
    } catch (error) {
      console.error('Failed to update book:', error)
      return { ok: false, error: error.message }
    }
  }

  const deleteBook = async id => {
    try {
      await booksAPI.delete(id)
      setBooks(prev => prev.filter(b => b.id !== id))
      setBorrows(prev => prev.filter(br => br.bookId !== id))
      return { ok: true }
    } catch (error) {
      console.error('Failed to delete book:', error)
      return { ok: false, error: error.message }
    }
  }

  const borrowBook = async ({ bookId, userId, days = 14 }) => {
    try {
      const book = books.find(b => b.id === bookId)
      if (!book || !book.available) {
        return { ok: false, error: 'Book not available' }
      }
      
      const dueDate = addDays(new Date(), days).toISOString()
      const borrowData = { 
        bookId, 
        userId, 
        borrowDate: new Date().toISOString(), 
        dueDate 
      }
      
      const createdBorrow = await borrowsAPI.create(borrowData)
      setBorrows(prev => [...prev, createdBorrow])
      setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, available: false } : b)))
      
      return { ok: true, borrow: createdBorrow }
    } catch (error) {
      console.error('Failed to borrow book:', error)
      return { ok: false, error: error.message }
    }
  }

  const returnBook = async ({ borrowId }) => {
    try {
      const borrow = borrows.find(br => br.id === borrowId)
      if (!borrow || borrow.status === 'returned') {
        return { ok: false, error: 'Invalid borrow' }
      }
      
      const updatedBorrow = await borrowsAPI.return(borrowId, borrow.bookId)
      setBorrows(prev => prev.map(br => (br.id === borrowId ? updatedBorrow : br)))
      setBooks(prev => prev.map(b => (b.id === borrow.bookId ? { ...b, available: true } : b)))
      
      return { ok: true, borrow: updatedBorrow }
    } catch (error) {
      console.error('Failed to return book:', error)
      return { ok: false, error: error.message }
    }
  }

  const calculateFine = borrow => {
    const now = new Date()
    const due = new Date(borrow.dueDate)
    if (borrow.returnDate) {
      const returned = new Date(borrow.returnDate)
      if (isAfter(returned, due)) {
        const lateDays = Math.max(0, differenceInCalendarDays(returned, due))
        return lateDays * DAILY_FINE
      }
      return 0
    }
    if (isAfter(now, due)) {
      const lateDays = Math.max(0, differenceInCalendarDays(now, due))
      return lateDays * DAILY_FINE
    }
    return 0
  }

  const value = useMemo(
    () => ({ books, borrows, loading, addBook, updateBook, deleteBook, borrowBook, returnBook, calculateFine }),
    [books, borrows, loading]
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}


