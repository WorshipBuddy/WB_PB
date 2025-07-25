import "./App.css";
import TopNavBar from "./components/topNavBar";
import ProjectsBar from "./components/projectsBar";
import { useState, useEffect } from "react";
import { Song } from "./lib/song";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit, listen } from '@tauri-apps/api/event';
import { Button } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

function App() {

  const [songs, setSongs] = useState<Song[]>([]);
  const [curSongIndex, setCurSongIndex] = useState<number>(0);
  const [curSlideIndex, setCurSlideIndex] = useState<number>(0);

  const openProjector = () => {
    // Create a new window
    const projector = new WebviewWindow("projector", {
      url: "projector.html",
      title: "Projector",
      width: 1920,
      height: 1080,
      x: 1920,  // position on second monitor (if your primary is 1920 wide)
      y: 0
    });
    projector.once('tauri://created', function () {
      sendSlide();
    });
  };

  const sendSlide = () => {
    const currentSong = songs.length > curSongIndex ? songs[curSongIndex] : null;
    emit("projector:update", { lines: (currentSong?.slides && currentSong.slides[curSlideIndex]) ? currentSong.slides[curSlideIndex].lines : [] });
  };

  listen('projector:mounted', () => {
    sendSlide();
  });

  useEffect(() => {
    sendSlide();
  }, [curSlideIndex, songs]);

  const currentSong = songs.length > curSongIndex ? songs[curSongIndex] : null;

  return (
    <div className="h-screen flex flex-col w-full">
      <TopNavBar />
      <div className="flex flex-row flex-1 min-h-0">
        <ProjectsBar songs={songs} setSongs={setSongs} curSongIndex={curSongIndex} setCurSongIndex={setCurSongIndex}></ProjectsBar>
        <div className="px-10 bg-white text-black h-full flex flex-col w-full min-h-0">
          <div className="flex flex-1 min-h-0">
            <div className="flex-1 flex flex-col border-r border-gray-200 mr-10 py-7 min-h-0">
              {currentSong ? (
                <div className="flex flex-col h-full min-h-0">
                  <h1 className="text-2xl font-bold text-black mb-1">{currentSong.title}</h1>
                  <p className="text-sm text-gray-500 mb-4 min-h-0">{currentSong.author == "" ? "Traditional" : currentSong.author}</p>
                  <div className="space-y-4 overflow-y-auto pr-10 mt-4">
                    {currentSong.slides.map((slide, slideIndex) => (
                      <div
                        key={slideIndex}
                        className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-200"
                        onClick={() => setCurSlideIndex(slideIndex)}
                      >
                        <h2 className="text-indigo-600 font-bold uppercase mb-2 text-lg">
                          {slide.section}
                        </h2>
                        {slide.lines.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-gray-800">
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Please select a song or set to add to the song library.</p>
              )}
            </div>

            <div className="flex-1 flex flex-col py-7 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Presentation Preview</h2>
                <Button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-2"
                  onClick={openProjector}
                >
                  <IconPlayerPlay size={20} className="mr-2" />
                  Present
                </Button>
              </div>

              <div className="w-full mx-auto flex-1 flex flex-col">
                <div className="bg-black rounded-lg aspect-video relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center">
                    <p className="text-white text-[4vh] font-semibold leading-snug whitespace-pre-wrap text-center">
                      {(currentSong?.slides && currentSong.slides[curSlideIndex])
                        ? currentSong.slides[curSlideIndex].lines.join('\n')
                        : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
