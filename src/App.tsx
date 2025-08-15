import "./App.css";
import TopNavBar from "./components/topNavBar";
import ProjectsBar from "./components/projectsBar";
import { useState, useEffect } from "react";
import { Song } from "./lib/song";
import SongView from "./components/songView";
import SettingsView from "./components/settingsView";
import BibleView from "./components/bibleView";
import { emit } from '@tauri-apps/api/event';

function App() {

  const [curPage, setCurPage] = useState<string>("songs");
  const [songs, setSongs] = useState<Song[]>([]);
  const [curSongIndex, setCurSongIndex] = useState<number>(0);
  
  // Bible state
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bibleImportModalOpened, setBibleImportModalOpened] = useState<boolean>(false);
  


  // Bible handlers
  const handleBibleSearch = () => {
    // TODO: Implement Bible search
    console.log("Bible search for:", searchQuery);
  };

  const handleImportVersion = () => {
    setBibleImportModalOpened(true);
  };

  const handleBibleImport = (bibleData: any, versionName: string) => {
    console.log(`Importing Bible version: ${versionName}`, bibleData);
    // TODO: Store the imported Bible data and allow switching between versions
    // For now, just log the imported data
    setBibleImportModalOpened(false);
  };

  // Clear projector content when switching between sections
  useEffect(() => {
    // Clear the projector when switching pages
    emit("projector:update", { lines: [] });
  }, [curPage]);

  return (
    <div className="h-screen flex flex-col w-full">
      <TopNavBar setPage={setCurPage} />
      <div className="flex flex-row flex-1 min-h-0">
        <ProjectsBar 
          songs={songs} 
          setSongs={setSongs} 
          curSongIndex={curSongIndex} 
          setCurSongIndex={setCurSongIndex}
          currentPage={curPage}
          onPageChange={setCurPage}
          // Bible props
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onBibleSearch={handleBibleSearch}
          onImportVersion={handleImportVersion}
        />
        {curPage == "songs" && (
          <SongView songs={songs} curSongIndex={curSongIndex} ></SongView>
        )}
        {curPage == "bible" && (
          <BibleView 
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            setSelectedBook={setSelectedBook}
            setSelectedChapter={setSelectedChapter}
            importModalOpened={bibleImportModalOpened}
            setImportModalOpened={setBibleImportModalOpened}
            onImport={handleBibleImport}
          />
        )}
        {curPage == "settings" && (
          <SettingsView setPage={setCurPage} />
        )}
      </div>
    </div>
  );
}

export default App;
