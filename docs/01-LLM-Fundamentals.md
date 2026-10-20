---
sidebar_position: 2
slug: /llm-fundamentals
---

# Chapter 1 — What an LLM actually sees

Imagine you are building a study assistant for this course.

A learner sends one innocent-looking message:

> `నమస్తే — can you explain attention? 🚀`

Your application says it is only 33 characters. The model server says it is 28 tokens. The response takes longer than a similar English question. Later, the system runs out of memory when several people ask long questions at once.

Those are not separate mysteries. They are one story: **a piece of text enters a machine, is converted into numbers, moves through a Transformer, and becomes one generated token at a time.**

This chapter follows that one request from keyboard to answer. At every stop, you will learn three things:

- what the model is doing;
- what can go wrong in a real system;
- how to inspect it yourself rather than trusting a diagram.

## The journey we will trace

```text
A learner types text
      ↓
Tokenizer turns text into token IDs
      ↓
Embeddings turn IDs into vectors
      ↓
Transformer layers mix information across the request
      ↓
The model scores possible next tokens
      ↓
A decoding policy chooses one token
      ↓
The process repeats — using a KV cache to stay fast
```

![A learner request flowing through tokenization, embeddings, Transformer layers, decoding, and a KV cache](/img/diagrams/ch01-request-journey.svg)

By the end, you will be able to take a real input, inspect its tokenizer output, calculate a small causal-attention pass, choose an architecture for a task, and estimate why an inference server can run out of memory.

> **Two tracks:** first we rebuild the mechanics from scratch. Then we inspect the same ideas in production tooling such as Qwen3, Hugging Face, and PyTorch. The goal is not to memorize vocabulary; it is to know what to check when the system behaves strangely.

## How to use this chapter

Do not try to “finish” it in one sitting. Follow the request. When we stop at a stage, use the same rhythm:

1. **See it** — get the intuition.
2. **Open it** — inspect the internals, shapes, and math.
3. **Compare it** — see how real model families differ.
4. **Run it** — execute a small artifact with fixed inputs.
5. **Break it** — change one variable and observe the result.
6. **Debug it** — name the trade-off and likely failure mode.
7. **Prove it** — complete a small challenge with a measurable outcome.

This chapter uses **Qwen3-0.6B** as a recurring production reference model. Later chapters will fine-tune, evaluate, optimize, serve, and monitor a small open model; the tiny from-scratch experiments remain a separate track.

---

# Stop 1 — The message becomes tokens

## First intuition

The model never receives the learner’s words directly. It receives integer IDs. A **tokenizer** is the translation layer that turns a string into IDs and turns generated IDs back into text.

```text
"The future of AI is multilingual 🚀"
                ↓ tokenizer
[791, 1213, 328, 1552, ...]
                ↓ embedding table
vectors with shape [sequence_length, hidden_size]
```

A token is not reliably a word. It may represent a full word, a subword, whitespace plus a word fragment, punctuation, a byte sequence, code, or an emoji fragment. That is why a 4,000-token context window is **not** a 4,000-word limit.

### Why subwords won

A word-only vocabulary is huge and fails on rare names, typos, code, and new terms. Character-level tokenization handles every string but produces long sequences. Subword methods sit between those extremes:

- frequent sequences become compact tokens;
- uncommon strings fall back to smaller pieces;
- the vocabulary remains finite;
- every downstream cost depends on the resulting sequence length.

## 2. Internals

### BPE in one page

Byte Pair Encoding (BPE) begins with a base alphabet—often bytes—and repeatedly merges the most useful/frequent adjacent pair. Training produces an ordered merge list and a vocabulary. Encoding applies those learned merges to a new string.

A conceptual miniature:

```text
Corpus: low lower newest widest
Initial symbols: l o w, l o w e r, ...
Frequent pair: (l, o)  → merge "lo"
Frequent pair: (lo, w) → merge "low"
...
```

Real byte-level BPE implementations have preprocessing and byte mappings that make them much more robust than this toy sketch. The important idea is that the vocabulary is *learned from distributional frequency*, not hand-authored as a dictionary.

### WordPiece and Unigram

| Method | Core idea | Typical association | What to notice |
|---|---|---|---|
| Byte-level BPE | Repeatedly merge useful pairs over byte-derived symbols | GPT-like tokenizers, many decoder models | Strong fallback for arbitrary Unicode/code; token pieces can look strange to humans |
| WordPiece | Learn pieces that improve a likelihood-style objective | BERT-family models | Often exposes continuation pieces such as `##ing` |
| Unigram | Start with many possible pieces and remove the least useful | T5/SentencePiece ecosystems | A probabilistic segmentation objective |

