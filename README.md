# llmradar 📡🖥️

**Scan your machine right in the browser and see which local LLMs it can actually run** — Qwen, Gemma, gpt-oss, GLM, Nemotron, Mistral, DeepSeek & co. No install, no upload, no backend.

The hardware analysis runs **100 % client-side**. Only the optional HuggingFace catalog talks to the public HuggingFace API.

**▶ Live:** https://bennixview.github.io/llmradar/

---

## Features

- 🔍 **Browser hardware detection** — CPU cores (`navigator.hardwareConcurrency`) and GPU name (WebGL `WEBGL_debug_renderer_info` + a high-performance WebGPU adapter).
  - 🍎 **Apple Silicon M1–M6 and A18 Pro (MacBook Neo)** — the chip is mapped to its **core tiers** (S = super, P = performance, E = efficiency), GPU cores, memory bandwidth and real RAM options. Safari and Firefox hide the chip, so there's a **chip picker** (chip and RAM pick are remembered in `localStorage`); where two variants share a core count (e.g. M5 Max 32- vs 40-core GPU), your RAM choice decides.
  - 🧩 **Unified-memory PCs** — AMD Ryzen AI Max (Strix Halo), NVIDIA DGX Spark / GB10, Snapdragon X / X2, Intel Lunar Lake / Panther Lake and AMD Ryzen AI 300 (Strix Point) are recognised with their RAM options and bandwidth.
  - 🎮 **Dedicated GPUs** — matched against a VRAM + bandwidth table covering GeForce RTX 20–50, Radeon RX 6000–9000, Intel Arc A / B / Pro B, RTX PRO Blackwell and older workstation cards, and datacenter GPUs (T4 … B300). **Laptop variants** are matched separately: an RTX 4090 Laptop has 16 GB, not 24.
- ⚡ **Speed estimate (tok/s)** — rough decode speed from memory bandwidth ÷ active weights per token (unified memory or known GPU). CPU-only runs assume 80 GB/s (typical dual-channel DDR5).
- ✏️ **Editable values & RAM presets** — browsers can't read RAM/VRAM exactly (`deviceMemory` is rounded/capped), so every value can be overridden, with one-click presets for the detected chip's or platform's configs. Recommendations update live.
- 📚 **Two catalogs**
  - **Curated** — 41 hand-picked models as of Nov 2026 (Qwen3.5 / 3.6 / 3.8, Gemma 4, gpt-oss, GLM-4.7-Flash, Nemotron 3.5, Devstral Small 2, Ministral 3, Muse Glimmer, DeepSeek V4, Kimi K3 …) with accurate parameter counts and MoE active-param info.
  - **🤗 HuggingFace (live)** — search or load trending GGUF repos straight from the HuggingFace API. Parameter size is parsed from the model name (incl. MoE like `30B-A3B` and `8x7B`).
- ⚙️ **Quantization selector** — Q2_K, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 and FP16, with per-quant memory estimates.
- 📏 **Context-length slider (2K–256K)** — capped at each model's native context window, and folds the KV cache into the memory estimate. A long context can need more RAM than the weights themselves.
- 📋 **Ready-to-run commands** — copy-to-clipboard for **Ollama** and **LM Studio** per model:
  - Curated: `ollama run qwen3.5:9b` · `lms get qwen/qwen3.5-9b@q4_k_m`
  - HuggingFace: `ollama run hf.co/REPO:Q4_K_M` · `lms get https://huggingface.co/REPO@Q4_K_M`
  - Curated Ollama tags pull Ollama's default build (usually Q4_K_M), whatever quantization is selected; the card says so on hover. FP16 maps to the `BF16` file/tag name used in GGUF repos.
  - Some models have no Ollama or LM Studio package (e.g. GLM-5.3, Kimi K3); those command rows are hidden.
- 📊 **Benchmarks at a glance** — MMLU-Pro, GPQA-Diamond and SWE-bench Verified bars per curated model, taken **only from each model's own card or tech report** (source noted per value in `data.js`). Gaps stay empty; a one-click link opens the model's HuggingFace card.
- 🟢🔵🟡🔴 **Clear verdict per model** — runs on GPU / runs on CPU / borderline / too big, plus a rough speed hint.
- 🌗 **Dark & light theme** — follows your OS setting (`prefers-color-scheme`) until you toggle it; the choice is persisted in `localStorage` and applied before first paint.
- ♿ **Accessibility** — animations are switched off with `prefers-reduced-motion`; visible focus rings, `aria-pressed` toggles, labelled controls and live regions for status updates.

## Fonts, icons, privacy & security

No third-party assets are loaded at runtime, so there's **no Google-Fonts-style GDPR exposure** (no visitor IP leaks to a CDN):

- **Inter** typeface is **self-hosted** (`assets/fonts/`) under the [SIL Open Font License 1.1](assets/fonts/OFL.txt).
- **Lucide** icons are inlined as SVG by the app script (no icon-font request), under the [ISC license](assets/LICENSE-lucide.txt).

The only outbound request is the optional HuggingFace model catalog, and only when you open that tab.

