import { useEffect, useState, useRef } from "react";
import { listen, UnlistenFn, emit } from "@tauri-apps/api/event";

function Projector() {
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(100); // in px

  useEffect(() => {
    emit("projector:mounted");

    let unlisten: UnlistenFn | null = null;

    listen("projector:update", (event) => {
      const newLines = (event.payload as any).lines || [];
      setLines(newLines);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !textRef.current || lines.length === 0) return;

    const container = containerRef.current;
    const text = textRef.current;

    let size = 100;
    const MIN_SIZE = 10;

    text.style.fontSize = `${size}px`;

    const fits = () =>
      text.scrollHeight <= container.clientHeight &&
      text.scrollWidth <= container.clientWidth;

    const shrinkUntilFits = () => {
      while (!fits() && size > MIN_SIZE) {
        size -= 1;
        text.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    };

    requestAnimationFrame(shrinkUntilFits);
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className="bg-black text-white flex items-center justify-center h-screen w-screen overflow-hidden"
    >
      <div
        ref={textRef}
        className="whitespace-pre-wrap font-semibold text-center leading-tight px-10"
        style={{ fontSize: `${fontSize}px` }}
      >
        {lines.join("\n")}
      </div>
    </div>
  );
}

export default Projector;