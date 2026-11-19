/* llmradar — app logic (classic script; needs data.js loaded first) */
"use strict";

/* ===== Icons (Lucide 1.75, ISC license — see assets/LICENSE-lucide.txt; inlined, no runtime fetch) ===== */
const ICONS = {
  cpu: '<path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  "memory-stick": '<path d="M12 12v-2"/><path d="M12 18v-2"/><path d="M16 12v-2"/><path d="M16 18v-2"/><path d="M2 11h1.5"/><path d="M20 18v-2"/><path d="M20.5 11H22"/><path d="M4 18v-2"/><path d="M8 12v-2"/><path d="M8 18v-2"/><rect x="2" y="6" width="20" height="10" rx="2"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  microchip: '<path d="M10 12h4"/><path d="M10 17h4"/><path d="M10 7h4"/><path d="M18 12h2"/><path d="M18 18h2"/><path d="M18 6h2"/><path d="M4 12h2"/><path d="M4 18h2"/><path d="M4 6h2"/><rect x="6" y="2" width="12" height="20" rx="2"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  "sliders-horizontal": '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  "chart-bar": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
function icon(name, size) {
  size = size || 18;
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

const state = { quant: "Q4_K_M", ctx: 8192, onlyFit: false, sort: "size", minTps: 0, source: "curated", hfModels: [], hfLoaded: false };

/* ===== Small helpers ===== */
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const num = (x, d) => { x = Number(x); return Number.isFinite(x) ? x : d; };
const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);

/* Chip name from the renderer string ("ANGLE Metal Renderer: Apple M4 Pro", "Apple A18 Pro").
   Safari only says "Apple GPU"; Firefox reports every Apple Silicon Mac as "Apple M1, or similar" → treat both as unknown. */
function parseAppleChip(renderer) {
  if (/or similar/i.test(renderer || "")) return null;
  const m = (renderer || "").match(/Apple\s+([MA]\d+)(?:\s+(Pro|Max|Ultra))?\b/i);
  if (!m) return null;
  return m[1].toUpperCase() + (m[2] ? " " + m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() : "");
}
/* Spec for chip + CPU cores + RAM. Variants with the same core count (bin.alt) are told apart by their RAM options. */
const APPLE_GENERIC_RAM = [8, 16, 24, 32, 48, 64, 96, 128];
function appleSpec(key, cores, ram) {
  const chip = key && has(APPLE_CHIPS, key) ? APPLE_CHIPS[key] : null;
  if (!chip) return { ram: APPLE_GENERIC_RAM, tiers: null, gpu: null, bw: null };
  const counts = cores && has(chip.bins, cores) ? [cores] : Object.keys(chip.bins).map(Number).sort((a, b) => b - a);
  const variants = [];
  counts.forEach(c => { const b = chip.bins[c]; variants.push(b); if (b.alt) variants.push(Object.assign({}, b, b.alt)); });
  const v = variants.find(x => (x.ram || chip.ram).includes(ram)) || variants[0];
  const bw = chip.bwByRam && has(chip.bwByRam, ram) ? chip.bwByRam[ram] : v.bw;
  // Known bin → only the RAM sizes that bin (and its alt variant) ships with; unknown bin → every option of the chip
  const ramOpts = counts.length === 1
    ? [...new Set(variants.flatMap(x => x.ram || chip.ram))].sort((a, b) => a - b)
    : chip.ram;
  return { ram: ramOpts, tiers: { s: v.s, p: v.p, e: v.e }, gpu: v.gpu, bw };
}
function applyAppleSpec(h) {
  h = h || HW;
  // Safari caps hardwareConcurrency at 8, so core counts only pick the bin when the chip was actually detected
  const sp = appleSpec(h.chip, h.chipHidden ? null : h.cores, h.ram);
  h.ramOptions = sp.ram; h.tiers = sp.tiers; h.gpuCores = sp.gpu; h.bandwidth = sp.bw;
  if (h.chipHidden) h.cores = h.tiers ? (h.tiers.s || 0) + (h.tiers.p || 0) + (h.tiers.e || 0) : null;   // picked chip → its real core count
}
/* Safari / Firefox hide the chip and RAM: remember what the user picked so they only pick once */
const APPLE_PICK_KEY = "llmradar-apple";
function saveApplePick() {
  if (!HW.apple || !HW.chipHidden || !HW.chip) return;
  try { localStorage.setItem(APPLE_PICK_KEY, JSON.stringify({ chip: HW.chip, ram: HW.ram })); } catch (e) {}
}
function loadApplePick() {
  try {
    const p = JSON.parse(localStorage.getItem(APPLE_PICK_KEY) || "null");
    if (p && typeof p.chip === "string" && has(APPLE_CHIPS, p.chip)) return { chip: p.chip, ram: num(p.ram, 0) };
  } catch (e) {}
  return null;
}

const HW_DEFAULTS = {
  cores: null, cpuConf: "measured", ram: null, ramConf: "estimated", vram: null, vramConf: "estimated",
  unified: false, gpuName: "Unknown", gpuApprox: false, platform: "",
  apple: false, chip: null, chipHidden: false, socName: null, tiers: null,
  gpuCores: null, bandwidth: null, gpuBandwidth: null, ramOptions: null,
  vramSaved: 0, vramSavedConf: "estimated",   // dedicated-VRAM value restored when "Unified Memory" is unchecked
  dgpuHint: false,                            // WebGPU saw a discrete GPU we couldn't identify (hybrid laptop) → ask for its VRAM
};
const HW = Object.assign({}, HW_DEFAULTS);

/* GPU vendor from a WebGL renderer string / a WebGPU adapter vendor ("nvidia", "amd", "0x10de" …) */
function rendererVendor(s) {
  s = String(s || "").toLowerCase();
  if (/nvidia|geforce|quadro|\brtx\b/.test(s)) return "nvidia";
  if (/\bamd\b|radeon|\bati\b/.test(s)) return "amd";
  if (/intel|iris|\buhd\b/.test(s)) return "intel";
  if (/apple/.test(s)) return "apple";
  if (/qualcomm|adreno/.test(s)) return "qualcomm";
  return "";
}
function adapterVendor(v) {
  v = String(v || "").toLowerCase().trim();
  if (v === "0x10de" || /nvidia/.test(v)) return "nvidia";
  if (v === "0x1002" || v === "0x1022" || /\bamd\b|\bati\b|advanced micro/.test(v)) return "amd";
  if (v === "0x8086" || /intel/.test(v)) return "intel";
  return v;
}
const VENDOR_LABEL = { nvidia: "NVIDIA", amd: "AMD" };
const inTable = (table, s) => table.some(([re]) => re.test(s));

/* ===== Hardware detection ===== */
async function detectHardware() {
  // Detect into a local object and apply it at the end: HW keeps the previous scan while WebGPU is awaited,
  // so controls changed mid-scan still render (re-scan still starts clean: no chip / bandwidth / RAM presets left over)
  const hw = Object.assign({}, HW_DEFAULTS);
  const hc = num(navigator.hardwareConcurrency, 0);
  hw.cores = hc > 0 ? Math.round(hc) : null;
  // userAgentData.platform is more accurate than navigator.platform (which says "MacIntel" on Apple Silicon)
  hw.platform = String((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "");
  if (/^mac/i.test(hw.platform)) hw.platform = "macOS";

  let renderer = "";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
      if (!renderer) renderer = String(gl.getParameter(gl.RENDERER) || "");
    }
  } catch (e) {}
  const webgl = renderer.trim();

  // WebGPU: request the high-performance adapter so dedicated GPUs win over an iGPU on laptops (time-boxed: some drivers never resolve)
  let gpuDesc = "", gpuVendor = "";
  try {
    if (navigator.gpu) {
      const adapter = await withTimeout(navigator.gpu.requestAdapter({ powerPreference: "high-performance" }), 2000);
      if (adapter) {
        let info = adapter.info;
        if (!info && adapter.requestAdapterInfo) { try { info = await withTimeout(adapter.requestAdapterInfo(), 2000); } catch (e) {} }
        if (info) {
          gpuDesc = String(info.description || "").trim().slice(0, 160);
          gpuVendor = adapterVendor(info.vendor);
          const desc = String(info.description || info.device || info.architecture || "");
          if (desc && (!renderer || renderer.length < 4)) renderer = desc;
        }
      }
    }
  } catch (e) {}

  // Hybrid laptops: WebGL often reports the iGPU while the high-performance adapter is the dGPU
  const descL = gpuDesc.toLowerCase(), webglL = webgl.toLowerCase();
  if (gpuDesc && !/apple/.test(descL) && !inTable(UNIFIED, descL) && inTable(GPUS, descL)) {
    renderer = gpuDesc;   // known dGPU → use it
  } else if ((gpuVendor === "nvidia" || gpuVendor === "amd") && webgl && !inTable(GPUS, webglL)) {
    // Unknown dGPU, or Chrome left the description empty: a different vendor (or a different, non-unified device) than WebGL's
    const otherDevice = gpuDesc && !inTable(UNIFIED, descL) && !webglL.includes(descL);
    if (rendererVendor(webgl) !== gpuVendor || otherDevice) hw.dgpuHint = true;
  }

  renderer = renderer.trim().slice(0, 160);
  hw.gpuName = renderer || "Not detectable";

  const lower = renderer.toLowerCase();
  const isApple = /apple/.test(lower);
  const soc = isApple || hw.dgpuHint ? null : UNIFIED.find(([re]) => re.test(lower));
  const isIntegrated = /(intel|iris|uhd|hd graphics|radeon(\(tm\))?\s*graphics|adreno|mali|integrated)/.test(lower)
    && !/(\brx\s*\d|radeon pro|arc(\(tm\))?\s*(pro\s*)?[ab]\d{3})/.test(lower);
  hw.gpuApprox = /or similar/.test(lower);   // Firefox buckets GPUs into representative models
  const dm = Math.max(0, num(navigator.deviceMemory, 0)) || null;

  if (isApple) {
    hw.unified = true; hw.apple = true;
    hw.chip = parseAppleChip(renderer);
    hw.chipHidden = !hw.chip;
    // Safari caps hardwareConcurrency at 8 and hides chip + RAM: no real core count until a chip is picked
    const pick = hw.chipHidden ? loadApplePick() : null;
    if (hw.chipHidden) { hw.chip = pick && pick.chip; hw.cpuConf = hw.chip ? "manual" : "estimated"; }
    hw.gpuName = hw.chip ? "Apple " + hw.chip : "Apple Silicon (chip hidden by the browser)";
    applyAppleSpec(hw);
    // RAM is not readable; reuse the last pick, else the chip's lowest config, but trust deviceMemory if it matches an option
    const known = hw.chip && has(APPLE_CHIPS, hw.chip);
    if (pick && hw.ramOptions.includes(pick.ram)) { hw.ram = pick.ram; hw.ramConf = "manual"; }
    else hw.ram = dm && hw.ramOptions.includes(dm) ? dm : known ? hw.ramOptions[0] : 16;
    applyAppleSpec(hw);
    hw.vram = hw.ram; hw.vramSaved = 0;   // no dedicated VRAM behind Apple's unified memory
  } else if (soc) {
    const s = soc[1];
    hw.unified = true; hw.socName = s.name; hw.gpuName = s.name; hw.bandwidth = s.bw; hw.ramOptions = s.ram;
    const inName = renderer.match(/\((\d+)\s*GB\)/i);   // Lunar Lake reports its RAM: "Arc(TM) 140V GPU (16GB)"
    if (inName && s.ram.includes(+inName[1])) { hw.ram = +inName[1]; hw.ramConf = "measured"; }
    else hw.ram = dm && s.ram.includes(dm) ? dm : s.ram[0];
    hw.vram = hw.ram; hw.vramSaved = 0;
  } else {
    hw.ram = dm || 8;
    hw.ramConf = dm ? (dm >= 8 ? "estimated" : "measured") : "estimated";
    let v = 0, bw = null, found = false;
    for (const [re, gb, b] of GPUS) { if (re.test(lower)) { v = gb; bw = b; found = true; break; } }
    if (found) { hw.vram = v; hw.gpuBandwidth = bw; hw.vramConf = "estimated"; }
    else if (hw.dgpuHint) { hw.vram = 0; hw.vramConf = "estimated"; hw.gpuName = gpuDesc || `${VENDOR_LABEL[gpuVendor]} GPU (model hidden by the browser)`; }
    else if (isIntegrated) { hw.vram = 0; hw.vramConf = "estimated"; if (renderer) hw.gpuName = renderer + " (integrated)"; }
    else { hw.vram = 0; hw.vramConf = "estimated"; }
    hw.vramSaved = hw.vram;
  }
  Object.assign(HW, HW_DEFAULTS, hw);
}

