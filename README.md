# 📚 Personal Book Tracker

A full-stack, production-grade Book Tracker application built with **React (Vite)**, **Node.js/Express**, and **MySQL**. This app allows readers to organize their library, track reading progress, and discover new books via Google Books integration.

---

# 🚀 Live Deployment

**Website:** [https://personal-book-tracker-ten.vercel.app/](https://personal-book-tracker-ten.vercel.app/)

*Hosted on **Vercel** with **Railway MySQL**.*

---

# ✨ Features

### 📖 Library Management
* **Status Tracking:** Categorize books as *Reading*, *Completed*, or *Wishlist*.
* **Custom Shelves:** Create and manage personal shelves (e.g., "Favorites", "To Buy").
* **Tags:** Add mood or genre-based tags to your collection.
* **Ratings & Notes:** Store your personal thoughts and 1-5 star ratings.

### 🔍 Discovery
* **Google Books Search:** Instantly find books by title or author and add them to your library.
* **Auto-Metadata:** Automatically fetches cover art, descriptions, page counts, and genres.

### 📊 Insights & Social
* **Visual Dashboard:** Interactive charts showing your reading habits and collection stats.
* **Public Profiles:** Share your reading journey with others via public links.
* **User Search:** Find and explore other readers' collections.

### 🎨 Modern UI/UX
* **Themed Transitions:** Professional, smooth preloader with dark/light mode detection.
* **Glassmorphism:** Premium modern interface with rich animations and responsive design.
* **Dark Mode:** Built-in support for eye-friendly reading at night.

---

# 🛠️ Tech Stack

*   **Frontend:** React 18, Vite, Vanilla CSS (Premium Custom Design)
*   **Backend:** Node.js, Express.js (Deployed as Serverless Functions)
*   **Database:** MySQL (Railway)
*   **Auth:** JWT (JSON Web Tokens) with Secure HTTP Headers
*   **Security:** Helmet, express-rate-limit, bcryptjs, Parameterized Queries

---

# 📂 Project Structure

```bash
personal-book-tracker/
├── api/                # Vercel Serverless Entry Points
├── backend/            # Core Backend Logic (Controllers, Models, Routes)
├── database/           # SQL Schema and Migration Scripts
├── public/             # Static Assets
├── src/                # Frontend React Components & Logic
├── index.html          # App Entry Point
├── vercel.json         # Deployment Configuration
└── vite.config.js      # Build Settings
```

---

# ⚙️ Local Development

### 1️⃣ Clone and Install
```bash
git clone https://github.com/AnandKalirana/personal-book-tracker.git
cd personal-book-tracker
npm install
```

### 2️⃣ Database Setup
1. Create a MySQL database (Local or Cloud).
2. Run the scripts in `/database/schema.sql` and `/database/migrate_features.sql`.

### 3️⃣ Environment Variables
Create a `.env` in the root:
```env
# Database
DATABASE_URL=mysql://user:pass@host:port/db
# Or individual vars
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=book_tracker

# Security
JWT_SECRET=your_secret_here
NODE_ENV=development
```

### 4️⃣ Start Development
```bash
# Start Frontend & Backend concurrently
npm run dev
```

---

# 👨‍💻 Author

**Anand Kalirana**
*   IoT Engineering Student
*   Full Stack Developer & Cybersecurity Enthusiast

---

# 📄 License

This project is for educational and portfolio purposes.
