import "./App.scss";
import React, { useState, useEffect, useLayoutEffect, useReducer, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import Layout from "./HOC/Layout";
import ErrorBoundary from "./UI/ErrorBoundary/ErrorBoundary";
import ExploreButton from "./Components/ExploreButton/ExploreButton";
import MobileExploreOverlay from "./Components/MobileExploreOverlay/MobileExploreOverlay";
import GameHUD from "./Components/GameHUD/GameHUD";
import GameBriefing from "./Components/GameBriefing/GameBriefing";
import { isMobileDevice } from "./utils/isMobileDevice";
import { gameReducer, initialGameState } from "./state/gameReducer";
import { PortfolioModeProvider } from "./state/PortfolioModeContext";

// Code-split the Three.js scene — it pulls in the whole three.js bundle
const Scene = lazy(() => import("./TreeJSComponents/Scene"));

function init(base) {
  const stored = parseInt(localStorage.getItem("highScore") || "0", 10);
  return { ...base, highScore: stored };
}

function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialGameState, init);
  const sceneApiRef = useRef(null);
  const isMobile = isMobileDevice();

  // The page unmounts while Explore or Game Mode runs. Before a mode starts we
  // note the scroll position and the projects tour, and put the visitor back
  // there when the page returns.
  const tourRef = useRef({ project: "0", step: 0 });
  const returnPointRef = useRef(null);
  const saveReturnPoint = useCallback(() => {
    returnPointRef.current = { scrollY: window.scrollY, ...tourRef.current };
  }, []);

  const {
    exploring, gameMode, briefing, hudData, gameOverScreen, hitFlash, killPopup,
    waveComplete, paused, muted, autoFire, highScore,
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

  const toggleExplore = useCallback(() => {
    const entering = !exploring;
    if (entering) saveReturnPoint();
    dispatch({ type: "TOGGLE_EXPLORE" });
    if (isMobile) {
      if (entering) {
        const el = document.documentElement;
        (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
      } else if (document.fullscreenElement || document.webkitFullscreenElement) {
        document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
      }
    }
  }, [exploring, isMobile, saveReturnPoint]);

  const handleGameModeToggle = useCallback(() => {
    if (gameMode) {
      dispatch({ type: "EXIT_GAME" });
    } else {
      saveReturnPoint();
      dispatch({ type: "ENTER_GAME_MODE" });
    }
  }, [gameMode, saveReturnPoint]);

  // The START click supplies the user activation for fullscreen / pointer lock
  const handleStartGame = useCallback(() => {
    if (isMobile) {
      const el = document.documentElement;
      (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {});
    }
    dispatch({ type: "START_GAME" });
  }, [isMobile]);

  const handleBriefingCancel = useCallback(() => dispatch({ type: "EXIT_GAME" }), []);

  const handleExploreEnd = useCallback(() => {
    dispatch({ type: "EXIT_GAME" });
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    }
  }, []);

  const handleGameOver = useCallback((finalScore, isVictory = false) => {
    dispatch({ type: "GAME_OVER", score: finalScore, victory: isVictory });
  }, []);

  const handleRestart = useCallback(() => {
    saveReturnPoint();
    dispatch({ type: "RESTART" });
  }, [saveReturnPoint]);

  const handleExitFromGameOver = useCallback(() => dispatch({ type: "DISMISS_GAME_OVER" }), []);

  const handleHudUpdate = useCallback((health, score, wave) =>
    dispatch({ type: "HUD_UPDATE", health, score, wave }), []);

  const handlePlayerHit = useCallback(() => dispatch({ type: "PLAYER_HIT" }), []);

  const handleWaveComplete = useCallback((wave) => dispatch({ type: "WAVE_COMPLETE", wave }), []);

  const handlePause = useCallback((isPaused) => dispatch({ type: "PAUSE", isPaused }), []);

  const handleKill = useCallback((points) =>
    dispatch({ type: "KILL", points, now: Date.now() }), []);

  const handleMuteChange = useCallback((isMuted) =>
    dispatch({ type: "SET_MUTED", muted: isMuted }), []);

  const handleAutoFireToggle = useCallback(() => dispatch({ type: "TOGGLE_AUTOFIRE" }), []);

  // Compile the game's shaders while the visitor reads the briefing, so
  // pressing start does not stall on first draw
  useEffect(() => {
    if (briefing) sceneApiRef.current?.prepareGame();
  }, [briefing]);

  // Keep the engine's auto-fire flag in sync with UI state
  useEffect(() => {
    sceneApiRef.current?.setAutoFire(autoFire);
  }, [autoFire, gameMode]);

  const handleFireStart   = useCallback(() => sceneApiRef.current?.setFiring(true), []);
  const handleFireEnd     = useCallback(() => sceneApiRef.current?.setFiring(false), []);
  const handleBoostStart  = useCallback(() => sceneApiRef.current?.setBoosting(true), []);
  const handleBoostEnd    = useCallback(() => sceneApiRef.current?.setBoosting(false), []);
  const handlePauseToggle = useCallback(() => sceneApiRef.current?.togglePause(), []);
  const handleMuteToggle  = useCallback(() => sceneApiRef.current?.toggleMute(), []);

  // What the page itself can ask for: the tour's try-it buttons and the hero tip.
  const portfolioMode = useMemo(() => ({
    isMobile,
    startExplore: () => { if (!exploring) toggleExplore(); },
    openGame: () => { if (!gameMode) handleGameModeToggle(); },
    getReturnPoint: () => returnPointRef.current,
    rememberTour: (project, step) => { tourRef.current = { project, step }; },
  }), [isMobile, exploring, gameMode, toggleExplore, handleGameModeToggle]);

  const pageShown = !exploring && !gameMode;
  useLayoutEffect(() => {
    const point = returnPointRef.current;
    if (!pageShown || !point) return;
    // One frame later the remounted page has its full height to scroll within.
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: point.scrollY, behavior: "instant" });
      returnPointRef.current = null;
    });
    return () => cancelAnimationFrame(id);
  }, [pageShown]);

  return (
    <div className="App">
      {!exploring && !gameMode && (
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      )}
      {!sceneReady && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-ring" />
            <p className="loading-text">Loading Solar System&hellip;</p>
          </div>
        </div>
      )}
      {/* If WebGL fails, drop the scene but unblock the loading screen so the portfolio still renders */}
      <ErrorBoundary onError={() => setSceneReady(true)}>
        <Suspense fallback={null}>
          <Scene
            exploring={exploring}
            gameMode={gameMode}
            apiRef={sceneApiRef}
            onExploreEnd={handleExploreEnd}
            onGameOver={handleGameOver}
            onHudUpdate={handleHudUpdate}
            onPlayerHit={handlePlayerHit}
            onKill={handleKill}
            onWaveComplete={handleWaveComplete}
            onPause={handlePause}
            onMuteChange={handleMuteChange}
            onReady={() => setSceneReady(true)}
          />
        </Suspense>
      </ErrorBoundary>
      <ExploreButton
        exploring={exploring}
        gameMode={gameMode}
        onToggle={toggleExplore}
        onGameModeToggle={handleGameModeToggle}
        isMobile={isMobile}
      />
      <GameBriefing
        active={briefing}
        isMobile={isMobile}
        autoFire={autoFire}
        onAutoFireToggle={handleAutoFireToggle}
        onStart={handleStartGame}
        onCancel={handleBriefingCancel}
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
        muted={muted}
        autoFire={autoFire}
        isMobile={isMobile}
        highScore={highScore}
        onAutoFireToggle={handleAutoFireToggle}
        onRestart={handleRestart}
        onExitGameMode={handleExitFromGameOver}
        onFireStart={handleFireStart}
        onFireEnd={handleFireEnd}
        onBoostStart={handleBoostStart}
        onBoostEnd={handleBoostEnd}
        onPauseToggle={handlePauseToggle}
        onMuteToggle={handleMuteToggle}
      />
      {exploring && !gameMode && <MobileExploreOverlay key={exploring} />}
      {!exploring && !gameMode && (
        <PortfolioModeProvider value={portfolioMode}>
          <Layout />
        </PortfolioModeProvider>
      )}
    </div>
  );
}

export default App;