/* ===== Memory requirement incl. KV cache ===== */
function kvCacheGB(model, ctxTokens) {
  const p = model.active ? Math.min(model.params, model.active * 3) : model.params;
  return 5.5e-5 * Math.pow(p, 0.42) * ctxTokens;
}
function requiredGB(model, quantKey, ctxTokens) {
  const modelGB = model.params * QUANTS[quantKey].bpw / 8;
  const kv = kvCacheGB(model, ctxTokens);
  const runtime = modelGB * 0.06 + 0.5;
  return modelGB + kv + runtime;
}
function evaluate(model) {
  // Context is capped at the model's native window (HF models have no entry → slider value)
  const nat = model.source !== "hf" && has(NATIVE_CTX, model.name) ? num(NATIVE_CTX[model.name], 0) : 0;
  const ctx = nat > 0 ? Math.min(state.ctx, nat) : state.ctx, capped = ctx < state.ctx;
  const need = requiredGB(model, state.quant, ctx);
  const active = model.active || model.params;
  let fit;
  if (HW.unified) {
    const usable = HW.ram * 0.72;
    if (need <= usable) fit = "gpu";
    else if (need <= HW.ram * 0.9) fit = "tight";
    else fit = "no";
  } else {
    const vramUsable = HW.vram * 0.9;
    const ramUsable = HW.ram * 0.7;
    if (HW.vram > 0 && need <= vramUsable) fit = "gpu";
    else if (HW.vram >= 2 && need <= vramUsable + ramUsable) fit = "offload";
    else if (need <= ramUsable) fit = "cpu";
    else fit = "no";
  }
  return { need, fit, active, ctx, capped };
}
function statusLabel(fit) {
  switch (fit) {
    case "gpu":     return HW.unified ? (HW.apple ? "Runs on the GPU (Metal)" : "Runs on the GPU (unified memory)") : "Runs smoothly on the GPU";
    case "cpu":     return "Runs on the CPU";
    case "offload": return "GPU + RAM (offload)";
    case "tight":   return "Tight — might work";
    default:        return "Too large for this system";
  }
}
function speedLabel(fit, active) {
  if (fit === "gpu")     return active <= 9 ? "fast" : active <= 32 ? "usable" : "sluggish";
  if (fit === "cpu")     return active <= 3 ? "usable" : active <= 8 ? "slow" : "very slow";
  if (fit === "offload") return "slow";
  if (fit === "tight")   return "borderline";
  return "—";
}
/* Rough decode speed from memory bandwidth: tok/s ≈ efficiency × BW ÷ (active weights read per token) */
function estimateTokps(model, fit) {
  let bw = null, eff = 0.65;
  if (HW.unified && (fit === "gpu" || fit === "tight")) { bw = HW.bandwidth || (HW.apple ? null : CPU_BW); eff = 0.62; }   // unknown iGPU: system-RAM bandwidth
  else if (fit === "gpu") { bw = HW.gpuBandwidth; eff = 0.72; }
  else if (fit === "cpu") { bw = CPU_BW; eff = 0.45; }
  if (!bw) return null;
  const activeBytesGB = (model.active || model.params) * QUANTS[state.quant].bpw / 8;
  const t = eff * bw / activeBytesGB;
  if (!isFinite(t) || t <= 0) return null;
  return t >= 100 ? Math.round(t / 5) * 5 : t >= 10 ? Math.round(t) : +t.toFixed(1);
}
const speedClass = t => t == null ? "" : t < 5 ? "sp-1" : t < 15 ? "sp-2" : t < 30 ? "sp-3" : "sp-4";
function speedHTML(model, fit, active) {
  if (fit === "no") return `<span class="speed-tag"></span>`;
  const t = estimateTokps(model, fit);
  const label = t != null ? `~${t} tok/s` : speedLabel(fit, active);
  return `<span class="speed-tag ${speedClass(t)}">${icon("gauge",13)} ${label}</span>`;
}

