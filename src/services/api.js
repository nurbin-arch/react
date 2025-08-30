import axios from 'axios'

// Local json-server API
const API_BASE_URL = 'http://localhost:3001'

const api = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Users API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.get(`/users?email=${encodeURIComponent(email)}`)
      const users = response.data
      
      if (users.length === 0) {
        return { ok: false, error: 'User not found' }
      }
      
      const user = users[0]
      if (user.password !== password) {
        return { ok: false, error: 'Invalid password' }
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user
      return { ok: true, user: userWithoutPassword }
    } catch (error) {
      console.error('Login error:', error)
      return { ok: false, error: 'Login failed. Please try again.' }
    }
  },

  // Register new user
  signup: async (userData) => {
    try {
      // Check if user already exists
      const existingUserResponse = await api.get(`/users?email=${encodeURIComponent(userData.email)}`)
      if (existingUserResponse.data.length > 0) {
        return { ok: false, error: 'User already exists with this email' }
      }
      
      // Create new user
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString()
      }
      
      const response = await api.post('/users', newUser)
      const { password: _, ...userWithoutPassword } = response.data
      
      return { ok: true, user: userWithoutPassword }
    } catch (error) {
      console.error('Signup error:', error)
      return { ok: false, error: 'Signup failed. Please try again.' }
    }
  },

  // Get user by ID
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      const { password: _, ...userWithoutPassword } = response.data
      return userWithoutPassword
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }
}

// Books API
export const booksAPI = {
  // Get all books
  getAll: async () => {
    try {
      const response = await api.get('/books')
      return response.data
    } catch (error) {
      console.error('Get books error:', error)
      return []
    }
  },

  // Get book by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data
    } catch (error) {
      console.error('Get book error:', error)
      return null
    }
  },

  // Create new book
  create: async (bookData) => {
    try {
      const newBook = {
        ...bookData,
        available: true,
        createdAt: new Date().toISOString()
      }
      const response = await api.post('/books', newBook)
      return response.data
    } catch (error) {
      console.error('Create book error:', error)
      throw new Error('Failed to create book')
    }
  },

  // Update book
  update: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData)
      return response.data
    } catch (error) {
      console.error('Update book error:', error)
      throw new Error('Failed to update book')
    }
  },

  // Delete book
  delete: async (id) => {
    try {
      await api.delete(`/books/${id}`)
      return true
    } catch (error) {
      console.error('Delete book error:', error)
      throw new Error('Failed to delete book')
    }
  },

  // Search books
  search: async (query) => {
    try {
      const response = await api.get(`/books?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Search books error:', error)
      return []
    }
  }
}

// Borrows API
export const borrowsAPI = {
  // Get all borrows
  getAll: async () => {
    try {
      const response = await api.get('/borrows?_expand=book&_expand=user')
      return response.data
    } catch (error) {
      console.error('Get borrows error:', error)
      return []
    }
  },

  // Get borrows by user ID
  getByUserId: async (userId) => {
    try {
      const response = await api.get(`/borrows?userId=${userId}&_expand=book`)
      return response.data
    } catch (error) {
      console.error('Get user borrows error:', error)
      return []
    }
  },

  // Create new borrow
  create: async (borrowData) => {
    try {
      const newBorrow = {
        ...borrowData,
        status: 'borrowed',
        createdAt: new Date().toISOString()
      }
      const response = await api.post('/borrows', newBorrow)
      
      // Update book availability
      await booksAPI.update(borrowData.bookId, { available: false })
      
      return response.data
    } catch (error) {
      console.error('Create borrow error:', error)
      throw new Error('Failed to create borrow')
    }
  },

  // Return book
  return: async (borrowId, bookId) => {
    try {
      const returnData = {
        returnDate: new Date().toISOString(),
        status: 'returned'
      }
      const response = await api.patch(`/borrows/${borrowId}`, returnData)
      
      // Update book availability
      await booksAPI.update(bookId, { available: true })
      
      return response.data
    } catch (error) {
      console.error('Return book error:', error)
      throw new Error('Failed to return book')
    }
  },

  // Get borrow by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/borrows/${id}?_expand=book&_expand=user`)
      return response.data
    } catch (error) {
      console.error('Get borrow error:', error)
      return null
    }
  }
}

export default api
