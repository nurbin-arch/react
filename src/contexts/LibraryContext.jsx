import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { differenceInCalendarDays, addDays, isAfter } from 'date-fns'
import { DAILY_FINE } from '../utils/constants'
import { listBooks, createBook as apiCreateBook, updateBookApi, deleteBookApi, listBorrows, createBorrow, updateBorrow, seedBooks } from '../services/mockApi'

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [stored, setStored] = useLocalStorage('rl_library', { books: [], borrows: [] })
  const [books, setBooks] = useState(stored.books || [])
  const [borrows, setBorrows] = useState(stored.borrows || [])

  useEffect(() => {
    const load = async () => {
      try {
        await seedBooks() // Seed books if API is empty
        const [bks, brs] = await Promise.all([listBooks(), listBorrows()])
        setBooks(Array.isArray(bks) ? bks : [])
        setBorrows(Array.isArray(brs) ? brs : [])
        setStored({ books: bks, borrows: brs })
      } catch {
        // fall back to stored if API fails
      }
    }
    load()
  }, [setStored])

  const addBook = async book => {
    const payload = { ...book, available: true }
    const created = await apiCreateBook(payload)
    const next = [...books, created]
    setBooks(next)
    setStored({ books: next, borrows })
  }

  const updateBook = async (id, updates) => {
    const updated = await updateBookApi(id, updates)
    const next = books.map(b => (b.id === id ? updated : b))
    setBooks(next)
    setStored({ books: next, borrows })
  }

  const deleteBook = async id => {
    await deleteBookApi(id)
    const nextBooks = books.filter(b => b.id !== id)
    const nextBorrows = borrows.filter(br => br.bookId !== id)
    setBooks(nextBooks)
    setBorrows(nextBorrows)
    setStored({ books: nextBooks, borrows: nextBorrows })
  }

  const borrowBook = async ({ bookId, userId, days = 14 }) => {
    const book = books.find(b => b.id === bookId)
    if (!book || !book.available) return { ok: false, error: 'Book not available' }
    const dueDate = addDays(new Date(), days).toISOString()
    const createdBorrow = await createBorrow({ bookId, userId, borrowedAt: new Date().toISOString(), dueDate, returnedAt: null })
    const nextBooks = books.map(b => (b.id === bookId ? { ...b, available: false } : b))
    const nextBorrows = [...borrows, createdBorrow]
    setBooks(nextBooks)
    setBorrows(nextBorrows)
    setStored({ books: nextBooks, borrows: nextBorrows })
    await updateBookApi(bookId, { available: false })
    return { ok: true }
  }

  const returnBook = async ({ borrowId }) => {
    const borrow = borrows.find(br => br.id === borrowId)
    if (!borrow || borrow.returnedAt) return { ok: false, error: 'Invalid borrow' }
    const returnedAt = new Date().toISOString()
    const nextBorrows = borrows.map(br => (br.id === borrowId ? { ...br, returnedAt } : br))
    const nextBooks = books.map(b => (b.id === borrow.bookId ? { ...b, available: true } : b))
    setBooks(nextBooks)
    setBorrows(nextBorrows)
    setStored({ books: nextBooks, borrows: nextBorrows })
    await Promise.all([
      updateBorrow(borrowId, { returnedAt }),
      updateBookApi(borrow.bookId, { available: true })
    ])
    return { ok: true }
  }

  const calculateFine = borrow => {
    const now = new Date()
    const due = new Date(borrow.dueDate)
    if (borrow.returnedAt) {
      const returned = new Date(borrow.returnedAt)
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
    () => ({ books, borrows, addBook, updateBook, deleteBook, borrowBook, returnBook, calculateFine }),
    [books, borrows]
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}


