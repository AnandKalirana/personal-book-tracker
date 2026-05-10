# 📚 Personal Book Tracker

A full-stack Personal Book Tracker web application built with React, Node.js, Express, and MySQL that allows users to securely manage and organize their reading journey.

The application includes authentication, book management, Open Library API integration, Cloudinary image uploads, and production-level security practices.

---

# 🚀 Live Demo

## Frontend

Coming Soon

## Backend API

Coming Soon

---

# ✨ Features

## 📖 Book Management

* Add books manually
* Edit book details
* Delete books
* Track reading progress
* Store notes and ratings
* Organize books into shelves/categories

## 🔍 Book Search Integration

* Integrated with Open Library API
* Search books by title or author
* Auto-fetch book details and cover images

## 🔐 Authentication & Security

* Secure JWT authentication
* Password hashing using bcrypt
* Protected API routes
* Rate limiting for API protection
* Secure CORS configuration
* Helmet.js security headers
* XSS and HTTP Parameter Pollution protection
* Input validation using express-validator
* SQL Injection prevention using parameterized queries

## ☁️ Image Uploads

* Cloudinary integration for cloud image storage
* Secure image upload handling

## 🎨 Frontend

* Responsive UI
* Clean modern interface
* React + Vite powered frontend
* Dynamic search and filtering

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* CSS

## Backend

* Node.js
* Express.js

## Database

* MySQL
* mysql2

## Authentication

* JWT (JSON Web Tokens)
* bcryptjs

## Security

* Helmet
* express-rate-limit
* express-validator
* xss-clean
* hpp
* cors

## External Services

* Open Library API
* Cloudinary

## Deployment

* Vercel (Frontend)
* Railway (Backend & MySQL)

---

# 📂 Project Structure

```bash
personal-book-tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── database/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/personal-book-tracker.git
```

```bash
cd personal-book-tracker
```

---

# 🔧 Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

Create a `.env` file inside the backend folder.

Example:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=book_tracker

JWT_SECRET=your_super_secure_secret

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Start Backend Server

```bash
npm start
```

---

# 💻 Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

Create `.env` inside frontend folder.

```env
VITE_API_URL=http://localhost:5000/api
```

## Start Frontend

```bash
npm run dev
```

---

# 🗄️ Database Setup

1. Create a MySQL database.
2. Import the SQL schema from:

```bash
backend/database/schema.sql
```

---

# 🔒 Security Features Implemented

* Secure password hashing with bcrypt
* JWT authentication
* SQL Injection prevention
* XSS protection
* HTTP Parameter Pollution protection
* Secure CORS configuration
* API rate limiting
* Environment variable protection
* Secure error handling
* Input validation & sanitization
* Cloudinary secure uploads

---

# 🌐 Deployment

## Frontend

Deployed using:

* Vercel

## Backend & Database

Deployed using:

* Railway

---

# 📸 Screenshots

Add screenshots here after deployment.

Example:

* Home Page
* Login Page
* Book Dashboard
* Add Book Modal
* Search Functionality

---

# 🧠 Future Improvements

* Reading statistics dashboard
* Dark mode improvements
* Reading goals tracking
* Favorites & wishlist
* Email verification
* OAuth login
* Advanced search filters
* Mobile app version

---

# 👨‍💻 Author

## Anand Kalirana

* IoT Engineering Student
* Full Stack Developer
* Cybersecurity Enthusiast

---

# 📄 License

This project is for educational and portfolio purposes.
