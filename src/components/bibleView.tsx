'use client';

import { useState, useEffect } from "react";
import { Button } from "@mantine/core";
import { IconPlayerPlayFilled, IconEyeOff, IconPlayerStop, IconEye } from "@tabler/icons-react";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit, listen } from '@tauri-apps/api/event';
import { BibleVerse, KJV_BOOKS } from "../lib/bible";
import { loadKJVBible, getChapter, isBibleDataLoaded } from "../lib/bibleService";
import BibleImportModal from "./bibleImportModal";

interface BibleViewProps {
  selectedBook: string;
  selectedChapter: number;
  setSelectedBook: (book: string) => void;
  setSelectedChapter: (chapter: number) => void;
  importModalOpened: boolean;
  setImportModalOpened: (opened: boolean) => void;
  onImport: (bibleData: any, versionName: string) => void;
}

export default function BibleView({ 
  selectedBook, 
  selectedChapter, 
  setSelectedBook, 
  setSelectedChapter,
  importModalOpened,
  setImportModalOpened,
  onImport
}: BibleViewProps) {
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [isFaded, setIsFaded] = useState<boolean>(false);
  const [projectorWindow, setProjectorWindow] = useState<any>(null);

  // Load Bible data on component mount
  useEffect(() => {
    loadBibleData();
  }, []);

  // Load chapter when book or chapter changes
  useEffect(() => {
    if (selectedBook && selectedChapter && isBibleDataLoaded()) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter]);

  // Listen for projector mounted event and send current verse
  useEffect(() => {
    const unlisten = listen('projector:mounted', () => {
      sendVerseToProjector();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [selectedBook, selectedChapter, selectedVerse, verses]);

  // Listen for projector window close to reset state
  useEffect(() => {
    const checkProjectorClosed = setInterval(() => {
      if (projectorWindow) {
        // Check if the window is still open
        try {
          // Try to access a property to see if window is still valid
          if (projectorWindow.label) {
            // Window is still open
          }
        } catch {
          // Window is closed
          setIsPresenting(false);
          setIsFaded(false);
          setProjectorWindow(null);
        }
      }
    }, 1000);

    return () => clearInterval(checkProjectorClosed);
  }, [projectorWindow]);

  // Send verse to projector whenever selection changes
  useEffect(() => {
    sendVerseToProjector();
  }, [selectedBook, selectedChapter, selectedVerse, verses]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in input fields
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (selectedChapter > 1) {
            setSelectedChapter(selectedChapter - 1);
            setSelectedVerse(1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          const maxChapters = getBookChapters(selectedBook);
          if (selectedChapter < maxChapters) {
            setSelectedChapter(selectedChapter + 1);
            setSelectedVerse(1);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (selectedVerse > 1) {
            setSelectedVerse(prev => prev - 1);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (selectedVerse < verses.length) {
            setSelectedVerse(prev => prev + 1);
          }
          break;
        case ' ':
          event.preventDefault();
          sendVerseToProjector();
          break;

      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedBook, selectedChapter, selectedVerse, verses.length]);

  const loadBibleData = async () => {
    try {
      setIsLoading(true);
      await loadKJVBible();
      // Set default book to Genesis
      setSelectedBook("Genesis");
      setSelectedChapter(1);
      setSelectedVerse(1);
    } catch (err) {
      setError("Failed to load Bible data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = () => {
    try {
      const chapterVerses = getChapter(selectedBook, selectedChapter);
      setVerses(chapterVerses);
      if (chapterVerses.length > 0) {
        setSelectedVerse(1);
      }
    } catch (err) {
      setError("Failed to load chapter");
      console.error(err);
    }
  };





  const sendVerseToProjector = () => {
    const currentVerse = verses.find(v => v.verse === selectedVerse);
    
    if (currentVerse) {
      const lines = [
        `${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verse}`,
        currentVerse.text
      ];
      emit("projector:update", { lines });
    } else {
      // Send empty content if no verse is selected
      emit("projector:update", { lines: [] });
    }
  };



  const openProjector = () => {
    const projector = new WebviewWindow("projector", {
      url: "projector.html",
      title: "Projector",
      width: 1920,
      height: 1080,
      x: 1920,
      y: 0
    });
    setProjectorWindow(projector);
    // The projector:mounted event will trigger sendVerseToProjector automatically
  };

  const getBookChapters = (bookName: string): number => {
    const book = KJV_BOOKS.find(b => b.name === bookName);
    return book ? book.chapters : 0;
  };





  if (isLoading) {
    return (
      <div className="pl-10 bg-white text-black h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c245e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bible data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-10 bg-white text-black h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadBibleData} className="bg-[#0c245e] hover:bg-[#0c245e]">
            Retry
          </Button>
        </div>
      </div>
    );
  }

    return (
      <div className="pl-10 bg-white text-black h-full flex flex-col w-full min-h-0">
        <div className="flex flex-1 min-h-0">
          {/* Bible Content */}
          <div className="flex-1 flex flex-col border-r border-gray-200 py-7 min-h-0">
            {verses.length > 0 ? (
              <div className="flex flex-col h-full min-h-0">
                <h1 className="text-2xl font-bold text-black mb-1">Bible</h1>
                <p className="text-sm text-gray-500 mb-4 min-h-0">King James Version</p>
                <div className="space-y-4 overflow-y-auto pr-10 mt-4">
                  {verses.map((verse) => (
                    <div
                      key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                      onClick={() => setSelectedVerse(verse.verse)}
                      className={`flex items-start justify-between rounded-2xl shadow-md border p-4 mb-4 transition-all cursor-pointer ${
                        selectedVerse === verse.verse
                          ? "border-[#0c245e] bg-[#b5c4ff50] border-2"
                          : "border-gray-200 bg-white hover:shadow-lg"
                      }`}
                    >
                      {/* Left side content */}
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[#0c245e] text-white">
                            {verse.verse}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-snug">{verse.text}</p>
                      </div>

                      {/* Right side status icon */}
                      <div className="flex items-start justify-center">
                        {selectedVerse === verse.verse ? (
                          <div className="flex items-center gap-1">
                            {/* Live status dot */}
                            <span className="w-3 h-3 rounded-full bg-[#0c245e] shadow-md"></span>
                            <span className="text-[#0c245ebb] text-sm font-medium">Live</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-50">
                            <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                            <span className="text-gray-500 text-sm">Idle</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full min-h-0">
                <h1 className="text-2xl font-bold text-black mb-1">Bible</h1>
                <p className="text-sm text-gray-500 mb-4 min-h-0">King James Version</p>
                <p className="text-gray-500">Select a book and chapter to view content</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col py-7 min-h-0 pr-10 pl-10 bg-[#b5c4ff30]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Presentation Preview</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={`px-4 py-2 rounded flex items-center gap-2 font-bold ${
                    isPresenting 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-[#b5c4ff] hover:bg-[#b5c4ff] text-black hover:border-black'
                  }`}
                  onClick={() => {
                    if (isPresenting) {
                      // End presentation and close projector
                      setIsPresenting(false);
                      setIsFaded(false);
                      emit("projector:end", {});
                      // Close the projector window
                      if (projectorWindow) {
                        projectorWindow.close();
                        setProjectorWindow(null);
                      }
                    } else {
                      // Start presentation
                      setIsPresenting(true);
                      openProjector();
                    }
                  }}
                  disabled={!selectedBook || !selectedChapter || !selectedVerse}
                >
                  {isPresenting ? (
                    <>
                      <IconPlayerStop size={18} className="mr-2" />
                      End Presentation
                    </>
                  ) : (
                    <>
                      <IconPlayerPlayFilled size={18} className="mr-2" />
                      Present
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`px-4 py-2 rounded flex items-center gap-2 font-bold ${
                    isFaded 
                      ? 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white' 
                      : 'text-[#0c245e] border-[#0c245e] hover:bg-[#0c245e] hover:text-white'
                  }`}
                  onClick={() => {
                    const newFadeState = !isFaded;
                    setIsFaded(newFadeState);
                    emit("projector:fade", { fade: newFadeState });
                  }}
                  disabled={!isPresenting}
                >
                  {isFaded ? (
                    <>
                      <IconEye size={18} className="mr-2" />
                      Restore
                    </>
                  ) : (
                    <>
                      <IconEyeOff size={18} className="mr-2" />
                      Fade to Black
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="w-full mx-auto flex-1 flex flex-col">
              <div className="bg-black rounded-lg aspect-video relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center">
                  {selectedBook && selectedChapter && selectedVerse && verses.length > 0 ? (
                    <div className="text-center">
                      <p className="text-white text-[3vh] font-semibold mb-4">
                        {selectedBook} {selectedChapter}:{selectedVerse}
                      </p>
                      <p className="text-white text-[4vh] font-semibold leading-snug">
                        {verses.find(v => v.verse === selectedVerse)?.text}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white text-[3vh] text-center">
                      Select a verse to preview
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Import Modal */}
        <BibleImportModal
          opened={importModalOpened}
          onClose={() => setImportModalOpened(false)}
          onImport={onImport}
        />
      </div>
    );
}
