import { Image, Center, Button } from "@mantine/core";
import { IconTrash, IconPiano } from "@tabler/icons-react";

export default function ProjectsBar() {

  return (
    <div className="justify-center min-w-[300px] bg-[#191c38] px-4 py-5">
      <div className="flex">
        <Image src="/rocket.png" alt="Rocket" h={40} w={40} />
        <Center>
          <p className="text-xl font-bold text-white ml-3">
            PresenterBuddy
          </p>
        </Center>
      </div>
      <div className="mt-6 mb-4">
        <Center className="flex justify-between">
          <p className="font-bold text-sm">Worship Schedule</p>
          <Button size="compact-xs" className="bg-indigo-500 hover:bg-indigo-600 ml-6">+ New Song</Button>
        </Center>
      </div>
      <div>
        <Center className="flex justify-between mt-3">
          <div className="flex">
            <Center><IconPiano className="text-indigo-400 h-5 w-5 stroke-2 mr-2" /></Center>
            <p className="text-base truncate whitespace-nowrap overflow-y-auto max-w-[200px]">929. Your Miracles</p>
          </div>
          <Center><IconTrash className="text-indigo-400 h-5 w-5 stroke-1 mr-1" /></Center>
        </Center>
      </div>
    </div>
  )
}