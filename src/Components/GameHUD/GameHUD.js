import React from "react";
import classes from "./GameHUD.module.scss";

const GameHUD = ({ health, score, wave, active, gameOverScreen, hitFlash, killPopup, waveComplete, paused, highScore, onRestart, onExitGameMode }) => {
  if (!active && !gameOverScreen.active) return null;

  const healthColor = health > 0.5 ? '#ffc947' : health > 0.25 ? '#ff8800' : '#ff2200';

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
              {killPopup.streak >= 3 && (
                <div className={classes.streakLine}>{killPopup.streak}× KILL STREAK!</div>
              )}
            </div>
          )}

          {waveComplete && waveComplete.active && (
            <div key={waveComplete.wave} className={classes.waveBanner}>
              WAVE {waveComplete.wave} CLEARED
            </div>
          )}

          {paused && (
            <div className={classes.pauseOverlay}>
              <p className={classes.pauseText}>PAUSED</p>
              <p className={classes.pauseHint}>P — RESUME</p>
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
                style={{ width: `${Math.max(0, health * 100)}%`, background: healthColor }}
              />
            </div>
          </div>
        </div>
      )}

      {gameOverScreen.active && (
        <div className={classes.gameOverOverlay}>
          {gameOverScreen.victory
            ? <h1 className={classes.victoryTitle}>MISSION COMPLETE</h1>
            : <h1 className={classes.gameOverTitle}>SYSTEM FAILURE</h1>
          }
          {gameOverScreen.isNew && <p className={classes.newRecord}>NEW RECORD!</p>}
          <p className={classes.gameOverScore}>FINAL SCORE: {gameOverScreen.score}</p>
          <p className={classes.highScoreLine}>HIGH SCORE: {highScore}</p>
          <button className={classes.restartBtn} onClick={onRestart}>
            PLAY AGAIN
          </button>
          <button className={classes.restartBtn} onClick={onExitGameMode}>
            EXIT GAME MODE
          </button>
        </div>
      )}
    </>
  );
};

export default GameHUD;
