//songView
'use client';

import { useEffect, useState, useMemo } from "react";
import { Button, TextInput, ActionIcon, NumberInput } from "@mantine/core";
import { IconPlus, IconLink, IconHash, IconTrash } from "@tabler/icons-react";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit, listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import SongCard from "./songCard";
import { Song, RawSong } from "../lib/song";
import { splitLyricsToSlides } from "../hooks/useSongbookSongs";

interface WorshipBuddySet {
  setNumber: string;
  songs: Song[];
}

interface SongViewProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  curSongIndex: number;
  setCurSongIndex: React.Dispatch<React.SetStateAction<number>>;
  curSlideIndex: number; // block index
  setCurSlideIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function SongView({
  songs,
  setSongs,
  curSongIndex,
  setCurSongIndex,
  curSlideIndex,
  setCurSlideIndex,
}: SongViewProps) {
  const [slideStartOffset, setSlideStartOffset] = useState<number>(0);
  const [setNumber, setSetNumber] = useState<number | string>("");
  const [importUrl, setImportUrl] = useState<string>("");

  const [worshipBuddySets, setWorshipBuddySets] = useState<WorshipBuddySet[]>([]);
  const [activeSetSongIndex, setActiveSetSongIndex] = useState<{
    setIdx: number;
    songIdx: number;
  } | null>(null);

  useEffect(() => {
    if (activeSetSongIndex !== null) {
      setActiveSetSongIndex(null);
    }
  }, [curSongIndex]);

  const activeSetSong: Song | null =
    activeSetSongIndex !== null
      ? worshipBuddySets[activeSetSongIndex.setIdx]?.songs[
          activeSetSongIndex.songIdx
        ] ?? null
      : null;
  const currentLibrarySong =
    songs.length > curSongIndex ? songs[curSongIndex] : null;
  const displaySong: Song | null = activeSetSong || currentLibrarySong;

  const sendSlideNow = (lines: string[]) => {
  emit("projector:update", {
    lines,
  });
};
  useEffect(() => {
    setCurSlideIndex(0);
    setSlideStartOffset(0);
  }, [activeSetSongIndex, curSongIndex, setCurSlideIndex]);

  const rawSlideLines = displaySong?.slides?.[curSlideIndex]?.lines || [];
  const currentBlockLines = rawSlideLines.slice(slideStartOffset);

  const sendSlide = () => {
    emit("projector:update", {
      lines: currentBlockLines,
    });
  };

  useEffect(() => {
    const unlisten = listen("projector:mounted", () => {
      sendSlide();
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  useEffect(() => {
  const unlisten = listen<Song>("projector:setlist-update", (event) => {
    setWorshipBuddySets((prev) => {
      const copy = [...prev];
      if (copy.length === 0) {
        copy.push({ setNumber: "manual", songs: [event.payload] });
      } else {
        copy[0].songs.push(event.payload);
      }
      return copy;
    });
  });

  return () => {
    unlisten.then((fn) => fn());
  };
}, []);

  useEffect(() => {
    sendSlide();
  }, [curSlideIndex, slideStartOffset, songs, activeSetSong]);

  useEffect(() => {
    setSlideStartOffset(0);
  }, [curSlideIndex]);

  useEffect(() => {
    if (!displaySong) return;
    if (curSlideIndex >= (displaySong.slides?.length ?? 0)) {
      setCurSlideIndex(0);
      setSlideStartOffset(0);
    }
  }, [displaySong, curSlideIndex, setCurSlideIndex]);

  const openProjector = () => {
    const projector = new WebviewWindow("projector", {
      url: "projector.html",
      title: "Projector",
      width: 1920,
      height: 1080,
      x: 1920,
      y: 0,
    });
    projector.once("tauri://created", function () {
      sendSlide();
    });
  };

  const slidePrefixSums = useMemo(() => {
    if (!displaySong) return [];
    const sums: number[] = [];
    let acc = 0;
    for (const slide of displaySong.slides) {
      sums.push(acc);
      acc += slide.lines.length;
    }
    return sums;
  }, [displaySong]);

  function convertRawSongs(rawSongs: RawSong[]): Song[] {
    return rawSongs.map((rawSong) => {
      const content = rawSong.sections.map((s) => s.content).join("\n");
      const slides = splitLyricsToSlides(content);
      return {
        songNumber: rawSong.song_number,
        title: rawSong.title,
        author: (rawSong as any).author || "",
        sections: rawSong.sections,
        slides,
      };
    });
  }

  async function fetchSet() {
    try {
      if (setNumber === "" || worshipBuddySets.length > 0) return;
      const rawSongs = await invoke<RawSong[]>('fetch_and_process_songs', {
        setNumber: setNumber.toString(),
      });
      const songsWithSlides = convertRawSongs(rawSongs);
      setWorshipBuddySets([
        {
          setNumber: setNumber.toString(),
          songs: songsWithSlides,
        },
      ]);
      setActiveSetSongIndex(null);
    } catch (e) {
      console.error("Error invoking fetch_and_process_songs:", e);
    }
  }

  async function importFromUrl() {
    if (!importUrl) return;
    try {
      const rawSong = await invoke<any>("import_song_from_url", {
        url: importUrl,
      });
      const content = rawSong.sections.map((s: any) => s.content).join("\n");
      const adapted: Song = {
        songNumber: rawSong.song_number,
        title: rawSong.title,
        author: rawSong.author || "",
        sections: rawSong.sections,
        slides: splitLyricsToSlides(content),
      };
      setSongs((prev) => [...prev, adapted]);
    } catch (err) {
      console.error("Failed to import song from URL", err);
    }
  }

  const removeSet = (setNumberToRemove: string) => {
    setWorshipBuddySets((prev) =>
      prev.filter((s) => s.setNumber !== setNumberToRemove)
    );
    setActiveSetSongIndex((cur) => {
      if (cur && worshipBuddySets[cur.setIdx]?.setNumber === setNumberToRemove)
        return null;
      return cur;
    });
  };

  const blockCount = displaySong?.slides?.length ?? 0;

  return (
    <div className="pl-10 bg-white text-black h-full flex flex-col w-full min-h-0">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col border-r border-gray-200 py-7 min-h-0 overflow-auto">
          {displaySong ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="mb-1 flex flex-col sm:flex-row sm:items-baseline gap-1">
                <h1 className="text-2xl font-bold text-black mr-2">
                  {displaySong.songNumber}. {displaySong.title}
                </h1>
                {activeSetSong && (
                  <div className="text-sm text-gray-600">
                    (from set #{worshipBuddySets[activeSetSongIndex!.setIdx].setNumber})
                  </div>
                )}
                {!activeSetSong && currentLibrarySong && (
                  <div className="text-sm text-gray-600">from library</div>
                )}
              </div>
              <div className="overflow-auto flex-1">
                {displaySong.slides.map((slide, slideIdx) => {
                  const slideStartGlobal = slidePrefixSums[slideIdx] ?? 0;
                  const isActiveBlock = slideIdx === curSlideIndex;
                  return (
                    <div
                      key={slideIdx}
                      className={`mb-6 cursor-pointer ${
                        isActiveBlock ? "bg-[#f0f4ff] rounded-md p-2" : ""
                      }`}
                      onClick={() => {
                        setCurSlideIndex(slideIdx);
                        setSlideStartOffset(0);
                        sendSlideNow(displaySong?.slides?.[slideIdx]?.lines || []);
                      }}
                    >
                      {slide.lines.map((line, idx) => {
                        const globalIndex = slideStartGlobal + idx;
                        const label = globalIndex + 1;
                        const isInCurrentDisplayed =
                          isActiveBlock && idx >= slideStartOffset;
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 ${
                              isInCurrentDisplayed ? "font-semibold" : ""
                            }`}
                          >
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurSlideIndex(slideIdx);
                                setSlideStartOffset(idx);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setCurSlideIndex(slideIdx);
                                  setSlideStartOffset(idx);
                                }
                              }}
                              className="flex-none text-right select-none text-sm font-semibold cursor-pointer hover:text-blue-600"
                              style={{ minWidth: "2ch" }}
                              aria-label={`Show from line ${label}`}
                            >
                              {label}.
                            </span>
                            <div className="flex-1 leading-snug">{line}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="p-4">Please select a song from a set or the library.</p>
          )}
        </div>

        <div className="basis-1/3 flex flex-col py-4 min-h-0 pr-10 pl-10 bg-[#b5c4ff30] overflow-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#b5c4ff] text-black px-4 py-2 rounded hover:bg-[#b5c4ff] hover:text-black hover:border-black flex items-center gap-2 font-bold"
                onClick={openProjector}
              >
                Present
              </Button>
              <Button
                size="sm"
                className="bg-[#b5c4ff] text-black px-4 py-2 rounded hover:bg-[#b5c4ff] hover:text-black hover:border-black flex items-center gap-2 font-bold"
                onClick={openProjector}
              >
                Fade
              </Button>
              <Button
                size="sm"
                className="bg-[#b5c4ff] text-black px-4 py-2 rounded hover:bg-[#b5c4ff] hover:text-black hover:border-black flex items-center gap-2 font-bold"
                onClick={openProjector}
              >
                Show
              </Button>
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col">
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center">
                <p className="text-white text-[2vh] font-semibold leading-snug whitespace-pre-wrap text-center">
                  {currentBlockLines.length ? currentBlockLines.join("\n") : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-end">
                  <TextInput
                    className="flex-1"
                    label="Import from URL"
                    placeholder="Paste URL here"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.currentTarget.value)}
                    leftSection={<IconLink size={16} />}
                  />
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    className="bg-[#0c245e] hover:bg-[#0c245e] border-none"
                    onClick={importFromUrl}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </div>

                <div className="flex gap-2 items-end">
                  <NumberInput
                    variant="unstyled"
                    className="flex-1"
                    label="Import WorshipBuddy Set"
                    placeholder="Set Number"
                    leftSection={<IconHash size={16} />}
                    value={setNumber}
                    onChange={(v) => setSetNumber(v ?? "")}
                    disabled={worshipBuddySets.length > 0}
                  />
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    className={`border-none ${worshipBuddySets.length > 0 ? "opacity-50 cursor-not-allowed" : "bg-[#0c245e] hover:bg-[#0c245e]"}`}
                    onClick={fetchSet}
                    disabled={worshipBuddySets.length > 0}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </div>

                {worshipBuddySets.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">Set List</h3>
                    </div>
                    <div className="space-y-4">
                      {worshipBuddySets.map((set, setIdx) => (
                        <div
                          key={set.setNumber}
                          className="border rounded p-3 bg-white shadow-sm flex flex-col flex-1"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">
                              WorshipBuddy Set: {set.setNumber} (
                              {set.songs.length}{" "}
                              {set.songs.length === 1 ? "song" : "songs"})
                            </div>
                            <ActionIcon
                              size="sm"
                              onClick={() => removeSet(set.setNumber)}
                              aria-label="Remove set"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-auto">
                            {set.songs.map((s, songIdx) => {
                              const isActive =
                                activeSetSongIndex &&
                                activeSetSongIndex.setIdx === setIdx &&
                                activeSetSongIndex.songIdx === songIdx;
                              return (
                                <div key={`${s.title}-${songIdx}`}>
                                  <SongCard
                                    song={s}
                                    isCurrent={!!isActive}
                                    onSelect={() =>
                                      setActiveSetSongIndex({
                                        setIdx,
                                        songIdx,
                                      })
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}