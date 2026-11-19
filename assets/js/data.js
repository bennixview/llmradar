/* llmradar — data tables (classic script, loaded before app.js; top-level consts are shared globals) */
"use strict";

/* ===== Quantizations (avg bits per weight, llama.cpp quantize README) ===== */
const QUANTS = {
  "Q2_K":   { label: "Q2_K · smallest (noticeable quality loss)", bpw: 3.16 },
  "Q3_K_M": { label: "Q3_K_M · small",                     bpw: 4.00 },
  "IQ4_XS": { label: "IQ4_XS · compact 4-bit",             bpw: 4.46 },
  "Q4_K_M": { label: "Q4_K_M · recommended (balanced)",    bpw: 4.89 },
  "Q5_K_M": { label: "Q5_K_M · slightly higher quality",   bpw: 5.70 },
  "Q6_K":   { label: "Q6_K · near full quality",           bpw: 6.56 },
  "Q8_0":   { label: "Q8_0 · very high quality",           bpw: 8.50 },
  "FP16":   { label: "FP16 · full precision (large)",      bpw: 16.0 },
};
/* Quant key → file/tag name used in GGUF repos (hf.co Ollama tags, LM Studio @quant).
   Full precision is mostly published as "BF16" (lmstudio-community, ggml-org, bartowski). Unlisted keys are used as-is. */
const GGUF_QUANT_TAG = { "FP16": "BF16" };

const CTX_STEPS  = [2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144];
const CTX_LABELS = ["2K", "4K", "8K", "16K", "32K", "64K", "128K", "256K"];

/* ===== Curated catalog (as of 11/2026; verified against HF, ollama.com/library, lmstudio.ai/models) =====
   params=total (B) · active=active params (MoE) · hf=canonical HuggingFace repo
   ollama=Ollama tag · lms=LM Studio catalog key — null = no local package there                          */
