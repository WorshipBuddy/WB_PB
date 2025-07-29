import { useState, useRef } from "react";
import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface HoldToDeleteButtonProps {
  onHoldComplete: () => void;
  holdDuration?: number; // milliseconds
  size?: number; // button size
}

export default function HoldToDeleteButton({
  onHoldComplete,
  holdDuration = 1000,
  size = 40,
}: HoldToDeleteButtonProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / holdDuration, 1));
    }, 16);

    timeoutRef.current = setTimeout(() => {
      stopHold();
      onHoldComplete();
    }, holdDuration);
  };

  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    setProgress(0);
  };

  return (
    <ActionIcon
      variant="light"
      color="navy"
      radius="xl"
      size={size}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      style={{ position: "relative" }}
      aria-label="Hold to delete"
    >
      <IconTrash stroke={2} size={size * 0.5} />

      {/* Progress overlay */}
      {progress > 0 && (
        <svg
          className="absolute top-0 left-0"
          width={size}
          height={size}
          viewBox="0 0 36 36"
        >
          <circle
            stroke="navy"
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
            strokeDasharray={100}
            strokeDashoffset={100 - progress * 100}
            transform="rotate(-90 18 18)"
          />
        </svg>
      )}
    </ActionIcon>
  );
}
