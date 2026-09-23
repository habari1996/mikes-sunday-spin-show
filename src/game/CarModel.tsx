import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { type CarSpec, sim } from "./sim";

const CHROME = "#c8c4bc";
const LAMP = "#f4f1e6";
const BLACK = "#0c0c0c";
const RUBBER = "#141414";
const GOLD = "#c4a574";

const MODEL = "/models/bmw.glb";

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL);
}

function paintScene(src: THREE.Object3D, spec: CarSpec) {
  const root = src.clone(true);
  const gush = spec.shape === "z";
  const paint = new THREE.Color(spec.color);
  const gold = new THREE.Color(GOLD);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(Boolean) as THREE.Material[];
    const next = mats.map((mat) => {
      const c = mat.clone() as THREE.MeshStandardMaterial;
      const n = (c.name || mat.name || "").toLowerCase();
      const looksPaint =
        n === "carpaint" ||
        n === "body" ||
        n === "matte" ||
        n.includes("paint") ||
        n.includes("car paint");
      if (looksPaint) {
        c.color.copy(paint);
        c.metalness = gush ? 0.55 : 0.28;
        c.roughness = gush ? 0.24 : 0.38;
        c.envMapIntensity = 1.1;
      } else if (gush && (n.includes("rim") || n === "bmwsilver" || n === "bolt")) {
        c.color.copy(gold);
        c.metalness = 0.85;
        c.roughness = 0.22;
      }
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? next : next[0]!;
  });
  return root;
}

export function CarModel({ spec }: { spec: CarSpec }) {
  const gltf = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);
  const gush = spec.shape === "z";
  const ride = gush ? -0.04 : 0;

  const root = useMemo(() => paintScene(gltf.scene, spec), [gltf.scene, spec]);

  const wheels = useMemo(() => {
    const found: { name: string; obj: THREE.Object3D; front: boolean }[] = [];
    root.traverse((o) => {
      if (!o.name.startsWith("Wheel_")) return;
      found.push({ name: o.name, obj: o, front: o.name.includes("_F") });
    });
    return found;
  }, [root]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.set(sim.x, ride, sim.z);
    g.rotation.y = sim.yaw;
    const bank = THREE.MathUtils.clamp(-sim.lVel * 0.035 - sim.steer * 0.05, -0.18, 0.18);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, bank, 8, dt);
    const squash = sim.hitFlash > 0 ? 0.94 : 1;
    g.scale.set(1, squash, 1);
    for (const w of wheels) {
      w.obj.rotation.x = sim.wheelSpin;
      w.obj.rotation.y = w.front ? sim.steer * 0.42 : 0;
    }
  });

  return (
    <group ref={group}>
      <primitive object={root} />
      {spec.spoiler ? (
        <mesh position={[0, 1.18, 2.12]} castShadow>
          <boxGeometry args={[1.28, 0.045, 0.32]} />
          <meshStandardMaterial color={spec.trim} roughness={0.38} />
        </mesh>
      ) : null}
      {spec.stripe ? (
        <mesh position={[0, 1.08, -0.55]}>
          <boxGeometry args={[0.16, 0.02, 2.4]} />
          <meshStandardMaterial color={spec.stripe} roughness={0.4} />
        </mesh>
      ) : null}
      {gush ? (
        <mesh position={[0, 0.08, -2.2]} castShadow>
          <boxGeometry args={[1.7, 0.05, 0.28]} />
          <meshStandardMaterial color={BLACK} roughness={0.55} />
        </mesh>
      ) : null}
      <pointLight position={[0.9, 1.4, -3.6]} intensity={16} distance={9} color="#fff3dd" />
      <pointLight position={[-0.7, 1.1, -3.2]} intensity={7} distance={7} color="#ffd8a8" />
    </group>
  );
}

function makeLowerHull(width: number, drop: number) {
  const s = new THREE.Shape();
  const y = (v: number) => v - drop;
  s.moveTo(-2.18, y(0.15));
  s.lineTo(-2.22, y(0.18));
  s.lineTo(-2.22, y(0.4));
  s.lineTo(-2.15, y(0.54));
  s.lineTo(-1.72, y(0.64));
  s.lineTo(-0.52, y(0.73));
  s.lineTo(1.92, y(0.74));
  s.lineTo(2.1, y(0.68));
  s.lineTo(2.16, y(0.54));
  s.lineTo(2.22, y(0.4));
  s.lineTo(2.22, y(0.18));
  s.lineTo(2.16, y(0.15));
  s.lineTo(-2.12, y(0.15));
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.022,
    bevelSegments: 1,
    steps: 1,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function makeCabin(width: number, drop: number) {
  const s = new THREE.Shape();
  const y = (v: number) => v - drop;
  s.moveTo(-0.5, y(0.72));
  s.lineTo(-0.14, y(1.26));
  s.lineTo(0.9, y(1.28));
  s.bezierCurveTo(1.1, y(1.27), 1.18, y(1.12), 1.24, y(0.98));
  s.lineTo(1.38, y(0.76));
  s.lineTo(-0.5, y(0.72));
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelSegments: 1,
    steps: 1,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function Kidney({
  x,
  y,
  z,
  chrome,
}: {
  x: number;
  y: number;
  z: number;
  chrome: boolean;
}) {
  const frame = chrome ? CHROME : "#3a3a3c";
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.26, 0.22, 0.06]} />
        <meshStandardMaterial color={frame} metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[0.205, 0.175, 0.05]} />
        <meshStandardMaterial color={BLACK} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function ParkedCar({
  x,
  z,
  yaw,
  color,
}: {
  x: number;
  z: number;
  yaw: number;
  color: string;
}) {
  const hull = useMemo(() => makeLowerHull(1.66, 0), []);
  const cabin = useMemo(() => makeCabin(1.42, 0), []);
  useLayoutEffect(
    () => () => {
      hull.dispose();
      cabin.dispose();
    },
    [hull, cabin],
  );
  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      <mesh geometry={hull} castShadow>
        <meshStandardMaterial color={color} roughness={0.48} metalness={0.32} />
      </mesh>
      <mesh geometry={cabin}>
        <meshStandardMaterial color={color} roughness={0.48} metalness={0.32} />
      </mesh>
      <mesh position={[0, 1.0, -0.3]} rotation={[0.6, 0, 0]}>
        <boxGeometry args={[1.28, 0.5, 0.03]} />
        <meshStandardMaterial color="#14181c" metalness={0.55} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.58, -2.18]}>
        <boxGeometry args={[1.55, 0.22, 0.06]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <Kidney x={-0.15} y={0.58} z={-2.18} chrome />
      <Kidney x={0.15} y={0.58} z={-2.18} chrome />
      {([-0.68, -0.46, 0.46, 0.68] as const).map((lx) => (
        <mesh key={lx} position={[lx, 0.58, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 10]} />
          <meshStandardMaterial color={LAMP} emissive={LAMP} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {(
        [
          [-0.78, -1.28],
          [0.78, -1.28],
          [-0.78, 1.28],
          [0.78, 1.28],
        ] as const
      ).map(([wx, wz]) => (
        <mesh key={`${wx}${wz}`} position={[wx, 0.3, wz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.18, 10]} />
          <meshStandardMaterial color={RUBBER} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