const CURATED = [
  // Tiny (<2B)
  { name: "Qwen3.5 0.8B",              params: 0.87, cat: "Tiny",                    hf: "Qwen/Qwen3.5-0.8B",                         ollama: "qwen3.5:0.8b",             lms: "qwen/qwen3.5-0.8b" },
  { name: "Gemma 3 1B",                params: 1.0,  cat: "Tiny",                    hf: "google/gemma-3-1b-it",                      ollama: "gemma3:1b",                lms: "google/gemma-3-1b" },
  { name: "LFM3 1.7B",                 params: 1.73, cat: "Tiny",                    hf: "LiquidAI/LFM3-1.7B",                        ollama: "lfm3:1.7b",                lms: null },
  // Small (2–5B)
  { name: "Qwen3.5 2B",                params: 2.27, cat: "Small",                   hf: "Qwen/Qwen3.5-2B",                           ollama: "qwen3.5:2b",               lms: "qwen/qwen3.5-2b" },
  { name: "Llama 3.2 3B",              params: 3.21, cat: "Small",                   hf: "meta-llama/Llama-3.2-3B-Instruct",          ollama: "llama3.2:3b",              lms: "meta/llama-3.2-3b" },
  { name: "Phi-4-mini 3.8B",           params: 3.8,  cat: "Small",                   hf: "microsoft/Phi-4-mini-instruct",             ollama: "phi4-mini:3.8b",           lms: "microsoft/phi-4-mini" },
  { name: "Qwen3.5 4B",                params: 4.66, cat: "Small",                   hf: "Qwen/Qwen3.5-4B",                           ollama: "qwen3.5:4b",               lms: "qwen/qwen3.5-4b" },
  { name: "Gemma 4 E2B",               params: 5.1,  cat: "Small · on-device",       hf: "google/gemma-4-E2B-it",                     ollama: "gemma4:e2b",               lms: "google/gemma-4-e2b" },
  // Medium (6–10B)
  { name: "OLMo 3 7B",                 params: 7.3,  cat: "Medium",                  hf: "allenai/Olmo-3-7B-Instruct",                ollama: "olmo-3:7b-instruct",       lms: "allenai/olmo-3-7b" },
  { name: "Llama 3.1 8B",              params: 8.03, cat: "Medium",                  hf: "meta-llama/Llama-3.1-8B-Instruct",          ollama: "llama3.1:8b",              lms: "llama-3.1-8b" },
  { name: "Gemma 4 E4B",               params: 8.0,  cat: "Medium · on-device",      hf: "google/gemma-4-E4B-it",                     ollama: "gemma4:e4b",               lms: "google/gemma-4-e4b" },
  { name: "Granite 4.2 8B",            params: 8.79, cat: "Medium",                  hf: "ibm-granite/granite-4.2-8b",                ollama: "granite4.2:8b",            lms: null },
  { name: "Qwen3.5 9B",                params: 9.65, cat: "Medium",                  hf: "Qwen/Qwen3.5-9B",                           ollama: "qwen3.5:9b",               lms: "qwen/qwen3.5-9b" },
  // Mid-large (11–20B)
  { name: "Gemma 4 12B",               params: 11.95,cat: "Mid-large",               hf: "google/gemma-4-12B-it",                     ollama: "gemma4:12b",               lms: "google/gemma-4-12b" },
  { name: "Ministral 3 14B",           params: 13.95,cat: "Mid-large",               hf: "mistralai/Ministral-3-14B-Instruct-2512",   ollama: "ministral-3:14b",          lms: "mistralai/ministral-3-14b" },
  { name: "Phi-4-reasoning-plus 14B",  params: 14.7, cat: "Mid-large · Reasoning",   hf: "microsoft/Phi-4-reasoning-plus",            ollama: "phi4-reasoning:plus",      lms: "microsoft/phi-4-reasoning-plus" },
  // Large (21–40B dense)
  { name: "Devstral Small 2 24B",      params: 24.0, cat: "Large · Coding",          hf: "mistralai/Devstral-Small-2-24B-Instruct-2512", ollama: "devstral-small-2:24b",  lms: "mistralai/devstral-small-2-2512" },
  { name: "Qwen3.8 27B",               params: 27.78,cat: "Large · Reasoning",       hf: "Qwen/Qwen3.8-27B",                          ollama: "qwen3.8:27b",              lms: "qwen/qwen3.8-27b" },
  { name: "Muse Glimmer 30B",          params: 29.6, cat: "Large",                   hf: "meta-models/Muse-Glimmer-30B",              ollama: "muse-glimmer:30b",         lms: "meta/muse-glimmer" },
  { name: "Gemma 4 31B",               params: 30.7, cat: "Large",                   hf: "google/gemma-4-31B-it",                     ollama: "gemma4:31b",               lms: "google/gemma-4-31b" },
  { name: "OLMo 3.1 32B Think",        params: 32.23,cat: "Large · Reasoning",       hf: "allenai/Olmo-3.1-32B-Think",                ollama: "olmo-3.1:32b-think",       lms: "allenai/olmo-3.1-32b-think" },
  // MoE · lean
  { name: "gpt-oss 20B",               params: 20.9, active: 3.6, cat: "MoE · lean · Reasoning", hf: "openai/gpt-oss-20b",              ollama: "gpt-oss:20b",              lms: "openai/gpt-oss-20b" },
  { name: "Gemma 4 26B-A4B",           params: 25.2, active: 3.8, cat: "MoE · lean",  hf: "google/gemma-4-26B-A4B-it",                 ollama: "gemma4:26b-a4b",           lms: "google/gemma-4-26b-a4b" },
  { name: "GLM-4.7-Flash 30B-A3B",     params: 31.2, active: 3,   cat: "MoE · lean · Coding", hf: "zai-org/GLM-4.7-Flash",          ollama: "glm-4.7-flash",            lms: "zai-org/glm-4.7-flash" },
  { name: "Nemotron 3.5 Lightning 30B-A3B", params: 31.6, active: 3, cat: "MoE · lean", hf: "nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16", ollama: "nemotron-3.5-lightning:30b", lms: "nvidia/nemotron-3.5-lightning" },
  { name: "Qwen3.6 35B-A3B",           params: 35.95,active: 3,   cat: "MoE · lean",  hf: "Qwen/Qwen3.6-35B-A3B",                      ollama: "qwen3.6:35b-a3b",          lms: "qwen/qwen3.6-35b-a3b" },
  // MoE · large
  { name: "Qwen3-Coder-Next 80B-A3B",  params: 79.7, active: 3,   cat: "MoE · large · Coding", hf: "Qwen/Qwen3-Coder-Next",         ollama: "qwen3-coder-next",         lms: "qwen/qwen3-coder-next" },
  { name: "GLM-4.5-Air",               params: 106,  active: 12,  cat: "MoE · large", hf: "zai-org/GLM-4.5-Air",                       ollama: null,                       lms: null },
  { name: "gpt-oss 120B",              params: 116.8,active: 5.1, cat: "MoE · large · Reasoning", hf: "openai/gpt-oss-120b",         ollama: "gpt-oss:120b",             lms: "openai/gpt-oss-120b" },
  { name: "Mistral Small 4 119B",      params: 119,  active: 6.5, cat: "MoE · large", hf: "mistralai/Mistral-Small-4-119B-2603",       ollama: null,                       lms: "mistralai/mistral-small-4" },
  { name: "Nemotron 3.5 Super 120B-A12B", params: 120, active: 12, cat: "MoE · large", hf: "nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16", ollama: "nemotron-3.5-super:120b", lms: "nvidia/nemotron-3.5-super-vl" },
  { name: "Qwen3.8 Flash-Next",        params: 176,  active: 6,   cat: "MoE · large", hf: "Qwen/Qwen3.8-Flash-Next",                   ollama: "qwen3.8-flash-next:125b-a6b-q4_K_M", lms: "qwen/qwen3.8-flash-next" },  // 125B MoE + 51B offloadable n-gram embeddings
  // MoE · huge
  { name: "MiniMax M2.7",              params: 229,  active: 10,  cat: "MoE · huge · Coding", hf: "MiniMaxAI/MiniMax-M2.7",          ollama: null,                       lms: "minimax/minimax-m2.7" },
  { name: "DeepSeek V4-Flash",         params: 284,  active: 13,  cat: "MoE · huge",  hf: "deepseek-ai/DeepSeek-V4-Flash-0731",        ollama: null,                       lms: "deepseek/deepseek-v4-flash" },
  { name: "GLM-5.3-Flash",             params: 320,  active: 18,  cat: "MoE · huge",  hf: "zai-org/GLM-5.3-Flash",                     ollama: null,                       lms: null },
  { name: "Qwen3.5 397B-A17B",         params: 397,  active: 17,  cat: "MoE · huge",  hf: "Qwen/Qwen3.5-397B-A17B",                    ollama: null,                       lms: "qwen/qwen3.5-397b-a17b" },
  // MoE · frontier
  { name: "GLM-5.3",                   params: 753,  active: 40,  cat: "MoE · frontier · Coding", hf: "zai-org/GLM-5.3",              ollama: null,                       lms: null },
  { name: "DeepSeek V4.1-Flash",       params: 763,  active: 16,  cat: "MoE · frontier", hf: "deepseek-ai/DeepSeek-V4.1-Flash",       ollama: null,                       lms: null },
  { name: "Kimi K3",                   params: 2800, active: 104, cat: "MoE · frontier", hf: "moonshotai/Kimi-K3",                    ollama: null,                       lms: null },
  // Very large dense
  { name: "Llama 3.3 70B",             params: 70.6, cat: "Very large",              hf: "meta-llama/Llama-3.3-70B-Instruct",         ollama: "llama3.3:70b",             lms: "meta/llama-3.3-70b" },
  { name: "Mistral Medium 3.5 128B",   params: 127.7,cat: "Very large",              hf: "mistralai/Mistral-Medium-3.5-128B",         ollama: "mistral-medium-3.5:128b",  lms: null },
];

