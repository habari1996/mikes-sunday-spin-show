import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sky } from "@react-three/drei";
import { CROWD, LOT, PARKED } from "./sim";
import {
  makeFlexBanner,
  makeKatraBanner,
  makeKutjaSign,
  makeLotTexture,
  makeMetal,
  makeSamBanner,
  makeSignTexture,
} from "./textures";
import { ParkedCar } from "./CarModel";

function useCanvasTexture(factory: () => HTMLCanvasElement, anisotropy = 8) {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const t = new THREE.CanvasTexture(factory());
    t.anisotropy = anisotropy;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [factory, anisotropy]);
  useLayoutEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

function Floodlight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 4.2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 8.4, 8]} />
        <meshStandardMaterial color="#3a3a3c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 8.5, 0]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.9, 0.35, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <spotLight
        position={[0, 8.4, 0]}
        angle={0.55}
        penumbra={0.5}
        intensity={48}
        distance={42}
        color="#fff1d2"
        castShadow={false}
      />
    </group>
  );
}

function TireStack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.18 + i * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.11, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function LotBanner({
  map,
  position,
  width,
  height,
  rotation = 0,
}: {
  map: THREE.Texture | null;
  position: [number, number, number];
  width: number;
  height: number;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[-width / 2 - 0.1, -0.15, 0]}>
        <boxGeometry args={[0.12, height + 0.9, 0.12]} />
        <meshStandardMaterial color="#3a3a3c" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[width / 2 + 0.1, -0.15, 0]}>
        <boxGeometry args={[0.12, height + 0.9, 0.12]} />
        <meshStandardMaterial color="#3a3a3c" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={map} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Crowd() {
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const colors = useMemo(
    () => ["#c45c4a", "#7a9a68", "#efece4", "#2c3340", "#c4a574", "#1e2a4a", "#6b3d2e", "#d8d2c4"],
    [],
  );
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    CROWD.forEach((p, i) => {
      dummy.position.set(p.x, 0.72, p.z);
      dummy.scale.set(1, 1 + (i % 5) * 0.04, 1);
      dummy.updateMatrix();
      body.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x, 1.42, p.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      head.current?.setMatrixAt(i, dummy.matrix);
      color.set(colors[i % colors.length]!);
      body.current?.setColorAt(i, color);
    });
    if (body.current) {
      body.current.instanceMatrix.needsUpdate = true;
      if (body.current.instanceColor) body.current.instanceColor.needsUpdate = true;
    }
    if (head.current) head.current.instanceMatrix.needsUpdate = true;
  }, [colors]);
  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, CROWD.length]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.9, 6]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, CROWD.length]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#c4a574" />
      </instancedMesh>
    </group>
  );
}

