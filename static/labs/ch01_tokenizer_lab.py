"""Chapter 1 lab: compare real tokenizers on the same text.

Install:
    python -m pip install tiktoken transformers sentencepiece

This downloads tokenizer assets only. It does not download model weights.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import tiktoken
from transformers import AutoTokenizer


@dataclass
class TokenizationResult:
    tokenizer: str
    ids: list[int]
    pieces: list[str]
    decoded: str
    offsets: list[tuple[int, int]] | None = None


def inspect_tiktoken(name: str, encoding: tiktoken.Encoding, text: str) -> TokenizationResult:
    ids = encoding.encode(text, disallowed_special=())
    return TokenizationResult(
        tokenizer=name,
        ids=ids,
        pieces=[encoding.decode([token_id]) for token_id in ids],
        decoded=encoding.decode(ids),
    )


def inspect_hf(name: str, tokenizer, text: str) -> TokenizationResult:
    encoded = tokenizer(text, add_special_tokens=False, return_offsets_mapping=True)
    ids = encoded["input_ids"]
    return TokenizationResult(
        tokenizer=name,
        ids=ids,
        pieces=tokenizer.convert_ids_to_tokens(ids),
        decoded=tokenizer.decode(ids, skip_special_tokens=False),
        offsets=[tuple(pair) for pair in encoded["offset_mapping"]],
    )


def show(result: TokenizationResult) -> None:
    print(f"\n{result.tokenizer}: {len(result.ids)} tokens")
    print(f"IDs:    {result.ids}")
    print(f"Pieces: {result.pieces}")
    if result.offsets:
        print(f"Offsets:{result.offsets}")
    print(f"Round trip: {result.decoded!r}")


def main() -> None:
    tokenizers: list[Callable[[str], TokenizationResult]] = [
        lambda text: inspect_tiktoken("OpenAI o200k_base", tiktoken.get_encoding("o200k_base"), text),
        lambda text: inspect_hf(
            "Qwen3-0.6B",
            AutoTokenizer.from_pretrained("Qwen/Qwen3-0.6B"),
            text,
        ),
        lambda text: inspect_hf(
            "BERT base uncased",
            AutoTokenizer.from_pretrained("google-bert/bert-base-uncased"),
            text,
        ),
    ]

    samples = {
        "English": "Tokenization is fascinating!",
        "Telugu": "నమస్తే, ఎలా ఉన్నారు?",
        "Code": "def add(a, b): return a + b",
        "Emoji": "Hello 👨‍💻🚀",
        "Mixed": "The future of AI is multilingual 🚀",
    }

    for label, text in samples.items():
        print("\n" + "=" * 78)
        print(f"{label}: {text!r}")
        for inspect in tokenizers:
            show(inspect(text))


if __name__ == "__main__":
    main()
