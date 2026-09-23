type AudioGraph = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  engine: OscillatorNode;
  engine2: OscillatorNode;
  engineGain: GainNode;
  engineFilter: BiquadFilterNode;
  noise: AudioBufferSourceNode;
  screech: GainNode;
  screechFilter: BiquadFilterNode;
};

let graph: AudioGraph | null = null;
let muted = false;

function makeNoiseBuffer(ctx: AudioContext) {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function unlockAudio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!graph) {
    const ctx = new AC({ latencyHint: "interactive" });
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    const sfx = ctx.createGain();
    sfx.connect(master);

    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 380;
    const engineGain = ctx.createGain();
    engineGain.gain.value = 0.0001;
    engineFilter.connect(engineGain);
    engineGain.connect(sfx);

    const engine = ctx.createOscillator();
    engine.type = "sawtooth";
    engine.frequency.value = 48;
    engine.connect(engineFilter);
    const engine2 = ctx.createOscillator();
    engine2.type = "square";
    engine2.frequency.value = 51;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    engine2.connect(g2);
    g2.connect(engineFilter);
    engine.start();
    engine2.start();

    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;
    const screechFilter = ctx.createBiquadFilter();
    screechFilter.type = "bandpass";
    screechFilter.frequency.value = 1400;
    screechFilter.Q.value = 1.2;
    const screech = ctx.createGain();
    screech.gain.value = 0.0001;
    noise.connect(screechFilter);
    screechFilter.connect(screech);
    screech.connect(sfx);
    noise.start();

    graph = { ctx, master, sfx, engine, engine2, engineGain, engineFilter, noise, screech, screechFilter };
  }
  if (graph.ctx.state === "suspended") void graph.ctx.resume();
}

export function setMuted(v: boolean) {
  muted = v;
  if (graph) {
    graph.master.gain.setTargetAtTime(v ? 0 : 0.55, graph.ctx.currentTime, 0.04);
  }
}

export function isMuted() {
  return muted;
}

export function resumeAudio() {
  if (graph?.ctx.state === "suspended") void graph.ctx.resume();
}

export function updateAudio(rpm: number, slip: number, throttle: number, playing: boolean) {
  if (!graph) return;
  const t = graph.ctx.currentTime;
  if (!playing) {
    graph.engineGain.gain.setTargetAtTime(0.0001, t, 0.08);
    graph.screech.gain.setTargetAtTime(0.0001, t, 0.08);
    return;
  }
  const freq = 46 + rpm * 220;
  graph.engine.frequency.setTargetAtTime(freq, t, 0.04);
  graph.engine2.frequency.setTargetAtTime(freq * 1.04, t, 0.04);
  graph.engineFilter.frequency.setTargetAtTime(280 + rpm * 900, t, 0.05);
  const eng = 0.012 + rpm * 0.045 + Math.max(0, throttle) * 0.02;
  graph.engineGain.gain.setTargetAtTime(eng, t, 0.05);
  const sc = Math.min(0.09, Math.max(0, slip - 0.15) * 0.12);
  graph.screech.gain.setTargetAtTime(sc, t, 0.04);
}

export function blip(kind: "spin" | "start" | "end") {
  if (!graph || muted) return;
  const ctx = graph.ctx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = kind === "spin" ? "triangle" : "square";
  o.frequency.value = kind === "spin" ? 520 : kind === "start" ? 180 : 90;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(graph.sfx);
  const t = ctx.currentTime;
  g.gain.setTargetAtTime(kind === "end" ? 0.05 : 0.035, t, 0.01);
  g.gain.setTargetAtTime(0.0001, t + (kind === "end" ? 0.4 : 0.12), 0.05);
  o.start(t);
  o.stop(t + 0.5);
}
