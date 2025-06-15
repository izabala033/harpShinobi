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
// import NotationSwitch from "./NotationSwitch";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <div>
          <Menu />
          {/* <NotationSwitch /> */}
        </div>
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/NoteBender/circle" element={<Circle />} />
            <Route path="/NoteBender/harmonica" element={<Harmonica />} />
            <Route path="/NoteBender/settings" element={<Settings />} />
            <Route
              path="/"
              element={<Navigate to="/NoteBender/circle" replace />}
            />
            <Route
              path="/NoteBender"
              element={<Navigate to="/NoteBender/circle" replace />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
