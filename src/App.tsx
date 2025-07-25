import "./App.css";
import TopNavBar from "./components/topNavBar";
import ProjectsBar from "./components/projectsBar";
import { useState } from "react";
import { Song } from "./lib/song";

function App() {

  const [songs, setSongs] = useState<Song[]>([]);

  return (
    <div className="h-screen flex flex-col w-full">
      <TopNavBar />
      <div className="flex flex-row flex-1 min-h-0">
        <ProjectsBar songs={songs} setSongs={setSongs}></ProjectsBar>
        <div className="px-10 bg-white text-black h-full flex flex-col w-full overflow-hidden min-h-0">
          <div className="flex flex-1">
            <div className="flex-1 flex flex-col border-r border-gray-200 mr-10 py-7">
              <h1 className="text-2xl font-bold text-black mb-1">Song Title</h1>
              <p className="text-sm text-gray-500 mb-4">Author Name</p>

              <div className="space-y-4 overflow-y-auto">
                <div>
                  <h2 className="text-indigo-600 font-bold uppercase mb-1">Verse 1</h2>
                  <p>Line 1 of verse 1</p>
                  <p>Line 2 of verse 1</p>
                  <p>Line 3 of verse 1</p>
                </div>
                <div>
                  <h2 className="text-indigo-600 font-bold uppercase mb-1">Verse 2</h2>
                  <p>Line 1 of verse 2</p>
                  <p>Line 2 of verse 2</p>
                  <p>Line 3 of verse 2</p>
                </div>
                <div>
                  <h2 className="text-indigo-600 font-bold uppercase mb-1">Chorus</h2>
                  <p>Line 1 of chorus</p>
                  <p>Line 2 of chorus</p>
                  <p>Line 3 of chorus</p>
                </div>
              </div>
            </div>

            {/* Right side: Presentation Preview */}
            <div className="flex-1 flex flex-col py-7">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Presentation Preview</h2>
                <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                  Present
                </button>
              </div>

              {/* Slide preview */}
              <div className="flex-1 bg-black rounded-lg flex items-center justify-center">
                <p className="text-white text-3xl font-semibold text-center px-4 leading-relaxed">
                  Line 1 of the current verse<br />
                  Line 2 of the current verse<br />
                  Line 3 of the current verse
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