/* ===== Commands =====
   These are pasted into a shell, so every argument must be a plain token: HF ids must match HF_ID_RE,
   curated tags SAFE_ARG (no spaces, quotes, $, `, ;, |, & …). Anything else gets no command (per tool: null). */
const HF_ID_RE = /^(?!.*\.\.)[A-Za-z0-9][\w.-]*\/[\w.-]+$/;
const SAFE_ARG = /^[A-Za-z0-9][\w.:\/@-]*$/;
const quantTag = q => has(GGUF_QUANT_TAG, q) ? GGUF_QUANT_TAG[q] : q;
function commandsFor(m) {
  const tag = quantTag(state.quant);
  if (!SAFE_ARG.test(tag)) return null;
  if (m.source === "hf") return typeof m.hf === "string" && HF_ID_RE.test(m.hf)
    ? { ollama: `ollama run hf.co/${m.hf}:${tag}`, lms: `lms get https://huggingface.co/${m.hf}@${tag}`, ollamaDefault: false } : null;
  const ok = s => typeof s === "string" && SAFE_ARG.test(s);
  // Curated: null = no package on that tool. Ollama tags pull the library's default build, which ignores the selected quant
  return { ollama: ok(m.ollama) ? `ollama run ${m.ollama}` : null, lms: ok(m.lms) ? `lms get ${m.lms}@${tag.toLowerCase()}` : null, ollamaDefault: true };
}

/* ===== Utils ===== */
function fmtGB(x) { return (x < 10 ? x.toFixed(1) : Math.round(x)) + " GB"; }
function fmtCtx(t) { return t >= 1048576 ? +(t / 1048576).toFixed(1) + "M" : Math.round(t / 1024) + "K"; }   // 202752 → "198K", 1048576 → "1M"
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function fmtDownloads(n) { n = num(n, 0); if (n <= 0) return ""; if (n >= 1e6) return (n/1e6).toFixed(1)+"M"; if (n >= 1e3) return Math.round(n/1e3)+"k"; return String(Math.round(n)); }
function hfModelURL(id) { return "https://huggingface.co/" + String(id).split("/").map(encodeURIComponent).join("/"); }
function legacyCopy(t) {
  return new Promise((res, rej) => {
    const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy") ? res() : rej(new Error("copy refused")); } catch (e) { rej(e); } finally { document.body.removeChild(ta); }
  });
}
function copyText(t) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).catch(() => legacyCopy(t));
  return legacyCopy(t);
}

