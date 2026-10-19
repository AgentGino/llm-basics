---
sidebar_position: 9
slug: /model-deployment
---

# Chapter 8 — Model Deployment

**Exam domain: Model Deployment — 9%**

## Purpose

Learn how to package, serve, scale, and tune LLM inference systems for dependable latency and throughput.

## Learning objectives

- Compare offline batch, synchronous online, and asynchronous serving.
- Understand Docker, Kubernetes, dynamic batching, and model repositories.
- Explain latency/throughput/memory tradeoffs.
- Recognize where NVIDIA Triton, TensorRT-LLM, NIM, and Dynamo fit.
- Design a safe deployment rollout.

---

## 1. Serving is a systems problem
A deployed LLM must meet a workload contract: model/version, hardware, context limit, expected concurrency, input/output token distribution, latency SLOs, throughput, error behavior, and safety controls. A benchmark using short prompts and one user may not represent production.

## 2. Containers and orchestration
Docker packages the model server and dependencies reproducibly. Kubernetes schedules containers, manages replicas, provides service discovery, supports rolling updates, and helps isolate resource requests/limits. It does not magically solve GPU capacity, model loading time, traffic spikes, or unsafe releases.

## 3. Batching and scheduling
Dynamic batching combines compatible requests to improve accelerator utilization. The scheduling policy must balance throughput with queueing delay and tail latency. LLM-specific serving often uses continuous/in-flight batching because requests finish at different times and generate different lengths.

## 4. NVIDIA serving concepts
Triton Inference Server provides model serving and scheduling capabilities. TensorRT-LLM focuses on optimizing LLM inference on NVIDIA GPUs, including parallelism, quantization, and KV-cache configurations. NVIDIA NIM packages optimized inference microservices. Dynamo is a distributed inference framework for scaling generative workloads. Learn the role of each rather than memorizing product names.

## 5. Rollout and rollback
Use immutable artifacts, versioned prompts/configuration, health checks, canary traffic, meaningful dashboards, and a tested rollback. Evaluate quality and safety under production-like load before expanding a release.

## Mini-lab
Design a serving plan for a 7B chat model: define max input/output tokens, concurrency expectation, p95 latency SLO, batching policy, KV-cache budget, dashboards, and rollback trigger. Explain one configuration that improves throughput but may hurt user experience.

## Study checkpoint
- I can distinguish dynamic batching from continuous batching.
- I can explain why p95 latency matters beside average latency.
- I can describe the role of Triton and TensorRT-LLM.
- I can list what must be versioned for a reproducible deployment.


---

## Further learning resources

### Reading and documentation

1. [NVIDIA TensorRT-LLM documentation](https://nvidia.github.io/TensorRT-LLM/)
2. [NVIDIA Triton Inference Server documentation](https://docs.nvidia.com/deeplearning/triton-inference-server/)
3. [NVIDIA Dynamo documentation](https://docs.nvidia.com/dynamo/)
4. [Docker Get Started](https://docs.docker.com/get-started/)
5. [Kubernetes documentation](https://kubernetes.io/docs/home/)

### Videos

- [NVIDIA Triton Inference Server search](https://www.youtube.com/results?search_query=NVIDIA+Triton+Inference+Server+tutorial)
- [TensorRT-LLM serving search](https://www.youtube.com/results?search_query=TensorRT-LLM+serving+tutorial)
- [Kubernetes for ML serving search](https://www.youtube.com/results?search_query=Kubernetes+machine+learning+model+serving)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
