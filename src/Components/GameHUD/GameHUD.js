import React from "react";
import classes from "./GameHUD.module.scss";

const GameHUD = ({ health, score, wave, active, gameOverScreen, hitFlash, killPopup, onRestart }) => {
  if (!active && !gameOverScreen.active) return null;

  return (
    <>
      {active && (
        <div className={classes.hud}>
          {hitFlash && <div className={classes.hitVignette} />}

          <div className={classes.crosshair}>
            <div className={classes.crosshair__h} />
            <div className={classes.crosshair__v} />
            <div className={classes.crosshair__dot} />
          </div>

          {killPopup && (
            <div key={killPopup.id} className={classes.killPopup}>
              +{killPopup.points} PTS
            </div>
          )}

          <div className={classes.scoreDisplay}>
            <span className={classes.label}>SCORE</span>
            <span className={classes.scoreValue}>{score}</span>
          </div>

          <div className={classes.waveDisplay}>
            <span className={classes.label}>WAVE</span>
            <span className={classes.waveValue}>{wave}</span>
          </div>

          <div className={classes.healthContainer}>
            <span className={classes.label}>HULL INTEGRITY</span>
            <div className={classes.healthTrack}>
              <div
                className={classes.healthFill}
                style={{ width: `${Math.max(0, health * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {gameOverScreen.active && (
        <div className={classes.gameOverOverlay}>
          <h1 className={classes.gameOverTitle}>SYSTEM FAILURE</h1>
          <p className={classes.gameOverScore}>FINAL SCORE: {gameOverScreen.score}</p>
          <button className={classes.restartBtn} onClick={onRestart}>
            PLAY AGAIN
          </button>
        </div>
      )}
    </>
  );
};

export default GameHUD;
