/**
 * Preloaded Books - Combined dataset loader
 * Merges all parts and adds computed fields (cover URLs, quality scores)
 */
const part1 = require('./preloadedBooks_part1');
const part2 = require('./preloadedBooks_part2');
const part3 = require('./preloadedBooks_part3');

const OL_COVER = 'https://covers.openlibrary.org/b/isbn';

const allBooks = [...part1, ...part2, ...part3].map(book => ({
  ...book,
  source: 'preloaded',
  cover_image_url: book.isbn ? `${OL_COVER}/${book.isbn}-L.jpg` : null,
  quality_score: 90,
  language: 'en',
  info_link: book.isbn ? `https://openlibrary.org/isbn/${book.isbn}` : null
}));

module.exports = allBooks;
