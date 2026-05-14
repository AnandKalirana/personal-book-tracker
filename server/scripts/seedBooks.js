/**
 * Seed Script - Populates book_cache with preloaded books
 * Usage: node server/scripts/seedBooks.js
 */
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BookCache = require('../models/BookCache');
const preloadedBooks = require('../data/preloadedBooks');

async function seed() {
  console.log(`\n📚 Seeding ${preloadedBooks.length} preloaded books...\n`);

  try {
    const inserted = await BookCache.bulkInsert(preloadedBooks);
    console.log(`✅ Successfully inserted ${inserted} books into book_cache`);

    const stats = await BookCache.getCount();
    console.log(`📊 Total: ${stats.total} | Preloaded: ${stats.preloaded} | Cached: ${stats.cached}`);
    console.log('\n🎉 Seeding complete!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }

  process.exit(0);
}

seed();
