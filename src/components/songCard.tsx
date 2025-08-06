// SongCard.tsx
import type { Song } from "../lib/song";
import { IconPencil, IconPlus } from "@tabler/icons-react";

interface SongCardProps {
  song: Song;
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  isCurrent: boolean;
  onSelect?: () => void;
}

export default function SongCard({
  song,
  isCurrent,
  onEdit,
  onAdd,
  onSelect,
}: SongCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer overflow-hidden 
        ${isCurrent ? "bg-[#b5c4ff50] border-[#0c245e] border-2" : "bg-white border-gray-300"}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-black text-xs truncate">
          {song.songNumber}. {song.title}
        </p>
        <p className="text-gray-500 text-xs mt-1 truncate">
          {song.author === "" ? "" : song.author}
        </p>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          aria-label="Edit song"
          className="opacity-100 group-hover:opacity-100 transition flex items-center justify-center w-7 h-7 rounded-md bg-[#0c245e] text-white hover:bg-[#09193b]"
        >
          <IconPencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
          aria-label="Add song"
          className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0c245e] text-white hover:bg-[#09193b]"
        >
          <IconPlus size={14} />
        </button>
      </div>
    </div>
  );
}