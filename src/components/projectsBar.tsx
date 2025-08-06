// src/components/ProjectsBar.tsx
'use client';

import { useEffect, useMemo, useState, useRef } from "react";
import {
  SegmentedControl,
  TextInput,
  Select,
  Button,
  Modal,
  Collapse,
  Checkbox,
  ActionIcon,
  Group,
  Loader,
} from "@mantine/core";
import {
  IconBook,
  IconMusic,
  IconSearch,
  IconHelpCircle,
  IconPlus,
} from "@tabler/icons-react";
import SongCard from "./songCard";
import SongEditor from "./songEditor";
import { Song } from "../lib/song";
import {
  SongbookOption,
  cleanLyrics,
  splitLyricsToSlides,
} from "../hooks/useSongbookSongs";
import { emit } from "@tauri-apps/api/event";

const SONGBOOK_STORAGE_KEY = "preferredSongbook";
const PATHS: Record<SongbookOption, string> = {
  us: "/us_songs.json",
  es: "/es_songs.json",
  aus: "/aus_songs.json",
};

interface ProjectsBarProps {
  curSongIndex: number;
  setCurSongIndex: React.Dispatch<React.SetStateAction<number>>;
  curSlideIndex: number;
  setCurSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  songbook: SongbookOption;
  setSongbook: React.Dispatch<React.SetStateAction<SongbookOption>>;
}