**Important nuance:** SentencePiece is a tokenizer framework, not a single competing algorithm. It supports both BPE and Unigram and operates directly over raw text rather than requiring whitespace pre-tokenization.

### The input pipeline

A production tokenizer usually has more stages than “split text”:

```text
raw Unicode text
  → normalization / pre-tokenization rules
  → byte or character representation
  → subword segmentation
  → token IDs
  → optional special tokens / chat template
  → attention mask and model inputs
```

Do not compare token counts until you state whether special tokens were added. A fair tokenizer comparison uses the same text, the same normalization policy, and `add_special_tokens=False` unless special-token overhead is the point of the measurement.

## 3. Industry comparison

| Tokenizer | Family / approach | Good investigation questions |
|---|---|---|
| OpenAI `cl100k_base` | Byte-level BPE encoding | How do token counts differ from newer encodings on code and non-English text? |
| OpenAI `o200k_base` | Byte-level BPE encoding | How efficiently does it represent multilingual text and emoji? |
| Qwen3 | Byte-level BPE-style production tokenizer | Which special tokens and chat-template rules alter the true request budget? |
| Llama-family models | BPE-based variants | How do vocabulary and chat formatting influence token boundaries? |
| BERT | WordPiece | Which strings fragment into continuation pieces or `[UNK]`? |
| T5 | SentencePiece Unigram | How does raw-text segmentation differ from WordPiece conventions? |

There is no universal “best tokenizer.” A tokenizer is good relative to a workload: language mix, code, domain terminology, vocabulary size, context budget, latency, and compatibility with the pretrained model.

## 4. Code walkthrough — inspect real tokenizers

Download the runnable lab: [ch01_tokenizer_lab.py](/labs/ch01_tokenizer_lab.py)

Install only tokenizer libraries—**not** model weights:

```bash
python -m pip install tiktoken transformers sentencepiece
python ch01_tokenizer_lab.py
```

The lab compares `o200k_base`, Qwen3-0.6B, and BERT on English, Telugu, code, emoji, and mixed-language inputs. It prints:

- token count;
- integer token IDs;
- visible token pieces;
- character offsets for Hugging Face tokenizers;
- round-trip decoding.

A representative inspection loop looks like this:

```python
encoded = tokenizer(text, add_special_tokens=False, return_offsets_mapping=True)
ids = encoded["input_ids"]
pieces = tokenizer.convert_ids_to_tokens(ids)
print(ids)
print(pieces)
print(tokenizer.decode(ids))
```

Expected result: **counts and pieces differ by tokenizer**, while round-trip decoding should normally reconstruct the original text. Individual pieces are implementation details; a single decoded token may display oddly because byte-level tokenizers do not promise human-readable boundaries.

## 5. Experiment — measure token efficiency

Create a text file with at least 100 samples across prose, your target language, code, URLs, emoji, and domain terms. For each tokenizer, record:

```text
mean tokens/sample
median tokens/sample
p95 tokens/sample
tokens/character
special-token overhead
round-trip failures or normalization changes
```

Then answer:

1. Which tokenizer is most compact for your corpus?
2. Does compactness survive when you include the real chat template?
3. Which inputs produce unexpectedly high token counts?
4. What would a longer sequence do to attention cost and KV-cache memory?

## 6. Trade-offs and failure modes

- **Token count is a cost metric.** More tokens consume context, prefill compute, output budget, and usually money.
- **Vocabulary size is not free.** A larger vocabulary reduces fragmentation for frequent patterns but expands embedding/output matrices.
- **Unicode is not cosmetic.** Normalization can change meaning, offsets, user-visible strings, and safety filters.
- **Chat templates matter.** Role markers, tool schemas, and control tokens consume real context budget.
- **Never swap a tokenizer under pretrained weights.** Token IDs index a learned embedding table; a different tokenizer changes the model’s input language.
- **Do not compare tokenizers by one English sentence.** Multilingual text, code, emojis, and structured data often reveal the meaningful differences.

## 7. Challenge — train your own BPE tokenizer

Use the Hugging Face `tokenizers` library to train BPE tokenizers at 2K, 8K, and 32K vocabulary sizes on the same small corpus. Measure token efficiency on a held-out corpus and report:

- average tokens per sample;
- vocabulary size;
- examples of useful and harmful segmentation;
- training time and tokenizer-file size;
- why your preferred vocabulary size is appropriate for that corpus.

**Pass condition:** your report makes a claim, includes the measurement supporting it, and names a trade-off you accepted.

