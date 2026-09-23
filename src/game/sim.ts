export type CarId = "katra" | "samsam" | "wababa";

export type CarSpec = {
  id: CarId;
  name: string;
  tag: string;
  color: string;
  trim: string;
  glass: string;
  stripe: string | null;
  plate: string;
  shape: "e30" | "e36" | "z";
  accel: number;
  brake: number;
  maxSpeed: number;
  turnRate: number;
  spinRate: number;
  grip: number;
  driftGrip: number;
  drag: number;
  scoreMul: number;
  width: number;
  spoiler: boolean;
};

export const CARS: Record<CarId, CarSpec> = {
  katra: {
    id: "katra",
    name: "King Katra",
    tag: "Kutja Works · 335i",
    color: "#1c1e1a",
    trim: "#0c0c0c",
    glass: "#141a16",
    stripe: "#7a9a68",
    plate: "KATRA",
    shape: "e30",
    accel: 18,
    brake: 22,
    maxSpeed: 29,
    turnRate: 2.6,
    spinRate: 4.05,
    grip: 1.5,
    driftGrip: 0.24,
    drag: 0.52,
    scoreMul: 1.12,
    width: 1.82,
    spoiler: false,
  },
  samsam: {
    id: "samsam",
    name: "Sam Sam",
    tag: "Alpinweiss 335i · lot legend",
    color: "#ffffff",
    trim: "#c5c2bb",
    glass: "#151c22",
    stripe: null,
    plate: "SAM SAM",
    shape: "e30",
    accel: 21,
    brake: 24,
    maxSpeed: 33,
    turnRate: 2.25,
    spinRate: 3.15,
    grip: 1.4,
    driftGrip: 0.22,
    drag: 0.48,
    scoreMul: 1.1,
    width: 1.84,
    spoiler: false,
  },
  wababa: {
    id: "wababa",
    name: "Wababa",
    tag: "Gusheshe 335i · Spin Flex Repeat",
    color: "#2a2c30",
    trim: "#0a0a0a",
    glass: "#101418",
    stripe: "#c4a574",
    plate: "WABABA",
    shape: "z",
    accel: 26,
    brake: 26,
    maxSpeed: 38,
    turnRate: 2.08,
    spinRate: 4.2,
    grip: 1.18,
    driftGrip: 0.16,
    drag: 0.42,
    scoreMul: 1.28,
    width: 1.88,
    spoiler: true,
  },
};

export function normalizeCarId(id: string | undefined): CarId {
  if (id === "katra" || id === "e30") return "katra";
  if (id === "wababa" || id === "gush") return "wababa";
  return "samsam";
}

export const SESSION = 90;
export const CAR_R = 1.15;
export const FIXED = 1 / 60;

/** Plot 10770, Kafue Road (T2), Lusaka. Plus code 5GPCH74F+F94.
 *  Satellite tarmac ~74 m E–W × 72 m N–S. +Z = north toward Kafue. */
export const LOT = { minX: -38, maxX: 36, minZ: -30, maxZ: 42 };

export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number };
export type Circle = { x: number; z: number; r: number };

export const BUILDINGS: Aabb[] = [
  // south wash hall — 5 × 3.8 m bays + plant
  { minX: -10, maxX: 34, minZ: -30, maxZ: -20.5 },
  // east L-wing office
  { minX: 26, maxX: 36, minZ: -20.5, maxZ: 9.5 },
  // west Kutja Works
  { minX: -38, maxX: -29, minZ: -16, maxZ: 8 },
  // vacuum islands
  { minX: -20.2, maxX: -16.2, minZ: 16, maxZ: 19.6 },
  { minX: 12.2, maxX: 16.2, minZ: 16, maxZ: 19.6 },
  // east pit stall
  { minX: 28.9, maxX: 33.1, minZ: 12.5, maxZ: 15.5 },
];

export const PARKED: { x: number; z: number; yaw: number; color: string }[] = [
  { x: -25.2, z: -10, yaw: Math.PI / 2, color: "#5c3d2e" },
  { x: -25.2, z: -4, yaw: Math.PI / 2, color: "#2c3340" },
  { x: -25.2, z: 3, yaw: Math.PI / 2, color: "#6b6e72" },
  { x: -25.2, z: 22, yaw: Math.PI / 2, color: "#1e2a4a" },
  { x: -25.2, z: 28, yaw: Math.PI / 2, color: "#7a1f1f" },
  { x: 22.2, z: -8, yaw: -Math.PI / 2, color: "#d8d2c4" },
  { x: 22.2, z: -2, yaw: -Math.PI / 2, color: "#24301c" },
  { x: 22.2, z: 5, yaw: -Math.PI / 2, color: "#3a3a3c" },
  { x: 22.2, z: 24, yaw: -Math.PI / 2, color: "#c9a227" },
  { x: 22.2, z: 30, yaw: -Math.PI / 2, color: "#4a5560" },
];

