import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import NotationSwitch from "./NotationSwitch";

const Menu: React.FC = () => (
  <nav className="flex justify-between items-center p-4 border-b border-gray-400 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
    <div className="flex gap-6">
      <Link
        to="/circle"
        className="text-white hover:text-green-400 transition-colors duration-300 font-semibold"
      >
        Circle
      </Link>
      <Link
        to="/harmonica"
        className="text-white hover:text-green-400 transition-colors duration-300 font-semibold"
      >
        Harmonica
      </Link>
    </div>

    {/* Right-side controls (GitHub + NotationSwitch) */}
    <div className="flex items-center gap-4">
      <div className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-3 py-1 rounded shadow">
        <NotationSwitch />
      </div>
      <a
        href="https://github.com/izabala033/NoteBender"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-green-400 transition-colors duration-300"
        title="GitHub Repository"
        aria-label="GitHub Repository"
      >
        <Github className="w-6 h-6" />
      </a>
    </div>
  </nav>
);

export default Menu;
