---
sidebar_position: 6
slug: /fine-tuning-and-alignment
---

# Chapter 5 — Fine-Tuning and Alignment

**Exam domain: Fine-Tuning — 13%**

## Purpose

Learn when changing model weights is justified, how parameter-efficient methods work, and how to align models with task preferences safely.

## Learning objectives

- Choose among prompting, RAG, full fine-tuning, and PEFT.
- Explain supervised fine-tuning, LoRA, adapters, and prompt tuning.
- Understand preference optimization concepts: RLHF, DPO, and GRPO.
- Detect overfitting and hallucination regressions.
- Build a pre/post fine-tuning evaluation plan.

---

## 1. Decide whether to fine-tune
Use prompting for instruction clarity, RAG for changing or attributable knowledge, and fine-tuning for persistent behavior, style, domain task performance, or an output policy that cannot be reliably achieved through prompting alone. Fine-tuning is not the best default fix for missing facts in documents.

## 2. Supervised fine-tuning (SFT)
SFT trains a pretrained model on input/output demonstrations. Quality matters more than raw quantity: label errors, inconsistent policies, and synthetic artifacts can become model behavior. Keep a held-out evaluation set that was not used for data creation or iterative prompt selection.

## 3. Parameter-efficient fine-tuning
Full fine-tuning updates all parameters and is expensive to store and train. PEFT methods update far fewer parameters.

- **LoRA:** learns low-rank updates inserted into selected linear layers.
- **Adapters:** add small trainable modules between frozen layers.
- **Prompt/P-tuning:** learns virtual prompt vectors rather than all model weights.

PEFT reduces training and storage cost and enables multiple task adapters, but target-module choice, rank, data, and serving integration still matter.

## 4. Preference alignment
RLHF uses human preference data to guide behavior, historically involving a reward model and reinforcement learning. DPO directly optimizes preferred versus dispreferred response pairs without the same RL loop. GRPO is a group-relative policy optimization approach that compares candidate responses within a group. For the exam, know their goal: steer helpfulness, style, and policy compliance—not prove factual correctness.

## 5. Avoiding false confidence
Fine-tuning can increase fluency and confidence while making unsupported answers sound stronger. Evaluate factuality, citations, refusal behavior, safety, calibration, and performance on prior capabilities. Use early stopping based on held-out metrics and inspect failure examples, not only aggregate loss.

## Mini-lab
Write a decision memo for a customer-support assistant: which requirements need RAG, which need prompting, and which might justify LoRA. Define a small held-out test set and success metrics before training.

## Study checkpoint
- I can explain the difference between SFT and preference optimization.
- I can name a case where RAG is better than fine-tuning.
- I can explain LoRA in plain language.
- I know why a lower training loss is not enough to ship a tuned model.


---

## Further learning resources

### Reading and documentation

1. [Hugging Face PEFT documentation](https://huggingface.co/docs/peft)
2. [LoRA paper](https://arxiv.org/abs/2106.09685)
3. [Direct Preference Optimization paper](https://arxiv.org/abs/2305.18290)
4. [NVIDIA NeMo Framework documentation](https://docs.nvidia.com/nemo-framework/user-guide/latest/)
5. [NVIDIA TensorRT-LLM multi-LoRA documentation](https://nvidia.github.io/TensorRT-LLM/advanced/lora.html)

### Videos

- [Hugging Face PEFT / LoRA search](https://www.youtube.com/results?search_query=Hugging+Face+PEFT+LoRA+tutorial)
- [NVIDIA NeMo fine-tuning search](https://www.youtube.com/results?search_query=NVIDIA+NeMo+LLM+fine+tuning)
- [DPO explained search](https://www.youtube.com/results?search_query=Direct+Preference+Optimization+DPO+explained)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