---

# Stop 2 — IDs become coordinates the model can work with

The tokenizer has produced IDs. But `15342` does not mean “attention” to a neural network; it is just a location in a table. Our request now needs a numerical representation the Transformer can transform.

## 1. Intuition

An embedding is a dense vector representation. The token ID `15342` is merely an index; its embedding vector is what the model can transform mathematically.

```text
ID 15342 → [0.18, -0.72, 0.04, ...]  # hidden_size numbers
```

Tokens used in related contexts tend to acquire useful geometric relationships, but “nearby in a vector space” is not the same thing as a human definition or a guarantee of truth.

## 2. Internals

For vocabulary size `V` and hidden size `d`, the embedding table is a learned matrix `E ∈ R^(V × d)`. Looking up a token is equivalent to selecting one row of `E`.

A contextual model begins with a token embedding, then repeatedly updates it. The initial representation of `bank` is the same in two sentences; after attention layers, its contextual hidden state can differ:

```text
I deposited money at the bank.      → financial sense
We sat by the river bank.           → geographic sense
```

For retrieval, dedicated embedding models usually pool or otherwise project a whole sequence into one vector. Cosine similarity is commonly used:

`cos(a, b) = (a · b) / (||a|| ||b||)`

## 3. Industry comparison

- **Static embeddings** such as Word2Vec have one vector per token type.
- **Contextual LLM hidden states** change by sentence position and surrounding content.
- **Embedding models** are trained and normalized for similarity/retrieval; using arbitrary final LLM hidden states is not automatically a good semantic-search design.

## 4–7. Lab, experiment, failure modes, challenge

**Lab:** encode ten sentences with a sentence-embedding model, compute cosine similarity, and inspect the nearest neighbors.

**Experiment:** compare the retrieval ranking before and after you change one word in a query. Use a finance/river “bank” example to demonstrate contextual ambiguity.

**Failure modes:** anisotropic vectors, bad pooling, domain shift, mixed-language weakness, and treating high cosine similarity as evidence of factual support.

**Challenge:** visualize a labeled set with PCA or UMAP, then explain one cluster that makes sense and one misleading cluster. A visualization is an investigation tool, not proof.

---

# Stop 3 — Each token asks: what earlier information matters now?

The learner’s message is now a sequence of vectors. The Transformer’s job is to let each vector borrow the context it needs without seeing the future answer.

## 1. Intuition

Self-attention lets every token decide which other tokens matter for its current representation. The word `it` in a sentence can use information from earlier nouns; a code token can use a far-away function definition.

![Causal self-attention projects token vectors into Q, K, and V, masks future positions, then mixes visible values](/img/diagrams/ch01-causal-attention.svg)

Attention is a **dynamic weighted lookup**. It is not a database query and an attention map is not a reliable explanation of a model decision by itself.

## 2. Internals: Q, K, V and shapes

Let `X` be a batch of input hidden states with shape `[B, T, d_model]`:

```text
Q = X W_Q  → [B, T, d_head]
K = X W_K  → [B, T, d_head]
V = X W_V  → [B, T, d_head]

scores  = Q Kᵀ / √d_head        → [B, T, T]
weights = softmax(scores + mask) → [B, T, T]
output  = weights V              → [B, T, d_head]
```

The scale factor `√d_head` prevents dot products from growing so large that softmax becomes overly sharp and gradients become unhelpful.

A decoder-only model uses a **causal mask**. At position `t`, all positions greater than `t` receive `-∞` before softmax, which makes their probability zero.

```text
      can attend to →  0   1   2   3
query token 0       [  ✓   ×   ×   × ]
query token 1       [  ✓   ✓   ×   × ]
query token 2       [  ✓   ✓   ✓   × ]
query token 3       [  ✓   ✓   ✓   ✓ ]
```

### Multi-head attention

Instead of one large attention calculation, a layer projects into several heads, runs attention in parallel, concatenates head outputs, and applies an output projection. Heads create multiple representation subspaces; do not assume each head has one clean human-interpretable purpose.

### The rest of a Transformer block

A modern decoder block is broadly:

```text
x
 ├─ RMSNorm/LayerNorm → multi-head attention → residual add
 └─ RMSNorm/LayerNorm → MLP / SwiGLU         → residual add
```

Attention mixes information **across positions**. The MLP transforms information **within each position**. Residual paths help very deep networks optimize; normalization stabilizes activation scale.

## 3. Industry comparison

