'use client';

import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";


interface SettingsProps {
  setPage: React.Dispatch<React.SetStateAction<string>>;
}

export default function SettingsView({ setPage }: SettingsProps) {

  const [curSection, setCurSection] = useState<string>("display");

  return (
    <div className="py-7 pr-5 pl-8 bg-white text-black h-full flex flex-col w-full min-h-0">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <Button
          size="sm"
          className="bg-[#0c245e] text-white px-4 py-2 rounded hover:bg-[#0c245e] hover:text-white border-none flex items-center gap-2 font-bold"
          onClick={() => setPage("songs")}
        >
          <IconArrowLeft size={18} className="mr-2" />
          Back
        </Button>
      </div>
      <p className="text-gray-600 text-opacity-80 mt-1">Manage your presentation settings and preferences</p>
      <div className="mt-5 flex">
        <Button
          size="compact-md"
          className={`text-sm px-4 py-1 rounded-full border-none ${curSection == "display" ? "bg-[#0c245e] text-white hover:bg-[#0c245e] font-bold" : "bg-gray-300 text-black hover:bg-gray-300 hover:text-black"}`}
          onClick={() => setCurSection("display")}
        >
          Display
        </Button>
        <Button
          size="compact-md"
          className={`ml-2 text-sm px-4 py-1 rounded-full border-none ${curSection == "actions" ? "bg-[#0c245e] text-white hover:bg-[#0c245e] font-bold" : "bg-gray-300 text-black hover:bg-gray-300 hover:text-black"}`}
          onClick={() => setCurSection("actions")}
        >
          Actions
        </Button>
      </div>
    </div>
  )
}