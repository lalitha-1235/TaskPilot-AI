import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-extrabold leading-tight">
            Manage Projects
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Smarter with AI
            </span>
          </h1>

          <p className="text-gray-400 mt-6 text-lg leading-8">
            TaskPilot AI helps teams manage projects, assign tasks,
            track progress, and gain AI-powered insights—all from
            one intelligent workspace.
          </p>

          <div className="mt-10 flex gap-4">
            <Link to="/login" className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-semibold hover:opacity-90 active:scale-[0.98] transition-all outline-none">
              Get Started
            </Link>

            <button className="px-7 py-3 rounded-xl border border-gray-700 hover:border-cyan-400">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="rounded-3xl bg-[#151515] border border-gray-800 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Dashboard Preview</h2>

            <div className="space-y-4">
              <div className="bg-[#202020] rounded-lg h-14"></div>
              <div className="bg-[#202020] rounded-lg h-24"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#202020] rounded-lg h-28"></div>
                <div className="bg-[#202020] rounded-lg h-28"></div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default Hero;