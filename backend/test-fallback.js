const { searchBooks } = require('./services/googleBooksService');

(async () => {
  const result = await searchBooks('hello', 5);
  console.log(JSON.stringify(result, null, 2));
})();
