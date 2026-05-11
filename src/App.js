import "./App.scss";
import React, { useState, useEffect, useRef } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import GameHUD from "./Components/GameHUD/GameHUD";
import { isMobileDevice } from "./utils/isMobileDevice";

function App() {
  const [exploring, setExploring]       = useState(false);
  const [gameMode, setGameMode]         = useState(false);
  const [gameOverScreen, setGameOverScreen] = useState({ active: false, score: 0 });
  const [hudData, setHudData]           = useState({ health: 1.0, score: 0, wave: 1 });
  const [hitFlash, setHitFlash]         = useState(false);
  const [killPopup, setKillPopup]       = useState(null);
  const isMobile = isMobileDevice();

  const hitFlashTimerRef  = useRef(null);
  const killPopupTimerRef = useRef(null);
  const gameOverTimerRef  = useRef(null);

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

  const handleGameModeToggle = () => {
    const entering = !gameMode;
    setGameMode(entering);
    setExploring(entering);
    if (entering) {
      setHudData({ health: 1.0, score: 0, wave: 1 });
      setGameOverScreen({ active: false, score: 0 });
    }
  };

  const handleExploreEnd = () => {
    setExploring(false);
    setGameMode(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  };

  const handleGameOver = (finalScore) => {
    setExploring(false);
    setGameMode(false);
    setGameOverScreen({ active: true, score: finalScore });
    clearTimeout(gameOverTimerRef.current);
  };

  const handleRestart = () => {
    clearTimeout(gameOverTimerRef.current);
    setGameOverScreen({ active: false, score: 0 });
    setHudData({ health: 1.0, score: 0, wave: 1 });
    setHitFlash(false);
    setKillPopup(null);
    setGameMode(true);
    setExploring(true);
  };

  const handleHudUpdate = (health, score, wave) => {
    setHudData({ health, score, wave: wave || 1 });
  };

  const handlePlayerHit = () => {
    setHitFlash(true);
    clearTimeout(hitFlashTimerRef.current);
    hitFlashTimerRef.current = setTimeout(() => setHitFlash(false), 350);
  };

  const handleKill = (points) => {
    setKillPopup({ points, id: Date.now() });
    clearTimeout(killPopupTimerRef.current);
    killPopupTimerRef.current = setTimeout(() => setKillPopup(null), 1400);
  };

  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setExploring(false);
        setGameMode(false);
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
      <Scene
        exploring={exploring}
        gameMode={gameMode}
        onExploreEnd={handleExploreEnd}
        onGameOver={handleGameOver}
        onHudUpdate={handleHudUpdate}
        onPlayerHit={handlePlayerHit}
        onKill={handleKill}
      />
      <ExploreButton
        exploring={exploring}
        gameMode={gameMode}
        onToggle={toggleExplore}
        onGameModeToggle={handleGameModeToggle}
        isMobile={isMobile}
      />
      <GameHUD
        health={hudData.health}
        score={hudData.score}
        wave={hudData.wave}
        active={gameMode}
        gameOverScreen={gameOverScreen}
        hitFlash={hitFlash}
        killPopup={killPopup}
        onRestart={handleRestart}
      />
      {exploring && !gameMode && <MobileExploreOverlay key={exploring} />}
      {!exploring && !gameMode && <Layout />}
    </div>
  );
}

export default App;
