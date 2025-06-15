import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => (
  <nav className="flex gap-6 p-4 border-b border-gray-400 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
    <Link
      to="/NoteBender/circle"
      className="text-white hover:text-green-400 transition-colors duration-300 font-semibold"
    >
      Circle
    </Link>
    {/* <Link
      to="/harmonica"
      className="text-white hover:text-green-400 transition-colors duration-300 font-semibold"
    >
      Harmonica
    </Link>
    <Link
      to="/settings"
      className="text-white hover:text-green-400 transition-colors duration-300 font-semibold"
    >
      Settings
    </Link> */}
  </nav>
);

export default Menu;
