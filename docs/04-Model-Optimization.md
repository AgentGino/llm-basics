---
sidebar_position: 5
slug: /model-optimization
---

# Chapter 4 — Model Optimization

**Exam domain: Model Optimization — 17%**

## Purpose

Learn to reduce cost and latency while preserving enough model quality for the actual task. This is the highest-weighted exam domain.

## Learning objectives

- Compare quantization, pruning, sparsity, and distillation.
- Explain FP32, TF32, BF16, FP16, INT8, and FP8 tradeoffs.
- Differentiate post-training quantization from quantization-aware training.
- Describe KV-cache, attention, and batching tradeoffs.
- Design an ablation and benchmark plan instead of optimizing by intuition.

---

## 1. Optimization is a tradeoff exercise
Optimize for an explicit target: p50/p95 latency, throughput, GPU memory, cost per token, power, startup time, or quality. A faster model that misses the quality bar is not an optimization. Establish a baseline, choose representative traffic, and measure both performance and task quality.

## 2. Quantization
Quantization represents weights and/or activations with lower precision. Lower precision reduces memory bandwidth and storage and can unlock faster hardware paths, but it may reduce quality or create numerical instability.

- **Post-training quantization (PTQ):** quantize an already trained model; fast and inexpensive, but sensitive models/tasks may lose more quality.
- **Quantization-aware training (QAT):** simulate quantization effects during training; more costly but can retain quality better.
- **Weight-only quantization:** lowers weight storage; common for LLM inference.
- **Activation/KV-cache quantization:** can reduce runtime memory further but needs careful validation.

Calibration data should resemble production inputs. A tiny or unrepresentative calibration set can create misleading results.

## 3. Pruning, sparsity, and distillation
**Pruning** removes parameters or structures judged less important. Unstructured sparsity does not automatically deliver speedup unless the runtime and hardware exploit it. **Structured pruning** removes heads, channels, or blocks and is often easier to accelerate.

**Knowledge distillation** trains a smaller student model to match a larger teacher’s outputs or internal signals. It can reduce serving cost substantially but requires a representative distillation dataset and strong evaluation.

## 4. Attention and inference optimizations
KV caching avoids recomputing prior attention keys and values during autoregressive decoding, at the cost of GPU memory. Sliding-window attention limits which history tokens are attended to. Paged KV caches improve memory allocation efficiency for serving variable-length requests. Continuous/in-flight batching increases throughput but can alter latency behavior.

## 5. A sound experiment loop
1. Capture baseline quality, latency, throughput, memory, and workload mix.
2. Change one important variable at a time where practical.
3. Measure overall quality and slices such as long context, multilingual, safety, and tool calls.
4. Inspect regressions and decide whether the cost improvement justifies them.
5. Record hardware, software versions, settings, prompts, and datasets.

## Mini-lab
For a small open model, compare BF16 baseline with one quantized variant. Record memory use, tokens/second, p50 latency, and task scores on 20 representative prompts. Write a one-paragraph decision: ship, reject, or investigate further.

## Study checkpoint
- I can distinguish PTQ from QAT.
- I know why INT8/FP8 are not automatically “better.”
- I can explain why sparsity may fail to improve wall-clock latency.
- I can identify the quality metrics needed beside tokens/second.


---

## Further learning resources

### Reading and documentation

1. [NVIDIA TensorRT documentation](https://docs.nvidia.com/tensorrt/)
2. [TensorRT-LLM documentation](https://nvidia.github.io/TensorRT-LLM/)
3. [NVIDIA TensorRT Model Optimizer](https://docs.nvidia.com/deeplearning/tensorrt/model-optimizer/)
4. [GPTQ paper](https://arxiv.org/abs/2210.17323)
5. [DistilBERT paper](https://arxiv.org/abs/1910.01108)

### Videos

- [NVIDIA TensorRT-LLM search](https://www.youtube.com/results?search_query=NVIDIA+TensorRT-LLM+quantization)
- [Hugging Face quantization search](https://www.youtube.com/results?search_query=Hugging+Face+LLM+quantization)
- [Knowledge distillation explainer search](https://www.youtube.com/results?search_query=knowledge+distillation+deep+learning+explained)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