function Traffic() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const dir = i < 3 ? 1 : -1;
      child.position.x += dir * (11 + (i % 3) * 2.2) * dt;
      if (dir > 0 && child.position.x > 90) child.position.x = -90;
      if (dir < 0 && child.position.x < -90) child.position.x = 90;
    });
  });
  const near = [
    { x: -40, color: "#2a2e32" },
    { x: -8, color: "#5a1c1c" },
    { x: 28, color: "#d0cdc4" },
  ];
  const far = [
    { x: 50, color: "#24301c" },
    { x: 12, color: "#3a3a3c" },
    { x: -30, color: "#6b3d2e" },
  ];
  return (
    <group ref={ref}>
      {near.map((c, i) => (
        <mesh key={`n${i}`} position={[c.x, 0.55, 48.8]} castShadow>
          <boxGeometry args={[4.6, 1.15, 1.85]} />
          <meshStandardMaterial color={c.color} roughness={0.5} />
        </mesh>
      ))}
      {far.map((c, i) => (
        <mesh key={`f${i}`} position={[c.x, 0.55, 58.6]} rotation={[0, Math.PI, 0]} castShadow>
          <boxGeometry args={[4.6, 1.15, 1.85]} />
          <meshStandardMaterial color={c.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function WashBays() {
  // five 3.8 m × 7.2 m bays — real hand-wash stall size
  const xs = [-8, -4, 0, 4, 8];
  return (
    <group>
      {xs.map((x) => (
        <group key={x} position={[x, 0, -25.2]}>
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[3.7, 3.1, 7.2]} />
            <meshStandardMaterial color="#1a1c1e" roughness={0.8} transparent opacity={0.14} />
          </mesh>
          <mesh position={[-1.85, 1.7, 0]}>
            <boxGeometry args={[0.14, 3.4, 7.2]} />
            <meshStandardMaterial color="#3d4348" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[1.85, 1.7, 0]}>
            <boxGeometry args={[0.14, 3.4, 7.2]} />
            <meshStandardMaterial color="#3d4348" metalness={0.3} roughness={0.6} />
          </mesh>
          {[-1.6, 0, 1.6].map((z) => (
            <mesh key={z} position={[0, 3.15, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#8a96a0" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function World() {
  const lotMap = useCanvasTexture(makeLotTexture, 8);
  const signMap = useCanvasTexture(makeSignTexture, 4);
  const metalMap = useCanvasTexture(makeMetal, 4);
  const kutjaMap = useCanvasTexture(makeKutjaSign, 4);
  const katraMap = useCanvasTexture(makeKatraBanner, 4);
  const samMap = useCanvasTexture(makeSamBanner, 4);
  const flexMap = useCanvasTexture(makeFlexBanner, 4);
  if (metalMap) {
    metalMap.wrapS = metalMap.wrapT = THREE.RepeatWrapping;
    metalMap.repeat.set(4, 2);
  }

  return (
    <>
      <color attach="background" args={["#2a1810"]} />
      <fog attach="fog" args={["#2a1810", 38, 120]} />
      <Sky
        sunPosition={[-30, 6, 40]}
        mieCoefficient={0.01}
        mieDirectionalG={0.85}
        rayleigh={0.45}
        turbidity={12}
      />
      <hemisphereLight args={["#f4d8b0", "#3a2a20", 0.95]} />
      <directionalLight
        position={[-28, 22, 36]}
        intensity={0.85}
        color="#ffd8a8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={90}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[6, 12, -28]} intensity={1.85} color="#ffe9c8" />
      <ambientLight intensity={0.32} />

      {/* laterite dirt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 8]} receiveShadow>
        <planeGeometry args={[220, 180]} />
        <meshStandardMaterial color="#6a4a32" roughness={1} />
      </mesh>
      {/* Plot 10770 tarmac — 74 × 72 m */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0, 6]} receiveShadow>
        <planeGeometry args={[74, 72]} />
        <meshStandardMaterial map={lotMap} roughness={0.92} metalness={0.04} />
      </mesh>
      {/* Kafue Road T2 — dual carriageway north of the lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 53.5]} receiveShadow>
        <planeGeometry args={[200, 19]} />
        <meshStandardMaterial color="#2b2b2e" roughness={0.9} />
      </mesh>
      {/* median */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 53.5]}>
        <planeGeometry args={[200, 2.2]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </mesh>
      {[-70, -40, -10, 20, 50, 80].map((x) => (
        <group key={x}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, 48.6]}>
            <planeGeometry args={[7, 0.16]} />
            <meshStandardMaterial color="#cfc8b4" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, 58.4]}>
            <planeGeometry args={[7, 0.16]} />
            <meshStandardMaterial color="#cfc8b4" />
          </mesh>
        </group>
      ))}

      {/* south wash hall — open bays under a roof, plant room to the east */}
      <mesh position={[12, 4.45, -25.25]} castShadow>
        <boxGeometry args={[44.4, 0.55, 10.2]} />
        <meshStandardMaterial map={metalMap} color="#7a9a68" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[12, 2.15, -29.7]} castShadow>
        <boxGeometry args={[44, 4.3, 0.8]} />
        <meshStandardMaterial color="#cfc6b4" roughness={0.82} />
      </mesh>
      <mesh position={[23, 2.15, -25.25]} castShadow>
        <boxGeometry args={[22, 4.3, 9.5]} />
        <meshStandardMaterial color="#cfc6b4" roughness={0.82} />
      </mesh>
      {/* east L-wing 10 × 30 */}
      <mesh position={[31, 2.15, -5.5]} castShadow>
        <boxGeometry args={[10, 4.3, 30]} />
        <meshStandardMaterial color="#d5cfc2" roughness={0.8} />
      </mesh>
      {/* west Kutja Works 9 × 24 */}
      <mesh position={[-33.5, 2.15, -4]} castShadow>
        <boxGeometry args={[9, 4.3, 24]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.8} />
      </mesh>
      <mesh position={[-28.95, 3.4, -4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 1.7]} />
        <meshStandardMaterial map={kutjaMap} roughness={0.5} />
      </mesh>
      <WashBays />

      {/* Mike's sign on the wash, facing the lot */}
      <mesh position={[2, 5.85, -20.35]}>
        <boxGeometry args={[14, 2.6, 0.32]} />
        <meshStandardMaterial map={signMap} roughness={0.45} />
      </mesh>

      {/* fence — north has a 14 m Kafue entrance */}
      <mesh position={[LOT.minX, 0.55, 6]}>
        <boxGeometry args={[0.18, 1.1, 72]} />
        <meshStandardMaterial color="#4a4e52" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[LOT.maxX, 0.55, 25.75]}>
        <boxGeometry args={[0.18, 1.1, 32.5]} />
        <meshStandardMaterial color="#4a4e52" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[-1, 0.55, LOT.minZ]}>
        <boxGeometry args={[74, 1.1, 0.18]} />
        <meshStandardMaterial color="#4a4e52" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[-22.5, 0.55, LOT.maxZ]}>
        <boxGeometry args={[31, 1.1, 0.18]} />
        <meshStandardMaterial color="#4a4e52" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[21.5, 0.55, LOT.maxZ]}>
        <boxGeometry args={[29, 1.1, 0.18]} />
        <meshStandardMaterial color="#4a4e52" metalness={0.4} roughness={0.45} />
      </mesh>

      <LotBanner map={flexMap} position={[0, 3.45, LOT.maxZ + 0.12]} width={12} height={1.5} rotation={Math.PI} />
      <LotBanner map={katraMap} position={[LOT.minX + 0.2, 2.35, 10]} width={8.4} height={1.45} rotation={Math.PI / 2} />
      <LotBanner map={samMap} position={[LOT.maxX - 0.2, 2.35, 22]} width={8.4} height={1.45} rotation={-Math.PI / 2} />

      {/* vacuum islands */}
      {([-18.2, 14.2] as const).map((x) => (
        <group key={x} position={[x, 0, 17.8]}>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <boxGeometry args={[4, 0.4, 3.6]} />
            <meshStandardMaterial color="#3a3a3c" />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 2.4, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 2.55, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.5]} />
            <meshStandardMaterial color="#7a9a68" />
          </mesh>
        </group>
      ))}

      <TireStack position={[-22, 0, 36]} />
      <TireStack position={[20, 0, 36]} />
      <TireStack position={[-22, 0, -17]} />
      <TireStack position={[20, 0, -17]} />

      {/* pit stall on the east apron */}
      <group position={[31, 0, 14]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[4.2, 2.2, 3]} />
          <meshStandardMaterial color="#5a3d2e" />
        </mesh>
        <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[4.8, 0.12, 3.4]} />
          <meshStandardMaterial color="#7a9a68" />
        </mesh>
        <mesh position={[0, 1.55, 1.52]}>
          <planeGeometry args={[3.6, 0.7]} />
          <meshStandardMaterial map={kutjaMap} roughness={0.5} />
        </mesh>
      </group>

      {/* speakers at the wash */}
      <mesh position={[-12, 1.2, -19.2]} castShadow>
        <boxGeometry args={[1.1, 2.4, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-10.4, 1.2, -19.2]} castShadow>
        <boxGeometry args={[1.1, 2.4, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {PARKED.map((p, i) => (
        <ParkedCar key={i} {...p} />
      ))}
      <Crowd />
      <Traffic />

      <Floodlight position={[-36, 0, 38]} />
      <Floodlight position={[32, 0, 38]} />
      <Floodlight position={[-36, 0, -16]} />
      <Floodlight position={[32, 0, -16]} />

      {/* acacia-ish trees */}
      {([-62, -50, 52, 64] as const).map((x, i) => (
        <group key={x} position={[x, 0, -6 + (i % 2) * 22]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.22, 0.32, 2.8, 6]} />
            <meshStandardMaterial color="#3a2a1c" />
          </mesh>
          <mesh position={[0, 3.4, 0]}>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshStandardMaterial color="#3d5a32" />
          </mesh>
        </group>
      ))}
    </>
  );
}
