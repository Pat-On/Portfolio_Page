import "./App.scss";
import React, { useState, useEffect } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import { isMobileDevice } from "./utils/isMobileDevice";

function App() {
  const [exploring, setExploring] = useState(false);
  const isMobile = isMobileDevice();

  const toggleExplore = () => {
    const entering = !exploring;
    setExploring(entering);
    if (isMobile) {
      if (entering) {
        const el = document.documentElement;
        (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
      } else {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
        }
      }
    }
  };

  const handleExploreEnd = () => {
    setExploring(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setExploring(false);
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("webkitfullscreenchange", onFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("webkitfullscreenchange", onFSChange);
    };
  }, []);

  return (
    <div className="App">
      <Scene exploring={exploring} onExploreEnd={handleExploreEnd} />
      <ExploreButton
        exploring={exploring}
        onToggle={toggleExplore}
        isMobile={isMobile}
      />
      {exploring && <MobileExploreOverlay key={exploring} />}
      {!exploring && <Layout />}
    </div>
  );
}

export default App;
