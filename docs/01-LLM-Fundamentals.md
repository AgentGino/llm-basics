---
sidebar_position: 2
slug: /llm-fundamentals
---

# Chapter 1 — LLM Fundamentals

## Purpose

This chapter builds the mental model behind modern large language models (LLMs). By the end, you should be able to explain how text becomes model inputs, how a transformer processes those inputs, why encoder and decoder models behave differently, and how generation settings change an answer.

This maps to the certification guide's **LLM Architecture** domain: encoder-decoder structures, transformer/self-attention, embeddings, and advanced output sampling.

---

## 1. The big picture

An LLM is a neural network trained to predict language from huge amounts of text. The key idea is simple:

> Given some context, predict a probability distribution for what comes next.

For example, after the text `The capital of France is`, a language model assigns high probability to `Paris`, but it still computes probabilities for many other tokens.

A production LLM system has four distinct stages:

1. **Text preparation** — normalize text and split it into tokens.
2. **Representation** — turn token IDs into dense numeric vectors called embeddings.
3. **Transformer computation** — use attention and feed-forward layers to contextualize every token.
4. **Output selection** — turn output scores into a next token using a decoding/sampling policy.

Do not blend these together. Tokenization decides how text is represented; the transformer learns relationships; decoding decides how the answer is selected.

---

## 2. Tokens and tokenization

### What is a token?

A token is the discrete unit a model reads and generates. It is **not always a word**. A token can be a word, punctuation, a subword fragment, whitespace, or a code fragment.

`unbelievable` might be one token in one tokenizer and several pieces such as `un`, `believ`, `able` in another. The exact behavior depends on the model's tokenizer and vocabulary.

### Why subword tokenization?

A word-only vocabulary becomes enormous and struggles with rare words, misspellings, names, and new vocabulary. Character-level tokenization makes sequences long and expensive. Subword tokenization is the practical middle ground.

Common approaches:

- **BPE (Byte Pair Encoding):** repeatedly merges frequent symbol pairs. Widely used in GPT-style systems.
- **WordPiece:** chooses vocabulary pieces that improve likelihood under its training objective; commonly associated with BERT-family tokenizers.
- **Unigram:** starts with a larger set of pieces and removes the least useful alternatives.

### Practical implications

- **Context window limits are token limits**, not word limits.
- A tokenizer affects cost, latency, multilingual performance, code handling, and how much useful content fits in context.
- Adding special tokens (for chat roles, tool calls, padding, or document boundaries) changes the input format a model expects.

### Mini-exercise

Explain why a 4,000-token context window cannot safely be described as “4,000 words.” Then name two cases where token count can be much higher than expected.

---

## 3. Embeddings

### Token embeddings

A model cannot process a token ID like `15342` directly as a meaningful number. An **embedding layer** maps every token ID to a learned vector, for example a vector with thousands of dimensions.

Tokens used in similar contexts tend to develop related vector representations. The vector is not a dictionary definition; it is a learned representation useful for the model's prediction task.

### Contextual embeddings

The embedding of `bank` should differ in:

- `I deposited money at the bank.`
- `We sat on the river bank.`

Static token embeddings begin the same, but transformer layers update them based on surrounding context. The resulting hidden states are contextual embeddings.

### Sentence/document embeddings

For retrieval, semantic search, clustering, or RAG, we often need one vector for a whole passage. Dedicated embedding models encode an input into a vector where semantic similarity can be compared using cosine similarity or dot product.

**Important distinction:**

- Generative LLM hidden states help generate text.
- An embedding model creates compact vectors optimized for similarity/retrieval.
- Using a random generative model's final hidden state is not automatically the best retrieval embedding.

### Common applications

- Semantic search and RAG retrieval
- Recommendation and similarity matching
- Classification and clustering
- Duplicate detection
- Retrieval evaluation

---

## 4. Transformer architecture

The transformer replaced recurrent sequence processing with attention-based computation that can process many tokens in parallel during training.

A typical transformer block contains:

1. **Multi-head self-attention** — lets tokens exchange information.
2. **Residual connection + normalization** — stabilizes deep learning.
3. **Feed-forward network (MLP/FFN)** — transforms each token representation independently.
4. **Another residual connection + normalization.**

This block is repeated many times. Earlier layers often capture simpler patterns; later layers can represent more abstract relationships, although real models do not cleanly assign one concept to one layer.

### Positional information

Attention alone does not know whether a token appeared first or last. Transformers add positional information, such as learned positional embeddings or rotary position embeddings (RoPE), so token order affects the computation.

### Residual connections

A residual connection adds a layer's input back to its output. This helps gradients flow through many layers and lets the model refine rather than replace representations.

### Feed-forward network

The FFN/MLP applies the same small neural network to every token position. Attention mixes information *across tokens*; the FFN transforms information *within each token representation*.

---

