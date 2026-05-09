# ⚡ Quick Start Guide

Get Personal Book Tracker running in 10 minutes!

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- MySQL 5.7+
- Google Books API Key ([Get it free](https://console.cloud.google.com))

## 🚀 5-Minute Setup

### 1. Database Setup (1 min)

```bash
# Create database
mysql -u root -p < database/schema.sql

# Or manually
mysql -u root -p
CREATE DATABASE book_tracker_db;
USE book_tracker_db;
# Paste content from database/schema.sql
```

### 2. Backend Setup (2 min)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# GOOGLE_BOOKS_API_KEY=your_api_key

# Start server
npm run dev
```

**Server running at:** `http://localhost:5000`

### 3. Frontend Setup (2 min)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**App running at:** `http://localhost:5173`

### 4. Done! ✅

Open `http://localhost:5173` in your browser

---

## 🔑 Getting Google Books API Key (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google Books API"
4. Create API key (Credentials → API Key)
5. Add to `.env`:
   ```
   GOOGLE_BOOKS_API_KEY=your_key_here
   ```

---

## 📝 Common Commands

### Backend

```bash
npm run dev       # Start with auto-reload
npm start         # Production mode
npm test          # Run tests
npm run lint      # Check code quality
```

### Frontend

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

---

## 🆘 Troubleshooting

### "Cannot find module 'mysql2'"

```bash
cd backend
npm install
```

### "Port 5000 already in use"

```bash
# Change port in server.js or .env
PORT=5001 npm run dev
```

### "Cannot connect to database"

```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check credentials in .env
cat .env
```

### "API requests failing"

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check browser console for errors (F12)
```

---

## 📚 Next Steps

1. **Read Documentation:**
   - `README.md` - Full project overview
   - `DATABASE_SETUP.md` - Database configuration
   - `API_DOCUMENTATION.md` - All API endpoints
   - `PROJECT_STRUCTURE.md` - Project organization

2. **Try Features:**
   - Add a book manually
   - Search Google Books
   - Filter by genre/status
   - Toggle dark mode

3. **Explore Code:**
   - Backend: `backend/controllers/` - Business logic
   - Frontend: `frontend/src/components/` - React components
   - Database: `backend/models/Book.js` - Database queries

4. **Customize:**
   - Change colors in `frontend/src/App.css`
   - Add new fields in `database/schema.sql`
   - Add new features in controllers

---

## 🔄 Development Workflow

### Frontend Development

```
Edit Component (.jsx) → Save → Auto-reload → Test
```

### Backend Development

```
Edit Code → Save → Auto-restart → Test with cURL/Postman
```

### Database Development

```
Modify Schema → Run Migration → Update Model → Test API
```

---

## 📦 Project Structure

```
.
├── backend/          # Express API server
├── frontend/         # React Vite app
├── database/         # MySQL schema
├── README.md         # Main documentation
└── [other docs]      # Setup guides
```

---

## 🧪 Quick Test

### Test API

```bash
# Get all books
curl http://localhost:5000/api/books

# Create a book
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "rating": 5
  }'
```

### Test Frontend

1. Open http://localhost:5173
2. Click "+ Add Book"
3. Fill form and submit
4. See book appear in list

---

## 🎨 Dark Mode

Click the moon icon in top right to toggle dark mode.

Settings saved to browser localStorage.

---

## 📱 Responsive Design

App works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

---

## 🔐 Security Tips

1. Change `DB_PASSWORD` in `.env`
2. Keep `.env` out of Git (already in `.gitignore`)
3. Use strong Google API key restrictions
4. Enable HTTPS in production
5. Set `NODE_ENV=production` in production

---

## 🚀 Ready to Deploy?

1. **Frontend:** See `DEPLOYMENT.md` for Vercel
2. **Backend:** See `DEPLOYMENT.md` for Render
3. **Database:** Use MongoDB Atlas or managed MySQL

---

## 💡 Tips

- Use browser DevTools (F12) to debug
- Check console for errors
- Use Postman to test API endpoints
- Read code comments for explanations
- Watch for lint warnings

---

## 📞 Need Help?

1. Check relevant documentation file
2. Review error messages carefully
3. Check browser console (F12)
4. Check terminal for backend errors
5. Verify `.env` configuration

---

## ✨ Features to Try

- ✅ Add books manually
- ✅ Search Google Books
- ✅ Filter by genre/status/rating
- ✅ Mark as favorite
- ✅ Add personal notes
- ✅ Dark mode
- ✅ View statistics
- ✅ Responsive design

---

**Happy coding! 🚀**

For detailed documentation, see:
- [`README.md`](./README.md) - Project overview
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) - API reference
- [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) - Database guide
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deployment guide