/* Native context window (tokens) — the context slider is capped per model */
const NATIVE_CTX = {
  "Qwen3.5 0.8B": 262144, "Qwen3.5 2B": 262144, "Qwen3.5 4B": 262144, "Qwen3.5 9B": 262144, "Qwen3.8 27B": 262144, "Qwen3.6 35B-A3B": 262144,
  "Qwen3-Coder-Next 80B-A3B": 262144, "Qwen3.8 Flash-Next": 262144, "Qwen3.5 397B-A17B": 262144, "LFM3 1.7B": 262144,
  "Gemma 3 1B": 32768, "Gemma 4 E2B": 131072, "Gemma 4 E4B": 131072, "Gemma 4 12B": 262144, "Gemma 4 26B-A4B": 262144, "Gemma 4 31B": 262144,
  "Llama 3.2 3B": 131072, "Llama 3.1 8B": 131072, "Llama 3.3 70B": 131072, "Phi-4-mini 3.8B": 131072, "Phi-4-reasoning-plus 14B": 32768,
  "OLMo 3 7B": 65536, "OLMo 3.1 32B Think": 65536, "Granite 4.2 8B": 131072, "Ministral 3 14B": 262144, "Devstral Small 2 24B": 262144,
  "Mistral Small 4 119B": 262144, "Mistral Medium 3.5 128B": 262144, "Muse Glimmer 30B": 131072, "gpt-oss 20B": 131072, "gpt-oss 120B": 131072,
  "GLM-4.7-Flash 30B-A3B": 202752, "GLM-4.5-Air": 131072, "MiniMax M2.7": 204800, "Nemotron 3.5 Lightning 30B-A3B": 1048576,
  "Nemotron 3.5 Super 120B-A12B": 1048576, "DeepSeek V4-Flash": 1048576, "DeepSeek V4.1-Flash": 1048576, "GLM-5.3-Flash": 1048576,
  "GLM-5.3": 1048576, "Kimi K3": 1048576,
};