export default function ProjectsBar({
  curSongIndex,
  setCurSongIndex,
  curSlideIndex,
  setCurSlideIndex,
  songs,
  setSongs,
  searchQuery,
  setSearchQuery,
  songbook,
  setSongbook,
}: ProjectsBarProps) {
  const [category, setCategory] = useState<"songs" | "bible">("songs");
  const [showBibleSettings, setShowBibleSettings] = useState(false);

  const [bookSongs, setBookSongs] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [errorBooks, setErrorBooks] = useState<string | null>(null);

  useEffect(() => {
    if (category !== "songs") return;
    setLoadingBooks(true);
    setErrorBooks(null);

    fetch(PATHS[songbook])
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: any[]) => setBookSongs(data))
      .catch((err) => setErrorBooks(err.message))
      .finally(() => setLoadingBooks(false));
  }, [category, songbook]);

  const filteredBookSongs = useMemo(() => {
    if (!searchQuery) return bookSongs;
    const q = searchQuery.toLowerCase();
    return bookSongs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.song_number.toString().includes(q)
    );
  }, [bookSongs, searchQuery]);

  useEffect(() => {
    const adapted: Song[] = filteredBookSongs.map((b: any) => ({
      songNumber: b.song_number,
      title: b.title,
      author: b.writer || "",
      sections: [{ title: "Lyrics", content: cleanLyrics(b.lyrics) }],
      slides: splitLyricsToSlides(b.lyrics),
    }));
    setSongs(adapted);
    setCurSongIndex(0);
    setCurSlideIndex(0);
  }, [filteredBookSongs, setSongs, setCurSongIndex, setCurSlideIndex]);

  const [visibleCount, setVisibleCount] = useState(10);
  useEffect(() => {
    setVisibleCount(10);
  }, [songbook, searchQuery, category]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleCount((prev) =>
        Math.min(prev + 10, filteredBookSongs.length)
      );
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(SONGBOOK_STORAGE_KEY, songbook);
    } catch {}
  }, [songbook]);

  const [editingSongIndex, setEditingSongIndex] = useState<number | null>(null);
  const editingSong =
    editingSongIndex !== null ? songs[editingSongIndex] : null;
  const currentSong = songs[curSongIndex] || null;

  return (
    <>
      <div className="min-w-[350px] bg-gray-100 text-black border-r border-gray-200 flex flex-col">

        {/* Category Tabs */}
        <div className="p-7 shrink-0">
          <SegmentedControl
            fullWidth
            value={category}
            onChange={(v) => setCategory(v as "songs" | "bible")}
            data={[
              { label: <><IconMusic size={16} /> Songs</>, value: "songs" },
              { label: <><IconBook size={16} /> Bible</>, value: "bible" },
            ]}
            size="md"
            radius="sm"
            classNames={{
              root: "w-full border border-gray-300",
              control: "flex-1",
            }}
            styles={{ indicator: { backgroundColor: "#0c245e" } }}
          />
        </div>

        {category === "songs" ? (
          <>
            {/* Songbook selector */}
            <div className="p-7 shrink-0">
              <label className="block text-sm font-medium mb-1">
                Songbook:
              </label>
              <Select
                data={[
                  { value: "us", label: "US" },
                  { value: "es", label: "Spanish" },
                  { value: "aus", label: "South Pacific" },
                ]}
                value={songbook}
                onChange={(v) => v && setSongbook(v as SongbookOption)}
                size="sm"
              />
            </div>

            {/* Search */}
            <div className="border-b border-gray-200 pb-7 px-7 shrink-0">
              <TextInput
                label="Search Songs"
                placeholder="Search..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>

            {/* List w/ infinite scroll */}
            <div
              className="flex-1 min-h-0 px-7 pb-7 pt-5 flex flex-col overflow-y-auto"
              onScroll={handleScroll}
            >
              <h2 className="font-bold mb-2">Song Library</h2>
              {loadingBooks && <Loader />}
              {errorBooks && (
                <div className="text-red-600">{errorBooks}</div>
              )}
              <div className="flex-1 overflow-y-auto">
                {songs
                  .slice(0, visibleCount)
                  .map((song, i) => (
                    <SongCard
                      key={song.songNumber}
                      song={song}
                      isCurrent={curSongIndex === i}
                      onSelect={() => setCurSongIndex(i)}
                      onEdit={() => setEditingSongIndex(i)}
                      onAdd={() => emit("projector:setlist-update", song)}
                    />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="px-7 space-y-6">
            <h2 className="font-bold mb-2">Bible Verses</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reference
              </label>
              <Group className="flex-nowrap gap-2 items-center">
                <TextInput
                  placeholder={`"Foo 8", "2 Baz 9:2-7"`}
                  className="flex-1"
                  size="sm"
                />
                <ActionIcon variant="outline">
                  <IconHelpCircle size={18} />
                </ActionIcon>
                <Button variant="outline" size="sm">
                  <IconPlus size={16} />
                </Button>
              </Group>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select</label>
              <Group className="flex-nowrap gap-2 items-center">
                <Select
                  data={[]}
                  placeholder="Book"
                  className="flex-1"
                  size="sm"
                />
                <Select
                  data={[]}
                  placeholder="Chapter"
                  className="w-24"
                  size="sm"
                />
                <Button size="sm">Go</Button>
                <Button variant="outline" size="sm">
                  <IconPlus size={16} />
                </Button>
              </Group>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <TextInput
                placeholder={`"on unto perfection"`}
                size="sm"
              />
            </div>
            <div>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowBibleSettings((o) => !o)}
              >
                Settings&nbsp;<IconHelpCircle size={16} />
              </Button>
              <Collapse in={showBibleSettings}>
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Bible version</span>
                    <Select
                      data={[
                        { value: "RV1960", label: "RV1960" },
                        { value: "KJV", label: "KJV" },
                      ]}
                      value="RV1960"
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expand abbreviations while typing.</span>
                    <Checkbox size="sm" />
                  </div>
                </div>
              </Collapse>
            </div>
          </div>
        )}
        <div className="px-7 pb-7">
          <div className="bg-[#b5c4ff30] rounded-lg p-5">  
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
              <div className="absolute inset-0 overflow-auto p-6 flex items-center justify-center">
                <p className="text-white text-[1.5vh] font-semibold leading-snug whitespace-pre-wrap text-center">
                  {currentSong?.slides[curSlideIndex]?.lines.join("\n") ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        opened={editingSong !== null}
        onClose={() => setEditingSongIndex(null)}
        size="70%"
        title={editingSong ? `Edit: ${editingSong.title}` : ""}
        withinPortal
        centered
      >
        {editingSong && (
          <SongEditor
            initialSong={editingSong}
            onSave={(updated) => {
              setSongs((prev) => {
                const copy = [...prev];
                if (editingSongIndex !== null) copy[editingSongIndex] = updated;
                return copy;
              });
              setEditingSongIndex(null);
            }}
            onCancel={() => setEditingSongIndex(null)}
          />
        )}
      </Modal>
    </>
  );
}