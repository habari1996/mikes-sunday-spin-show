import { normalizeCarId } from "./sim";

const KEY = "mikes-spin-v1";

export type SaveData = {
  v: 1;
  best: number;
  bestCar: string;
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { v: 1, best: 0, bestCar: "samsam" };
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed?.v !== 1) return { v: 1, best: 0, bestCar: "samsam" };
    return {
      v: 1,
      best: Number(parsed.best) || 0,
      bestCar: normalizeCarId(typeof parsed.bestCar === "string" ? parsed.bestCar : "samsam"),
    };
  } catch {
    return { v: 1, best: 0, bestCar: "samsam" };
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}