- 🔒 **Strict Content-Security-Policy** (meta tag): `script-src 'self'` (no inline scripts), styles/fonts/images only from the page's own origin, and network access (`connect-src`) only to `https://huggingface.co`. `style-src` still allows inline styles (the `<style>` block and a few `style=""` attributes).
- 🙈 **`no-referrer`** policy for the page; all external links open with `rel="noopener noreferrer"`.
- 🧪 **HuggingFace data is treated as untrusted:** repo ids must match a strict `owner/name` pattern before they reach links or the copyable commands (anything else is dropped, so a pasted `ollama`/`lms` command can't carry shell metacharacters), download counts and other numbers are coerced, and every value is HTML-escaped before rendering.

## How it works

```
required memory ≈ params × bits-per-weight ÷ 8   (model weights)
              + KV cache (scales with context length)
              + runtime overhead
```

- Fits in **VRAM** → runs fast on the GPU.
- Fits only in **RAM** → runs on the CPU (slower).
- **Apple Silicon** and other **unified-memory** systems share RAM and GPU memory, so total RAM counts.
- **MoE models** need memory for *all* experts but compute only with the *active* parameters, hence much faster than their total size suggests.

All numbers are estimates. The goal is a realistic gut-check, not a benchmark.

## Usage

It's a static, dependency-free page with no build step:

```
index.html              markup + CSS
assets/js/theme-init.js sets the theme before first paint (loaded in <head>)
assets/js/data.js       data tables: quantizations, curated models, context windows, benchmarks, GPU / unified-memory / Apple-chip specs
assets/js/app.js        detection, estimates, rendering, HuggingFace catalog
assets/fonts/           self-hosted Inter
```

The scripts are plain classic scripts (no modules), so it also works straight from `file://`. Just open it:

```bash
# simplest: double-click index.html
# or serve locally:
python3 -m http.server
# then visit http://localhost:8000
```

Everything, including the HuggingFace tab, works from `file://` (verified in WebKit, Safari's engine; Chromium also treats `file:` URLs as `'self'` for CSP). If a browser blocks the scripts or `fetch()` for local files, serve the folder locally instead; the deployed site is unaffected.

## Updating the data

All tables live in `assets/js/data.js`:

- 🧮 **`QUANTS`** — quantizations with average bits per weight; `GGUF_QUANT_TAG` maps a key to its GGUF file/tag name (`FP16` → `BF16`).
- 📏 **`CTX_STEPS` / `CTX_LABELS`** — the context-slider steps.
- 📚 **`CURATED`** — the curated catalog (`params`, `active` for MoE, `hf` repo, `ollama` tag, `lms` key; `null` = no package there).
- 🪟 **`NATIVE_CTX`** — native context window per curated model (keyed by `name`).
- 📊 **`BENCH`** — benchmark values per curated model. **Every value needs a primary-source comment** (model card URL or tech report + table); no leaderboards or third-party aggregators.
- 🎮 **`GPUS`** — `[regex, VRAM GB, bandwidth GB/s]`, first match wins. **Laptop, SUPER and Ti regexes must come before the base entry** (e.g. `rtx 4090.*laptop` before `rtx 4090`, `rtx 4070 ti super` before `rtx 4070 ti` before `rtx 4070`).
- 🧩 **`UNIFIED`** — non-Apple unified-memory platforms (checked before `GPUS`).
- ⚡ **`CPU_BW`** — memory bandwidth assumed for CPU-only decode.
- 🍎 **`APPLE_CHIPS`** — per chip and CPU-core-count bin: core tiers, GPU cores, bandwidth, RAM options (`alt` = second GPU variant with the same core count, told apart by RAM).

## Limitations

- `navigator.deviceMemory` is rounded and capped at 8 GB; correct your real RAM in the UI.
- Safari caps `hardwareConcurrency` at 8 and only reports "Apple GPU"; Firefox reports every Apple Silicon Mac as "Apple M1, or similar". Neither exposes the RAM size. Pick chip and RAM once; the core count then comes from the chip.
- Firefox buckets GPUs into representative models ("…, or similar"), so the matched GPU and VRAM are approximate; check them. Some privacy modes mask the GPU renderer string entirely.
- The 8 GB and 16 GB variants of the RTX 5060 Ti and RX 9060 XT can't be told apart from the browser (the 5060 Ti defaults to 8 GB, the 9060 XT to 16 GB); edit VRAM if needed.
- VRAM is guessed from the GPU name via a lookup table; unknown GPUs default to 0 (edit manually).
- The KV-cache estimate is a dense-attention heuristic. It **overestimates** memory for hybrid / sliding-window-attention models at long context.
- Speed labels are heuristics, not measured throughput.

## Actually running models

[Ollama](https://ollama.com) · [LM Studio](https://lmstudio.ai) · [llama.cpp](https://github.com/ggml-org/llama.cpp)

## License

[MIT](LICENSE) © 2026 Benjamin Wirtz · Inter: [OFL 1.1](assets/fonts/OFL.txt) · Lucide icons: [ISC](assets/LICENSE-lucide.txt)
