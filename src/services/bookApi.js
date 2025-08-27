import axios from 'axios'

// Google Books API configuration
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || ''

// Enhanced book data fetching with multiple fallbacks
export async function fetchBookByIsbn(isbn) {
  if (!isbn || isbn.trim().length === 0) {
    return null
  }

  const cleanIsbn = isbn.trim().replace(/[-\s]/g, '')
  
  try {
    // Try Google Books API first (with API key if available)
    const googleUrl = GOOGLE_API_KEY 
      ? `${GOOGLE_BOOKS_API}?q=isbn:${encodeURIComponent(cleanIsbn)}&key=${GOOGLE_API_KEY}&maxResults=1`
      : `${GOOGLE_BOOKS_API}?q=isbn:${encodeURIComponent(cleanIsbn)}&maxResults=1`
    
    const googleResponse = await axios.get(googleUrl, { timeout: 10000 })
    const googleItem = googleResponse.data?.items?.[0]
    
    if (googleItem) {
      const volumeInfo = googleItem.volumeInfo || {}
      const industryIdentifiers = volumeInfo.industryIdentifiers || []
      
      // Find the best ISBN match
      const isbnMatch = industryIdentifiers.find(id => 
        id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )
      
      if (isbnMatch && isbnMatch.identifier === cleanIsbn) {
        return {
          title: volumeInfo.title || '',
          author: (volumeInfo.authors && volumeInfo.authors[0]) || '',
          isbn: cleanIsbn,
          category: (volumeInfo.categories && volumeInfo.categories[0]) || '',
          publishedYear: volumeInfo.publishedDate ? String(volumeInfo.publishedDate).slice(0, 4) : '',
          thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
          description: volumeInfo.description || '',
          pageCount: volumeInfo.pageCount || '',
          publisher: volumeInfo.publisher || '',
          language: volumeInfo.language || '',
          averageRating: volumeInfo.averageRating || '',
          ratingsCount: volumeInfo.ratingsCount || '',
          previewLink: volumeInfo.previewLink || '',
          infoLink: volumeInfo.infoLink || ''
        }
      }
    }
  } catch (error) {
    console.log('Google Books API failed:', error.message)
  }

  try {
    // Fallback to Open Library API
    const openLibraryUrl = `https://openlibrary.org/isbn/${encodeURIComponent(cleanIsbn)}.json`
    const openLibraryResponse = await axios.get(openLibraryUrl, { timeout: 10000 })
    const openLibraryData = openLibraryResponse.data || {}
    
    if (openLibraryData.title) {
      // Try to get author details
      let authorName = ''
      if (openLibraryData.authors && openLibraryData.authors.length > 0) {
        try {
          const authorResponse = await axios.get(`https://openlibrary.org${openLibraryData.authors[0].key}.json`, { timeout: 5000 })
          authorName = authorResponse.data?.name || ''
        } catch {
          authorName = openLibraryData.authors[0]?.name || ''
        }
      }
      
      return {
        title: openLibraryData.title || '',
        author: authorName,
        isbn: cleanIsbn,
        category: '',
        publishedYear: openLibraryData.publish_date ? String(openLibraryData.publish_date).slice(-4) : '',
        thumbnail: openLibraryData.cover?.large || openLibraryData.cover?.medium || openLibraryData.cover?.small || '',
        description: openLibraryData.description?.value || openLibraryData.description || '',
        pageCount: openLibraryData.number_of_pages || '',
        publisher: openLibraryData.publishers?.[0]?.name || '',
        language: openLibraryData.languages?.[0]?.key?.split('/').pop() || '',
        averageRating: '',
        ratingsCount: '',
        previewLink: '',
        infoLink: `https://openlibrary.org/isbn/${cleanIsbn}`
      }
    }
  } catch (error) {
    console.log('Open Library API failed:', error.message)
  }

  try {
    // Final fallback: Search by title if ISBN search fails
    const searchResponse = await axios.get(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(cleanIsbn)}&maxResults=1`, { timeout: 10000 })
    const searchItem = searchResponse.data?.items?.[0]
    
    if (searchItem) {
      const volumeInfo = searchItem.volumeInfo || {}
      return {
        title: volumeInfo.title || '',
        author: (volumeInfo.authors && volumeInfo.authors[0]) || '',
        isbn: cleanIsbn,
        category: (volumeInfo.categories && volumeInfo.categories[0]) || '',
        publishedYear: volumeInfo.publishedDate ? String(volumeInfo.publishedDate).slice(0, 4) : '',
        thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
        description: volumeInfo.description || '',
        pageCount: volumeInfo.pageCount || '',
        publisher: volumeInfo.publisher || '',
        language: volumeInfo.language || '',
        averageRating: volumeInfo.averageRating || '',
        ratingsCount: volumeInfo.ratingsCount || '',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || ''
      }
    }
  } catch (error) {
    console.log('Fallback search failed:', error.message)
  }

  return null
}

// Search books by title, author, or general query
export async function searchBooks(query, maxResults = 20) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const searchUrl = GOOGLE_API_KEY 
      ? `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${GOOGLE_API_KEY}`
      : `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    
    const response = await axios.get(searchUrl, { timeout: 15000 })
    const items = response.data?.items || []
    
    return items.map(item => {
      const volumeInfo = item.volumeInfo || {}
      const industryIdentifiers = volumeInfo.industryIdentifiers || []
      const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || ''
      const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || ''
      
      return {
        id: item.id,
        title: volumeInfo.title || '',
        author: (volumeInfo.authors && volumeInfo.authors[0]) || '',
        isbn: isbn13 || isbn10,
        isbn13,
        isbn10,
        category: (volumeInfo.categories && volumeInfo.categories[0]) || '',
        publishedYear: volumeInfo.publishedDate ? String(volumeInfo.publishedDate).slice(0, 4) : '',
        thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
        description: volumeInfo.description || '',
        pageCount: volumeInfo.pageCount || '',
        publisher: volumeInfo.publisher || '',
        language: volumeInfo.language || '',
        averageRating: volumeInfo.averageRating || '',
        ratingsCount: volumeInfo.ratingsCount || '',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || ''
      }
    })
  } catch (error) {
    console.log('Book search failed:', error.message)
    return []
  }
}

