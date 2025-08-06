// src/App.tsx
import "./App.css";
import TopNavBar from "./components/topNavBar";
import ProjectsBar from "./components/projectsBar";
import { useState, useEffect } from "react";
import { Song } from "./lib/song";
import SongView from "./components/songView";
import SettingsView from "./components/settingsView";
import { SongbookOption } from "./hooks/useSongbookSongs";

function App() {
  const [curPage, setCurPage] = useState<string>("songs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [songbook, setSongbook] = useState<SongbookOption>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferredSongbook");
      if (stored === "es" || stored === "aus" || stored === "us") {
        return stored as SongbookOption;
      }
    }
    return "us";
  });
  const [curSongIndex, setCurSongIndex] = useState<number>(0);
  const [curSlideIndex, setCurSlideIndex] = useState<number>(0);
  const [songsForView, setSongsForView] = useState<Song[]>([]);

  // Persist preferred songbook if changed elsewhere
  useEffect(() => {
    try {
      localStorage.setItem("preferredSongbook", songbook);
    } catch {}
  }, [songbook]);

  return (
    <div className="h-screen flex flex-col w-full">
      <TopNavBar setPage={setCurPage} />
      <div className="flex flex-row flex-1 min-h-0">
        <ProjectsBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          songbook={songbook}
          setSongbook={setSongbook}
          songs={songsForView}
          setSongs={setSongsForView}
          curSongIndex={curSongIndex}
          setCurSongIndex={setCurSongIndex}
          curSlideIndex={curSlideIndex}
          setCurSlideIndex={setCurSlideIndex}
        />
        {curPage === "songs" && (
          <SongView
            songs={songsForView}
            setSongs={setSongsForView}
            curSongIndex={curSongIndex}
            setCurSongIndex={setCurSongIndex}
            curSlideIndex={curSlideIndex}
            setCurSlideIndex={setCurSlideIndex}
          />
        )}
        {curPage === "settings" && <SettingsView setPage={setCurPage} />}
      </div>
    </div>
  );
}

export default App;