import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full bg-[#09090B] border-b border-gray-800 text-white px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent outline-none">
        TaskPilot AI
      </Link>

      <div className="flex gap-6">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <a href="#" className="hover:text-cyan-400 transition-colors">Features</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
      </div>

      <Link to="/login" className="bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2 rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all outline-none">
        Get Started
      </Link>
    </nav>
  );
}

export default Navbar;