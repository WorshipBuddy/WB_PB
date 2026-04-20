import { useEffect, useState } from "react";
import { listen, UnlistenFn, emit } from "@tauri-apps/api/event";
import { Center } from "@mantine/core";

function Projector() {
  const [lines, setLines] = useState([]);
  const [isFaded, setIsFaded] = useState(false);

  useEffect(() => {
    emit('projector:mounted');

    let unlisten: UnlistenFn | null = null;
    let unlistenFade: UnlistenFn | null = null;
    let unlistenEnd: UnlistenFn | null = null;

    listen("projector:update", (event) => {
      setLines((event.payload as any).lines || []);
      setIsFaded(false); // Reset fade when new content is sent
    }).then((fn) => {
      unlisten = fn;
    });

    listen("projector:fade", (event) => {
      setIsFaded((event.payload as any).fade || false);
    }).then((fn) => {
      unlistenFade = fn;
    });

    listen("projector:end", () => {
      setLines([]);
      setIsFaded(false);
    }).then((fn) => {
      unlistenEnd = fn;
    });

    return () => {
      if (unlisten) unlisten();
      if (unlistenFade) unlistenFade();
      if (unlistenEnd) unlistenEnd();
    };
  }, []);

  return (
    <div style={{ padding: 20, height: "100vh" }} className={`flex items-center justify-center text-white transition-all duration-500 ${isFaded ? 'bg-black' : 'bg-black'}`}>
      <Center>
        <p className={`text-white text-[13vh] font-semibold leading-tight whitespace-pre-wrap text-center transition-all duration-500 ${isFaded ? 'opacity-0' : 'opacity-100'}`}>
          {lines.join('\n')}
        </p>
      </Center>
    </div>
  );
}

export default Projector;
