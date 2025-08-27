import axios from 'axios'

// Replace with your MockAPI base URL
const BASE_URL = import.meta.env.VITE_MOCKAPI_URL || 'https://68af2cefb91dfcdd62bb9e5c.mockapi.io/api/users'

const api = axios.create({ baseURL: BASE_URL })

// Sample books data
const sampleBooks = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      category: "Fiction",
      publishedYear: "1925",
      thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780446310789",
      category: "Fiction",
      publishedYear: "1960",
      thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      category: "Fiction",
      publishedYear: "1949",
      thumbnail: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      category: "Fiction",
      publishedYear: "1813",
      thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "9780547928241",
      category: "Fantasy",
      publishedYear: "1937",
      thumbnail: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769488",
      category: "Fiction",
      publishedYear: "1951",
      thumbnail: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "Lord of the Flies",
      author: "William Golding",
      isbn: "9780399501487",
      category: "Fiction",
      publishedYear: "1954",
      thumbnail: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&q=80&auto=format&fit=crop",
      available: true
    },
    {
      title: "Animal Farm",
      author: "George Orwell",
      isbn: "9780451526342",
      category: "Fiction",
      publishedYear: "1945",
      thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80&auto=format&fit=crop",
      available: true
    }
  ]
  
  // Seed books function
  export const seedBooks = async () => {
    try {
      const existingBooks = await listBooks()
      if (!existingBooks || existingBooks.length === 0) {
        // Add sample books one by one
        for (const book of sampleBooks) {
          await createBook(book)
        }
        console.log('Sample books seeded successfully')
      }
    } catch (error) {
      console.log('Could not seed books:', error.message)
    }
  }

// Books endpoints
export const listBooks = () => api.get('/books').then(r => r.data)
export const createBook = data => api.post('/books', data).then(r => r.data)
export const updateBookApi = (id, data) => api.put(`/books/${id}`, data).then(r => r.data)
export const deleteBookApi = id => api.delete(`/books/${id}`).then(r => r.data)

// Borrows endpoints
export const listBorrows = () => api.get('/borrows').then(r => r.data)
export const createBorrow = data => api.post('/borrows', data).then(r => r.data)
export const updateBorrow = (id, data) => api.put(`/borrows/${id}`, data).then(r => r.data)

export default api


