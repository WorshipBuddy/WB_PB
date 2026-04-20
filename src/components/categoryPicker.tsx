import { SegmentedControl } from '@mantine/core';
import { IconBook, IconMusic } from '@tabler/icons-react';

interface CategoryPickerProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function CategoryPicker({ currentPage, onPageChange }: CategoryPickerProps) {

  return (
    <SegmentedControl
      fullWidth
      value={currentPage}
      onChange={onPageChange}
      data={[
        {
          label: (
            <div
              className={`flex items-center justify-center gap-2 w-full ${
                currentPage === 'songs' ? 'text-white' : 'text-black'
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
                currentPage === 'bible' ? 'text-white' : 'text-black'
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
      radius="sm" // minimal rounding
      classNames={{
        root: 'w-full border border-gray-300', // always visible border
        control: 'flex-1',
        indicator: '', // we'll set color in `styles`
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