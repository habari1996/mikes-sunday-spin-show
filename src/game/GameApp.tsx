import { useEffect, useState } from "react";
import { GameCanvas, snapCamera } from "./GameCanvas";
import { Hud, MuteButton, PauseMenu, Results, StartScreen, TouchControls } from "./overlays";
import { attachInput, setQaKeys, setQaSteer } from "./input";
import { resumeAudio, setMuted, unlockAudio, blip } from "./audio";
import { resetSim, sim } from "./sim";
import { useGame } from "./store";

export function GameApp() {
  const phase = useGame((s) => s.phase);
  const muted = useGame((s) => s.muted);
  const setPhase = useGame((s) => s.setPhase);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
    const off = attachInput();
    const vis = () => {
      if (!document.hidden) resumeAudio();
    };
    document.addEventListener("visibilitychange", vis);

    window.__controlsTest = {
      getYaw: () => sim.yaw,
      getSpeed: () => Math.hypot(sim.vx, sim.vz),
      setSteer: (v: number) => setQaSteer(v),
      setKeys: (codes: string[]) => {
        setQaKeys(codes);
        if (codes.length && useGame.getState().phase === "menu") {
          start();
        }
      },
    };

    return () => {
      off();
      document.removeEventListener("visibilitychange", vis);
      delete window.__controlsTest;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  function start() {
    unlockAudio();
    resetSim(useGame.getState().carId);
    snapCamera();
    useGame.getState().setPhase("playing");
    blip("start");
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg overscroll-none touch-none select-none">
      <GameCanvas />
      <div className="pointer-events-none absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <MuteButton />
      </div>
      {phase === "menu" ? <StartScreen onStart={start} /> : null}
      {phase === "playing" ? (
        <>
          <Hud onPause={() => setPhase("paused")} />
          {coarse ? <TouchControls /> : null}
        </>
      ) : null}
      {phase === "paused" ? (
        <PauseMenu onResume={() => setPhase("playing")} onMenu={() => setPhase("menu")} />
      ) : null}
      {phase === "results" ? (
        <Results onRetry={start} onMenu={() => setPhase("menu")} />
      ) : null}
    </main>
  );
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
