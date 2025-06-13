import "./App.css";
import ProjectsBar from "./components/projectsBar";

function App() {

  return (
    <div className="h-screen bg-[#13152a]">
      <div className="flex flex-row h-full">
        <ProjectsBar />
        <div className="flex flex-col flex-1 min-h-0 p-10 text-white w-full h-full">
          <div className="shrink-0">
            <h1 className="text-5xl font-black">929. Your Miracles</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