/* ===== HuggingFace catalog ===== */
const HF_SKIP = /(whisper|embed|rerank|reranker|bge-|gte-|clip|tts|vits|sdxl|flux|stable-diffusion|moderation|guard|vl\b)/i;
const HF_TIMEOUT_MS = 15000;
function parseHFModel(item) {
  if (!item || typeof item !== "object") return null;
  const id = typeof item.id === "string" ? item.id : typeof item.modelId === "string" ? item.modelId : "";
  // Untrusted API data: only well-formed "owner/name" ids (they end up in links and shell commands)
  if (id.length > 200 || !HF_ID_RE.test(id) || HF_SKIP.test(id)) return null;
  const short = id.split("/").pop();
  const actMatch = short.match(/[-_]a(\d+(?:\.\d+)?)b\b/i);
  const moeMatch = short.match(/\b(\d+)\s*x\s*(\d+(?:\.\d+)?)b\b/i);
  const denseMatches = [...short.matchAll(/(?:^|[-_\s.])(\d+(?:\.\d+)?)\s*b\b/gi)].map(m => parseFloat(m[1])).filter(v => v >= 0.1 && v <= 2000);
  let params = null, active = null;
  if (moeMatch) { const n = parseInt(moeMatch[1], 10), sz = parseFloat(moeMatch[2]); params = +(n * sz * 0.86).toFixed(1); active = +(sz * 2).toFixed(1); }
  else if (denseMatches.length) { params = Math.max(...denseMatches); if (actMatch) active = parseFloat(actMatch[1]); }
  if (!params || !Number.isFinite(params)) return null;
  return {
    name: short.replace(/[-_]?gguf$/i, ""), params, active: active || undefined,
    cat: active ? "MoE · HF" : "HuggingFace", source: "hf", hf: id,
    url: hfModelURL(id), downloads: num(item.downloads, 0), likes: num(item.likes, 0),
  };
}
let hfSeq = 0, hfCtrl = null;   // newest request wins: older ones are aborted and their results ignored
async function fetchHF(query) {
  const seq = ++hfSeq;
  if (hfCtrl) hfCtrl.abort();
  const ctrl = hfCtrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, HF_TIMEOUT_MS);
  const status = document.getElementById("hfStatus");
  status.innerHTML = `<span class="spinner"></span> Loading models from huggingface.co …`;
  const params = new URLSearchParams({ filter: "gguf", sort: "downloads", direction: "-1", limit: "60" });
  if (query) params.set("search", query);
  let data;
  try {
    const r = await fetch("https://huggingface.co/api/models?" + params.toString(), { signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    data = await r.json();
    if (!Array.isArray(data)) throw new Error("unexpected response");
  } catch (e) {
    if (seq !== hfSeq) return;      // superseded by a newer search
    const why = timedOut ? "no response within " + HF_TIMEOUT_MS / 1000 + " s" : (e && e.message) || "network error";
    status.innerHTML = `⚠️ Couldn't reach HuggingFace (${esc(why)}). Check your connection / ad blocker, or use “Curated”.`;
    return;
  } finally {
    clearTimeout(timer);
    if (hfCtrl === ctrl) hfCtrl = null;
  }
  if (seq !== hfSeq) return;
  const seen = new Set(), parsed = [];
  let skipped = 0;
  for (const item of data) {
    const m = parseHFModel(item); if (!m) { skipped++; continue; }
    const key = m.name.toLowerCase(); if (seen.has(key)) continue;
    seen.add(key); parsed.push(m); if (parsed.length >= 30) break;
  }
  state.hfModels = parsed; state.hfLoaded = true;
  status.innerHTML = `${icon("check",15)} ${parsed.length} models with a detectable size loaded` +
    (skipped > 0 ? ` · ${skipped} skipped (no size in name or not a chat model)` : "") +
    ` · source: <a href="https://huggingface.co/models?library=gguf" target="_blank" rel="noopener noreferrer">huggingface.co</a>`;
  renderModels();
}

/* ===== Rendering =====
   Everything dynamic that reaches innerHTML goes through esc() — including detected values (GPU string, platform). */
function renderHardware() {
  const grid = document.getElementById("hwGrid");
  const confTxt = { measured: "measured", estimated: "estimated", manual: "manual" };

  const t = HW.tiers;
  const tierTxt = t ? [t.s && `${esc(t.s)}S`, t.p && `${esc(t.p)}P`, t.e && `${esc(t.e)}E`].filter(Boolean).join(" + ") + " cores · " : "";
  const cpuDetail = HW.apple && HW.chipHidden && !HW.chip
    ? `${esc(HW.platform)} · hidden by the browser — pick your chip`
    : `<span title="S = super · P = performance · E = efficiency cores">${tierTxt}</span>${esc(HW.platform)}`;
  const ramPresets = (HW.unified && HW.ramOptions)
    ? `<div class="ram-presets" role="group" aria-label="RAM presets">${HW.ramOptions.map(o => `<button type="button" class="ram-chip${o === HW.ram ? " active" : ""}" data-ram="${esc(o)}" aria-pressed="${o === HW.ram}">${esc(o)}</button>`).join("")}<span class="ram-presets-hint">GB — pick yours</span></div>`
    : `<div class="detail">editable — enter your real RAM</div>`;

  const chipKeys = Object.keys(APPLE_CHIPS).concat(HW.chip && !has(APPLE_CHIPS, HW.chip) ? [HW.chip] : []);
  const chipSelect = HW.apple
    ? `<div class="detail"><select id="chipSelect" class="chip-select" aria-label="Apple chip">${HW.chip ? "" : `<option value="">Pick your chip …</option>`}${chipKeys.map(k => `<option value="${esc(k)}"${k === HW.chip ? " selected" : ""}>Apple ${esc(k)}</option>`).join("")}</select></div>`
    : "";
  const gpuConf = HW.chipHidden ? (HW.chip ? ["manual", "picked"] : ["estimated", "hidden"]) : ["estimated", "detected"];
  const approx = HW.gpuApprox ? `<div class="detail">Browser reports an approximate GPU — check VRAM</div>` : "";
  const dgpu = HW.dgpuHint && !HW.unified ? `<div class="detail">discrete GPU detected — enter its VRAM</div>` : "";

  grid.innerHTML = `
    <div class="hw-cell">
      <div class="conf ${HW.cpuConf}">${confTxt[HW.cpuConf]}</div>
      <div class="label">${icon("cpu",15)} Processor</div>
      <div class="value">${esc(HW.cores || "?")}<span class="unit">cores</span></div>
      <div class="detail">${cpuDetail}</div>
    </div>
    <div class="hw-cell">
      <div class="conf ${HW.ramConf}">${confTxt[HW.ramConf]}</div>
      <div class="label">${icon("memory-stick",15)} ${HW.unified ? "Unified Memory" : "Memory (RAM)"}</div>
      <div class="value"><input type="number" id="ramInput" min="1" max="2048" step="1" value="${esc(HW.ram)}" aria-label="RAM in GB"><span class="unit">GB</span></div>
      ${ramPresets}
    </div>
    <div class="hw-cell">
      <div class="conf ${HW.vramConf}">${confTxt[HW.vramConf]}</div>
      <div class="label">${icon("microchip",15)} Graphics memory (VRAM)</div>
      <div class="value"><input type="number" id="vramInput" min="0" max="512" step="1" value="${esc(HW.vram)}" aria-label="VRAM in GB"${HW.unified ? " disabled" : ""}><span class="unit">GB</span></div>
      <div class="detail">${HW.unified ? `<span class="unified-tag">${icon("layers",13)} shared with RAM</span>` : "0 = no dedicated GPU"}</div>
    </div>
    <div class="hw-cell">
      <div class="conf ${gpuConf[0]}">${gpuConf[1]}</div>
      <div class="label">${icon("monitor",15)} Graphics card</div>
      <div class="value" style="font-size:14.5px;line-height:1.3;font-weight:650;">${esc(HW.gpuName)}</div>
      <div class="detail spec-line" id="gpuSpec">${gpuSpecHTML()}</div>
      ${chipSelect}${approx}${dgpu}
      <div class="detail">
        <label class="switch" style="font-size:12px;margin-top:4px;">
          <input type="checkbox" id="unifiedToggle" ${HW.unified ? "checked" : ""}>
          <span class="track"></span> Unified Memory (Apple / iGPU)
        </label>
      </div>
    </div>`;

  document.getElementById("ramInput").addEventListener("input", e => {
    HW.ram = Math.min(2048, Math.max(1, parseFloat(e.target.value) || 1)); HW.ramConf = "manual";
    if (HW.unified) { HW.vram = HW.ram; document.getElementById("vramInput").value = HW.ram; }
    if (HW.apple) { applyAppleSpec(); saveApplePick(); document.getElementById("gpuSpec").innerHTML = gpuSpecHTML(); }   // RAM can decide the GPU variant
    document.querySelectorAll(".ram-chip").forEach(c => { const on = +c.dataset.ram === HW.ram; c.classList.toggle("active", on); c.setAttribute("aria-pressed", on); });
    renderModels();
  });
  document.getElementById("vramInput").addEventListener("input", e => {
    HW.vram = Math.min(512, Math.max(0, parseFloat(e.target.value) || 0)); HW.vramConf = "manual"; renderModels();
  });
  document.getElementById("unifiedToggle").addEventListener("change", e => {
    if (e.target.checked) { HW.vramSaved = HW.vram; HW.vramSavedConf = HW.vramConf; HW.unified = true; HW.vram = HW.ram; }
    else { HW.unified = false; HW.vram = HW.vramSaved; HW.vramConf = HW.vramSavedConf; }   // back to the dedicated VRAM, not RAM
    renderHardware(); renderModels();
    document.getElementById("unifiedToggle").focus();   // keep keyboard focus after re-render
  });
  const chipSel = document.getElementById("chipSelect");
  if (chipSel) chipSel.addEventListener("change", e => {
    const k = e.target.value; if (!k || !chipKeys.includes(k)) return;
    HW.chip = k; HW.gpuName = "Apple " + k;
    if (HW.chipHidden) HW.cpuConf = "manual";
    applyAppleSpec();
    if (!HW.ramOptions.includes(HW.ram)) HW.ram = HW.ramOptions[0];
    applyAppleSpec(); saveApplePick();
    if (HW.unified) HW.vram = HW.ram;
    renderHardware(); renderModels();
    const again = document.getElementById("chipSelect"); if (again) again.focus();   // keep keyboard focus after re-render
  });
  document.querySelectorAll(".ram-chip").forEach(chip => chip.addEventListener("click", () => {
    HW.ram = +chip.dataset.ram; HW.ramConf = "manual";
    if (HW.unified) HW.vram = HW.ram;
    if (HW.apple) { applyAppleSpec(); saveApplePick(); }
    renderHardware(); renderModels();
    const again = document.querySelector(`.ram-chip[data-ram="${HW.ram}"]`); if (again) again.focus();   // keep keyboard focus after re-render
  }));
}

function gpuSpecHTML() {
  const parts = [];
  if (HW.gpuCores) parts.push(`${esc(HW.gpuCores)}-core GPU`);
  const bw = HW.unified ? HW.bandwidth : HW.gpuBandwidth;
  if (bw) parts.push(`~${esc(bw)} GB/s`);
  return parts.length ? `${icon("zap",12)} ${parts.join(" · ")}` : "";
}

function benchValue(m, key) {
  if (m.source === "hf" || !has(BENCH, m.name) || BENCH[m.name][key] == null) return null;
  const v = Number(BENCH[m.name][key]);
  return Number.isFinite(v) ? v : null;
}
/* Sort keys: size ascending, everything else descending; models without a value go last */
const SORT_KEYS = {
  swe: x => benchValue(x.m, "swe"), gpqa: x => benchValue(x.m, "gpqa"), mmluPro: x => benchValue(x.m, "mmluPro"),
  tps: x => x.tps,
};
function sortModels(list) {
  const key = has(SORT_KEYS, state.sort) ? SORT_KEYS[state.sort] : null;
  if (!key) return list;
  return list.map(x => ({ x, k: key(x) })).sort((a, b) =>
    (a.k == null) - (b.k == null) || (b.k || 0) - (a.k || 0) || a.x.m.params - b.x.m.params).map(o => o.x);
}

function benchHTML(m) {
  if (m.source === "hf" || !has(BENCH, m.name)) return "";
  const b = BENCH[m.name];
  const rows = [];
  const add = (key, label) => { const v = b[key] == null ? NaN : Number(b[key]); if (!Number.isFinite(v)) return; const pct = Math.max(0, Math.min(100, v)); rows.push(`<div class="bench-row"><span class="bench-l">${label}</span><span class="bench-bar"><i style="width:${pct}%"></i></span><span class="bench-v">${esc(v)}</span></div>`); };
  add("mmluPro", "MMLU-Pro"); add("gpqa", "GPQA-D"); add("swe", "SWE-bench");
  if (!rows.length) return "";
  return `<div class="bench"><div class="bench-head">${icon("chart-bar",13)} Benchmarks</div>${rows.join("")}</div>`;
}

/* lmstudio-community GGUFs (behind curated LM Studio keys) usually ship only these quants */
const LMS_COMMON_QUANTS = ["Q4_K_M", "Q6_K", "Q8_0", "FP16"];
/* Quant pinned by a curated Ollama tag ("qwen3.8-flash-next:125b-a6b-q4_K_M" → "q4_K_M"); null = library default build */
function pinnedOllamaQuant(tag) {
  const t = String(tag || "").split(":")[1] || "";
  const m = t.match(/(?:^|[-_])((?:q\d|iq\d|fp16|bf16|f16|nvfp4|mxfp4)[\w.]*)/i);
  return m ? m[1] : null;
}
function cmdRowHTML(tool, cmd, title, badge) {
  return `<div class="cmd"${title ? ` title="${esc(title)}"` : ""}><span class="tool">${tool}${badge ? `<i class="cmd-note">${badge}</i>` : ""}</span><code>${esc(cmd)}</code><button type="button" class="copybtn" data-cmd="${esc(cmd)}" title="Copy" aria-label="Copy ${tool} command">${icon("copy",14)}</button></div>`;
}

function modelCardHTML(m) {
  const { need, fit, active, ctx, capped } = evaluate(m);
  const isMoE = !!m.active;
  const url = m.source === "hf" ? m.url : hfModelURL(m.hf);
  const nameHTML = `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="Open model card on HuggingFace">${esc(m.name)} ${icon("external-link",13)}</a>`;
  const dlTxt = fmtDownloads(m.downloads);
  const dl = dlTxt ? ` · ${icon("flame",12)} ${esc(dlTxt)}` : "";

  let cmds = "";
  const c = fit !== "no" ? commandsFor(m) : null;
  if (c) {
    const cur = c.ollamaDefault;   // curated: Ollama default build + lmstudio-community GGUFs
    const pinned = cur ? pinnedOllamaQuant(m.ollama) : null;
    const oNote = pinned ? `This tag pins the ${pinned} build — it's pulled whatever quantization is selected here.`
      : cur ? `Pulls Ollama's default build of this model (often Q4_K_M; some are NVFP4 or MLX), not necessarily the selected ${state.quant}. For another quant, pick a specific tag on ollama.com/library.` : "";
    const lNote = cur ? `Points to the lmstudio-community GGUF, which usually ships only Q4_K_M, Q6_K, Q8_0 and BF16 — other @quant values may not exist.` : "";
    const rows = [
      c.ollama && cmdRowHTML("Ollama", c.ollama, oNote, cur && !pinned && state.quant !== "Q4_K_M" ? "default build" : ""),
      c.lms && cmdRowHTML("LM Studio", c.lms, lNote, cur && !LMS_COMMON_QUANTS.includes(state.quant) ? "may be n/a" : ""),
    ].filter(Boolean);
    cmds = rows.length ? `<div class="cmds">${rows.join("")}</div>`
      : `<div class="cmd-none">No Ollama / LM Studio package — get GGUFs via the model card</div>`;
  }

  return `
    <div class="model ${fit}">
      <div class="top">
        <div>
          <div class="name">${nameHTML}</div>
          <div class="meta">${esc(m.params)}B params${isMoE ? ` · ${esc(m.active)}B active` : ""}${dl}</div>
        </div>
        <div class="cat">${esc(m.cat)}</div>
      </div>
      <div class="status ${fit}"><span class="sdot"></span>${statusLabel(fit)}</div>
      ${benchHTML(m)}
      ${cmds}
      <div class="foot">
        <span class="req">Needs <b>${fmtGB(need)}</b> · ${esc(state.quant)} · ${capped ? `<span class="ctx-max" title="${esc(`Capped at this model's native context window (${ctx.toLocaleString("en-US")} tokens)`)}">${fmtCtx(ctx)} (max)</span>` : fmtCtx(ctx)}</span>
        ${speedHTML(m, fit, active)}
      </div>
    </div>`;
}

function renderModels() {
  const baseList = state.source === "hf" ? state.hfModels : CURATED;
  const evaluated = baseList.map(m => ({ m, ...evaluate(m) })).sort((a, b) => a.m.params - b.m.params);
  evaluated.forEach(x => { x.tps = x.fit === "no" ? null : estimateTokps(x.m, x.fit); });
  const container = document.getElementById("models");

  if (state.source === "hf" && !state.hfLoaded) {
    container.innerHTML = `<div class="placeholder" style="grid-column:1/-1">Search above, or load the <b>Top models</b>.</div>`;
  } else if (!evaluated.length) {
    container.innerHTML = `<div class="placeholder" style="grid-column:1/-1">No models found. Try a different search term.</div>`;
  } else {
    const visible = sortModels(evaluated.filter(x => (!state.onlyFit || x.fit !== "no") && (!state.minTps || (x.tps != null && x.tps >= state.minTps))));
    container.innerHTML = visible.length
      ? visible.map(x => modelCardHTML(x.m)).join("")
      : `<div class="placeholder" style="grid-column:1/-1">None of the models match these settings. Lower “Min. speed”, turn off “Runnable only” or raise RAM / VRAM.</div>`;
  }
  renderSummary(evaluated);
}

let lastHeadline = "";
function renderSummary(evaluated) {
  const counts = { gpu: 0, cpu: 0, offload: 0, tight: 0, no: 0 };
  evaluated.forEach(x => counts[x.fit]++);
  const runnable = evaluated.filter(x => x.fit !== "no");
  const best = runnable.length ? runnable[runnable.length - 1] : null;
  const gpuBest = evaluated.filter(x => x.fit === "gpu");
  const topGpu = gpuBest.length ? gpuBest[gpuBest.length - 1] : null;
  const ctxLabel = CTX_LABELS[CTX_STEPS.indexOf(state.ctx)];

  let headline;
  if (!evaluated.length) headline = "No models loaded yet.";
  else if (!runnable.length) headline = "These settings are a bit tight for this system.";
  else if (topGpu) headline = `Your largest smooth model: <span style="color:var(--green)">${esc(topGpu.m.name)}</span>`;
  else headline = `Largest runnable model: <span style="color:var(--blue)">${esc(best.m.name)}</span> (on the CPU)`;

  const hwTxt = HW.unified
    ? `${HW.apple ? "Apple " + esc(HW.chip || "Silicon") + " · " : HW.socName ? esc(HW.socName) + " · " : ""}${fmtGB(HW.ram)} Unified Memory`
    : `${fmtGB(HW.ram)} RAM${HW.vram > 0 ? ` · ${fmtGB(HW.vram)} VRAM` : " · no dedicated GPU"}`;

  document.getElementById("summary").innerHTML = `
    <h3>${headline}</h3>
    <p>${state.source === "hf" ? "HuggingFace catalog" : "Curated catalog"} · <b>${esc(state.quant)}</b> · <b>${ctxLabel}</b> context · ${hwTxt}</p>
    <div class="pill-row">
      <span class="pill"><span class="sdot" style="background:var(--green)"></span><b>${counts.gpu}</b> on GPU</span>
      <span class="pill"><span class="sdot" style="background:var(--blue)"></span><b>${counts.cpu}</b> on CPU</span>
      <span class="pill"><span class="sdot" style="background:var(--amber)"></span><b>${counts.offload + counts.tight}</b> borderline</span>
      <span class="pill"><span class="sdot" style="background:var(--red)"></span><b>${counts.no}</b> too large</span>
    </div>`;
  // Screen readers: announce only the headline, and only when it changed (not on every slider step / keystroke)
  const text = document.querySelector("#summary h3").textContent.trim();
  if (text !== lastHeadline) { lastHeadline = text; document.getElementById("summaryLive").textContent = text; }
}

/* ===== Static text with icons ===== */
function renderStaticChrome() {
  document.getElementById("logoMark").innerHTML = `${icon("gauge",18)} llmradar`;
  document.getElementById("checkBtn").innerHTML = `${icon("search",18)} Check my system`;
  document.getElementById("hwTitle").innerHTML = `${icon("cpu",13)} Your hardware`;
  document.getElementById("modelsTitle").innerHTML = `${icon("layers",13)} Models`;
  document.getElementById("hwHint").innerHTML = `${icon("info",15)} <span>Browsers can't read RAM and VRAM exactly. The <b>estimated</b> values can be overridden above — recommendations update instantly.</span>`;
  document.getElementById("lblSource").innerHTML = `${icon("layers",14)} Source`;
  document.getElementById("lblQuant").innerHTML = `${icon("layers",14)} Quantization`;
  document.getElementById("lblCtx").innerHTML = `${icon("sliders-horizontal",14)} Context`;
  document.getElementById("hfTabBtn").innerHTML = `${icon("search",13)} HuggingFace`;
  document.getElementById("hfSearchBtn").innerHTML = `${icon("search",14)} Search`;
  document.getElementById("hfTopBtn").innerHTML = `${icon("flame",14)} Top models`;
  document.getElementById("hfSearchIcon").innerHTML = icon("search", 16);

  document.getElementById("notes").innerHTML = `
    <summary>${icon("info",16)} How it's calculated &amp; what the limits are</summary>
    <p><b>Memory needed:</b> model size ≈ params × bits-per-weight ÷ 8, plus the KV cache (scales with context length) and some runtime overhead. An 8B model in Q4_K_M needs ≈ 6–7 GB at 8K context, noticeably more at 32K. Context is capped at each model's native window (shown as “(max)”). The KV-cache estimate is a dense-attention heuristic, so at 128K+ it overestimates memory for hybrid / sliding-window models (Qwen3.5+, Gemma 4, gpt-oss, Nemotron, DeepSeek / GLM-5).</p>
    <p><b>Quantization:</b> Q4_K_M is the usual sweet spot. Q2_K, Q3_K_M and IQ4_XS squeeze big models into less memory at some quality cost; Q6_K and up are near-lossless. FP16 maps to the BF16 files most GGUF repos publish.</p>
    <p><b>Where it runs:</b> if everything fits in <b>VRAM</b> → fast on the GPU. If it only fits in <b>RAM</b> → runs on the CPU (slower). Apple Silicon shares RAM and GPU memory (Unified Memory), so total RAM counts there.</p>
    <p><b>MoE models</b> (e.g. Qwen3.6-35B-A3B, gpt-oss, Gemma 4 26B-A4B) need memory for <i>all</i> experts but only compute with the <i>active</i> parameters — so they're much faster than their total size suggests.</p>
    <p><b>Benchmarks:</b> values come from each model's own card or tech report (mostly thinking / high-effort modes) — MMLU-Pro (general), GPQA-Diamond (hard reasoning) and SWE-bench Verified (coding). Missing bars mean the source doesn't state that figure. Open a model's card for details, or compare live on <a href="https://llm-stats.com" target="_blank" rel="noopener noreferrer">llm-stats.com</a> and <a href="https://lmarena.ai" target="_blank" rel="noopener noreferrer">LMArena</a>.</p>
    <p><b>HuggingFace catalog:</b> parameter size is parsed from the model name (e.g. “…-8B-…”). Models with no detectable size are skipped. <code>ollama run hf.co/REPO:QUANT</code> pulls GGUF straight from HuggingFace; <code>lms get https://huggingface.co/REPO@QUANT</code> (or the in-app search) does the same in LM Studio.</p>
    <p><b>Commands (curated):</b> <code>ollama run TAG</code> pulls Ollama's default build of the model (often Q4_K_M, some are NVFP4 or MLX) whatever quantization is selected here. The LM Studio key points to the lmstudio-community GGUF, which usually ships only Q4_K_M, Q6_K, Q8_0 and BF16 — other <code>@quant</code> values may not exist. Models without a package on either tool link to their GGUFs via the model card.</p>
    <p><b>Hardware detection:</b> on Apple Silicon (M1 – M6, A18 Pro) Chromium browsers expose the chip (e.g. “Apple M5 Pro”), which is mapped to its core split (S = super, P = performance, E = efficiency), GPU cores, memory bandwidth and real RAM options. Safari and Firefox hide the chip, the RAM size and the real core count (Safari reports at most 8) — pick chip and RAM once; the choice is remembered in this browser only. Where two variants share a core count (e.g. M5 Max 32- vs 40-core GPU) your RAM choice decides. Unified-memory PCs (AMD Ryzen AI Max / Strix Halo, NVIDIA DGX Spark, Snapdragon X, Intel Lunar / Panther Lake) are recognised too. Dedicated GPUs — incl. laptop variants, which often have less VRAM than the desktop card of the same name — are matched against a VRAM/bandwidth table.</p>
    <p><b>Speed (tok/s):</b> a rough decode-speed estimate = memory bandwidth ÷ active weights read per token. It's a ballpark, not a measured benchmark. Colour: red below 5 tok/s (painful), amber 5–15 (readable), light green 15–30 (smooth), green 30+ (fast). Use <i>Sort</i> and <i>Min. speed</i> to find e.g. the best SWE-bench model that still runs fast.</p>
    <p><b>Limits:</b> browsers can't read RAM/VRAM exactly — <code>navigator.deviceMemory</code> is rounded (and often capped at 8 GB), VRAM is inferred from the GPU name. Correct any value manually if needed.</p>
    <p>To actually run models: <a href="https://ollama.com" target="_blank" rel="noopener noreferrer">Ollama</a>, <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer">LM Studio</a> or <a href="https://github.com/ggml-org/llama.cpp" target="_blank" rel="noopener noreferrer">llama.cpp</a>.</p>`;

  document.getElementById("footer").innerHTML = `
    Estimates without guarantee · hardware analysis runs offline in your browser.<br>
    Model data &amp; benchmarks from public sources &amp; HuggingFace.<br>
    Typeface: Inter (SIL OFL 1.1) · Icons: Lucide (ISC) — both self-hosted.`;
}

function applyThemeIcon() {
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  const btn = document.getElementById("themeToggle");
  btn.innerHTML = icon(dark ? "sun" : "moon", 19);
  btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

/* ===== Controls ===== */
function initControls() {
  const sel = document.getElementById("quant");
  sel.innerHTML = Object.entries(QUANTS).map(([k, v]) => `<option value="${esc(k)}" ${k === state.quant ? "selected" : ""}>${esc(v.label)}</option>`).join("");
  sel.addEventListener("change", e => { if (has(QUANTS, e.target.value)) { state.quant = e.target.value; renderModels(); } });

  const ctxEl = document.getElementById("ctx");
  ctxEl.max = String(CTX_STEPS.length - 1);   // derived from the data so 256K (or later steps) stays reachable
  ctxEl.addEventListener("input", e => {
    const idx = Math.min(CTX_STEPS.length - 1, Math.max(0, parseInt(e.target.value, 10) || 0));
    state.ctx = CTX_STEPS[idx];
    document.getElementById("ctxVal").textContent = CTX_LABELS[idx];
    e.target.setAttribute("aria-valuetext", CTX_LABELS[idx] + " tokens");
    renderModels();
  });
  document.getElementById("onlyFit").addEventListener("change", e => { state.onlyFit = e.target.checked; renderModels(); });
  document.getElementById("sortBy").addEventListener("change", e => { state.sort = has(SORT_KEYS, e.target.value) ? e.target.value : "size"; renderModels(); });
  document.getElementById("minTps").addEventListener("change", e => { state.minTps = Math.max(0, num(e.target.value, 0)); renderModels(); });

  document.querySelectorAll("#sourceTabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sourceTabs button").forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", b === btn); });
      state.source = btn.dataset.src;
      document.getElementById("hfBar").classList.toggle("hidden", state.source !== "hf");
      if (state.source === "hf" && !state.hfLoaded) fetchHF(""); else renderModels();
    });
  });

  document.getElementById("hfSearchBtn").addEventListener("click", () => fetchHF(document.getElementById("hfSearch").value.trim()));
  document.getElementById("hfSearch").addEventListener("keydown", e => { if (e.key === "Enter") fetchHF(e.target.value.trim()); });
  document.getElementById("hfTopBtn").addEventListener("click", () => { document.getElementById("hfSearch").value = ""; fetchHF(""); });

  const resetTimers = new WeakMap();
  document.getElementById("models").addEventListener("click", e => {
    const btn = e.target.closest(".copybtn"); if (!btn) return;
    const flash = ok => {
      clearTimeout(resetTimers.get(btn));
      btn.innerHTML = icon(ok ? "check" : "x", 14); btn.classList.toggle("done", ok); btn.classList.toggle("fail", !ok);
      btn.title = ok ? "Copied" : "Copy failed — select the command and copy it manually";
      resetTimers.set(btn, setTimeout(() => { btn.innerHTML = icon("copy", 14); btn.classList.remove("done", "fail"); btn.title = "Copy"; }, ok ? 1200 : 2500));
    };
    copyText(btn.dataset.cmd).then(() => flash(true), () => flash(false));
  });
}

