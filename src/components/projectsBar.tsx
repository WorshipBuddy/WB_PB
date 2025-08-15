import { TextInput, ActionIcon, NumberInput, Button, Select } from "@mantine/core";
import { IconPlus, IconLink, IconSearch, IconHash, IconBook, IconUpload } from "@tabler/icons-react";
import { invoke } from '@tauri-apps/api/core';
import { useState } from "react";
import { Song, RawSong, Slide } from "../lib/song";
import SongCard from "./songCard";
import CategoryPicker from "./categoryPicker";
import { KJV_BOOKS } from "../lib/bible";


interface ProjectsBarProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  curSongIndex: number;
  setCurSongIndex: React.Dispatch<React.SetStateAction<number>>;
  currentPage: string;
  onPageChange: (page: string) => void;
  // Bible props
  selectedBook: string;
  setSelectedBook: (book: string) => void;
  selectedChapter: number;
  setSelectedChapter: (chapter: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBibleSearch: () => void;
  onImportVersion: () => void;
}

export default function ProjectsBar({ 
  songs, 
  setSongs, 
  curSongIndex, 
  setCurSongIndex, 
  currentPage, 
  onPageChange,
  // Bible props
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  searchQuery,
  setSearchQuery,
  onBibleSearch,
  onImportVersion
}: ProjectsBarProps) {

  const [setNumber, setSetNumber] = useState<number | string>("");

  function convertRawSongs(rawSongs: RawSong[]): Song[] {
    return rawSongs.map((rawSong) => {
      const slides: Slide[] = [];
  
      rawSong.sections.forEach((section) => {
        const lines = section.content.split("\n").filter((l) => l.trim() !== "");
        for (let i = 0; i < lines.length; i += 4) {
          slides.push({
            section: section.title,
            lines: lines.slice(i, i + 4),
          });
        }
      });
  
      return {
        songNumber: rawSong.song_number,
        title: rawSong.title,
        author: rawSong.author,
        sections: rawSong.sections,
        slides: slides,
      };
    });
  }

  async function fetchSet() {
    try {
      if (setNumber !== "") {
        const rawSongs = await invoke<RawSong[]>('fetch_and_process_songs', { 
          setNumber: setNumber.toString() 
        });
        const songsWithSlides = convertRawSongs(rawSongs);
        setSongs((prevSongs) => [...prevSongs, ...songsWithSlides]);
      }
    } catch (e) {
      console.error('Error invoking fetch_and_process_songs:', e);
    }
  }
  

  const handleDelete = (indexToDelete: number) => {
    if (curSongIndex == songs.length && curSongIndex != 0) {
      setCurSongIndex((prevIndex) => prevIndex - 1)
    }
    setSongs((prevSongs) => {
      const newSongs = [...prevSongs];
      newSongs.splice(indexToDelete, 1);
      return newSongs;
    });
  };

  return (
    <div className="justify-center min-w-[350px] bg-gray-100 text-black border-r border-gray-200 min-h-0 flex flex-col">
      <div className="p-7 shrink-0">
        <CategoryPicker currentPage={currentPage} onPageChange={onPageChange} />
      </div>
      {/* Controls Section - Fixed height and width to prevent shifting */}
      <div className="border-b border-gray-200 pb-7 px-7 shrink-0 h-[200px] w-full">
        {currentPage === "songs" && (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="w-full">
                <TextInput
                  label="Import from URL"
                  placeholder="Paste URL here"
                  leftSection={<IconLink size={16} />}
                />
              </div>
              <ActionIcon
                size="lg"
                variant="filled"
                className="bg-[#0c245e] hover:bg-[#0c245e] border-none"
              >
                <IconPlus size={16} />
              </ActionIcon>
            </div>

            {/* Search songs */}
            <TextInput
              label="Search Songs"
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
              className="mt-2"
            />

            {/* Add from Set */}
            <div className="grid grid-cols-2 gap-2 items-end mt-2">
              <div className="w-full">
                <NumberInput
                  variant="unstyled"
                  label="Import WorshipBuddy Set"
                  placeholder="Set Number"
                  leftSection={<IconHash size={16} />}
                  value={setNumber}
                  onChange={(value) => setSetNumber(value ?? "")}
                />
              </div>
              <ActionIcon
                size="lg"
                variant="filled"
                className="bg-[#0c245e] hover:bg-[#0c245e] border-none"
                onClick={fetchSet}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </div>

          </div>
        )}

        {currentPage === "bible" && (
          <div className="h-full flex flex-col">
            {/* Bible Search */}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="w-full">
                <TextInput
                  label="Search Bible"
                  placeholder="Search for text..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                className="bg-[#0c245e] hover:bg-[#0c245e]"
                onClick={onBibleSearch}
              >
                Search
              </Button>
            </div>

            {/* Book and Chapter Selection */}
            <div className="grid grid-cols-2 gap-2 mt-2 w-full">
              <Select
                label="Book"
                placeholder="Select book..."
                value={selectedBook}
                onChange={(value) => setSelectedBook(value || "")}
                data={KJV_BOOKS.map(book => ({
                  value: book.name,
                  label: book.name
                }))}
                searchable
                leftSection={<IconBook size={16} />}
                className="w-full"
              />
              
              <NumberInput
                label="Chapter"
                placeholder="Chapter"
                value={selectedChapter}
                onChange={(value) => setSelectedChapter(Number(value) || 1)}
                min={1}
                max={selectedBook ? KJV_BOOKS.find(b => b.name === selectedBook)?.chapters || 1 : 1}
                leftSection={<IconHash size={16} />}
                className="w-full"
              />
            </div>

            {/* Import Version Button */}
            <Button
              size="sm"
              variant="outline"
              className="text-[#0c245e] border-[#0c245e] hover:bg-[#0c245e] hover:text-white w-full mt-2"
              onClick={onImportVersion}
              leftSection={<IconUpload size={16} />}
            >
              Import Version
            </Button>
          </div>
        )}
      </div>

      {/* Content Section - Always visible, content changes based on page */}
      <div className="flex-1 min-h-0 px-7 pb-7 pt-5 flex flex-col">
        {currentPage === "songs" && (
          <>
            <h2 className="font-bold mb-2">Song Library</h2>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {songs.map((song, i) => (
                <div className="mb-2" onClick={() => {setCurSongIndex(i)}}>
                  <SongCard key={`${song.title}-${i}`} song={song} onDelete={() => handleDelete(i)} isCurrent={curSongIndex == i} />
                </div>
              ))}
            </div>
          </>
        )}

        {currentPage === "bible" && (
          <>
            <h2 className="font-bold mb-2">Bible Library</h2>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <p className="text-gray-500">Select a book and chapter to view Bible content</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}