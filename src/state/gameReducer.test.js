import { gameReducer, initialGameState, computeStreak } from "./gameReducer";

describe("gameReducer", () => {
  describe("initialGameState", () => {
    it("starts with exploring/gameMode/paused all false", () => {
      expect(initialGameState.exploring).toBe(false);
      expect(initialGameState.gameMode).toBe(false);
      expect(initialGameState.paused).toBe(false);
    });
    it("starts with full health, zero score, wave 1", () => {
      expect(initialGameState.hudData).toEqual({ health: 1.0, score: 0, wave: 1 });
    });
    it("starts with gameOverScreen and waveComplete inactive", () => {
      expect(initialGameState.gameOverScreen.active).toBe(false);
      expect(initialGameState.waveComplete.active).toBe(false);
    });
    it("starts with no kill popup and zero streak", () => {
      expect(initialGameState.killPopup).toBe(null);
      expect(initialGameState.killStreak).toBe(0);
      expect(initialGameState.lastKillTime).toBe(0);
    });
  });

  describe("computeStreak", () => {
    it("increments when same-streak window is open (< 3000 ms)", () => {
      expect(computeStreak(1000, 0, 0)).toBe(1);     // first kill ever
      expect(computeStreak(2500, 1000, 1)).toBe(2);  // 1.5s gap
      expect(computeStreak(4500, 2500, 2)).toBe(3);  // 2s gap
    });
    it("resets to 1 when the gap is >= 3000 ms", () => {
      expect(computeStreak(5000, 1000, 4)).toBe(1);  // 4s gap
      expect(computeStreak(4000, 1000, 4)).toBe(1);  // exactly 3s
    });
  });

  describe("TOGGLE_EXPLORE", () => {
    it("flips the exploring flag", () => {
      const s1 = gameReducer(initialGameState, { type: "TOGGLE_EXPLORE" });
      expect(s1.exploring).toBe(true);
      const s2 = gameReducer(s1, { type: "TOGGLE_EXPLORE" });
      expect(s2.exploring).toBe(false);
    });
  });

  describe("ENTER_GAME_MODE", () => {
    it("sets gameMode + exploring, resets hudData, clears overlays", () => {
      const dirty = {
        ...initialGameState,
        hudData: { health: 0.2, score: 999, wave: 5 },
        gameOverScreen: { active: true, score: 200, isNew: false, victory: false },
        waveComplete: { active: true, wave: 3 },
        paused: true,
        killStreak: 7,
      };
      const s = gameReducer(dirty, { type: "ENTER_GAME_MODE" });
      expect(s.gameMode).toBe(true);
      expect(s.exploring).toBe(true);
      expect(s.hudData).toEqual({ health: 1.0, score: 0, wave: 1 });
      expect(s.gameOverScreen.active).toBe(false);
      expect(s.waveComplete.active).toBe(false);
      expect(s.paused).toBe(false);
      expect(s.killStreak).toBe(0);
    });
  });

  describe("EXIT_GAME", () => {
    it("clears exploring and gameMode", () => {
      const playing = { ...initialGameState, exploring: true, gameMode: true };
      const s = gameReducer(playing, { type: "EXIT_GAME" });
      expect(s.exploring).toBe(false);
      expect(s.gameMode).toBe(false);
    });
  });

  describe("GAME_OVER", () => {
    it("clears exploring/gameMode/paused/waveComplete and sets gameOverScreen.active", () => {
      const playing = {
        ...initialGameState,
        exploring: true,
        gameMode: true,
        paused: true,
        waveComplete: { active: true, wave: 3 },
      };
      const s = gameReducer(playing, { type: "GAME_OVER", score: 450, victory: false });
      expect(s.exploring).toBe(false);
      expect(s.gameMode).toBe(false);
      expect(s.paused).toBe(false);
      expect(s.waveComplete.active).toBe(false);
      expect(s.gameOverScreen.active).toBe(true);
      expect(s.gameOverScreen.score).toBe(450);
      expect(s.gameOverScreen.victory).toBe(false);
    });
    it("marks isNew=true and bumps highScore when score > current highScore", () => {
      const s = gameReducer(
        { ...initialGameState, highScore: 100 },
        { type: "GAME_OVER", score: 250, victory: false }
      );
      expect(s.gameOverScreen.isNew).toBe(true);
      expect(s.highScore).toBe(250);
    });
    it("marks isNew=false and leaves highScore when score <= current highScore", () => {
      const s = gameReducer(
        { ...initialGameState, highScore: 500 },
        { type: "GAME_OVER", score: 250, victory: true }
      );
      expect(s.gameOverScreen.isNew).toBe(false);
      expect(s.highScore).toBe(500);
      expect(s.gameOverScreen.victory).toBe(true);
    });
    it("does not mark isNew=true for a zero score even on a fresh game", () => {
      const s = gameReducer(initialGameState, { type: "GAME_OVER", score: 0 });
      expect(s.gameOverScreen.isNew).toBe(false);
    });
  });

  describe("RESTART", () => {
    it("clears all overlays, resets hudData, enters gameMode+explore", () => {
      const after = {
        ...initialGameState,
        gameOverScreen: { active: true, score: 100, isNew: false, victory: false },
        hudData: { health: 0.0, score: 100, wave: 4 },
        hitFlash: true,
        killPopup: { points: 100, id: 7, streak: 3 },
        waveComplete: { active: true, wave: 4 },
        paused: true,
        killStreak: 3,
      };
      const s = gameReducer(after, { type: "RESTART" });
      expect(s.gameOverScreen.active).toBe(false);
      expect(s.hudData).toEqual({ health: 1.0, score: 0, wave: 1 });
      expect(s.hitFlash).toBe(false);
      expect(s.killPopup).toBe(null);
      expect(s.waveComplete.active).toBe(false);
      expect(s.paused).toBe(false);
      expect(s.killStreak).toBe(0);
      expect(s.gameMode).toBe(true);
      expect(s.exploring).toBe(true);
    });
  });

  describe("HUD_UPDATE", () => {
    it("replaces health/score/wave in hudData", () => {
      const s = gameReducer(initialGameState, {
        type: "HUD_UPDATE", health: 0.6, score: 420, wave: 3,
      });
      expect(s.hudData).toEqual({ health: 0.6, score: 420, wave: 3 });
    });
    it("defaults wave to 1 when missing", () => {
      const s = gameReducer(initialGameState, {
        type: "HUD_UPDATE", health: 0.5, score: 10,
      });
      expect(s.hudData.wave).toBe(1);
    });
  });

  describe("PLAYER_HIT", () => {
    it("sets hitFlash true", () => {
      const s = gameReducer(initialGameState, { type: "PLAYER_HIT" });
      expect(s.hitFlash).toBe(true);
    });
  });

  describe("DISMISS_HIT_FLASH", () => {
    it("clears hitFlash", () => {
      const s = gameReducer({ ...initialGameState, hitFlash: true }, { type: "DISMISS_HIT_FLASH" });
      expect(s.hitFlash).toBe(false);
    });
  });

  describe("KILL", () => {
    it("increments streak when within 3000 ms, sets killPopup with new id", () => {
      const base = { ...initialGameState, lastKillTime: 1000, killStreak: 2 };
      const s = gameReducer(base, { type: "KILL", points: 150, now: 2500 });
      expect(s.killStreak).toBe(3);
      expect(s.lastKillTime).toBe(2500);
      expect(s.killPopup).not.toBe(null);
      expect(s.killPopup.points).toBe(150);
      expect(s.killPopup.streak).toBe(3);
      expect(typeof s.killPopup.id).toBe("number");
    });
    it("resets streak to 1 when gap >= 3000 ms", () => {
      const base = { ...initialGameState, lastKillTime: 1000, killStreak: 4 };
      const s = gameReducer(base, { type: "KILL", points: 100, now: 5000 });
      expect(s.killStreak).toBe(1);
      expect(s.killPopup.streak).toBe(1);
    });
    it("assigns a monotonically increasing id across successive kills", () => {
      let s = gameReducer(initialGameState, { type: "KILL", points: 100, now: 1 });
      const id1 = s.killPopup.id;
      s = gameReducer(s, { type: "KILL", points: 100, now: 2 });
      expect(s.killPopup.id).toBeGreaterThan(id1);
    });
  });

  describe("DISMISS_KILL_POPUP", () => {
    it("clears killPopup but preserves streak", () => {
      const base = {
        ...initialGameState,
        killPopup: { points: 100, id: 1, streak: 2 },
        killStreak: 2,
      };
      const s = gameReducer(base, { type: "DISMISS_KILL_POPUP" });
      expect(s.killPopup).toBe(null);
      expect(s.killStreak).toBe(2);
    });
  });

  describe("WAVE_COMPLETE", () => {
    it("sets waveComplete active with wave number", () => {
      const s = gameReducer(initialGameState, { type: "WAVE_COMPLETE", wave: 5 });
      expect(s.waveComplete).toEqual({ active: true, wave: 5 });
    });
  });

  describe("DISMISS_WAVE_COMPLETE", () => {
    it("clears waveComplete", () => {
      const base = { ...initialGameState, waveComplete: { active: true, wave: 5 } };
      const s = gameReducer(base, { type: "DISMISS_WAVE_COMPLETE" });
      expect(s.waveComplete).toEqual({ active: false, wave: 0 });
    });
  });

  describe("DISMISS_GAME_OVER", () => {
    it("clears the gameOverScreen overlay without resetting hudData or highScore", () => {
      const base = {
        ...initialGameState,
        gameOverScreen: { active: true, score: 200, isNew: true, victory: false },
        highScore: 200,
        hudData: { health: 0, score: 200, wave: 3 },
      };
      const s = gameReducer(base, { type: "DISMISS_GAME_OVER" });
      expect(s.gameOverScreen.active).toBe(false);
      expect(s.highScore).toBe(200);
      expect(s.hudData).toEqual({ health: 0, score: 200, wave: 3 });
    });
  });

  describe("PAUSE", () => {
    it("toggles paused based on the action payload", () => {
      const s1 = gameReducer(initialGameState, { type: "PAUSE", isPaused: true });
      expect(s1.paused).toBe(true);
      const s2 = gameReducer(s1, { type: "PAUSE", isPaused: false });
      expect(s2.paused).toBe(false);
    });
  });

  describe("unknown action", () => {
    it("returns the same state reference (no-op)", () => {
      const s = gameReducer(initialGameState, { type: "DOES_NOT_EXIST" });
      expect(s).toBe(initialGameState);
    });
  });
});
