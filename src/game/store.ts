import { create } from "zustand";
import { type CarId, normalizeCarId } from "./sim";
import { loadSave, writeSave } from "./save";

export type Phase = "menu" | "playing" | "paused" | "results";

export type Hud = {
  speed: number;
  score: number;
  combo: number;
  time: number;
  spins: number;
  slip: number;
  rpm: number;
  drifting: boolean;
  message: string;
};

const save = typeof window !== "undefined" ? loadSave() : { v: 1 as const, best: 0, bestCar: "samsam" };

export const useGame = create<{
  phase: Phase;
  carId: CarId;
  best: number;
  lastScore: number;
  lastSpins: number;
  lastMaxCombo: number;
  lastDrift: number;
  newBest: boolean;
  muted: boolean;
  help: boolean;
  hud: Hud;
  setPhase: (p: Phase) => void;
  setCar: (id: CarId) => void;
  setHud: (h: Partial<Hud>) => void;
  toggleMute: () => void;
  setHelp: (v: boolean) => void;
  commitResult: (score: number, spins: number, maxCombo: number, drift: number) => void;
}>((set, get) => ({
  phase: "menu",
  carId: normalizeCarId(save.bestCar),
  best: save.best,
  lastScore: 0,
  lastSpins: 0,
  lastMaxCombo: 1,
  lastDrift: 0,
  newBest: false,
  muted: false,
  help: false,
  hud: {
    speed: 0,
    score: 0,
    combo: 1,
    time: 90,
    spins: 0,
    slip: 0,
    rpm: 0,
    drifting: false,
    message: "",
  },
  setPhase: (phase) => set({ phase }),
  setCar: (carId) => set({ carId }),
  setHud: (h) => set({ hud: { ...get().hud, ...h } }),
  toggleMute: () => set({ muted: !get().muted }),
  setHelp: (help) => set({ help }),
  commitResult: (score, spins, maxCombo, drift) => {
    const best = Math.max(get().best, Math.floor(score));
    const newBest = Math.floor(score) >= get().best && score > 0;
    writeSave({ v: 1, best, bestCar: get().carId });
    set({
      phase: "results",
      lastScore: Math.floor(score),
      lastSpins: spins,
      lastMaxCombo: maxCombo,
      lastDrift: drift,
      best,
      newBest,
    });
  },
}));
