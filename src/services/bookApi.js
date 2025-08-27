import axios from 'axios'

export async function fetchBookByIsbn(isbn) {
  try {
    // Try Google Books first
    const google = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`)
    const gItem = google.data?.items?.[0]
    if (gItem) {
      const info = gItem.volumeInfo || {}
      return {
        title: info.title || '',
        author: (info.authors && info.authors[0]) || '',
        isbn,
        category: (info.categories && info.categories[0]) || '',
        publishedYear: info.publishedDate ? String(info.publishedDate).slice(0, 4) : '',
        thumbnail: info.imageLinks?.thumbnail || ''
      }
    }
  } catch {
    // fallthrough to Open Library
  }

  try {
    const open = await axios.get(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`)
    const data = open.data || {}
    return {
      title: data.title || '',
      author: Array.isArray(data.authors) ? data.authors[0]?.name || '' : '',
      isbn,
      category: '',
      publishedYear: data.publish_date ? String(data.publish_date).slice(-4) : '',
      thumbnail: ''
    }
  } catch (err) {
    return null
  }
}


