---
sidebar_position: 4
slug: /data-preparation
---

# Chapter 3 — Data Preparation

**Exam domain: Data Preparation — 9%**

## Purpose

Learn how data quality, format, tokenization, and split design determine whether an LLM adaptation or RAG system is trustworthy.

## Learning objectives

- Define a dataset contract and inspect it before training.
- Clean, deduplicate, normalize, and filter data without losing provenance.
- Choose and evaluate a tokenizer.
- Create leakage-resistant train/validation/test splits.
- Recognize class imbalance, distribution shift, and contamination.

---

## 1. Start with a data contract
Before cleaning anything, define the unit of data, fields, source, allowed license, sensitive-data policy, target task, language mix, and quality criteria. A model trained on poorly specified data merely learns a poorly specified task faster.

Keep provenance: source, collection date, license, transformations, and filtering decisions. This is essential for debugging, compliance, reproducibility, and removing bad records later.

## 2. Quality operations
Common operations include exact and near-duplicate removal, language/format validation, malformed-record handling, length filtering, personally identifiable information review, toxicity/quality filtering, and decontamination against evaluation data. Do not blindly normalize code, punctuation, or domain terminology; a transformation that helps prose can damage source code or clinical text.

## 3. Splits and leakage
A validation set drives model choices; a test set is held back for final assessment. Split by the unit that matters. For example, if many chunks come from one source document, splitting chunks randomly can leak nearly identical text across train and test. Use document-, user-, time-, or group-level splits when that reflects production reality.

## 4. Tokenizers and vocabulary
Tokenizers turn text into IDs. BPE and WordPiece trade vocabulary size against average sequence length. A larger vocabulary can shorten frequent domain terms but costs embedding/output parameters; a smaller vocabulary may fragment terminology and inflate compute. Evaluate token length, unknown/fragment behavior, multilingual coverage, and compatibility with the base model.

## 5. Data for instruction tuning and RAG
Instruction data needs a consistent message schema, quality answers, task diversity, and clear refusals/uncertainty behavior. RAG corpora need clean documents, meaningful chunk boundaries, stable metadata, access controls, and a re-indexing strategy as content changes.

## Mini-lab
Take 30 records from any public dataset. Write a data card with schema, intended use, exclusions, quality checks, split rule, and two possible leakage paths. Tokenize five representative samples and compare token counts across short prose, code, and a non-English example.

## Study checkpoint
- I can explain why deduplication and split design are separate concerns.
- I can identify a train/test leakage example.
- I can explain why tokenizer choice affects memory, cost, and quality.
- I can describe the metadata needed to safely operate a RAG corpus.


---

## Further learning resources

### Reading and documentation

1. [Hugging Face Datasets documentation](https://huggingface.co/docs/datasets)
2. [Hugging Face Tokenizers documentation](https://huggingface.co/docs/tokenizers)
3. [NVIDIA NeMo Curator documentation](https://docs.nvidia.com/nemo/curator/latest/)
4. [NVIDIA NeMo Framework documentation](https://docs.nvidia.com/nemo-framework/user-guide/latest/)
5. [Datasheets for Datasets paper](https://arxiv.org/abs/1803.09010)

### Videos

- [Hugging Face tokenizers search](https://www.youtube.com/results?search_query=Hugging+Face+tokenizers+tutorial)
- [NVIDIA NeMo Curator search](https://www.youtube.com/results?search_query=NVIDIA+NeMo+Curator)
- [Data leakage in machine learning search](https://www.youtube.com/results?search_query=machine+learning+data+leakage+explained)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
