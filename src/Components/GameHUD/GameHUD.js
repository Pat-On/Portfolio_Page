import React from "react";
import PropTypes from "prop-types";
import classes from "./GameHUD.module.scss";
import { formatRunTime } from "../../TreeJSComponents/game/combat";

// The end screen's account of the run, as [label, value] rows
const runRows = (stats) => [
  ["WAVE REACHED", stats.wave],
  ["KILLS", stats.kills],
  ["ACCURACY", stats.accuracy === null ? "—" : `${Math.round(stats.accuracy * 100)}%`],
  ["TIME", formatRunTime(stats.timeS)],
  ["BEST STREAK", stats.bestStreak],
  ...(stats.hullBonus > 0 ? [["HULL BONUS", `+${stats.hullBonus}`]] : []),
];

const GameHUD = ({
  health, score, wave, active, gameOverScreen, hitFlash, killPopup, waveComplete,
  paused, muted, autoFire, isMobile, highScore, onRestart, onExitGameMode,
  onFireStart, onFireEnd, onBoostStart, onBoostEnd, onPauseToggle, onMuteToggle,
  onAutoFireToggle,
}) => {
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
              +{killPopup.points} PTS{killPopup.multiplier > 1 ? ` ×${killPopup.multiplier}` : ""}
              {killPopup.streak >= 3 && (
                <div className={classes.streakLine}>{killPopup.streak}× KILL STREAK!</div>
              )}
            </div>
          )}

          {waveComplete && waveComplete.active && (
            <div key={waveComplete.wave} className={classes.waveBanner}>
              WAVE {waveComplete.wave} CLEARED
              {waveComplete.bonus > 0 && (
                <div className={classes.waveBonus}>+{waveComplete.bonus} BONUS</div>
              )}
            </div>
          )}

          {paused && (
            <div className={classes.pauseOverlay}>
              <p className={classes.pauseText}>PAUSED</p>
              <p className={classes.pauseHint}>{isMobile ? "TAP — RESUME" : "P / TAP — RESUME"}</p>
              <button className={classes.resumeBtn} onClick={onPauseToggle}>
                RESUME
              </button>
            </div>
          )}

          <div className={classes.systemButtons}>
            <button
              className={`${classes.sysBtn} ${autoFire ? classes.sysBtnActive : ""}`}
              onClick={onAutoFireToggle}
              aria-label="Auto-fire"
              aria-pressed={autoFire}
              title={autoFire ? "Auto-fire ON" : "Auto-fire OFF"}
            >
              🎯
            </button>
            <button className={classes.sysBtn} onClick={onPauseToggle} aria-label="Pause">
              {paused ? "▶" : "⏸"}
            </button>
            <button className={classes.sysBtn} onClick={onMuteToggle} aria-label="Mute">
              {muted ? "🔇" : "🔊"}
            </button>
          </div>

          {isMobile && (
            <>
              <button
                className={`${classes.touchBtn} ${classes.boostBtn}`}
                onPointerDown={onBoostStart}
                onPointerUp={onBoostEnd}
                onPointerLeave={onBoostEnd}
                onPointerCancel={onBoostEnd}
                onContextMenu={(e) => e.preventDefault()}
              >
                BOOST
              </button>
              {!autoFire && (
                <button
                  className={`${classes.touchBtn} ${classes.fireBtn}`}
                  onPointerDown={onFireStart}
                  onPointerUp={onFireEnd}
                  onPointerLeave={onFireEnd}
                  onPointerCancel={onFireEnd}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  FIRE
                </button>
              )}
            </>
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
          {gameOverScreen.stats && (
            <ul className={classes.runStats} aria-label="Run statistics">
              {runRows(gameOverScreen.stats).map(([label, value]) => (
                <li key={label}>
                  <span className={classes.runStats__label}>{label}</span>
                  <span className={classes.runStats__value}>{value}</span>
                </li>
              ))}
            </ul>
          )}
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

GameHUD.propTypes = {
  health: PropTypes.number,
  score: PropTypes.number,
  wave: PropTypes.number,
  active: PropTypes.bool.isRequired,
  gameOverScreen: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    victory: PropTypes.bool,
    isNew: PropTypes.bool,
    score: PropTypes.number,
    stats: PropTypes.shape({
      wave: PropTypes.number,
      kills: PropTypes.number,
      accuracy: PropTypes.number,
      timeS: PropTypes.number,
      bestStreak: PropTypes.number,
      hullBonus: PropTypes.number,
    }),
  }).isRequired,
  hitFlash: PropTypes.bool,
  killPopup: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    points: PropTypes.number,
    streak: PropTypes.number,
    multiplier: PropTypes.number,
  }),
  waveComplete: PropTypes.shape({
    active: PropTypes.bool,
    wave: PropTypes.number,
    bonus: PropTypes.number,
  }),
  paused: PropTypes.bool,
  muted: PropTypes.bool,
  autoFire: PropTypes.bool,
  isMobile: PropTypes.bool,
  highScore: PropTypes.number,
  onRestart: PropTypes.func,
  onExitGameMode: PropTypes.func,
  onFireStart: PropTypes.func,
  onFireEnd: PropTypes.func,
  onBoostStart: PropTypes.func,
  onBoostEnd: PropTypes.func,
  onPauseToggle: PropTypes.func,
  onMuteToggle: PropTypes.func,
  onAutoFireToggle: PropTypes.func,
};

export default GameHUD;
