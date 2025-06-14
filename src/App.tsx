import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Menu from "./Menu";
import Circle from "./Circle/Circle";
import Harmonica from "./Harmonica/Harmonica";
import Settings from "./Settings/Settings";

function App() {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/circle" element={<Circle />} />
        <Route path="/harmonica" element={<Harmonica />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/circle" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
