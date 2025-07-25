'use client';

import { ActionIcon, Group } from "@mantine/core";
import { IconSettings, IconFlag3, IconInfoCircle, IconMusic } from "@tabler/icons-react";


export default function TopNavBar() {

  return (
    <div className="sticky top-0 z-50">
      <div className="flex justify-between bg-white text-black px-2 py-1 border-b border-gray-200 border-b-1">
        <div className="flex items-center">
          <a href="/">
            <div
              className="flex items-center ml-3 mt-2 mb-2"
              onClick={() => {window.location.href = '/';}}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black">
                <IconMusic className="w-6 h-6 text-white" stroke={2} />
              </div>
              <p className="text-2xl font-bold text-black ml-4">Presenter Buddy</p>
              <span className="ml-3 inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-full border-black border-2 bg-white text-black">PRO</span>
            </div>
          </a>
        </div>
        <Group justify="center" gap={10} className="mr-3">
          <ActionIcon variant="filled" className="bg-indigo-500 hover:bg-indigo-600">
            <IconSettings style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
          <ActionIcon variant="filled" className="bg-indigo-500 hover:bg-indigo-600">
            <IconFlag3
              style={{ width: "70%", height: "70%" }}
              stroke={2}
            />
          </ActionIcon>
          <a href="/docs">
            <ActionIcon variant="filled" className="bg-indigo-500 hover:bg-indigo-600">
              <IconInfoCircle style={{ width: "70%", height: "70%" }} stroke={2} />
            </ActionIcon>
          </a>
        </Group>
      </div>
    </div>
  )

}