/* ===== Benchmark snapshot (primary sources only: model cards / tech reports) =====
   Values shown only where the model's own card or report states them; gaps fall back to the model card link.
   mmluPro = MMLU-Pro · gpqa = GPQA-Diamond · swe = SWE-bench Verified (all %). Mostly thinking / high-effort modes. */
const BENCH = {
  "Qwen3.5 0.8B":     { mmluPro: 42.3 },               // https://huggingface.co/Qwen/Qwen3.5-0.8B
  "Gemma 3 1B":       { mmluPro: 14.7, gpqa: 19.2 },   // arXiv 2503.19786, Table 6
  "LFM3 1.7B":        { gpqa: 63.4, swe: 43.4 },       // https://huggingface.co/LiquidAI/LFM3-1.7B (SWE via OpenCode harness)
  "Qwen3.5 2B":       { mmluPro: 66.5, gpqa: 51.6 },   // https://huggingface.co/Qwen/Qwen3.5-2B
  "Phi-4-mini 3.8B":  { mmluPro: 52.8, gpqa: 25.2 },   // https://huggingface.co/microsoft/Phi-4-mini-instruct
  "Qwen3.5 4B":       { mmluPro: 79.1, gpqa: 76.2 },   // https://huggingface.co/Qwen/Qwen3.5-4B
  "Gemma 4 E2B":      { mmluPro: 60.0, gpqa: 43.4 },   // https://huggingface.co/google/gemma-4-E2B-it
  "OLMo 3 7B":        { gpqa: 40.4 },                  // https://huggingface.co/allenai/Olmo-3-7B-Instruct
  "Llama 3.1 8B":     { mmluPro: 48.3, gpqa: 31.8 },   // meta-llama/llama-models llama3_3 MODEL_CARD.md
  "Gemma 4 E4B":      { mmluPro: 69.4, gpqa: 58.6 },   // https://huggingface.co/google/gemma-4-E4B-it
  "Granite 4.2 8B":   { mmluPro: 74.0, gpqa: 64.1 },   // https://huggingface.co/ibm-granite/granite-4.2-8b
  "Qwen3.5 9B":       { mmluPro: 82.5, gpqa: 81.7 },   // https://huggingface.co/Qwen/Qwen3.5-9B
  "Gemma 4 12B":      { mmluPro: 77.2, gpqa: 78.8 },   // https://huggingface.co/google/gemma-4-12B-it
  "Phi-4-reasoning-plus 14B": { mmluPro: 76.0, gpqa: 68.9 }, // https://huggingface.co/microsoft/Phi-4-reasoning-plus
  "Devstral Small 2 24B": { swe: 68.0 },               // https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
  "Qwen3.8 27B":      { gpqa: 89.2 },                  // https://huggingface.co/Qwen/Qwen3.8-27B
  "Muse Glimmer 30B": { gpqa: 83.5, swe: 76.0 },       // https://huggingface.co/meta-models/Muse-Glimmer-30B
  "Gemma 4 31B":      { mmluPro: 85.2, gpqa: 84.3 },   // https://huggingface.co/google/gemma-4-31B-it
  "OLMo 3.1 32B Think": { gpqa: 57.5 },                // https://huggingface.co/allenai/Olmo-3.1-32B-Think
  "gpt-oss 20B":      { gpqa: 71.5, swe: 60.7 },       // high effort, no tools; arXiv 2508.10925, Table 3
  "Gemma 4 26B-A4B":  { mmluPro: 82.6, gpqa: 82.3 },   // https://huggingface.co/google/gemma-4-26B-A4B-it
  "GLM-4.7-Flash 30B-A3B": { gpqa: 75.2, swe: 59.2 },  // https://huggingface.co/zai-org/GLM-4.7-Flash
  "Nemotron 3.5 Lightning 30B-A3B": { mmluPro: 81.9, gpqa: 75.4, swe: 51.6 }, // https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
  "Qwen3.6 35B-A3B":  { mmluPro: 85.2, gpqa: 86.0, swe: 73.4 }, // https://huggingface.co/Qwen/Qwen3.6-35B-A3B
  "Qwen3-Coder-Next 80B-A3B": { swe: 70.6 },           // SWE-Agent; arXiv 2603.00729, Table 3
  "gpt-oss 120B":     { gpqa: 80.1, swe: 62.4 },       // high effort, no tools; arXiv 2508.10925, Table 3
  "Nemotron 3.5 Super 120B-A12B": { gpqa: 89.5, swe: 71.1 }, // https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
  "Qwen3.8 Flash-Next": { gpqa: 91.7 },                // https://huggingface.co/Qwen/Qwen3.8-Flash-Next
  "Qwen3.5 397B-A17B": { mmluPro: 87.8, gpqa: 88.4, swe: 76.4 }, // https://huggingface.co/Qwen/Qwen3.5-397B-A17B
  "DeepSeek V4.1-Flash": { gpqa: 90.9 },               // https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
  "Kimi K3":          { gpqa: 93.5 },                  // max mode; https://huggingface.co/moonshotai/Kimi-K3
  "Llama 3.3 70B":    { mmluPro: 68.9, gpqa: 50.5 },   // meta-llama/llama-models llama3_3 MODEL_CARD.md
  "Mistral Medium 3.5 128B": { swe: 77.6 },            // https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
};

