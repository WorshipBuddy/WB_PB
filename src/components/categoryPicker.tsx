import { SegmentedControl } from '@mantine/core';
import { useState } from 'react';
import { IconBook, IconMusic } from '@tabler/icons-react';

export default function CategoryPicker() {
  const [value, setValue] = useState("songs");

  return (
    <SegmentedControl
      fullWidth
      value={value}
      onChange={setValue}
      data={[
        {
          label: (
            <div
              className={`flex items-center justify-center gap-2 w-full ${
                value === 'songs' ? 'text-white' : 'text-black'
              }`}
            >
              <IconMusic size={16} />
              <span>Songs</span>
            </div>
          ),
          value: 'songs',
        },
        {
          label: (
            <div
              className={`flex items-center justify-center gap-2 w-full ${
                value === 'bible' ? 'text-white' : 'text-black'
              }`}
            >
              <IconBook size={16} />
              <span>Bible</span>
            </div>
          ),
          value: 'bible',
        },
      ]}
      size="md"
      radius="sm"
      classNames={{
        root: 'w-full border border-gray-300',
        control: 'flex-1',
        indicator: '',
      }}
      styles={{
        indicator: {
          backgroundColor: "#0c245e",
        },
        root: {
          padding: 0,
          margin: 0,
        },
        control: {
          padding: 0,
          margin: 0,
        },
      }}
    />
  );
}