export const CROWD: Circle[] = (() => {
  const pts: Circle[] = [];
  for (let i = 0; i < 8; i++) {
    pts.push({ x: -28.3 + (i % 2) * 0.5, z: -14 + i * 2.6, r: 0.42 });
    pts.push({ x: 24.6 - (i % 2) * 0.5, z: -14 + i * 2.6, r: 0.42 });
  }
  for (let i = 0; i < 7; i++) {
    pts.push({ x: -36.5 + (i % 2) * 0.55, z: 11 + i * 3.6, r: 0.42 });
    pts.push({ x: 34.2 - (i % 2) * 0.5, z: 12 + i * 3.5, r: 0.42 });
  }
  for (let i = 0; i < 7; i++) {
    pts.push({ x: -8 + i * 4.2, z: -19.6, r: 0.4 });
  }
  return pts;
})();

export const PARKED_CIRCLES: Circle[] = PARKED.map((p) => ({
  x: p.x,
  z: p.z,
  r: 1.35,
}));

export type Sim = {
  spec: CarSpec;
  x: number;
  z: number;
  yaw: number;
  vx: number;
  vz: number;
  fVel: number;
  lVel: number;
  yawRate: number;
  steer: number;
  throttle: number;
  handbrake: boolean;
  lastSpinDir: number;
  wheelSpin: number;
  score: number;
  combo: number;
  comboTimer: number;
  spins: number;
  spinAccum: number;
  driftTime: number;
  maxCombo: number;
  longestDrift: number;
  driftStreak: number;
  time: number;
  over: boolean;
  drifting: boolean;
  trauma: number;
  hitFlash: number;
  message: string;
  messageT: number;
  rpm: number;
  tightSpinTime: number;
  flexArmed: number;
  flexCount: number;
  lapDist: number;
  cleanSpins: number;
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function createSim(carId: CarId = "samsam"): Sim {
  const spec = CARS[normalizeCarId(carId)];
  return {
    spec,
    x: 0,
    z: 18,
    yaw: 0,
    vx: 0,
    vz: 0,
    fVel: 0,
    lVel: 0,
    yawRate: 0,
    steer: 0,
    throttle: 0,
    handbrake: false,
    lastSpinDir: 1,
    wheelSpin: 0,
    score: 0,
    combo: 1,
    comboTimer: 0,
    spins: 0,
    spinAccum: 0,
    driftTime: 0,
    maxCombo: 1,
    longestDrift: 0,
    driftStreak: 0,
    time: SESSION,
    over: false,
    drifting: false,
    trauma: 0,
    hitFlash: 0,
    message: "",
    messageT: 0,
    rpm: 0.12,
    tightSpinTime: 0,
    flexArmed: 0,
    flexCount: 0,
    lapDist: 0,
    cleanSpins: 0,
  };
}

export const sim: Sim = createSim();

export function resetSim(carId: CarId) {
  Object.assign(sim, createSim(carId));
}

function hit(s: Sim, hard = false) {
  s.combo = 1;
  s.comboTimer = 0;
  s.driftStreak = 0;
  s.flexCount = 0;
  s.flexArmed = 0;
  s.cleanSpins = 0;
  s.lapDist = 0;
  s.tightSpinTime = 0;
  s.trauma = Math.min(1, s.trauma + (hard ? 0.55 : 0.32));
  s.hitFlash = 0.18;
  s.score = Math.max(0, s.score - (hard ? 140 : 60));
  s.message = hard ? "HIT" : "CLIP";
  s.messageT = 0.7;
}

function collideCircle(s: Sim, c: Circle, hard: boolean) {
  const dx = s.x - c.x;
  const dz = s.z - c.z;
  const d = Math.hypot(dx, dz);
  const min = CAR_R + c.r;
  if (d >= min) {
    if (s.drifting && d < min + 1.8 && d > min + 0.15) {
      s.score += 18 * s.combo * s.spec.scoreMul * FIXED;
    }
    return;
  }
  if (d < 1e-5) {
    s.x += min;
    return;
  }
  const nx = dx / d;
  const nz = dz / d;
  const pen = min - d;
  s.x += nx * pen;
  s.z += nz * pen;
  const vn = s.vx * nx + s.vz * nz;
  if (vn < 0) {
    s.vx -= nx * vn * 1.55;
    s.vz -= nz * vn * 1.55;
    s.vx *= 0.72;
    s.vz *= 0.72;
    hit(s, hard);
  }
}

function collideAabb(s: Sim, b: Aabb) {
  const r = CAR_R;
  const cx = clamp(s.x, b.minX, b.maxX);
  const cz = clamp(s.z, b.minZ, b.maxZ);
  const dx = s.x - cx;
  const dz = s.z - cz;
  const d2 = dx * dx + dz * dz;
  if (s.x > b.minX && s.x < b.maxX && s.z > b.minZ && s.z < b.maxZ) {
    const left = s.x - b.minX;
    const right = b.maxX - s.x;
    const top = s.z - b.minZ;
    const bot = b.maxZ - s.z;
    const m = Math.min(left, right, top, bot);
    if (m === left) s.x = b.minX - r;
    else if (m === right) s.x = b.maxX + r;
    else if (m === top) s.z = b.minZ - r;
    else s.z = b.maxZ + r;
    s.vx *= -0.25;
    s.vz *= -0.25;
    hit(s, true);
    return;
  }
  if (d2 < r * r) {
    const d = Math.sqrt(d2) || 0.0001;
    const pen = r - d;
    s.x += (dx / d) * pen;
    s.z += (dz / d) * pen;
    const nx = dx / d;
    const nz = dz / d;
    const vn = s.vx * nx + s.vz * nz;
    if (vn < 0) {
      s.vx -= nx * vn * 1.6;
      s.vz -= nz * vn * 1.6;
    }
    s.vx *= 0.7;
    s.vz *= 0.7;
    hit(s, true);
  }
}

function walls(s: Sim) {
  const r = CAR_R;
  if (s.x < LOT.minX + r) {
    s.x = LOT.minX + r;
    if (s.vx < 0) s.vx = -s.vx * 0.25;
    hit(s);
  } else if (s.x > LOT.maxX - r) {
    s.x = LOT.maxX - r;
    if (s.vx > 0) s.vx = -s.vx * 0.25;
    hit(s);
  }
  if (s.z < LOT.minZ + r) {
    s.z = LOT.minZ + r;
    if (s.vz < 0) s.vz = -s.vz * 0.25;
    hit(s);
  } else if (s.z > LOT.maxZ - r) {
    s.z = LOT.maxZ - r;
    if (s.vz > 0) s.vz = -s.vz * 0.25;
    hit(s);
  }
}

function scoreStep(s: Sim, dt: number) {
  const speed = Math.hypot(s.vx, s.vz);
  const slip = Math.abs(Math.atan2(s.lVel, Math.max(2.2, Math.abs(s.fVel))));
  const spinning = Math.abs(s.yawRate) > 1.65 && speed > 2.2;
  const sliding = speed > 4.2 && slip > 0.22;
  const wasDrifting = s.drifting;
  s.drifting = sliding || spinning || (s.handbrake && speed > 2.8);

  if (wasDrifting && !s.drifting) s.flexArmed = 0.95;
  if (s.flexArmed > 0) {
    s.flexArmed -= dt;
    if (s.drifting && spinning) {
      s.flexCount += 1;
      s.flexArmed = 0;
    }
  }

  if (s.drifting) {
    s.lapDist += speed * dt;
    if (spinning && speed < 11) s.tightSpinTime += dt;
    else s.tightSpinTime = Math.max(0, s.tightSpinTime - dt * 0.4);

    const rate =
      (slip * 1.55 + Math.abs(s.yawRate) * 0.28 + (s.handbrake ? 0.4 : 0)) *
      speed *
      s.spec.scoreMul;
    s.comboTimer = 1.55;
    s.combo = Math.min(8, s.combo + dt * 0.85);
    s.score += rate * s.combo * dt * 14;
    s.driftStreak += dt;
    s.driftTime += dt;
    if (s.driftStreak > s.longestDrift) s.longestDrift = s.driftStreak;
    s.spinAccum += Math.abs(s.yawRate) * dt;
    while (s.spinAccum >= Math.PI * 2 * 0.92) {
      s.spinAccum -= Math.PI * 2;
      s.spins += 1;
      s.cleanSpins += 1;
      let msg = s.spins === 1 ? "DONUT" : `${s.spins} SPINS`;
      let bonus = 520;
      if (s.tightSpinTime > 1.15 && speed < 12) {
        msg = s.cleanSpins >= 3 ? "KATRA" : "KUTJA WORKS";
        bonus = 920;
      } else if (s.flexCount >= 2) {
        msg = "SPIN FLEX REPEAT";
        bonus = 1180;
        s.flexCount = 0;
      } else if (s.lapDist > 50 && s.driftStreak > 3.4) {
        msg = "SAM SAM LAP";
        bonus = 980;
        s.lapDist = 0;
      } else if (s.cleanSpins > 0 && s.cleanSpins % 5 === 0) {
        msg = "WABABA";
        bonus = 1040;
      }
      s.score += bonus * s.combo * s.spec.scoreMul;
      s.message = msg;
      s.messageT = 1.2;
      s.trauma = Math.min(1, s.trauma + 0.12);
    }
  } else {
    s.driftStreak = 0;
    s.tightSpinTime = 0;
    s.lapDist *= 0.35;
    s.comboTimer -= dt;
    if (s.comboTimer <= 0) {
      s.combo = Math.max(1, s.combo - dt * 2.4);
      if (s.combo < 1.04) s.combo = 1;
    }
  }
  if (s.combo > s.maxCombo) s.maxCombo = s.combo;
}

export function stepSim(
  s: Sim,
  input: { throttle: number; steer: number; handbrake: boolean },
  dt: number,
) {
  if (s.over) return;
  const spec = s.spec;

  let steer = clamp(input.steer, -1, 1);
  const throttle = clamp(input.throttle, -1, 1);
  if (Math.abs(steer) > 0.12) s.lastSpinDir = Math.sign(steer);

  const speedNow = Math.hypot(s.vx, s.vz);
  const speedFactor = clamp(speedNow / 5.5, 0.18, 1);
  const reverse = s.fVel >= -0.4 ? 1 : -1;
  let yawDelta = steer * spec.turnRate * speedFactor * reverse * dt;

  if (input.handbrake) {
    const dir = Math.abs(steer) > 0.1 ? Math.sign(steer) : s.lastSpinDir;
    const spinPower = 0.5 + Math.max(0, throttle) * 0.85 + clamp(speedNow / 22, 0, 0.45);
    yawDelta += dir * spec.spinRate * spinPower * dt;
    steer = steer || dir * 0.4;
  }

  s.yaw += yawDelta;
  s.yawRate = yawDelta / dt;

  const fx = -Math.sin(s.yaw);
  const fz = -Math.cos(s.yaw);
  const rx = Math.cos(s.yaw);
  const rz = -Math.sin(s.yaw);

  let fVel = s.vx * fx + s.vz * fz;
  let lVel = s.vx * rx + s.vz * rz;

  if (throttle > 0) {
    const a = input.handbrake ? spec.accel * 0.52 : spec.accel;
    fVel += throttle * a * dt;
  } else {
    fVel += throttle * spec.brake * dt;
  }

  const drag = input.handbrake
    ? spec.drag * 2.6
    : Math.abs(throttle) < 0.06
      ? spec.drag * 1.9
      : spec.drag;
  fVel *= 1 - drag * dt;
  fVel = clamp(fVel, -spec.maxSpeed * 0.32, spec.maxSpeed);

  const grip = input.handbrake ? spec.driftGrip : spec.grip;
  lVel *= Math.exp(-grip * 8 * dt);

  s.vx = fx * fVel + rx * lVel;
  s.vz = fz * fVel + rz * lVel;
  s.x += s.vx * dt;
  s.z += s.vz * dt;
  s.fVel = fVel;
  s.lVel = lVel;
  s.steer = steer;
  s.throttle = throttle;
  s.handbrake = input.handbrake;
  s.wheelSpin += fVel * dt * 0.85;
  const targetRpm =
    0.12 + Math.max(0, throttle) * 0.55 + clamp(Math.abs(fVel) / spec.maxSpeed, 0, 1) * 0.4;
  s.rpm += (targetRpm - s.rpm) * (1 - Math.exp(-10 * dt));

  for (const b of BUILDINGS) collideAabb(s, b);
  for (const c of PARKED_CIRCLES) collideCircle(s, c, true);
  for (const c of CROWD) collideCircle(s, c, true);
  walls(s);

  scoreStep(s, dt);

  s.time -= dt;
  if (s.time <= 0) {
    s.time = 0;
    s.over = true;
  }
  s.trauma = Math.max(0, s.trauma - dt * 1.6);
  s.hitFlash = Math.max(0, s.hitFlash - dt);
  s.messageT = Math.max(0, s.messageT - dt);
}

export function speedKmh(s: Sim) {
  return Math.hypot(s.vx, s.vz) * 3.6 * 1.35;
}
