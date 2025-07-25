import { Button, TextInput, ActionIcon, NumberInput } from "@mantine/core";
import { IconMusic, IconBook, IconPlus, IconLink, IconSearch, IconHash } from "@tabler/icons-react";
import { invoke } from '@tauri-apps/api/core';
import { useState } from "react";
import { Song } from "../lib/song";
import SongCard from "./songCard";


interface ProjectsBarProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

export default function ProjectsBar({ songs, setSongs }: ProjectsBarProps) {

  const [setNumber, setSetNumber] = useState<number | string>("");

  async function fetchSet() {
    try {
      if (setNumber != "") {
        const result = await invoke<Song[]>('fetch_and_process_songs', { setNumber: setNumber.toString() })
        console.log(result)
        setSongs((prevSongs) => [...prevSongs, ...result]);
      }
    } catch (e) {
      console.error('Error invoking fetch_and_process_songs:', e)
    }
  }

  const handleDelete = (titleToDelete: string) => {
    setSongs((prevSongs) =>
      prevSongs.filter((song) => song.title !== titleToDelete)
    );
  };

  return (
    <div className="justify-center min-w-[350px] bg-gray-100 text-black border-r border-gray-200 min-h-0 flex flex-col">
      <div className="p-5 shrink-0">
        <div className="flex gap-3">
          <Button className="bg-indigo-500 hover:bg-indigo-600 flex-1 flex items-center justify-center gap-2">
            <IconMusic className="w-5 h-5 mr-1" />
            Songs
          </Button>
          <Button className="bg-indigo-500 hover:bg-indigo-600 flex-1 flex items-center justify-center gap-2">
            <IconBook className="w-5 h-5 mr-1" />
            Bible
          </Button>
        </div>
      </div>
      <div className="border-b border-gray-200 pb-5 px-5 shrink-0">
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
            className="bg-black hover:bg-indigo-600"
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
            label="Add from Set"
            placeholder="Set Number"
            leftSection={<IconHash size={16} />}
            value={setNumber} // ✅ controlled value
            onChange={(value) => setSetNumber(value ?? "")} // ✅ update state
          />
          <ActionIcon
            size="lg"
            variant="filled"
            className="bg-black hover:bg-indigo-600"
            onClick={fetchSet}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </div>
      </div>
      <div className="flex-1 min-h-0 p-5 flex flex-col">
        <h2 className="font-bold mb-2">Song Library</h2>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {songs.map((song) => (
            <div className="mb-2">
              <SongCard key={song.title} song={song} onDelete={() => handleDelete(song.title)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}