/* ===== Theme toggle ===== */
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("llmradar-theme", next); } catch (e) {}
  applyThemeIcon();
});
// No stored choice → keep following the OS theme live
try {
  const mq = matchMedia("(prefers-color-scheme: light)");
  if (mq.addEventListener) mq.addEventListener("change", e => {
    let stored = null; try { stored = localStorage.getItem("llmradar-theme"); } catch (err) {}
    if (stored === "light" || stored === "dark") return;
    document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark"); applyThemeIcon();
  });
} catch (e) {}

/* ===== Start ===== */
let initialized = false;
document.getElementById("checkBtn").addEventListener("click", async function () {
  const btn = this;
  btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Analyzing hardware …`;
  try {
    await new Promise(r => setTimeout(r, 600));
    await detectHardware();

    document.getElementById("placeholderSection").classList.add("hidden");
    ["hwSection", "ctrlSection", "summarySection", "modelSection"].forEach(id => document.getElementById(id).classList.remove("hidden"));

    if (!initialized) { initControls(); initialized = true; }
    renderHardware();
    renderModels();
    document.getElementById("hwSection").scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  } finally {
    btn.disabled = false; btn.innerHTML = `${icon("search",18)} ${initialized ? "Re-scan" : "Check my system"}`;
  }
});

/* ===== Init static chrome on load ===== */
renderStaticChrome();
applyThemeIcon();
