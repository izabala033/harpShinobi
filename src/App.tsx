import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Menu from "./Menu";
import Circle from "./Circle/Circle";
import Harmonica from "./Harmonica/Harmonica";
import Settings from "./Settings/Settings";
import MusicXML from "./MusicXML/MusicXML";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <div>
          <Menu />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/circle" element={<Circle />} />
            <Route path="/harmonica" element={<Harmonica />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/musicxml" element={<MusicXML />} />
            <Route path="/" element={<Navigate to="/harmonica" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
