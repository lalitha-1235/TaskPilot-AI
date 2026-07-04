function Navbar() {
  return (
    <nav className="w-full bg-[#09090B] border-b border-gray-800 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
        TaskPilot AI
      </h1>

      <div className="flex gap-6">
        <a href="#">Home</a>
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <a href="#">About</a>
      </div>

      <button className="bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2 rounded-lg">
        Get Started
      </button>
    </nav>
  );
}

export default Navbar;