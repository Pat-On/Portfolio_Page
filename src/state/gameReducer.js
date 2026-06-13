const FRESH_HUD = { health: 1.0, score: 0, wave: 1 };
const INACTIVE_GAME_OVER = { active: false, score: 0, isNew: false, victory: false };
const INACTIVE_WAVE = { active: false, wave: 0 };

export const STREAK_WINDOW_MS = 3000;

export const initialGameState = {
  exploring: false,
  gameMode: false,
  briefing: false,
  hudData: { ...FRESH_HUD },
  gameOverScreen: { ...INACTIVE_GAME_OVER },
  hitFlash: false,
  killPopup: null,
  waveComplete: { ...INACTIVE_WAVE },
  paused: false,
  muted: false,
  autoFire: true,
  highScore: 0,
  killStreak: 0,
  lastKillTime: 0,
  _nextKillId: 1,
};

export function computeStreak(now, lastKillTime, currentStreak) {
  if (lastKillTime === 0) return 1;
  return now - lastKillTime < STREAK_WINDOW_MS ? currentStreak + 1 : 1;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_EXPLORE":
      return { ...state, exploring: !state.exploring };

    // Game-mode button → show the briefing overlay; combat starts on START_GAME
    case "ENTER_GAME_MODE":
      return { ...state, briefing: true };

    case "START_GAME":
      return {
        ...state,
        briefing: false,
        gameMode: true,
        exploring: true,
        hudData: { ...FRESH_HUD },
        gameOverScreen: { ...INACTIVE_GAME_OVER },
        waveComplete: { ...INACTIVE_WAVE },
        paused: false,
        autoFire: true,
        killStreak: 0,
      };

    case "EXIT_GAME":
      return { ...state, exploring: false, gameMode: false, briefing: false };

    case "GAME_OVER": {
      const score = action.score || 0;
      const isNew = score > state.highScore && score > 0;
      return {
        ...state,
        exploring: false,
        gameMode: false,
        briefing: false,
        paused: false,
        waveComplete: { ...INACTIVE_WAVE },
        gameOverScreen: {
          active: true,
          score,
          isNew,
          victory: !!action.victory,
        },
        highScore: isNew ? score : state.highScore,
      };
    }

    case "RESTART":
      return {
        ...state,
        gameOverScreen: { ...INACTIVE_GAME_OVER },
        hudData: { ...FRESH_HUD },
        hitFlash: false,
        killPopup: null,
        waveComplete: { ...INACTIVE_WAVE },
        paused: false,
        autoFire: true,
        killStreak: 0,
        gameMode: true,
        exploring: true,
      };

    case "HUD_UPDATE":
      return {
        ...state,
        hudData: {
          health: action.health,
          score: action.score,
          wave: action.wave || 1,
        },
      };

    case "PLAYER_HIT":
      return { ...state, hitFlash: true };

    case "DISMISS_HIT_FLASH":
      return { ...state, hitFlash: false };

    case "KILL": {
      const streak = computeStreak(action.now, state.lastKillTime, state.killStreak);
      return {
        ...state,
        killStreak: streak,
        lastKillTime: action.now,
        killPopup: { points: action.points, id: state._nextKillId, streak },
        _nextKillId: state._nextKillId + 1,
      };
    }

    case "DISMISS_KILL_POPUP":
      return { ...state, killPopup: null };

    case "WAVE_COMPLETE":
      return { ...state, waveComplete: { active: true, wave: action.wave } };

    case "DISMISS_WAVE_COMPLETE":
      return { ...state, waveComplete: { ...INACTIVE_WAVE } };

    case "DISMISS_GAME_OVER":
      return { ...state, gameOverScreen: { ...INACTIVE_GAME_OVER } };

    case "PAUSE":
      return { ...state, paused: !!action.isPaused };

    case "SET_MUTED":
      return { ...state, muted: !!action.muted };

    case "TOGGLE_AUTOFIRE":
      return { ...state, autoFire: !state.autoFire };

    case "SET_HIGH_SCORE":
      return { ...state, highScore: action.value };

    default:
      return state;
  }
}
