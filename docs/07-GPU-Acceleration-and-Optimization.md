---
sidebar_position: 8
slug: /gpu-acceleration-and-optimization
---

# Chapter 7 — GPU Acceleration and Distributed Training

**Exam domain: GPU Acceleration and Optimization — 14%**

## Purpose

Learn how large-model training and inference use GPU memory, parallelism, mixed precision, batching, and profiling.

## Learning objectives

- Explain GPU memory use for weights, activations, gradients, optimizer state, and KV cache.
- Compare data, tensor, pipeline, sequence, expert, and FSDP-style sharding.
- Use mixed precision and gradient accumulation conceptually.
- Read basic profiling symptoms.
- Reason from a bottleneck to an appropriate change.

---

## 1. Memory is the first constraint
Training memory includes model weights, gradients, optimizer states, activations, temporary workspaces, and communication buffers. In inference, weights and KV cache dominate. A model that fits at batch size one may still fail under real concurrency because each active request consumes KV-cache memory.

## 2. Precision and accumulation
Mixed precision uses lower-precision math where safe and higher precision where needed for stability. BF16 has a wider exponent range than FP16 and is commonly attractive on supported hardware. Gradient accumulation simulates a larger effective batch by summing gradients across microbatches before an optimizer step; it trades throughput and wall-clock time for lower peak memory.

## 3. Parallelism vocabulary
- **Data parallelism / DDP:** each worker holds a model replica and processes different data; gradients synchronize.
- **FSDP / parameter sharding:** shards parameters, gradients, and/or optimizer state across workers to reduce per-device memory.
- **Tensor parallelism:** splits matrix operations across devices.
- **Pipeline parallelism:** puts consecutive layer groups on different devices; can create pipeline bubbles.
- **Sequence/context parallelism:** distributes long-sequence work.
- **Expert parallelism:** distributes mixture-of-experts routing and expert layers.

These methods can be combined. The right strategy depends on model size, sequence length, interconnect, batch size, and operational complexity.

## 4. Profiling mindset
First classify the bottleneck: compute-bound, memory-bandwidth-bound, communication-bound, CPU/input-bound, or scheduling-bound. Look at GPU utilization, memory allocation, kernel timelines, communication time, data-loader time, tokens/sec, and tail latency. A low utilization chart alone does not reveal the cause.

## 5. Practical levers
Use a correct batch size, efficient data loading, mixed precision, activation checkpointing, gradient accumulation, appropriate parallelism, compiler/runtime optimizations, and profiling-guided kernel work. Change one meaningful factor, measure, and record the workload.

## Mini-lab
Given an out-of-memory training run, propose three options: reduce microbatch and use accumulation; enable activation checkpointing; shard with FSDP. For each, state what it saves and what it costs. Then identify the first metric you would inspect before choosing.

## Study checkpoint
- I can list the major training-memory components.
- I can distinguish DDP from FSDP and tensor parallelism.
- I can explain gradient accumulation accurately.
- I can name at least four possible sources of low throughput.


---

## Further learning resources

### Reading and documentation

1. [PyTorch Distributed Data Parallel documentation](https://docs.pytorch.org/docs/stable/generated/torch.nn.parallel.DistributedDataParallel.html)
2. [PyTorch FSDP documentation](https://docs.pytorch.org/docs/stable/fsdp.html)
3. [NVIDIA CUDA C++ Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/)
4. [NVIDIA Nsight Systems documentation](https://docs.nvidia.com/nsight-systems/)
5. [NVIDIA NeMo parallelisms guide](https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/features/parallelisms.html)

### Videos

- [NVIDIA Nsight profiling search](https://www.youtube.com/results?search_query=NVIDIA+Nsight+Systems+profiling+machine+learning)
- [PyTorch DDP / FSDP search](https://www.youtube.com/results?search_query=PyTorch+DDP+FSDP+explained)
- [NVIDIA model parallelism search](https://www.youtube.com/results?search_query=NVIDIA+model+parallelism+large+language+models)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
