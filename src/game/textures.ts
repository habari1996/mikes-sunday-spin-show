function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d");
  return { c, ctx };
}

export function makeLotTexture() {
  const { c, ctx } = canvas(2048);
  const rand = rng(360);
  ctx.fillStyle = "#2a2a2c";
  ctx.fillRect(0, 0, 2048, 2048);

  const img = ctx.getImageData(0, 0, 2048, 2048);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 28;
    d[i] = 42 + n;
    d[i + 1] = 41 + n * 0.9;
    d[i + 2] = 40 + n * 0.7;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // laterite dust around edges
  const edge = ctx.createRadialGradient(1024, 1024, 420, 1024, 1024, 1100);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(122, 78, 42, 0.38)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 2048, 2048);

  // circular burnout scars — the Mike's signature
  ctx.save();
  ctx.translate(1024, 980);
  for (let ring = 0; ring < 7; ring++) {
    ctx.beginPath();
    const rad = 90 + ring * 42 + rand() * 10;
    ctx.strokeStyle = `rgba(8,8,8,${0.22 + rand() * 0.18})`;
    ctx.lineWidth = 10 + rand() * 14;
    ctx.ellipse(rand() * 18, rand() * 16, rad, rad * (0.88 + rand() * 0.1), rand() * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(243,239,230,0.16)";
  ctx.font = "700 42px Barlow, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SPIN  FLEX  REPEAT", 0, 6);
  ctx.restore();

  // oil stains
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(12,12,14,${0.08 + rand() * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(200 + rand() * 1640, 200 + rand() * 1640, 40 + rand() * 90, 18 + rand() * 40, rand() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // five wash-bay footprints at the south end (top of texture = -Z)
  ctx.strokeStyle = "rgba(230,226,214,0.18)";
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const x = 640 + i * 95;
    ctx.strokeRect(x, 70, 80, 200);
  }

  // cracks
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    let x = rand() * 2048;
    let y = rand() * 2048;
    ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (rand() - 0.5) * 80;
      y += (rand() - 0.4) * 70;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return c;
}

export function makeSignTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#141210";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = "#7a9a68";
  ctx.fillRect(0, 0, 18, 256);
  ctx.fillRect(1006, 0, 18, 256);
  ctx.fillStyle = "#f3efe6";
  ctx.font = "700 120px Barlow, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MIKE'S", 512, 100);
  ctx.font = "600 36px Barlow, sans-serif";
  ctx.fillStyle = "#9a9388";
  ctx.fillText("CAR WASH  ·  KAFUE ROAD", 512, 186);
  return c;
}

export function makeBanner(
  title: string,
  sub = "",
  accent = "#7a9a68",
  bg = "#141210",
  ink = "#f3efe6",
) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 16, 256);
  ctx.fillRect(1008, 0, 16, 256);
  ctx.fillRect(0, 0, 1024, 10);
  ctx.fillRect(0, 246, 1024, 10);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = title.length > 16 ? 68 : title.length > 11 ? 88 : 112;
  ctx.font = `700 ${size}px Barlow, sans-serif`;
  ctx.fillText(title, 512, sub ? 102 : 128);
  if (sub) {
    ctx.font = "600 30px Barlow, sans-serif";
    ctx.fillStyle = accent;
    ctx.fillText(sub, 512, 184);
  }
  return c;
}

export function makeKutjaSign() {
  return makeBanner("KUTJA WORKS", "SPIN SHOP  ·  LUSAKA", "#c4a574");
}

export function makeKatraBanner() {
  return makeBanner("KING KATRA", "PRECISION  ·  TIGHT SPINS", "#7a9a68");
}

export function makeSamBanner() {
  return makeBanner("SAM SAM", "MIKE'S LOT LEGEND", "#1c1e1a", "#efece4", "#141210");
}

export function makeFlexBanner() {
  return makeBanner("SPIN  FLEX  REPEAT", "WABABA", "#c4a574");
}

export function makePlate(text: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 80;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d9d4c8";
  ctx.fillRect(0, 0, 256, 80);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 74);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 32px Barlow, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 42);
  return c;
}

export function makeMetal() {
  const { c, ctx } = canvas(256);
  const rand = rng(19);
  ctx.fillStyle = "#3a3e42";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? "#4a5054" : "#32363a";
    ctx.fillRect(0, y, 256, 4);
    ctx.fillStyle = `rgba(255,255,255,${0.03 + rand() * 0.04})`;
    ctx.fillRect(0, y + 1, 256, 1);
  }
  return c;
}