/* ===== GPU lookup: [regex, VRAM GB, memory bandwidth GB/s] — first match wins (as of 11/2026) =====
   Order matters: laptop variants before desktop, SUPER/Ti before base. Windows strings carry "(TM)"/"(R)" for AMD/Intel,
   e.g. "ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics (0x…) Direct3D11 …)". Laptop bandwidths are approximate.        */
const GPUS = [
  // --- Datacenter ---
  [/\bb300\b/i,288,8000],[/\bb200\b/i,180,8000],
  [/\bh200\b/i,141,4800],[/h100.*nvl/i,94,3900],[/h100.*pcie/i,80,2000],[/\bh100\b/i,80,3350],
  [/\ba100\b.*80\s*gb/i,80,2039],[/\ba100\b/i,40,1555],
  [/\bl40s?\b/i,48,864],[/\bl4\b/i,24,300],[/\bt4\b/i,16,320],
  // "nvidia " prefix required: a bare \ba10\b would also hit AMD APUs ("AMD A10-9600P Radeon R5")
  [/nvidia\s*a10g?\b/i,24,600],[/nvidia\s*a30x?\b/i,24,933],[/nvidia\s*a40\b/i,48,696],[/nvidia\s*l20\b/i,48,864],
  // --- Workstation: Blackwell RTX PRO (laptop first) ---
  [/rtx\s*pro\s*5000.*laptop/i,24,896],[/rtx\s*pro\s*4000.*laptop/i,16,896],[/rtx\s*pro\s*3000.*laptop/i,12,672],
  [/rtx\s*pro\s*2000.*laptop/i,8,384],[/rtx\s*pro\s*1000.*laptop/i,8,384],[/rtx\s*pro\s*500.*laptop/i,6,288],
  [/rtx\s*pro\s*6000/i,96,1792],
  [/rtx\s*pro\s*5000.*72\s*gb/i,72,1344],[/rtx\s*pro\s*5000/i,48,1344],
  [/rtx\s*pro\s*4500/i,32,896],[/rtx\s*pro\s*4000.*sff/i,24,432],[/rtx\s*pro\s*4000/i,24,672],[/rtx\s*pro\s*2000/i,16,288],
  // --- Workstation: Ada / Ampere / Turing (laptop first) ---
  [/rtx\s*5000\s*ada.*laptop/i,16,576],[/rtx\s*(3500|4000)\s*ada.*laptop/i,12,432],[/rtx\s*[23]000\s*ada.*laptop/i,8,256],
  [/rtx\s*1000\s*ada.*laptop/i,6,192],[/rtx\s*500\s*ada.*laptop/i,4,128],
  [/rtx\s*a5500.*laptop/i,16,512],[/rtx\s*a5000.*laptop/i,16,448],[/rtx\s*a4500.*laptop/i,16,512],[/rtx\s*a4000.*laptop/i,8,384],
  [/rtx\s*a3000\s*12\s*gb.*laptop/i,12,336],[/rtx\s*a3000.*laptop/i,6,264],
  [/rtx\s*a2000\s*8\s*gb.*laptop/i,8,224],[/rtx\s*a2000.*laptop/i,4,192],
  [/rtx\s*a1000\s*6\s*gb.*laptop/i,6,168],[/rtx\s*a1000.*laptop/i,4,224],[/rtx\s*a500\b.*laptop/i,4,112],
  [/rtx\s*6000\s*ada/i,48,960],[/rtx\s*5000\s*ada/i,32,576],[/rtx\s*4500\s*ada/i,24,432],
  [/rtx\s*4000\s*sff\s*ada/i,20,280],[/rtx\s*4000\s*ada/i,20,360],[/rtx\s*2000e?\s*ada/i,16,224],
  [/quadro\s*rtx\s*8000/i,48,672],[/quadro\s*rtx\s*6000/i,24,672],[/quadro\s*rtx\s*5000/i,16,448],[/quadro\s*rtx\s*4000/i,8,416],
  [/rtx\s*a6000/i,48,768],[/rtx\s*a5500/i,24,768],[/rtx\s*a5000/i,24,768],[/rtx\s*a4500/i,20,640],[/rtx\s*a4000/i,16,448],
  [/rtx\s*a2000.*12\s*gb/i,12,288],[/rtx\s*a2000/i,6,288],[/rtx\s*a1000/i,8,192],[/rtx\s*a400\b/i,4,96],
  // --- GeForce laptop (must precede desktop: "RTX 4090 Laptop GPU" is 16 GB, not 24) ---
  [/rtx\s*5090.*laptop/i,24,896],[/rtx\s*5080.*laptop/i,16,896],[/rtx\s*5070\s*ti.*laptop/i,12,672],
  [/rtx\s*5070.*laptop/i,8,384],[/rtx\s*5060.*laptop/i,8,384],[/rtx\s*5050.*laptop/i,8,384],
  [/rtx\s*4090.*laptop/i,16,576],[/rtx\s*4080.*laptop/i,12,432],[/rtx\s*4070.*laptop/i,8,256],
  [/rtx\s*4060.*laptop/i,8,256],[/rtx\s*4050.*laptop/i,6,192],
  [/rtx\s*3080\s*ti.*laptop/i,16,512],[/rtx\s*3080.*laptop/i,8,384],[/rtx\s*3070\s*ti.*laptop/i,8,448],
  [/rtx\s*3070.*laptop/i,8,448],[/rtx\s*3060.*laptop/i,6,336],[/rtx\s*3050\s*6\s*gb.*laptop/i,6,144],
  [/rtx\s*3050\s*ti.*laptop/i,4,192],[/rtx\s*3050.*laptop/i,4,192],
  // GTX 16/10: laptop strings carry no "Laptop GPU" suffix and VRAM matches desktop, so one entry covers both
  [/gtx\s*1650\s*(ti|super)/i,4,192],[/gtx\s*1650/i,4,128],[/gtx\s*1050\s*ti/i,4,112],[/gtx\s*1050/i,2,112],
  [/laptop\s*gpu/i,8,256],                                      // safety net: never fall through to a desktop entry
  // --- GeForce desktop ---
  [/rtx\s*5090/i,32,1792],[/rtx\s*5080/i,16,960],[/rtx\s*5070\s*ti/i,16,896],[/rtx\s*5070/i,12,672],
  [/rtx\s*5060\s*ti/i,8,448],                                    // 8 & 16 GB share one PCI ID — assume 8, edit if needed
  [/rtx\s*5060/i,8,448],[/rtx\s*5050/i,8,320],
  [/rtx\s*4090/i,24,1008],[/rtx\s*4080\s*super/i,16,736],[/rtx\s*4080/i,16,717],
  [/rtx\s*4070\s*ti\s*super/i,16,672],[/rtx\s*4070\s*ti/i,12,504],[/rtx\s*4070/i,12,504],
  [/rtx\s*4060\s*ti.*0x0*2805/i,16,288],[/rtx\s*4060\s*ti/i,8,288],[/rtx\s*4060/i,8,272],   // 0x2805 = 16 GB variant (Windows)
  [/rtx\s*3090\s*ti/i,24,1008],[/rtx\s*3090/i,24,936],[/rtx\s*3080\s*ti/i,12,912],[/rtx\s*3080/i,10,760],
  [/rtx\s*3070\s*ti/i,8,608],[/rtx\s*3070/i,8,448],[/rtx\s*3060\s*ti/i,8,448],
  [/rtx\s*3060\s*8\s*gb/i,8,240],[/rtx\s*3060/i,12,360],[/rtx\s*3050\s*6\s*gb/i,6,168],[/rtx\s*3050/i,8,224],
  [/titan\s*rtx/i,24,672],[/rtx\s*2080\s*ti/i,11,616],[/rtx\s*2080\s*super/i,8,496],[/rtx\s*2080/i,8,448],[/rtx\s*2070/i,8,448],
  [/rtx\s*2060\s*super/i,8,448],[/rtx\s*2060/i,6,336],
  [/gtx\s*1080\s*ti/i,11,484],[/gtx\s*1080/i,8,320],[/gtx\s*1070/i,8,256],[/gtx\s*1660\s*(ti|super)/i,6,288],[/gtx\s*1660/i,6,192],[/gtx\s*1060/i,6,192],
  // --- AMD (require "rx"/"pro" so bare numbers never match) ---
  [/ai\s*pro\s*r9700/i,32,640],[/pro\s*w7900/i,48,864],[/pro\s*w7800.*48\s*gb/i,48,864],[/pro\s*w7800/i,32,576],
  [/rx\s*9070\s*xt/i,16,640],[/rx\s*9070\s*gre/i,12,432],[/rx\s*9070/i,16,640],
  [/rx\s*9060\s*xt/i,16,320],[/rx\s*9060/i,8,320],               // 9060 XT also ships with 8 GB under the same name
  [/rx\s*7900m/i,16,576],[/rx\s*7800m/i,12,432],[/rx\s*7700s/i,8,288],[/rx\s*7600m\s*xt/i,8,288],[/rx\s*7600[ms]/i,8,256],  // laptop
  [/rx\s*7900\s*xtx/i,24,960],[/rx\s*7900\s*xt/i,20,800],[/rx\s*7900\s*gre/i,16,576],[/rx\s*7800\s*xt/i,16,624],
  [/rx\s*7700\s*xt/i,12,432],[/rx\s*7700\b/i,16,624],[/rx\s*7600\s*xt/i,16,288],[/rx\s*7600/i,8,288],
  [/rx\s*6950\s*xt/i,16,576],[/rx\s*6900\s*xt/i,16,512],[/rx\s*6800m/i,12,384],[/rx\s*6800s/i,8,256],[/rx\s*6800/i,16,512],
  [/rx\s*6750\s*xt/i,12,432],[/rx\s*6700\s*xt/i,12,384],[/rx\s*6700/i,10,320],[/rx\s*6650\s*xt/i,8,280],[/rx\s*6600/i,8,224],
  // --- Intel discrete ---
  [/arc(\(tm\))?\s*pro\s*b70/i,32,608],[/arc(\(tm\))?\s*pro\s*b65/i,32,608],[/arc(\(tm\))?\s*pro\s*b60/i,24,456],[/arc(\(tm\))?\s*pro\s*b50/i,16,224],
  [/arc(\(tm\))?\s*b580/i,12,456],[/arc(\(tm\))?\s*b570/i,10,380],
  [/arc(\(tm\))?\s*a770/i,16,560],[/arc(\(tm\))?\s*a750/i,8,512],[/arc(\(tm\))?\s*a580/i,8,512],[/arc(\(tm\))?\s*a380/i,6,186],
];

