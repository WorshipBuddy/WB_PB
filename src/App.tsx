import "./App.css";
import TopNavBar from "./components/topNavBar";
import ProjectsBar from "./components/projectsBar";
import { useState } from "react";
import { Song } from "./lib/song";
import SongView from "./components/songView";
import SettingsView from "./components/settingsView";

function App() {

  const [curPage, setCurPage] = useState<string>("songs");
  const [songs, setSongs] = useState<Song[]>([]);
  const [curSongIndex, setCurSongIndex] = useState<number>(0);

  return (
    <div className="h-screen flex flex-col w-full">
      <TopNavBar setPage={setCurPage} />
      <div className="flex flex-row flex-1 min-h-0">
        <ProjectsBar songs={songs} setSongs={setSongs} curSongIndex={curSongIndex} setCurSongIndex={setCurSongIndex}></ProjectsBar>
        {curPage == "songs" && (
          <SongView songs={songs} curSongIndex={curSongIndex} ></SongView>
        )}
        {curPage == "settings" && (
          <SettingsView setPage={setCurPage} />
        )}
      </div>
    </div>
  );
}

export default App;
