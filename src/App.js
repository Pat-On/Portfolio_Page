import "./App.scss";
import React, { useState } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import { isMobileDevice } from "./utils/isMobileDevice";

function App() {
  const [exploring, setExploring] = useState(false);
  const isMobile = isMobileDevice();

  return (
    <div className="App">
      <Scene exploring={exploring} onExploreEnd={() => setExploring(false)} />
      <ExploreButton
        exploring={exploring}
        onToggle={() => setExploring((e) => !e)}
        isMobile={isMobile}
      />
      {exploring && <MobileExploreOverlay key={exploring} />}
      {!exploring && <Layout />}
    </div>
  );
}

export default App;
