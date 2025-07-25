import { useEffect, useState } from "react";
import { listen, UnlistenFn, emit } from "@tauri-apps/api/event";
import { Center } from "@mantine/core";

function Projector() {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    emit('projector:mounted');

    let unlisten: UnlistenFn | null = null;

    listen("projector:update", (event) => {
      setLines((event.payload as any).lines || []);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <div style={{ padding: 20, height: "100vh" }} className="flex items-center justify-center bg-black text-white">
      <Center>
        <p className="text-white text-[13vh] font-semibold leading-tight whitespace-pre-wrap text-center">
          {lines.join('\n')}
        </p>
      </Center>
    </div>
  );
}

export default Projector;
