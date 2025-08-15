export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  matchType: 'exact' | 'partial' | 'reference';
}

// KJV Bible book data
export const KJV_BOOKS: BibleBook[] = [
  // Old Testament
  { name: "Genesis", abbreviation: "Gen", testament: "old", chapters: 50 },
  { name: "Exodus", abbreviation: "Exo", testament: "old", chapters: 40 },
  { name: "Leviticus", abbreviation: "Lev", testament: "old", chapters: 27 },
  { name: "Numbers", abbreviation: "Num", testament: "old", chapters: 36 },
  { name: "Deuteronomy", abbreviation: "Deu", testament: "old", chapters: 34 },
  { name: "Joshua", abbreviation: "Jos", testament: "old", chapters: 24 },
  { name: "Judges", abbreviation: "Jdg", testament: "old", chapters: 21 },
  { name: "Ruth", abbreviation: "Rut", testament: "old", chapters: 4 },
  { name: "1 Samuel", abbreviation: "1Sa", testament: "old", chapters: 31 },
  { name: "2 Samuel", abbreviation: "2Sa", testament: "old", chapters: 24 },
  { name: "1 Kings", abbreviation: "1Ki", testament: "old", chapters: 22 },
  { name: "2 Kings", abbreviation: "2Ki", testament: "old", chapters: 25 },
  { name: "1 Chronicles", abbreviation: "1Ch", testament: "old", chapters: 29 },
  { name: "2 Chronicles", abbreviation: "2Ch", testament: "old", chapters: 36 },
  { name: "Ezra", abbreviation: "Ezr", testament: "old", chapters: 10 },
  { name: "Nehemiah", abbreviation: "Neh", testament: "old", chapters: 13 },
  { name: "Esther", abbreviation: "Est", testament: "old", chapters: 10 },
  { name: "Job", abbreviation: "Job", testament: "old", chapters: 42 },
  { name: "Psalms", abbreviation: "Psa", testament: "old", chapters: 150 },
  { name: "Proverbs", abbreviation: "Pro", testament: "old", chapters: 31 },
  { name: "Ecclesiastes", abbreviation: "Ecc", testament: "old", chapters: 8 },
  { name: "Song of Songs", abbreviation: "Sng", testament: "old", chapters: 12 },
  { name: "Isaiah", abbreviation: "Isa", testament: "old", chapters: 66 },
  { name: "Jeremiah", abbreviation: "Jer", testament: "old", chapters: 52 },
  { name: "Lamentations", abbreviation: "Lam", testament: "old", chapters: 5 },
  { name: "Ezekiel", abbreviation: "Ezk", testament: "old", chapters: 48 },
  { name: "Daniel", abbreviation: "Dan", testament: "old", chapters: 12 },
  { name: "Hosea", abbreviation: "Hos", testament: "old", chapters: 14 },
  { name: "Joel", abbreviation: "Jol", testament: "old", chapters: 3 },
  { name: "Amos", abbreviation: "Amo", testament: "old", chapters: 9 },
  { name: "Obadiah", abbreviation: "Oba", testament: "old", chapters: 1 },
  { name: "Jonah", abbreviation: "Jon", testament: "old", chapters: 4 },
  { name: "Micah", abbreviation: "Mic", testament: "old", chapters: 7 },
  { name: "Nahum", abbreviation: "Nah", testament: "old", chapters: 3 },
  { name: "Habakkuk", abbreviation: "Hab", testament: "old", chapters: 3 },
  { name: "Zephaniah", abbreviation: "Zep", testament: "old", chapters: 3 },
  { name: "Haggai", abbreviation: "Hag", testament: "old", chapters: 2 },
  { name: "Zechariah", abbreviation: "Zec", testament: "old", chapters: 14 },
  { name: "Malachi", abbreviation: "Mal", testament: "old", chapters: 4 },
  
  // New Testament
  { name: "Matthew", abbreviation: "Mat", testament: "new", chapters: 28 },
  { name: "Mark", abbreviation: "Mrk", testament: "new", chapters: 16 },
  { name: "Luke", abbreviation: "Luk", testament: "new", chapters: 24 },
  { name: "John", abbreviation: "Jhn", testament: "new", chapters: 21 },
  { name: "Acts", abbreviation: "Act", testament: "new", chapters: 28 },
  { name: "Romans", abbreviation: "Rom", testament: "new", chapters: 16 },
  { name: "1 Corinthians", abbreviation: "1Co", testament: "new", chapters: 16 },
  { name: "2 Corinthians", abbreviation: "2Co", testament: "new", chapters: 13 },
  { name: "Galatians", abbreviation: "Gal", testament: "new", chapters: 6 },
  { name: "Ephesians", abbreviation: "Eph", testament: "new", chapters: 6 },
  { name: "Philippians", abbreviation: "Php", testament: "new", chapters: 4 },
  { name: "Colossians", abbreviation: "Col", testament: "new", chapters: 4 },
  { name: "1 Thessalonians", abbreviation: "1Th", testament: "new", chapters: 5 },
  { name: "2 Thessalonians", abbreviation: "2Th", testament: "new", chapters: 3 },
  { name: "1 Timothy", abbreviation: "1Ti", testament: "new", chapters: 6 },
  { name: "2 Timothy", abbreviation: "2Ti", testament: "new", chapters: 4 },
  { name: "Titus", abbreviation: "Tit", testament: "new", chapters: 3 },
  { name: "Philemon", abbreviation: "Phm", testament: "new", chapters: 1 },
  { name: "Hebrews", abbreviation: "Heb", testament: "new", chapters: 13 },
  { name: "James", abbreviation: "Jas", testament: "new", chapters: 5 },
  { name: "1 Peter", abbreviation: "1Pe", testament: "new", chapters: 5 },
  { name: "2 Peter", abbreviation: "2Pe", testament: "new", chapters: 3 },
  { name: "1 John", abbreviation: "1Jn", testament: "new", chapters: 5 },
  { name: "2 John", abbreviation: "2Jn", testament: "new", chapters: 1 },
  { name: "3 John", abbreviation: "3Jn", testament: "new", chapters: 1 },
  { name: "Jude", abbreviation: "Jud", testament: "new", chapters: 1 },
  { name: "Revelation", abbreviation: "Rev", testament: "new", chapters: 22 }
];

// Helper function to get book by name
export function getBookByName(name: string): BibleBook | undefined {
  return KJV_BOOKS.find(book => 
    book.name.toLowerCase() === name.toLowerCase() ||
    book.abbreviation.toLowerCase() === name.toLowerCase()
  );
}

// Helper function to parse reference (e.g., "John 3:16")
export function parseReference(reference: string): { book: string; chapter: number; verse: number } | null {
  const match = reference.match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  
  const bookName = match[1].trim();
  const chapter = parseInt(match[2]);
  const verse = parseInt(match[3]);
  
  const book = getBookByName(bookName);
  if (!book) return null;
  
  return { book: book.name, chapter, verse };
}