/* ===== Non-Apple unified-memory platforms: [regex, { name, ram options (GB), bandwidth GB/s }] — checked before GPUS ===== */
const UNIFIED = [
  [/\bgb10\b/i,                    { name: "NVIDIA GB10 (DGX Spark)",        ram: [128],             bw: 273 }],
  [/radeon(\(tm\))?\s*80[456]0s/i, { name: "AMD Ryzen AI Max (Strix Halo)",  ram: [32,64,96,128],    bw: 256 }],
  [/adreno(\(tm\))?\s*x2-/i,       { name: "Snapdragon X2 Elite",            ram: [16,32,48,64,128], bw: 152 }],
  [/adreno(\(tm\))?\s*x1-/i,       { name: "Snapdragon X Elite / Plus",      ram: [16,32,64],        bw: 135 }],
  [/arc(\(tm\))?\s*1[34]0v/i,      { name: "Intel Lunar Lake",               ram: [16,32],           bw: 136 }],
  [/arc(\(tm\))?\s*b3[79]0/i,      { name: "Intel Panther Lake",             ram: [16,32,64,96],     bw: 150 }],
  [/radeon(\(tm\))?\s*8[6-9]0m/i,  { name: "AMD Ryzen AI 300 (Strix Point)", ram: [16,24,32,64],     bw: 120 }],
];

