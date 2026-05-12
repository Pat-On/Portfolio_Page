import "./App.scss";
import React, { useState, useEffect, useRef } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import GameHUD from "./Components/GameHUD/GameHUD";
import { isMobileDevice } from "./utils/isMobileDevice";

function App() {
  const [sceneReady, setSceneReady]     = useState(false);
  const [exploring, setExploring]       = useState(false);
  const [gameMode, setGameMode]         = useState(false);
  const [gameOverScreen, setGameOverScreen] = useState({ active: false, score: 0, isNew: false, victory: false });
  const [hudData, setHudData]           = useState({ health: 1.0, score: 0, wave: 1 });
  const [hitFlash, setHitFlash]         = useState(false);
  const [killPopup, setKillPopup]       = useState(null);
  const [waveComplete, setWaveComplete] = useState({ active: false, wave: 0 });
  const [paused, setPaused]             = useState(false);
  const [highScore, setHighScore]       = useState(() => parseInt(localStorage.getItem('highScore') || '0', 10));
  const isMobile = isMobileDevice();

  const hitFlashTimerRef     = useRef(null);
  const killPopupTimerRef    = useRef(null);
  const gameOverTimerRef     = useRef(null);
  const waveCompleteTimerRef = useRef(null);
  const killIdRef            = useRef(0);
  const killStreakRef        = useRef(0);
  const lastKillTimeRef      = useRef(0);

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
      setGameOverScreen({ active: false, score: 0, isNew: false });
      setWaveComplete({ active: false, wave: 0 });
      setPaused(false);
      killStreakRef.current = 0;
    }
  };

  const handleExploreEnd = () => {
    setExploring(false);
    setGameMode(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  };

  const handleGameOver = (finalScore, isVictory = false) => {
    const isNew = finalScore > highScore && finalScore > 0;
    if (isNew) {
      setHighScore(finalScore);
      localStorage.setItem('highScore', String(finalScore));
    }
    setExploring(false);
    setGameMode(false);
    setGameOverScreen({ active: true, score: finalScore, isNew, victory: isVictory });
    setWaveComplete({ active: false, wave: 0 });
    setPaused(false);
    clearTimeout(gameOverTimerRef.current);
    clearTimeout(waveCompleteTimerRef.current);
  };

  const handleRestart = () => {
    clearTimeout(gameOverTimerRef.current);
    clearTimeout(waveCompleteTimerRef.current);
    setGameOverScreen({ active: false, score: 0, isNew: false });
    setHudData({ health: 1.0, score: 0, wave: 1 });
    setHitFlash(false);
    setKillPopup(null);
    setWaveComplete({ active: false, wave: 0 });
    setPaused(false);
    killStreakRef.current = 0;
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

  const handleWaveComplete = (wave) => {
    setWaveComplete({ active: true, wave });
    clearTimeout(waveCompleteTimerRef.current);
    waveCompleteTimerRef.current = setTimeout(() => setWaveComplete({ active: false, wave: 0 }), 2000);
  };

  const handlePause = (isPaused) => {
    setPaused(isPaused);
  };

  const handleKill = (points) => {
    const now = Date.now();
    if (now - lastKillTimeRef.current < 3000) {
      killStreakRef.current++;
    } else {
      killStreakRef.current = 1;
    }
    lastKillTimeRef.current = now;
    setKillPopup({ points, id: ++killIdRef.current, streak: killStreakRef.current });
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
      {!sceneReady && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-ring" />
            <p className="loading-text">Loading Solar System&hellip;</p>
          </div>
        </div>
      )}
      <Scene
        exploring={exploring}
        gameMode={gameMode}
        onExploreEnd={handleExploreEnd}
        onGameOver={handleGameOver}
        onHudUpdate={handleHudUpdate}
        onPlayerHit={handlePlayerHit}
        onKill={handleKill}
        onWaveComplete={handleWaveComplete}
        onPause={handlePause}
        onReady={() => setSceneReady(true)}
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
        waveComplete={waveComplete}
        paused={paused}
        highScore={highScore}
        onRestart={handleRestart}
      />
      {exploring && !gameMode && <MobileExploreOverlay key={exploring} />}
      {!exploring && !gameMode && <Layout />}
    </div>
  );
}

export default App;