## 5. Self-attention: the central mechanism

Self-attention allows each token to weigh other relevant tokens in the sequence.

For each token representation, the model computes three projections:

- **Query (Q):** what this token is looking for.
- **Key (K):** what each possible source token offers.
- **Value (V):** information contributed if a source token is selected.

The model compares queries to keys, converts the scores to attention weights with softmax, and uses those weights to combine values:

`Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V`

You do not need to derive the equation for the certification, but you should understand its consequences:

- A token can focus more on relevant earlier tokens than irrelevant nearby ones.
- Attention weights are dynamic: the same word can attend differently in different sentences.
- The cost of standard full attention grows roughly with the square of sequence length, which makes long context expensive.

### Example intuition

In `The animal did not cross the street because it was tired`, the word `it` needs context to determine what was tired. Attention lets the representation of `it` incorporate information from `animal` and other relevant words.

### Multi-head attention

Instead of one attention calculation, a layer uses multiple heads. Each head learns different relation patterns or representation subspaces. The outputs are combined.

Do not claim that every head corresponds neatly to a human-interpretable skill. Some attention heads display recognizable patterns; many do not.

### Causal masking

A decoder-only text generator must not view future tokens when predicting the next token. A **causal mask** blocks attention from a position to later positions.

This is why a decoder can generate one token at a time while staying faithful to the next-token prediction objective.

---

## 6. Model families: encoder, decoder, and encoder-decoder

### Encoder-only models

Examples: BERT-like models.

- Every token can attend to both left and right context.
- Often trained with masked language modeling, where some tokens are hidden and predicted.
- Strong for classification, token labeling, extractive QA, and embeddings.
- Not naturally optimized for open-ended, autoregressive generation.

### Decoder-only models

Examples: GPT-like LLMs.

- Use causal masking: each token attends only to earlier tokens.
- Usually trained with causal language modeling / next-token prediction.
- Strong for chat, completion, code generation, and tool-using agents.
- During inference, generates token by token; the previous generated tokens are part of the next context.

### Encoder-decoder models

Examples: T5, BART-style architectures.

- The encoder reads an input bidirectionally.
- The decoder generates output autoregressively while attending to both its own prior output and the encoder's representation.
- Good fit for input-to-output tasks such as translation, summarization, and transformation.

### Decision guide

| Need | Usually a good starting architecture |
|---|---|
| Classify text / label tokens / create retrieval vectors | Encoder-only |
| Free-form generation / chat / code completion | Decoder-only |
| Translate or transform a known input into an output | Encoder-decoder |

In real projects, choose based on task quality, latency, cost, deployment constraints, data availability, and ecosystem support—not only architecture labels.

---

## 7. Training objectives in plain English

### Causal language modeling (CLM)

Predict the next token from prior tokens. This is the standard objective behind decoder-only generative models.

Example: given `Machine learning is`, predict a distribution for the next token, then repeat across many positions in the training data.

### Masked language modeling (MLM)

Hide selected tokens and predict them using both left and right context. This supports bidirectional language understanding and is common in encoder models.

Example: `The capital of France is [MASK].`

### Next sentence prediction (NSP)

A historical BERT-related objective that attempts to predict whether two sentences originally followed each other. It is useful to recognize but not universal in modern training recipes.

---

## 8. From logits to generated text

At each generation step, a decoder produces a score (a **logit**) for every vocabulary token. A softmax converts logits into probabilities. A decoding policy chooses the next token.

### Greedy decoding

Always choose the highest-probability token.

- **Benefit:** deterministic, simple, often coherent.
- **Risk:** repetitive or bland outputs; may miss a better overall sequence.

### Temperature

Temperature rescales logits before softmax.

- **Low temperature** (near 0): more deterministic, safer, less diverse.
- **Higher temperature:** more varied, creative, and risky.

Temperature changes the *shape* of the probability distribution. It is not an accuracy knob.

### Top-k sampling

Keep only the k most likely tokens and sample from them.

- Limits extremely low-probability tokens.
- Fixed k can be too restrictive in some contexts and too permissive in others.

### Top-p / nucleus sampling

Keep the smallest candidate set whose combined probability reaches p, then sample.

- Candidate-set size adapts to uncertainty.
- Commonly useful for natural, diverse text generation.

### Beam search

Track several likely partial sequences instead of one.

- Often useful for constrained sequence-to-sequence tasks such as translation.
- Can produce generic or repetitive text in open-ended generation.
- Higher beam width increases compute and latency.

### Repetition penalties and stop sequences

These controls reduce looping or end the answer at useful boundaries. They are practical output controls—not magic fixes for poor prompting, bad data, or hallucinations.

### Sampling scenario

For a production extraction workflow, you may prefer a low temperature, structured output validation, and constrained decoding. For creative ideation, higher temperature and nucleus sampling may be appropriate. The right configuration follows the task's error tolerance.

