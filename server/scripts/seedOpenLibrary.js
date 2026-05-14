require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');
const db = require('../config/database');
const OpenLibraryService = require('../services/openLibraryService');

const CATEGORIES = ['fiction', 'self_help', 'business', 'science', 'history'];
const LIMIT_PER_CATEGORY = 50;

async function seedBooks() {
    console.log('🚀 Starting Open Library Bulk Seeder...\n');

    for (const category of CATEGORIES) {
        console.log(`📥 Fetching category: ${category}...`);
        try {
            const response = await axios.get(`https://openlibrary.org/search.json?subject=${category}&limit=${LIMIT_PER_CATEGORY}`, {
                timeout: 15000,
                headers: { 'User-Agent': 'PersonalBookTracker/BulkSeeder/1.0' }
            });

            if (!response.data || !response.data.docs) continue;

            const books = response.data.docs
                .map(doc => OpenLibraryService.normalize(doc))
                .filter(book => OpenLibraryService.passesQualityCheck(book));

            if (books.length === 0) continue;

            const sql = `
        INSERT INTO book_cache 
        (title, author, description, cover_id, cover_image_url, genres, isbn, page_count, published_year, published_date, publisher, source, open_library_key, language, quality_score, info_link)
        VALUES ?
        ON DUPLICATE KEY UPDATE 
        search_count = search_count + 1
      `;

            const values = books.map(b => [
                b.title, b.author, b.description, b.cover_id, b.cover_image_url,
                b.genres, b.isbn, b.page_count, b.published_year, b.published_date,
                b.publisher, 'preloaded', b.open_library_key, b.language, b.quality_score, b.info_link
            ]);

            const [result] = await db.promise().query(sql, [values]);
            console.log(`✅ Processed ${books.length} valid books for ${category}. (Inserted/Updated: ${result.affectedRows})`);

        } catch (error) {
            console.error(`❌ Failed to fetch/seed category ${category}:`, error.message);
        }

        // Respect API rate limits
        await new Promise(res => setTimeout(res, 2000));
    }

    console.log('\n✨ Seeding Complete!');
    process.exit(0);
}

seedBooks();
