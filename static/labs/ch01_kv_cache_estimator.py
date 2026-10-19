"""Chapter 1 lab: estimate KV-cache memory for decoder-only models.

The formula approximates cache bytes for standard multi-head attention:
    2 (K and V) * layers * batch * sequence * kv_heads * head_dim * bytes/value

Grouped-query attention reduces kv_heads relative to attention_heads.
"""


def gibibytes(num_bytes: int) -> float:
    return num_bytes / 1024**3


def kv_cache_bytes(
    *, layers: int, batch_size: int, sequence_length: int,
    kv_heads: int, head_dim: int, bytes_per_value: int,
) -> int:
    return 2 * layers * batch_size * sequence_length * kv_heads * head_dim * bytes_per_value


configs = [
    {"name": "MHA BF16", "layers": 28, "batch_size": 8, "sequence_length": 8192, "kv_heads": 16, "head_dim": 128, "bytes_per_value": 2},
    {"name": "GQA BF16", "layers": 28, "batch_size": 8, "sequence_length": 8192, "kv_heads": 4, "head_dim": 128, "bytes_per_value": 2},
    {"name": "GQA INT8", "layers": 28, "batch_size": 8, "sequence_length": 8192, "kv_heads": 4, "head_dim": 128, "bytes_per_value": 1},
]

for config in configs:
    name = config.pop("name")
    memory = kv_cache_bytes(**config)
    print(f"{name:10} {gibibytes(memory):6.2f} GiB")
