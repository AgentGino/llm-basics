---
sidebar_position: 3
slug: /prompt-engineering-and-rag
---

# Chapter 2 — Prompt Engineering and RAG

**Exam domain: Prompt Engineering — 13%**

## Purpose

Learn to shape LLM behavior without changing model weights, and to ground answers in retrieved evidence when the model needs external knowledge.

## Learning objectives

- Write clear task, context, constraint, and output-format instructions.
- Choose zero-shot, one-shot, or few-shot prompting deliberately.
- Use structured output and validation rather than trusting prose.
- Explain the RAG pipeline and the failure modes at each stage.
- Separate prompt engineering from fine-tuning and retrieval.

---

## 1. Prompting as interface design
A prompt is an interface contract, not a magic spell. A robust prompt states the task, gives relevant context, sets constraints, defines a response format, and says what to do when evidence is insufficient. Strong prompts reduce ambiguity; they do not guarantee factual truth.

A useful baseline template is: **role/task → supplied context → rules → desired format → examples → fallback behavior**. Put the most important instructions near the beginning, delimit untrusted content clearly, and tell the model to cite or say “I do not know” when the evidence does not support an answer.

## 2. Zero-shot, one-shot, and few-shot
- **Zero-shot:** direct instruction without demonstrations. Use it for well-understood tasks and when examples would add noise or cost.
- **One-shot:** one example establishes style or schema.
- **Few-shot:** several diverse examples teach a pattern, class boundary, or formatting rule.

Examples should represent tricky cases, not merely easy ones. If the model is inconsistent, improve the task specification and examples before adding more tokens.

## 3. Reasoning and output control
For complex work, ask for intermediate checks, decomposition, or a concise rationale appropriate to the task. In production, do not depend on hidden reasoning. Instead, require observable artifacts: extracted fields, cited evidence, calculations checked by tools, or a validator.

For structured output, use a JSON schema, enumerated allowed values, type checks, retries, and repair logic. Treat model output as untrusted input to your software.

## 4. RAG fundamentals
Retrieval-augmented generation has five stages:
1. ingest and clean source documents;
2. split them into meaningful chunks with metadata;
3. embed and index chunks;
4. retrieve and often rerank candidates for a query;
5. give selected evidence to the generator with an answer/citation policy.

RAG changes the model’s context; it does not update model weights. It is generally preferable to fine-tuning when knowledge changes often, must be attributable, or is private to an organization.

## 5. RAG failure analysis
Bad answers can originate in retrieval (missing or irrelevant chunks), ranking (right evidence buried), context assembly (too much or poorly ordered evidence), generation (unsupported synthesis), or evaluation (tests do not represent real questions). Diagnose the stage before changing the model.

## Mini-lab
Pick five questions about the certification study guide. Create a prompt that requires an answer only from supplied excerpts, includes chapter/page citations, and returns `insufficient_evidence` when no excerpt supports the claim. Then test it with one answerable, one ambiguous, and one unanswerable question.

## Study checkpoint
- I can explain why a prompt is not a substitute for current knowledge.
- I can select zero-, one-, and few-shot methods.
- I can distinguish RAG from fine-tuning.
- I can name a likely cause for an answer that is fluent but uncited or unsupported.


---

## Further learning resources

### Reading and documentation

1. [NVIDIA: Build LLM Applications With Prompt Engineering](https://www.nvidia.com/en-us/training/online/)
2. [NVIDIA RAG Blueprint documentation](https://docs.nvidia.com/ai-blueprints/)
3. [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction)
4. [Prompt Engineering Guide](https://www.promptingguide.ai/)
5. [RAGAS documentation](https://docs.ragas.io/)

### Videos

- [DeepLearning.AI — ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)
- [NVIDIA Developer YouTube — RAG search](https://www.youtube.com/results?search_query=NVIDIA+Developer+RAG+LLM)
- [Hugging Face YouTube — RAG search](https://www.youtube.com/results?search_query=Hugging+Face+RAG+tutorial)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
