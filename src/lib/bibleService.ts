import { BibleVerse, BibleBook, KJV_BOOKS, getBookByName } from './bible';

// This will be populated when the Bible data is loaded
let kjvData: any = null;
let isDataLoaded = false;

// Load the KJV Bible data
export async function loadKJVBible(): Promise<void> {
  if (isDataLoaded) return;
  
  try {
    // Load the layout file first to get the structure
    const layoutResponse = await fetch('/json/layout-1769.json');
    if (!layoutResponse.ok) {
      throw new Error(`Failed to load layout file: ${layoutResponse.status}`);
    }
    const layoutData = await layoutResponse.json();
    
    // Load the verses file
    const versesResponse = await fetch('/json/verses-1769.json');
    if (!versesResponse.ok) {
      throw new Error(`Failed to load verses file: ${versesResponse.status}`);
    }
    const versesData = await versesResponse.json();
    
    // Process and structure the data
    kjvData = processBibleData(layoutData, versesData);
    isDataLoaded = true;
  } catch (error) {
    console.error('Failed to load KJV Bible data:', error);
    throw new Error(`Failed to load Bible data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Process the raw Bible data into a structured format
function processBibleData(layoutData: any[], versesData: any): any {
  const processedData: { [book: string]: { [chapter: number]: BibleVerse[] } } = {};
  
  let currentBook = '';
  let currentChapter = 0;
  let currentVerses: BibleVerse[] = [];
  
  // Process layout data to find book and chapter markers
  for (let i = 0; i < layoutData.length; i++) {
    const item = layoutData[i];
    
    if (item[0] === 'BOOK') {
      // Save previous chapter if exists
      if (currentBook && currentChapter > 0) {
        if (!processedData[currentBook]) {
          processedData[currentBook] = {};
        }
        processedData[currentBook][currentChapter] = currentVerses;
      }
      
      // Start new book
      currentBook = item[1];
      currentChapter = 0;
      currentVerses = [];
    } else if (item[0] === 'CHAPTER') {
      // Save previous chapter if exists
      if (currentBook && currentChapter > 0) {
        if (!processedData[currentBook]) {
          processedData[currentBook] = {};
        }
        processedData[currentBook][currentChapter] = currentVerses;
        currentVerses = [];
      }
      
      currentChapter = item[1];
    } else if (item[0] === 'VERSE') {
      const verseRef = item[1];
      const match = verseRef.match(/^([A-Za-z0-9\s]+)\s+(\d+):(\d+)$/);
      
      if (match && currentBook && currentChapter > 0) {
        const bookName = match[1].trim();
        const chapter = parseInt(match[2]);
        const verse = parseInt(match[3]);
        
        // Find the corresponding verse text in versesData
        const verseText = findVerseText(verseRef, versesData);
        
        currentVerses.push({
          book: bookName,
          chapter,
          verse,
          text: verseText || `Verse ${verse}`
        });
      }
    }
  }
  
  // Save the last chapter
  if (currentBook && currentChapter > 0) {
    if (!processedData[currentBook]) {
      processedData[currentBook] = {};
    }
    processedData[currentBook][currentChapter] = currentVerses;
  }
  
  return processedData;
}

// Find verse text in the verses data
function findVerseText(verseRef: string, versesData: any): string {
  // The versesData is an object with verse references as keys
  if (versesData && typeof versesData === 'object' && versesData[verseRef]) {
    return versesData[verseRef];
  }
  return '';
}

// Get a specific verse
export function getVerse(book: string, chapter: number, verse: number): BibleVerse | null {
  if (!isDataLoaded || !kjvData) {
    throw new Error('Bible data not loaded');
  }
  
  const bookData = kjvData[book];
  if (!bookData) return null;
  
  const chapterData = bookData[chapter];
  if (!chapterData) return null;
  
  return chapterData.find((v: BibleVerse) => v.verse === verse) || null;
}

// Get all verses in a chapter
export function getChapter(book: string, chapter: number): BibleVerse[] {
  if (!isDataLoaded || !kjvData) {
    throw new Error('Bible data not loaded');
  }
  
  const bookData = kjvData[book];
  if (!bookData) return [];
  
  return bookData[chapter] || [];
}

// Search for verses containing text
export function searchVerses(query: string): BibleVerse[] {
  if (!isDataLoaded || !kjvData) {
    throw new Error('Bible data not loaded');
  }
  
  const results: BibleVerse[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const bookName in kjvData) {
    const bookData = kjvData[bookName];
    for (const chapterNum in bookData) {
      const chapterData = bookData[chapterNum];
      for (const verse of chapterData) {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          results.push(verse);
        }
      }
    }
  }
  
  return results.slice(0, 100); // Limit results
}

// Get book information
export function getBook(bookName: string): BibleBook | undefined {
  return getBookByName(bookName);
}

// Get all books
export function getAllBooks(): BibleBook[] {
  return KJV_BOOKS;
}

// Check if data is loaded
export function isBibleDataLoaded(): boolean {
  return isDataLoaded;
}