/* CPU-only decode: typical dual-channel DDR5 (≈ 90 GB/s theoretical) */
const CPU_BW = 80;

/* ===== Apple Silicon database (as of 11/2026; apple.com tech specs) =====
   Keyed by chip; per CPU-core-count bin: cores by tier, GPU cores, memory bandwidth (GB/s).
   M1–M4: p = performance, e = efficiency · M5+: s = super, p = performance, e = efficiency (Apple's terms).
   ram = configurable options (GB); a bin may narrow it (bin.ram). alt = second GPU variant with the same CPU,
   told apart by RAM. bwByRam overrides bandwidth for a RAM size (M6 16 GB).                                       */
const APPLE_CHIPS = {
  "M1":       { ram: [8,16],            bins: { 8:{p:4,e:4,gpu:8,bw:68, alt:{gpu:7}} } },
  "M1 Pro":   { ram: [16,32],           bins: { 10:{p:8,e:2,gpu:16,bw:200, alt:{gpu:14}}, 8:{p:6,e:2,gpu:14,bw:200} } },
  "M1 Max":   { ram: [32,64],           bins: { 10:{p:8,e:2,gpu:32,bw:400, alt:{gpu:24}} } },
  "M1 Ultra": { ram: [64,128],          bins: { 20:{p:16,e:4,gpu:64,bw:800, alt:{gpu:48}} } },
  "M2":       { ram: [8,16,24],         bins: { 8:{p:4,e:4,gpu:10,bw:100, alt:{gpu:8}} } },
  "M2 Pro":   { ram: [16,32],           bins: { 12:{p:8,e:4,gpu:19,bw:200}, 10:{p:6,e:4,gpu:16,bw:200} } },
  "M2 Max":   { ram: [32,64,96],        bins: { 12:{p:8,e:4,gpu:38,bw:400, alt:{gpu:30,ram:[32,64]}} } },
  "M2 Ultra": { ram: [64,128,192],      bins: { 24:{p:16,e:8,gpu:76,bw:800, alt:{gpu:60}} } },
  "M3":       { ram: [8,16,24],         bins: { 8:{p:4,e:4,gpu:10,bw:100, alt:{gpu:8}} } },
  "M3 Pro":   { ram: [18,36],           bins: { 12:{p:6,e:6,gpu:18,bw:150}, 11:{p:5,e:6,gpu:14,bw:150} } },
  "M3 Max":   { ram: [36,48,64,96,128], bins: { 16:{p:12,e:4,gpu:40,bw:400,ram:[48,64,128]}, 14:{p:10,e:4,gpu:30,bw:300,ram:[36,96]} } },
  "M3 Ultra": { ram: [96,256,512],      bins: { 32:{p:24,e:8,gpu:80,bw:819}, 28:{p:20,e:8,gpu:60,bw:819,ram:[96,256]} } },
  "M4":       { ram: [16,24,32],        bins: { 10:{p:4,e:6,gpu:10,bw:120, alt:{gpu:8}}, 8:{p:4,e:4,gpu:8,bw:120,ram:[16,24]} } },
  "M4 Pro":   { ram: [24,48,64],        bins: { 14:{p:10,e:4,gpu:20,bw:273}, 12:{p:8,e:4,gpu:16,bw:273} } },
  "M4 Max":   { ram: [36,48,64,128],    bins: { 16:{p:12,e:4,gpu:40,bw:546,ram:[48,64,128]}, 14:{p:10,e:4,gpu:32,bw:410,ram:[36]} } },
  "M5":       { ram: [16,24,32],        bins: { 10:{s:4,e:6,gpu:10,bw:153, alt:{gpu:8}} } },
  "M5 Pro":   { ram: [24,48,64],        bins: { 18:{s:6,p:12,gpu:20,bw:307}, 15:{s:5,p:10,gpu:16,bw:307,ram:[24,48]} } },
  "M5 Max":   { ram: [36,48,64,128],    bins: { 18:{s:6,p:12,gpu:40,bw:614,ram:[48,64,128], alt:{gpu:32,bw:460,ram:[36]}} } },
  "M5 Ultra": { ram: [96,256,512],      bins: { 36:{s:12,p:24,gpu:80,bw:1200}, 30:{s:10,p:20,gpu:64,bw:1200,ram:[96]} } },
  "M6":       { ram: [16,24,32], bwByRam: { 16:153 },
                bins: { 12:{s:2,p:4,e:6,gpu:12,bw:170}, 10:{s:2,p:3,e:5,gpu:10,bw:170,ram:[16,24]} } },
  "A18 Pro":  { ram: [8],               bins: { 6:{p:2,e:4,gpu:5,bw:60} } },   // MacBook Neo (support.apple.com/126322)
};
