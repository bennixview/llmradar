# llmradar 📡🖥️

**Scan your machine right in the browser and see which local LLMs it can actually run** — Llama, Qwen, Gemma, Mistral, gpt-oss & co. No install, no upload, no backend.

The hardware analysis runs **100 % client-side**. Only the optional model catalog and benchmark links use the public HuggingFace API.

**▶ Live:** https://bennixview.github.io/llmradar/

---

## Features

- 🔍 **Browser hardware detection** — CPU threads (`navigator.hardwareConcurrency`), RAM (`navigator.deviceMemory`) and GPU name (WebGL `WEBGL_debug_renderer_info` + WebGPU). Apple Silicon is detected as **Unified Memory**.
- ✏️ **Editable values** — browsers can't read RAM/VRAM exactly (`deviceMemory` is capped at 8 GB), so every value can be overridden. Recommendations update live.
- 📚 **Two catalogs**
  - **Curated** — hand-picked 2026-era models with accurate parameter counts and MoE active-param info.
  - **🤗 HuggingFace (live)** — search or load trending GGUF repos straight from the HuggingFace API. Parameter size is parsed from the model name (incl. MoE like `30B-A3B` and `8x7B`).
- ⚙️ **Quantization selector** — Q4_K_M → FP16, with per-quant memory estimates.
- 📏 **Context-length slider (2K–128K)** — folds the KV-cache into the memory estimate. A long context can need more RAM than the weights themselves.
- 📋 **Ready-to-run commands** — copy-to-clipboard for both **Ollama** and **LM Studio** per model:
  - Curated: `ollama run qwen3:14b` · `lms get qwen3-14b@q4_k_m`
  - HuggingFace: `ollama run hf.co/REPO:Q4_K_M` · `lms get REPO`
- 📊 **Benchmarks at a glance** — MMLU-Pro, GPQA-Diamond and SWE-bench Verified bars per curated model (indicative figures from public reports), with a one-click link to each model's HuggingFace card for the authoritative numbers.
- 🟢🔵🟡🔴 **Clear verdict per model** — runs on GPU / runs on CPU / borderline / too big, plus a rough speed hint.
- 🌗 **Dark & light theme** — dark by default, toggleable, preference persisted in `localStorage`.

## Fonts, icons & privacy

No third-party assets are loaded at runtime — so there's **no Google-Fonts-style GDPR exposure** (no visitor IP leaks to a CDN):

- **Inter** typeface is **self-hosted** (`assets/fonts/`) under the [SIL Open Font License 1.1](assets/fonts/OFL.txt).
- **Lucide** icons (ISC license) are inlined as SVG in the page — no icon-font request.

The only outbound request is the optional HuggingFace model catalog/benchmark links, and only when you open that tab.

## How it works

```
required memory ≈ params × bits-per-weight ÷ 8   (model weights)
              + KV cache (scales with context length)
              + runtime overhead
```

- Fits in **VRAM** → runs fast on the GPU.
- Fits only in **RAM** → runs on the CPU (slower).
- **Apple Silicon** shares RAM and GPU memory (Unified Memory), so total RAM counts.
- **MoE models** need memory for *all* experts but compute only with the *active* parameters — hence much faster than their total size suggests.

All numbers are estimates. The goal is a realistic gut-check, not a benchmark.

## Usage

It's a single, dependency-free `index.html`. Just open it:

```bash
# simplest: double-click index.html
# or serve locally (recommended — some browsers block fetch() from file://):
python3 -m http.server
# then visit http://localhost:8000
```

A local server is only needed for the HuggingFace tab — the curated catalog and hardware detection work straight from `file://`.

## Limitations

- `navigator.deviceMemory` is rounded and capped at 8 GB — correct your real RAM in the UI.
- VRAM is guessed from the GPU name via a lookup table; unknown GPUs default to 0 (edit manually).
- Some browsers (Firefox RFP, privacy modes) mask the GPU renderer string.
- Speed labels are heuristics, not measured throughput.

## Actually running models

[Ollama](https://ollama.com) · [LM Studio](https://lmstudio.ai) · [llama.cpp](https://github.com/ggml-org/llama.cpp)

## License

[MIT](LICENSE) © 2026 Benjamin Wirtz
