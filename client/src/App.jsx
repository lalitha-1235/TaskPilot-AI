import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

function App() {
  return (
    <div className="bg-[#09090B] min-h-screen text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;