import { IconMusic } from "@tabler/icons-react";
import type { Song } from "../lib/song";
import HoldToDeleteButton from "./holdToDeleteButton";

interface SongCardProps {
  song: Song;
  onDelete: () => void;
  isCurrent: boolean;
}

export default function SongCard({ song, onDelete, isCurrent }: SongCardProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${isCurrent ? "bg-[#b5c4ff50] border-[#0c245e] border-2" : "bg-white border-gray-300"}`}
    >
      <div className={`flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full ${isCurrent ? "bg-[#0c245e]" : "bg-[#0c245e50]"}`}>
        <IconMusic className="w-5 h-5 text-white" stroke={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-black text-xs truncate">{song.title}</p>
        <p className="text-gray-500 text-xs mt-1 truncate">{song.author === "" ? "Traditional" : song.author}</p>
      </div>

      <HoldToDeleteButton
        size={30}
        holdDuration={1000}
        onHoldComplete={onDelete}
      />
    </div>
  );
}