---

## 9. Inference performance concept: KV cache

Autoregressive generation repeatedly processes the growing context. Without optimization, each new token would recompute attention keys and values for all previous tokens.

A **key-value (KV) cache** stores the attention keys and values from prior tokens so the model reuses them at later generation steps.

- **Benefit:** substantially speeds up token-by-token decoding.
- **Tradeoff:** cache memory grows with batch size, sequence length, layers, and model size.

KV cache is one of the bridges between architecture and real deployment performance, so remember it for the later optimization/deployment chapters.

---

## 10. What to be able to explain after this chapter

You should be able to answer these without notes:

1. Why are tokens not the same as words?
2. What is the difference between a token embedding and a document embedding?
3. What do query, key, and value do in self-attention?
4. Why does a decoder-only model need a causal mask?
5. Which architecture would you choose for semantic search, chat, and translation—and why?
6. How do temperature, top-k, top-p, and beam search differ?
7. Why does a KV cache speed inference but increase memory use?

---

## 11. Suggested learning path (about 7–10 hours)

### Session 1 — Foundation (90 minutes)

- Read sections 1–4.
- Watch an intuitive transformer/attention explanation.
- Write your own one-paragraph explanation of tokenization, embeddings, and attention.

### Session 2 — Architecture (90 minutes)

- Read sections 5–7.
- Draw encoder-only, decoder-only, and encoder-decoder flows.
- Identify the training objective associated with each model family.

### Session 3 — Generation controls (60–90 minutes)

- Read sections 8–9.
- Try the same prompt at low vs high temperature and compare outputs.
- Explain when deterministic decoding is safer than sampling.

### Session 4 — Consolidation (60 minutes)

- Answer the seven questions in section 10 without notes.
- Revisit weak terms.
- Ask for a short oral quiz or scenario quiz before moving to Chapter 2.

---

## 12. High-quality external resources

### Core reading

1. **Attention Is All You Need** — the original Transformer paper. Start with the abstract and architecture figures; do not get stuck on every mathematical detail on the first pass.
   - https://arxiv.org/abs/1706.03762

2. **Hugging Face LLM Course** — approachable explanations and hands-on notebooks around Transformers, tokenizers, datasets, and training.
   - https://huggingface.co/learn/llm-course/chapter1/1

3. **Hugging Face Transformers documentation** — use the conceptual guides and task docs as a reference once the basics click.
   - https://huggingface.co/docs/transformers/index

4. **NVIDIA: Building Transformer-Based Natural Language Processing Applications** — aligns well with NVIDIA's ecosystem and the certification guide.
   - https://www.nvidia.com/en-us/training/instructor-led-workshops/building-transformer-based-natural-language-processing-applications/

### Blogs and practical explainers

5. **The Illustrated Transformer — Jay Alammar** — excellent visual walkthrough of transformer components.
   - https://jalammar.github.io/illustrated-transformer/

6. **Hugging Face: The LLM Course, Chapter 1** — best first practical companion to the theory.
   - https://huggingface.co/learn/llm-course/chapter1/1

7. **NVIDIA Technical Blog: Mastering LLM Techniques** — use this series later as a bridge toward NVIDIA-specific optimization and deployment topics.
   - https://developer.nvidia.com/blog/mastering-llm-techniques-training/

### Videos

8. **3Blue1Brown — But what is a GPT? Visual intro to transformers** — very intuitive first watch.
   - https://www.youtube.com/watch?v=wjZofJX0v4M

9. **3Blue1Brown — Attention in transformers, visually explained** — best next video after the GPT overview.
   - https://www.youtube.com/watch?v=eMlx5fFNoYc

10. **Stanford CS25: Transformers United** — deeper lecture series; choose individual talks after the fundamentals are comfortable.
   - https://www.youtube.com/playlist?list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM

### Hands-on practice

11. **Hugging Face: Quicktour** — load a pretrained model and run inference locally or in a notebook.
   - https://huggingface.co/docs/transformers/quicktour

12. **OpenAI Tokenizer** — a simple way to develop intuition for token counts; use it as a concept tool, not as proof of another model's tokenization behavior.
   - https://platform.openai.com/tokenizer

---

## 13. Chapter 1 checkpoint

Before starting prompt engineering and RAG, complete this checkpoint:

- [ ] I can distinguish tokenization, embeddings, transformer computation, and decoding.
- [ ] I can explain self-attention in plain language and identify Q, K, and V.
- [ ] I can distinguish encoder-only, decoder-only, and encoder-decoder architectures.
- [ ] I understand causal masking and next-token prediction.
- [ ] I can select an appropriate decoding strategy for a deterministic extraction task versus creative writing.
- [ ] I can explain the purpose and tradeoff of the KV cache.

When these are solid, Chapter 2 will cover prompt engineering and RAG.