| Design choice | Why it exists | Consequence |
|---|---|---|
| LayerNorm vs RMSNorm | Stabilize activations | Different compute/normalization behavior |
| GELU vs SwiGLU MLP | Nonlinear token-wise transformation | SwiGLU is common in modern decoder models and changes parameter/compute allocation |
| MHA | Separate K/V for each query head | More KV-cache memory |
| GQA | Several query heads share K/V heads | Lower KV-cache memory, usually some quality trade-off |
| MQA | All query heads share one K/V head | Maximum cache reduction, stronger bottleneck |

## 4. Code walkthrough — calculate causal attention

Download: [ch01_attention_from_scratch.py](/labs/ch01_attention_from_scratch.py)

```bash
python -m pip install torch
python ch01_attention_from_scratch.py
```

The script creates a tiny `[1, 4, 8]` input, projects Q/K/V, applies a causal mask, computes softmax weights, and asserts two invariants:

1. every attention row sums to one;
2. every masked future position has zero probability.

## 5. Experiment

Change the script in three ways:

1. remove the causal mask and inspect the upper triangle;
2. replace `sqrt(d_head)` scaling with `1` and compare the entropy of attention weights;
3. duplicate the calculation across two heads with different projection matrices.

## 6. Trade-offs and failure modes

- Full attention has roughly quadratic sequence-length work and memory in its attention matrix.
- Long prompts are often expensive in the **prefill** stage even when output generation is short.
- A missing or incorrect causal mask leaks future labels during training and invalidates a next-token experiment.
- Shape bugs are common: verify `[batch, heads, sequence, head_dim]` explicitly in real implementations.
- Attention weights are not a complete causal explanation for output behavior.

## 7. Challenge

Implement multi-head causal attention as a PyTorch module. Add shape assertions, a unit test for the causal mask, and compare its output to `torch.nn.functional.scaled_dot_product_attention` on identical inputs.

---

# Stop 4 — The model learns the next-token game

The Transformer can compare vectors, but it still needs to know order, choose a model shape, and learn from examples. This is where position, architecture, and the training objective enter the story.

## Positional information

Attention alone is permutation-invariant: swapping two token rows would not reveal their original order. Positional mechanisms make order observable.

| Method | Core idea | Practical note |
|---|---|---|
| Sinusoidal | Fixed functions added to embeddings | No learned position table; classic Transformer choice |
| Learned position embeddings | Learn one vector per position | Simple, but tied to trained positions |
| RoPE | Rotate query/key dimensions by position | Common in modern decoder LLMs; supports relative-position behavior |
| ALiBi | Add distance-dependent bias to attention scores | Alters attention preference without adding a position vector |

**Experiment:** rotate a two-dimensional vector by increasing angles and observe that dot products depend on relative rotation. That is the geometric intuition behind RoPE.

## Model families

| Family | Attention visibility | Usual objective | Strong use cases |
|---|---|---|---|
| Encoder-only | bidirectional | masked-token prediction | classification, token labels, retrieval embeddings |
| Decoder-only | causal / left-to-right | next-token prediction | chat, completion, code, tool use |
| Encoder-decoder | encoder bidirectional + decoder causal/cross-attention | conditional generation | translation, summarization, structured transformation |
| Mixture-of-Experts | sparse routing to selected MLP experts | varies | more parameters at limited active compute, with routing complexity |

Select architecture from task requirements, data, latency, memory, ecosystem, and serving constraints—not from brand familiarity.

## Training objective internals

For causal language modeling, a sequence `x₁…x_T` trains the model to predict each next token:

`L = -Σ_t log P(x_t | x_<t)`

This is cross-entropy loss over the vocabulary. **Teacher forcing** supplies the real prior tokens during training; at inference the model consumes its own generated tokens, which contributes to error accumulation.

**Gradient accumulation** adds gradients over several small microbatches before an optimizer update. It approximates a larger effective batch while lowering peak activation memory, at the cost of more forward/backward passes per update.

**Challenge:** write a tiny next-token dataset, use shifted labels, compute cross-entropy manually, then confirm that PyTorch’s `cross_entropy` agrees.

---

# Stop 5 — Scores become the next visible token

After processing the request, the model has not yet written an answer. It has a score for every possible next token. A decoding policy decides how cautious or varied the next move should be.

A decoder emits a **logit** for every vocabulary item. Softmax turns logits into a distribution. A decoding policy selects the next token.

## Temperature, top-k, top-p, and beam search

