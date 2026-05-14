const FALLBACK_PHRASES = [
    "A story waiting to surprise you 📖",
    "This book is a mystery why not dive in?",
    "No summary? Even better. Discover it yourself!",
    "An adventure with secrets still hidden 👀",
    "Looks like this one wants you to judge it by its cover 😏",
    "Some stories are best discovered, not described ✨",
    "This could be your next favorite book 👀",
    "A hidden gem waiting to be opened 💎",
    "No spoilers here—just pure curiosity 😄",
    "Ready to explore something new? 📚",
    "A book that speaks for itself 🔥",
    "Unknown, unread, unforgettable?",
    "Every page might surprise you 😉",
    "Take a chance on this one 🎲",
    "A mystery wrapped in pages 📜"
];

/**
 * Returns a random engaging fallback description.
 * @returns {string}
 */
const generateFallbackDescription = () => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_PHRASES.length);
    return FALLBACK_PHRASES[randomIndex];
};

module.exports = {
    generateFallbackDescription
};
