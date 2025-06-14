import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Circle from "./Circle";
import Harmonica from "./Harmonica";
import Settings from "./Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/circle" element={<Circle />} />
        <Route path="/harmonica" element={<Harmonica />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/harmonica" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
