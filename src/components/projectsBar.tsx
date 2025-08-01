import { TextInput, ActionIcon, NumberInput } from "@mantine/core";
import { IconPlus, IconLink, IconSearch, IconHash } from "@tabler/icons-react";
import { invoke } from '@tauri-apps/api/core';
import { useState } from "react";
import { Song, RawSong, Slide } from "../lib/song";
import SongCard from "./songCard";
import CategoryPicker from "./categoryPicker";


interface ProjectsBarProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  curSongIndex: number;
  setCurSongIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function ProjectsBar({ songs, setSongs, curSongIndex, setCurSongIndex }: ProjectsBarProps) {

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
        <CategoryPicker></CategoryPicker>
      </div>
      <div className="border-b border-gray-200 pb-7 px-7 shrink-0">
        <div className="flex gap-2 items-end">
          <TextInput
            className="flex-1"
            label="Import from URL"
            placeholder="Paste URL here"
            leftSection={<IconLink size={16} />}
          />
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
        <div className="flex gap-2 items-end mt-2">
          <NumberInput
            variant="unstyled"
            className="flex-1"
            label="Import WorshipBuddy Set"
            placeholder="Set Number"
            leftSection={<IconHash size={16} />}
            value={setNumber} // ✅ controlled value
            onChange={(value) => setSetNumber(value ?? "")} // ✅ update state
          />
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
      <div className="flex-1 min-h-0 px-7 pb-7 pt-5 flex flex-col">
        <h2 className="font-bold mb-2">Song Library</h2>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {songs.map((song, i) => (
            <div className="mb-2" onClick={() => {setCurSongIndex(i)}}>
              <SongCard key={`${song.title}-${i}`} song={song} onDelete={() => handleDelete(i)} isCurrent={curSongIndex == i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}