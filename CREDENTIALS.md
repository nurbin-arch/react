# Library Management System - Test Credentials

This document contains the static login credentials for testing the Library Management System.

## Student Accounts

| Email | Password | Name | Role |
|-------|----------|------|------|
| `student1@library.com` | `student123` | John Student | Student |
| `student2@library.com` | `student456` | Jane Student | Student |
| `alice@university.edu` | `alice2024` | Alice Johnson | Student |
| `bob@university.edu` | `bob2024` | Bob Smith | Student |

## Librarian/Admin Accounts

| Email | Password | Name | Role |
|-------|----------|------|------|
| `librarian@library.com` | `librarian123` | Sarah Librarian | Librarian |
| `admin@library.com` | `admin456` | Admin User | Librarian |
| `lib.mary@library.com` | `mary2024` | Mary Wilson | Librarian |
| `lib.james@library.com` | `james2024` | James Brown | Librarian |

## How to Use

1. Navigate to the login page
2. Enter any of the email/password combinations above
3. The system will automatically redirect you to the appropriate dashboard:
   - Student accounts → Student Dashboard
   - Librarian accounts → Librarian Dashboard

## Features by Role

### Student Features
- Browse available books
- Borrow books
- View borrowing history
- Return books
- Search for books

### Librarian Features
- All student features
- Add new books to the library
- Remove books from the library
- Edit book information
- Manage all borrowings
- View all users' borrowing history
- Approve/reject book requests

## Notes

- These are static credentials for testing purposes only
- No actual authentication server is required
- You can still create new accounts via the signup page
- The system maintains backward compatibility with the old email-based logic