// Get book details by Google Books ID
export async function getBookDetails(bookId) {
  try {
    const url = GOOGLE_API_KEY 
      ? `${GOOGLE_BOOKS_API}/${bookId}?key=${GOOGLE_API_KEY}`
      : `${GOOGLE_BOOKS_API}/${bookId}`
    
    const response = await axios.get(url, { timeout: 10000 })
    const volumeInfo = response.data?.volumeInfo || {}
    const industryIdentifiers = volumeInfo.industryIdentifiers || []
    
    const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || ''
    const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || ''
    
    return {
      id: response.data.id,
      title: volumeInfo.title || '',
      author: (volumeInfo.authors && volumeInfo.authors[0]) || '',
      isbn: isbn13 || isbn10,
      isbn13,
      isbn10,
      category: (volumeInfo.categories && volumeInfo.categories[0]) || '',
      publishedYear: volumeInfo.publishedDate ? String(volumeInfo.publishedDate).slice(0, 4) : '',
      thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
      description: volumeInfo.description || '',
      pageCount: volumeInfo.pageCount || '',
      publisher: volumeInfo.publisher || '',
      language: volumeInfo.language || '',
      averageRating: volumeInfo.averageRating || '',
      ratingsCount: volumeInfo.ratingsCount || '',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || ''
    }
  } catch (error) {
    console.log('Get book details failed:', error.message)
    return null
  }
}

export default {
  fetchBookByIsbn,
  searchBooks,
  getBookDetails
}


