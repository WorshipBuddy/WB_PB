'use client';

import { Button } from "@mantine/core";
import { IconPlayerPlayFilled, IconEyeOff, IconPlayerStop, IconEye } from "@tabler/icons-react";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit, listen } from '@tauri-apps/api/event';
import { useState, useEffect } from "react";
import { Song } from "../lib/song";


interface SongViewProps {
  songs: Song[];
  curSongIndex: number;
}


export default function SongView({ songs, curSongIndex }: SongViewProps) {

  const [curSlideIndex, setCurSlideIndex] = useState<number>(0);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [isFaded, setIsFaded] = useState<boolean>(false);
  const [projectorWindow, setProjectorWindow] = useState<any>(null);

  const sendSlide = () => {
    const currentSong = songs.length > curSongIndex ? songs[curSongIndex] : null;
    emit("projector:update", { lines: (currentSong?.slides && currentSong.slides[curSlideIndex]) ? currentSong.slides[curSlideIndex].lines : [] });
  };

  listen('projector:mounted', () => {
    sendSlide();
  });

  useEffect(() => {
    sendSlide();
  }, [curSongIndex, curSlideIndex, songs]);

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

  useEffect(() => {
    setCurSlideIndex(0);
  }, [curSongIndex])

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
    setProjectorWindow(projector);
    projector.once('tauri://created', function () {
      sendSlide();
    });
  };

  const currentSong = songs.length > curSongIndex ? songs[curSongIndex] : null;

  return (
    <div className="pl-10 bg-white text-black h-full flex flex-col w-full min-h-0">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col border-r border-gray-200 py-7 min-h-0">
          {currentSong ? (
            <div className="flex flex-col h-full min-h-0">
              <h1 className="text-2xl font-bold text-black mb-1">{currentSong.title}</h1>
              <p className="text-sm text-gray-500 mb-4 min-h-0">{currentSong.author == "" ? "Traditional" : currentSong.author}</p>
              <div className="space-y-4 overflow-y-auto pr-10 mt-4">
                {currentSong.slides.map((slide, slideIndex) => (
                  <div
                    key={`slide-${slideIndex}`}
                    onClick={() => setCurSlideIndex(slideIndex)}
                    className={`flex items-start justify-between rounded-2xl shadow-md border p-4 mb-4 transition-all cursor-pointer ${curSlideIndex === slideIndex
                      ? "border-[#0c245e] bg-[#b5c4ff50] border-2"
                      : "border-gray-200 bg-white hover:shadow-lg"
                      }`}
                  >
                    {/* Left side content */}
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full border ${slide.section.toLowerCase().includes("chorus")
                            ? "bg-[#0c245e] text-white border-black"
                            : (() => {
                              const lower = slide.section.toLowerCase();
                              if (lower.includes("verse")) {
                                // Try to extract a number from the section name
                                const numMatch = slide.section.match(/\d+/);
                                if (numMatch) {
                                  const verseNum = parseInt(numMatch[0], 10);
                                  // Alternate based on odd/even
                                  return verseNum % 2 === 0
                                    ? "bg-[#194bbf] text-white"
                                    : "bg-[#b5c4ff] text-black";
                                }
                              }
                              // Default style if not a verse or chorus
                              return "bg-black text-white border-black";
                            })()
                            }`}
                        >
                          {slide.section}
                        </span>
                      </div>

                      {slide.lines.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-800 leading-snug">
                          {line}
                        </p>
                      ))}
                    </div>

                    {/* Right side status icon */}
                    <div className="flex items-start justify-center">
                      {curSlideIndex === slideIndex ? (
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
            <p>Please select a song or set to add to the song library.</p>
          )}
        </div>

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
  )
}