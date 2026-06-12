import React, { useEffect, useRef } from "react";
import ViewGL from "./ViewGL";

export default function Scene({
  exploring, gameMode, onReady, onExploreEnd,
  onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause,
}) {
  const canvasRef        = useRef(null);
  const overlayCanvasRef = useRef(null);
  const viewGLRef        = useRef(null);

  // Mount: build ViewGL once and wire window-level listeners
  useEffect(() => {
    viewGLRef.current = new ViewGL(canvasRef.current, overlayCanvasRef.current, onReady);

    const onMouse  = (e) => viewGLRef.current?.onMouseMove(e);
    const onResize = () => viewGLRef.current?.onWindowResize(window.innerWidth, window.innerHeight);
    const onScroll = (e) => viewGLRef.current?.onScroll(e);

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewGLRef.current?.setExploreMode(exploring, onExploreEnd);
  }, [exploring, onExploreEnd]);

  useEffect(() => {
    viewGLRef.current?.setGameMode(
      gameMode, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause
    );
  }, [gameMode, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          height: "100vh",
          width: "100%",
          touchAction: exploring ? "none" : "auto",
        }}
      />
      <canvas
        ref={overlayCanvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 15,
          height: "100vh",
          width: "100%",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
