import React, { useEffect, useRef } from "react";
import ViewGL from "./ViewGL";
import classes from "./Scene.module.scss";

export default function Scene({
  exploring, gameMode, onReady, onExploreEnd,
  onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause, onMuteChange,
  apiRef,
}) {
  const canvasRef        = useRef(null);
  const overlayCanvasRef = useRef(null);
  const viewGLRef        = useRef(null);

  // Mount: build ViewGL once and wire window-level listeners
  useEffect(() => {
    viewGLRef.current = new ViewGL(canvasRef.current, overlayCanvasRef.current, onReady);
    if (apiRef) apiRef.current = viewGLRef.current;

    const onMouse  = (e) => viewGLRef.current?.onMouseMove(e);
    // Follow the canvas's own CSS box: it changes with the window and when a
    // mode switches between the large and the visible viewport height
    const canvas = canvasRef.current;
    const onResize = () =>
      viewGLRef.current?.onWindowResize(canvas.clientWidth, canvas.clientHeight);
    const observer = window.ResizeObserver ? new window.ResizeObserver(onResize) : null;
    if (observer) observer.observe(canvas);
    const onScroll = (e) => viewGLRef.current?.onScroll(e);

    window.addEventListener("mousemove", onMouse);
    if (!observer) window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll);
      if (apiRef) apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewGLRef.current?.setExploreMode(exploring, onExploreEnd);
  }, [exploring, onExploreEnd]);

  useEffect(() => {
    viewGLRef.current?.setGameMode(
      gameMode, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause, onMuteChange
    );
  }, [gameMode, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause, onMuteChange]);

  const canvasClass = `${classes.canvas} ${exploring || gameMode ? classes.canvas_inMode : ""}`;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={canvasClass}
        style={{ zIndex: 10, touchAction: exploring ? "none" : "auto" }}
      />
      <canvas
        ref={overlayCanvasRef}
        aria-hidden="true"
        className={canvasClass}
        style={{ zIndex: 15, pointerEvents: "none" }}
      />
    </>
  );
}
