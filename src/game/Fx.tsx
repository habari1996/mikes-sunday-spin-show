import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sim } from "./sim";

const SMOKE_N = 280;
const SKID_N = 140;

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  alive: boolean;
};

export function Smoke() {
  const pts = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < SMOKE_N; i++) {
      list.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, alive: false });
    }
    return list;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(SMOKE_N * 3);
    const a = new Float32Array(SMOKE_N);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aLife", new THREE.BufferAttribute(a, 1));
    return g;
  }, []);

  const spawnCursor = useRef(0);

  useFrame((_, dt) => {
    const speed = Math.hypot(sim.vx, sim.vz);
    const slip = Math.abs(sim.lVel);
    const should = (sim.drifting || sim.handbrake) && speed > 2.5;
    const fx = -Math.sin(sim.yaw);
    const fz = -Math.cos(sim.yaw);
    const rx = Math.cos(sim.yaw);
    const rz = -Math.sin(sim.yaw);

    if (should) {
      const n = slip > 4 || Math.abs(sim.yawRate) > 3 ? 4 : 2;
      for (let k = 0; k < n; k++) {
        const p = particles[spawnCursor.current % SMOKE_N]!;
        spawnCursor.current++;
        const side = k % 2 === 0 ? -1 : 1;
        p.x = sim.x - fx * -1.35 + rx * side * 0.7;
        p.y = 0.18;
        p.z = sim.z - fz * -1.35 + rz * side * 0.7;
        p.vx = (Math.random() - 0.5) * 1.4;
        p.vy = 1.4 + Math.random() * 1.6;
        p.vz = (Math.random() - 0.5) * 1.4;
        p.life = 0;
        p.max = 0.7 + Math.random() * 0.6;
        p.alive = true;
      }
    }

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const lifeAttr = geo.attributes.aLife as THREE.BufferAttribute;
    for (let i = 0; i < SMOKE_N; i++) {
      const p = particles[i]!;
      if (p.alive) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy += 0.4 * dt;
        if (p.life >= p.max) p.alive = false;
      }
      pos.setXYZ(i, p.x, p.alive ? p.y : -10, p.z);
      lifeAttr.setX(i, p.alive ? 1 - p.life / p.max : 0);
    }
    pos.needsUpdate = true;
    lifeAttr.needsUpdate = true;
  });

  return (
    <points geometry={geo} ref={pts} frustumCulled={false}>
      <pointsMaterial
        color="#d8d2c8"
        size={0.55}
        transparent
        opacity={0.45}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function Skids() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cursor = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const last = useRef({ x: 0, z: 0, armed: false });

  useFrame(() => {
    if (!mesh.current) return;
    const speed = Math.hypot(sim.vx, sim.vz);
    if (sim.drifting && speed > 5) {
      const fx = -Math.sin(sim.yaw);
      const fz = -Math.cos(sim.yaw);
      const rx = Math.cos(sim.yaw);
      const rz = -Math.sin(sim.yaw);
      for (const side of [-0.7, 0.7]) {
        const x = sim.x + fx * 1.32 + rx * side;
        const z = sim.z + fz * 1.32 + rz * side;
        dummy.position.set(x, 0.03, z);
        dummy.rotation.set(-Math.PI / 2, 0, -sim.yaw);
        dummy.scale.set(0.28, 0.9, 1);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(cursor.current % SKID_N, dummy.matrix);
        cursor.current++;
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      last.current = { x: sim.x, z: sim.z, armed: true };
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SKID_N]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#121214" transparent opacity={0.42} depthWrite={false} />
    </instancedMesh>
  );
}
