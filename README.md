# React Library Management System

A modern library management system built with React, featuring Google Books API integration and a local JSON database.

## Features

- 📚 **Book Management**: Add, edit, delete, and search books
- 🔍 **Google Books API**: Auto-fill book details from ISBN or search
- 👥 **User Management**: Student and librarian accounts
- 📖 **Borrowing System**: Track book loans and returns
- 💰 **Fine Calculation**: Automatic late fee calculation
- 📊 **Dashboard**: Analytics and statistics
- 🎨 **Modern UI**: Responsive design with dark theme

## Tech Stack

- **Frontend**: React 19, Vite, CSS3
- **Backend**: JSON Server (local database)
- **APIs**: Google Books API, Open Library API
- **State Management**: React Context API
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env` file in the root directory:
   ```bash
   # Google Books API (optional but recommended)
   VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
   ```

4. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev:full
   
   # Or start them separately:
   npm run server  # Backend (port 3001)
   npm run dev     # Frontend (port 5173)
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Database Structure

The application uses `db.json` as a local database with the following structure:

```json
{
  "users": [
    {
      "id": 1,
      "email": "student@library.com",
      "password": "password123",
      "role": "student",
      "name": "Student Name",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "books": [
    {
      "id": 1,
      "title": "Book Title",
      "author": "Author Name",
      "isbn": "9781234567890",
      "category": "Fiction",
      "publishedYear": "2020",
      "thumbnail": "cover_url",
      "description": "Book description",
      "pageCount": 300,
      "publisher": "Publisher Name",
      "language": "English",
      "available": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "borrows": [
    {
      "id": 1,
      "bookId": 1,
      "userId": 1,
      "borrowDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "returnDate": null,
      "status": "borrowed",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

## Default Accounts

### Students
- `student1@library.com` / `student123`
- `student2@library.com` / `student456`
- `alice@university.edu` / `alice2024`
- `bob@university.edu` / `bob2024`

### Librarians
- `librarian@library.com` / `librarian123`
- `admin@library.com` / `admin456`
- `lib.mary@library.com` / `mary2024`
- `lib.james@library.com` / `james2024`

## Google Books API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Books API" service
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Add your API key to the `.env` file

### Benefits of API Key
- Higher rate limits (1,000 requests/day vs 100 requests/day)
- Better reliability and consistent access
- Enhanced book information

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start JSON server backend
- `npm run dev:full` - Start both servers simultaneously
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Books
- `GET /books` - Get all books
- `GET /books/:id` - Get book by ID
- `POST /books` - Create new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Borrows
- `GET /borrows` - Get all borrows
- `GET /borrows/:id` - Get borrow by ID
- `POST /borrows` - Create new borrow
- `PATCH /borrows/:id` - Update borrow (return book)

## Project Structure

```
src/
├── components/          # React components
│   ├── BookForm.jsx    # Book creation/editing form
│   ├── BookList.jsx    # Book display component
│   ├── BorrowForm.jsx  # Borrowing form
│   ├── Dashboard.jsx   # Main dashboard
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── LibraryContext.jsx # Library data state
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── SignupUser.jsx  # Student signup
│   ├── SignupAdmin.jsx # Librarian signup
│   └── ...
├── services/           # API services
│   ├── api.js         # Main API service (db.json)
│   ├── bookApi.js     # Google Books API service
│   └── mockApi.js     # Legacy MockAPI service
└── utils/              # Utility functions
    ├── constants.js    # App constants
    └── date.js         # Date utilities
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Kill processes using ports 3001 or 5173
   - Or change ports in package.json scripts

2. **CORS errors**
   - Ensure both servers are running
   - Check that frontend is calling correct backend URL

3. **Database not persisting**
   - Ensure `db.json` file exists and is writable
   - Check json-server is running on port 3001

4. **Google Books API not working**
   - Verify API key is correct in `.env` file
   - Check API quota and rate limits
   - Ensure internet connection is available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
