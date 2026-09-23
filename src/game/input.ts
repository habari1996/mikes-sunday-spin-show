const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyP",
  "Escape",
  "KeyR",
]);

const keys = new Set<string>();
const prevKeys = new Set<string>();
let qaCodes: string[] | null = null;
let qaSteer: number | null = null;

export const touch = {
  steer: 0,
  throttle: 0,
  handbrake: false,
  active: false,
};

function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export function attachInput() {
  const down = (e: KeyboardEvent) => {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    keys.add(e.code);
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };
  const clear = () => keys.clear();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) keys.clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

export function setQaKeys(codes: string[]) {
  qaCodes = codes.length ? codes : null;
}

export function setQaSteer(v: number | null) {
  qaSteer = v;
}

function held(code: string) {
  if (qaCodes) return qaCodes.includes(code);
  return keys.has(code);
}

export type Actions = {
  throttle: number;
  steer: number;
  handbrake: boolean;
  pause: boolean;
  pauseDown: boolean;
};

export function readActions(): Actions {
  let throttle = 0;
  let steer = 0;

  if (held("KeyW") || held("ArrowUp")) throttle += 1;
  if (held("KeyS") || held("ArrowDown")) throttle -= 1;
  if (held("KeyA") || held("ArrowLeft")) steer += 1;
  if (held("KeyD") || held("ArrowRight")) steer -= 1;

  const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
  if (pads) {
    for (const pad of pads) {
      if (!pad || pad.mapping !== "standard") continue;
      const st = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
      steer += -st.x;
      const gas = pad.buttons[7]?.value ?? 0;
      const brake = pad.buttons[6]?.value ?? 0;
      throttle += gas - brake;
      if (st.y < -0.25) throttle += -st.y;
      if (st.y > 0.25) throttle -= st.y;
      if (pad.buttons[0]?.pressed) {
        /* handbrake below */
      }
    }
  }

  if (touch.active) {
    steer += touch.steer;
    throttle += touch.throttle;
  }

  if (qaSteer != null) steer = qaSteer;

  throttle = Math.max(-1, Math.min(1, throttle));
  steer = Math.max(-1, Math.min(1, steer));

  let handbrake = held("Space") || held("ShiftLeft") || held("ShiftRight") || touch.handbrake;
  if (pads) {
    for (const pad of pads) {
      if (pad?.buttons[0]?.pressed) handbrake = true;
    }
  }

  const pauseHeld = held("KeyP") || held("Escape");
  const pauseDown = pauseHeld && !prevKeys.has("KeyP") && !prevKeys.has("Escape");

  prevKeys.clear();
  for (const c of qaCodes ?? keys) prevKeys.add(c);

  return { throttle, steer, handbrake, pause: pauseHeld, pauseDown };
}
