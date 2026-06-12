import "./App.scss";
import React, { useState, useEffect, useReducer } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import GameHUD from "./Components/GameHUD/GameHUD";
import { isMobileDevice } from "./utils/isMobileDevice";
import { gameReducer, initialGameState } from "./state/gameReducer";

function init(base) {
  const stored = parseInt(localStorage.getItem("highScore") || "0", 10);
  return { ...base, highScore: stored };
}

function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialGameState, init);
  const isMobile = isMobileDevice();

  const {
    exploring, gameMode, hudData, gameOverScreen, hitFlash, killPopup,
    waveComplete, paused, highScore,
  } = state;

  useEffect(() => {
    localStorage.setItem("highScore", String(highScore));
  }, [highScore]);

  useEffect(() => {
    if (!hitFlash) return;
    const id = setTimeout(() => dispatch({ type: "DISMISS_HIT_FLASH" }), 350);
    return () => clearTimeout(id);
  }, [hitFlash]);

  useEffect(() => {
    if (!killPopup) return;
    const id = setTimeout(() => dispatch({ type: "DISMISS_KILL_POPUP" }), 1400);
    return () => clearTimeout(id);
  }, [killPopup]);

  useEffect(() => {
    if (!waveComplete.active) return;
    const id = setTimeout(() => dispatch({ type: "DISMISS_WAVE_COMPLETE" }), 2000);
    return () => clearTimeout(id);
  }, [waveComplete.active]);

  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        dispatch({ type: "EXIT_GAME" });
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("webkitfullscreenchange", onFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("webkitfullscreenchange", onFSChange);
    };
  }, []);

  const toggleExplore = () => {
    const entering = !exploring;
    dispatch({ type: "TOGGLE_EXPLORE" });
    if (isMobile) {
      if (entering) {
        const el = document.documentElement;
        (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
      } else if (document.fullscreenElement || document.webkitFullscreenElement) {
        document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
      }
    }
  };

  const handleGameModeToggle = () => {
    if (gameMode) {
      dispatch({ type: "EXIT_GAME" });
    } else {
      dispatch({ type: "ENTER_GAME_MODE" });
    }
  };

  const handleExploreEnd = () => {
    dispatch({ type: "EXIT_GAME" });
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  };

  const handleGameOver = (finalScore, isVictory = false) => {
    dispatch({ type: "GAME_OVER", score: finalScore, victory: isVictory });
  };

  const handleRestart = () => dispatch({ type: "RESTART" });

  const handleExitFromGameOver = () => dispatch({ type: "DISMISS_GAME_OVER" });

  const handleHudUpdate = (health, score, wave) =>
    dispatch({ type: "HUD_UPDATE", health, score, wave });

  const handlePlayerHit = () => dispatch({ type: "PLAYER_HIT" });

  const handleWaveComplete = (wave) => dispatch({ type: "WAVE_COMPLETE", wave });

  const handlePause = (isPaused) => dispatch({ type: "PAUSE", isPaused });

  const handleKill = (points) =>
    dispatch({ type: "KILL", points, now: Date.now() });

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
        onExitGameMode={handleExitFromGameOver}
      />
      {exploring && !gameMode && <MobileExploreOverlay key={exploring} />}
      {!exploring && !gameMode && <Layout />}
    </div>
  );
}

export default App;
