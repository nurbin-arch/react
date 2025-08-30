# Google Books API Integration Setup

BookNest now includes automatic book information fetching from Google Books API and Open Library API.

## Features

- **Automatic ISBN lookup**: Enter an ISBN to auto-fill book details
- **Search by title/author**: Search for books when ISBN is not available
- **Multiple API fallbacks**: Google Books → Open Library → General search
- **Rich book data**: Covers, descriptions, page counts, publishers, ratings

## Setup Instructions

### 1. Get Google Books API Key (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Books API" service
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Google Books API (optional but recommended for higher rate limits)
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here

# MockAPI for data persistence (optional)
VITE_MOCKAPI_URL=https://your-mockapi-url.com
```

### 3. Benefits of Using API Key

- **Higher rate limits**: 1,000 requests/day vs 100 requests/day
- **Better reliability**: Consistent API access
- **Enhanced features**: More detailed book information

## How It Works

### ISBN Auto-fill
1. Enter ISBN in the book form
2. Click "Auto-fill from ISBN"
3. System fetches data from Google Books API
4. Falls back to Open Library if needed
5. Auto-populates all available fields

### Book Search
1. Use search box to find books by title/author
2. View search results with thumbnails
3. Click on any result to auto-fill form
4. Perfect for books without ISBN

### Fallback System
1. **Primary**: Google Books API (with ISBN lookup)
2. **Secondary**: Open Library API (ISBN lookup)
3. **Tertiary**: Google Books general search
4. **Manual**: Fill in remaining fields manually

## API Data Fields

The system fetches these fields automatically:

- **Basic**: Title, Author, ISBN, Category, Year
- **Media**: Thumbnail cover image
- **Details**: Description, Page count, Publisher, Language
- **Metadata**: Average rating, Rating count, Preview links

## Error Handling

- Graceful fallbacks if APIs are unavailable
- User-friendly error messages
- Timeout protection (10-15 seconds)
- Console logging for debugging

## Rate Limits

- **Without API key**: 100 requests/day
- **With API key**: 1,000 requests/day
- **Open Library**: No rate limits

## Troubleshooting

### Common Issues

1. **"No book found" error**
   - Try searching by title instead of ISBN
   - Check if ISBN format is correct
   - Some books may not be in the databases

2. **Slow response times**
   - APIs may be experiencing delays
   - Check your internet connection
   - Try again in a few minutes

3. **Missing book covers**
   - Not all books have cover images
   - Manual thumbnail URL entry available
   - Placeholder icon shown when no image

### Getting Help

- Check browser console for error messages
- Verify your API key is correct
- Ensure environment variables are loaded
- Restart development server after adding .env file

## Advanced Usage

### Custom Search Queries

You can search with specific terms:
- `author:"J.K. Rowling"` - Books by specific author
- `subject:fantasy` - Books in specific category
- `intitle:"Harry Potter"` - Books with specific title

### Batch Operations

For librarians adding multiple books:
1. Use ISBN auto-fill for efficiency
2. Search by title for older books
3. Manual entry for rare or custom books

## Security Notes

- API keys are client-side (Vite environment variables)
- Google Books API is public and safe to expose
- No sensitive data is transmitted
- Rate limiting prevents abuse
