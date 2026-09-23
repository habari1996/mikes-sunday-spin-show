import { useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CarModel } from "./CarModel";
import { World } from "./World";
import { Skids, Smoke } from "./Fx";
import { CARS, FIXED, normalizeCarId, sim, speedKmh, stepSim } from "./sim";
import { readActions } from "./input";
import { blip, updateAudio } from "./audio";
import { useGame } from "./store";

let camSnap = false;
export function snapCamera() {
  camSnap = true;
}

const tmpCam = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpShake = new THREE.Vector3();
let acc = 0;
let menuT = 0.4;
let lastSpins = 0;
let hudClock = 0;
let reduced = false;

function CameraRig() {
  const { camera } = useThree();
  const phase = useGame((s) => s.phase);
  const look = useRef(new THREE.Vector3(0, 0.55, 17.6));

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const fovCam = camera as THREE.PerspectiveCamera;
    if (phase === "menu" || phase === "results") {
      menuT += dt;
      const swing = Math.sin(menuT * 0.32) * 0.62;
      const az = Math.PI + 0.48 + swing;
      const r = phase === "results" ? 7.6 : 7.05;
      const h = phase === "results" ? 2.05 : 1.92;
      const cx = sim.x;
      const cz = sim.z;
      tmpCam.set(cx + Math.sin(az) * r, h, cz + Math.cos(az) * r);
      tmpLook.set(cx, -0.9, cz - 0.15);
      camera.position.copy(tmpCam);
      look.current.copy(tmpLook);
      camera.lookAt(look.current);
      fovCam.fov += (40 - fovCam.fov) * (1 - Math.exp(-4 * dt));
      fovCam.updateProjectionMatrix();
      return;
    }

    const fx = -Math.sin(sim.yaw);
    const fz = -Math.cos(sim.yaw);
    const speed = Math.hypot(sim.vx, sim.vz);
    const follow = 7.4 + Math.min(speed, 28) * 0.04;
    const height = 3.05 + Math.min(speed, 28) * 0.02;
    tmpCam.set(sim.x - fx * follow, height, sim.z - fz * follow);
    if (camSnap) {
      camera.position.copy(tmpCam);
      look.current.set(sim.x + fx * 5.2, 0.7, sim.z + fz * 5.2);
      camSnap = false;
    } else {
      const k = 1 - Math.exp(-4.2 * dt);
      camera.position.x += (tmpCam.x - camera.position.x) * k;
      camera.position.y += (tmpCam.y - camera.position.y) * k;
      camera.position.z += (tmpCam.z - camera.position.z) * k;
    }

    if (!reduced && sim.trauma > 0.01) {
      const mag = sim.trauma * sim.trauma * 0.45;
      tmpShake.set((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag * 0.4, (Math.random() - 0.5) * mag);
      camera.position.add(tmpShake);
    }

    tmpLook.set(sim.x + fx * 5.2, 0.7, sim.z + fz * 5.2);
    look.current.lerp(tmpLook, 1 - Math.exp(-6 * dt));
    camera.lookAt(look.current);
    const want = 58 + Math.min(speed, 36) * 0.28 + (sim.drifting ? 3 : 0);
    fovCam.fov += (want - fovCam.fov) * (1 - Math.exp(-3 * dt));
    fovCam.updateProjectionMatrix();
  });
  return null;
}

function Simulation() {
  const phase = useGame((s) => s.phase);
  const setHud = useGame((s) => s.setHud);
  const setPhase = useGame((s) => s.setPhase);
  const commitResult = useGame((s) => s.commitResult);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const actions = readActions();

    if (actions.pauseDown && phase === "playing") setPhase("paused");
    else if (actions.pauseDown && phase === "paused") setPhase("playing");

    if (phase === "playing") {
      acc += dt;
      while (acc >= FIXED) {
        stepSim(sim, actions, FIXED);
        acc -= FIXED;
      }
    } else {
      acc = 0;
    }

    if (sim.over && useGame.getState().phase === "playing") {
      blip("end");
      commitResult(sim.score, sim.spins, sim.maxCombo, sim.longestDrift);
    }

    if (sim.spins < lastSpins) lastSpins = sim.spins;
    if (sim.spins > lastSpins) {
      blip("spin");
      lastSpins = sim.spins;
    }

    const slip = Math.abs(Math.atan2(sim.lVel, Math.max(1, Math.abs(sim.fVel))));
    updateAudio(sim.rpm, slip, sim.throttle, phase === "playing");

    hudClock += dt;
    if (hudClock > 0.08) {
      hudClock = 0;
      setHud({
        speed: speedKmh(sim),
        score: sim.score,
        combo: sim.combo,
        time: sim.time,
        spins: sim.spins,
        slip,
        rpm: sim.rpm,
        drifting: sim.drifting,
        message: sim.messageT > 0 ? sim.message : "",
      });
    }
  });
  return null;
}

export function GameCanvas() {
  const carId = useGame((s) => s.carId);
  const spec = CARS[normalizeCarId(carId)];

  useEffect(() => {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 40, position: [-4.2, 1.75, 12.6], near: 0.08, far: 180 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none", position: "absolute", inset: 0 }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
        gl.shadowMap.type = THREE.PCFShadowMap;
        camera.lookAt(0, 0.55, 17.6);
      }}
    >
      <World />
      <Suspense fallback={null}>
        <CarModel key={spec.id} spec={spec} />
      </Suspense>
      <Smoke />
      <Skids />
      <CameraRig />
      <Simulation />
    </Canvas>
  );
}