| Method | What it changes | Good fit | Common failure mode |
|---|---|---|---|
| Greedy | choose highest-probability token | deterministic baselines, narrow extraction | repetitive or generic output |
| Temperature | rescales the whole distribution | adjust diversity | treating it as an “accuracy” slider |
| Top-k | keep the highest-k candidates | restrict long tails | k is fixed even when uncertainty changes |
| Top-p / nucleus | keep minimum mass reaching p | natural language generation | poor behavior if p/temperature are not validated on the task |
| Beam search | keep several high-likelihood partial sequences | constrained seq2seq tasks | expensive, generic, or repetitive open-ended text |

### Hands-on experiment

Given logits `[2.0, 1.0, 0.1, -1.0]`, calculate softmax probabilities at temperatures `0.3`, `1.0`, and `1.8`. Measure entropy. Then apply `top-k=2` and `top-p=0.8` and compare which tokens survive.

**Production rule:** for extraction or tool calls, prefer constrained structured output and validation. Sampling policy does not fix missing evidence, weak prompts, or unsafe tool permissions.

---

# Stop 6 — The conversation grows, so the server keeps a memory

The assistant has generated one token. To generate the next, it needs the earlier context again. Recomputing everything would be wasteful, so the server saves part of the work—and that is where memory pressure enters the story.

During autoregressive generation, every new token needs attention over prior tokens. Recomputing past keys and values every step is wasteful. A **KV cache** stores prior K/V tensors so decoding reuses them.

![A prompt prefill stage creates a KV cache, and each decode step reads and appends to it](/img/diagrams/ch01-kv-cache.svg)

## Prefill vs decode

- **Prefill:** process the input prompt and create cache entries. Often compute-heavy, especially for long context.
- **Decode:** generate one or a few tokens at a time using the cache. Often memory-bandwidth and cache-capacity sensitive.

An approximate cache-memory formula is:

`bytes ≈ 2 × layers × batch × sequence_length × kv_heads × head_dim × bytes_per_value`

The leading `2` is for keys and values. Grouped-query attention reduces `kv_heads`; lower precision reduces `bytes_per_value`.

Download: [ch01_kv_cache_estimator.py](/labs/ch01_kv_cache_estimator.py)

```bash
python ch01_kv_cache_estimator.py
```

**Challenge:** calculate cache memory for the same model under MHA, GQA, and a lower-precision cache. Then explain why a server can fit one request but fail under real concurrency.

---

# The first incident report

Return to the original message: `నమస్తే — can you explain attention? 🚀`. You can now trace exactly why it may use more tokens than expected, how those IDs become vectors, how causal attention uses its context, how one next token is selected, and why several long requests can exhaust memory.

You now have the first artifact in the recurring engineering project.

## Deliverable: tokenizer and attention investigation report

Create a short report or repository folder containing:

- a tokenizer benchmark over at least 100 representative samples;
- a table of token count, p95 count, and special-token overhead;
- three surprising segmentation examples and an explanation;
- causal-attention output with the mask test passing;
- one architecture-selection decision for retrieval, chat, and translation;
- a KV-cache estimate for a realistic concurrency target;
- your environment: Python version, library versions, tokenizer names, and date.

## Debugging checklist

| Symptom | First question to ask |
|---|---|
| Token counts look wildly different | Did every tokenizer receive the exact same Unicode text and special-token policy? |
| Decoding does not match input | Did normalization or special-token handling change the string? |
| Attention sees future text | Is the causal mask applied before softmax, with the correct broadcast shape? |
| Model output repeats | Is decoding too deterministic, or is the prompt/context itself repetitive? |
| GPU memory grows with user count | How large is the KV cache at actual sequence lengths and concurrency? |
| Retrieval vector quality is poor | Is the embedding model trained for retrieval, and was the corpus/query distribution represented? |

## Certification checkpoint

You are ready to move on only if you can:

- explain why tokens are not words and why tokenization controls context/cost;
- compare BPE, WordPiece, and Unigram without calling SentencePiece a competing algorithm;
- distinguish static, contextual, and retrieval embeddings;
- calculate the shapes in a causal-attention pass;
- select encoder-only, decoder-only, or encoder-decoder architecture for a stated task;
- explain cross-entropy, teacher forcing, and gradient accumulation;
- choose a decoding policy for a constrained workflow versus creative generation;
- estimate how KV cache changes memory under batch size, context length, and GQA.

---

## Further references

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1)
- [Hugging Face Tokenizers documentation](https://huggingface.co/docs/tokenizers/index)
- [Hugging Face Transformers documentation](https://huggingface.co/docs/transformers/index)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [3Blue1Brown — But what is a GPT?](https://www.youtube.com/watch?v=wjZofJX0v4M)
- [3Blue1Brown — Attention in transformers](https://www.youtube.com/watch?v=eMlx5fFNoYc)
