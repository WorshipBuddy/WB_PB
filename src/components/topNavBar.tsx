'use client';

import { ActionIcon, Group, Image } from "@mantine/core";
import { IconSettings, IconInfoCircle, IconUser } from "@tabler/icons-react";


export default function TopNavBar() {

  return (
    <div className="sticky top-0 z-50">
      <div className="flex justify-between text-black px-2 py-1 border-b border-gray-200 border-b-1 bg-[#0c245e]">
        <div className="flex items-center">
          <a href="/">
            <div
              className="flex items-center ml-3 mt-2 mb-2"
              onClick={() => {window.location.href = '/';}}
            >
              <Image src="presenterbuddy-white-2.png" w={35} ></Image>
              <p className="text-2xl font-bold text-white ml-4">Presenter Buddy</p>
              <span className="ml-3 inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-full border-white border-2 bg-transparent text-white">PRO</span>
            </div>
          </a>
        </div>
        <Group justify="center" gap={10} className="mr-3">
          <ActionIcon variant="outline" className="text-white hover:text-[#b5c4ff] hover:border-[#b5c4ff] border-white">
            <IconSettings style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
          <a href="/docs">
            <ActionIcon variant="outline" className="text-white hover:text-[#b5c4ff] hover:border-[#b5c4ff] border-white">
              <IconInfoCircle style={{ width: "70%", height: "70%" }} stroke={2} />
            </ActionIcon>
          </a>
          <ActionIcon variant="filled" className="text-black bg-[#b5c4ff] hover:bg-[#b5c4ff] hover:text-black border-none">
            <IconUser
              style={{ width: "70%", height: "70%" }}
              stroke={2}
            />
          </ActionIcon>
        </Group>
      </div>
    </div>
  )

}