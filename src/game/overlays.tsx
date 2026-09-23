import type { PointerEvent } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { CARS, type CarId } from "./sim";
import { touch } from "./input";
import { useGame } from "./store";
import { cn } from "@/lib/utils";

function formatTime(t: number) {
  const s = Math.max(0, t);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatScore(n: number) {
  return Math.floor(n).toLocaleString("en-US");
}

export function MuteButton() {
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute" : "Mute"}
      className="pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg"
    >
      {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
    </button>
  );
}

export function StartScreen({ onStart }: { onStart: () => void }) {
  const carId = useGame((s) => s.carId);
  const setCar = useGame((s) => s.setCar);
  const best = useGame((s) => s.best);
  const help = useGame((s) => s.help);
  const setHelp = useGame((s) => s.setHelp);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end lot-veil p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
      <div className="pointer-events-auto mx-auto w-full max-w-lg">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Plot 10770 · Kafue Road · Lusaka
        </p>
        <h1 className="font-display text-6xl leading-none text-fg sm:text-7xl">MIKE'S</h1>
        <p className="mt-1 text-lg text-dust">Sunday Spin Show</p>
        <p className="mt-1 text-xs font-medium tracking-[0.22em] text-dust uppercase">
          Spin · Flex · Repeat
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Ninety seconds on the lot. King Katra from Kutja Works, Sam Sam, or Wababa.
          Hold a slide, cook a donut, don't kiss the crowd. Best {formatScore(best)}.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {(Object.keys(CARS) as CarId[]).map((id) => {
            const car = CARS[id];
            const on = id === carId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCar(id)}
                className={cn(
                  "rounded-lg border px-3 py-3 text-left transition-colors duration-150",
                  on
                    ? "border-accent bg-surface-2 text-fg"
                    : "border-border bg-surface/80 text-muted",
                )}
              >
                <span
                  className="mb-2 block h-2 w-8 rounded-full border border-border"
                  style={{ background: car.color }}
                />
                <span className="block text-sm font-semibold text-fg">{car.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{car.tag}</span>
                <span className="mt-1 block font-mono text-[0.65rem] tracking-wider text-dust">
                  {car.plate}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="h-12 flex-1 rounded-lg bg-fg px-6 text-sm font-semibold text-accent-fg transition-transform duration-150 active:scale-[0.98]"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setHelp(!help)}
            className="h-12 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-fg"
          >
            How it drives
          </button>
          <a
            href="/downloads/mikes-spin-show-source.zip"
            download="mikes-spin-show-source.zip"
            className="flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-medium text-fg"
          >
            Download source
          </a>
        </div>

        {help ? (
          <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-muted">
            <p>
              <span className="text-fg">W / ↑</span> gas · <span className="text-fg">S / ↓</span> brake
              · <span className="text-fg">A / D</span> steer · <span className="text-fg">Space</span>{" "}
              handbrake. Stick + spin on a pad. On a phone, drag left to drive, hold Spin.
            </p>
            <p className="mt-2">
              The tarmac is Plot 10770: seventy-four metres along Kafue, seventy-two deep,
              five 3.8 m wash bays at the back. Tight donuts hit{" "}
              <span className="text-fg">Kutja Works</span> and{" "}
              <span className="text-fg">Katra</span>. Slide, lift, then spin again for{" "}
              <span className="text-fg">Spin Flex Repeat</span>. A long lot drift is a{" "}
              <span className="text-fg">Sam Sam lap</span>. Five clean spins:{" "}
              <span className="text-fg">Wababa</span>.
            </p>
            <p className="mt-2 text-xs">
              Car mesh after Mike Pan, CC-BY.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Hud({ onPause }: { onPause: () => void }) {
  const hud = useGame((s) => s.hud);
  return (
    <div className="pointer-events-none absolute inset-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-border bg-glass px-3 py-2">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase">Score</p>
          <p className="font-mono text-xl tabular-nums text-fg">{formatScore(hud.score)}</p>
        </div>
        <div className="rounded-lg border border-border bg-glass px-3 py-2 text-center">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase">Time</p>
          <p className="font-mono text-xl tabular-nums text-fg">{formatTime(hud.time)}</p>
        </div>
        <button
          type="button"
          onClick={onPause}
          aria-label="Pause"
          className="pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg"
        >
          <Pause className="size-5" />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="rounded-lg border border-border bg-glass px-3 py-2">
          <p className="font-mono text-2xl tabular-nums text-fg">{Math.round(hud.speed)}</p>
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase">km/h</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {hud.combo > 1.15 ? (
            <p className="rounded-md bg-accent px-2 py-1 font-mono text-sm font-semibold text-accent-fg tabular-nums">
              x{hud.combo.toFixed(1)}
            </p>
          ) : null}
          <p className="rounded-md border border-border bg-glass px-2 py-1 font-mono text-xs text-muted tabular-nums">
            {hud.spins} spins
          </p>
        </div>
      </div>

      <div className="absolute top-1/3 left-1/2 w-full -translate-x-1/2 text-center">
        {hud.message ? (
          <p className="font-display text-5xl tracking-wide text-fg drop-shadow-md">{hud.message}</p>
        ) : hud.drifting ? (
          <p className="font-display text-3xl tracking-[0.2em] text-dust">SLIDE</p>
        ) : null}
      </div>

      <div className="absolute bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] left-4 right-4 sm:bottom-8 sm:left-8 sm:right-auto sm:w-48">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, hud.rpm * 100)}%` }}
          />
        </div>
        <p className="mt-1 font-mono text-[0.65rem] tracking-[0.18em] text-faint uppercase">Rpm</p>
      </div>
    </div>
  );
}

export function PauseMenu({ onResume, onMenu }: { onResume: () => void; onMenu: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/70 p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-4xl text-fg">Paused</h2>
        <p className="mt-1 text-sm text-muted">The lot is still loud out there.</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-fg text-sm font-semibold text-accent-fg"
          >
            <Play className="size-4" /> Resume
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="h-12 rounded-lg border border-border text-sm font-medium text-fg"
          >
            Leave the lot
          </button>
        </div>
      </div>
    </div>
  );
}

export function Results({ onRetry, onMenu }: { onRetry: () => void; onMenu: () => void }) {
  const score = useGame((s) => s.lastScore);
  const spins = useGame((s) => s.lastSpins);
  const combo = useGame((s) => s.lastMaxCombo);
  const drift = useGame((s) => s.lastDrift);
  const best = useGame((s) => s.best);
  const newBest = useGame((s) => s.newBest);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end lot-veil p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          {newBest ? "New best on Kafue" : "Session over"}
        </p>
        <h2 className="font-display text-5xl text-fg">{formatScore(score)}</h2>
        <p className="mt-1 text-xs font-medium tracking-[0.22em] text-dust uppercase">
          Spin · Flex · Repeat
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-surface-2 px-2 py-3">
            <dt className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">Spins</dt>
            <dd className="font-mono text-lg text-fg tabular-nums">{spins}</dd>
          </div>
          <div className="rounded-md bg-surface-2 px-2 py-3">
            <dt className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">Combo</dt>
            <dd className="font-mono text-lg text-fg tabular-nums">x{combo.toFixed(1)}</dd>
          </div>
          <div className="rounded-md bg-surface-2 px-2 py-3">
            <dt className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">Slide</dt>
            <dd className="font-mono text-lg text-fg tabular-nums">{drift.toFixed(1)}s</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Best {formatScore(best)}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="h-12 flex-1 rounded-lg bg-fg text-sm font-semibold text-accent-fg"
          >
            Spin again
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="h-12 flex-1 rounded-lg border border-border text-sm font-medium text-fg"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export function TouchControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
      <Stick />
      <button
        type="button"
        aria-label="Handbrake spin"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
          touch.handbrake = true;
        }}
        onPointerUp={() => {
          touch.handbrake = false;
        }}
        onPointerCancel={() => {
          touch.handbrake = false;
        }}
        className="pointer-events-auto mb-2 grid size-20 place-items-center rounded-full border border-danger/40 bg-danger/85 text-xs font-semibold tracking-[0.14em] text-fg uppercase"
      >
        Spin
      </button>
    </div>
  );
}

function Stick() {
  const wrap = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const m = Math.hypot(dx, dy);
    const s = m > 1 ? 1 / m : 1;
    touch.steer = Math.max(-1, Math.min(1, -dx * s));
    touch.throttle = Math.max(-1, Math.min(1, -dy * s));
    touch.active = true;
  };
  const clear = () => {
    touch.steer = 0;
    touch.throttle = 0;
    touch.active = false;
  };
  return (
    <div
      className="pointer-events-auto size-36 rounded-full border border-border bg-surface/50"
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        wrap(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) wrap(e);
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
    >
      <div className="m-auto mt-14 size-8 rounded-full border border-muted/40 bg-fg/80" />
    </div>
  );
}
