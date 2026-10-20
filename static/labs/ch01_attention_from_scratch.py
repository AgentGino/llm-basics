"""Chapter 1 lab: calculate causal self-attention from first principles.

Install:
    python -m pip install torch
"""
import math
import torch


torch.manual_seed(7)

# batch=1, sequence length=4, model width=8
x = torch.randn(1, 4, 8)

# In a real layer these are learned parameters. We keep the dimensions small
# enough to inspect every intermediate tensor.
W_q = torch.randn(8, 4)
W_k = torch.randn(8, 4)
W_v = torch.randn(8, 4)

q = x @ W_q  # [batch, sequence, head_dim]
k = x @ W_k
v = x @ W_v

scores = q @ k.transpose(-2, -1) / math.sqrt(k.size(-1))
causal_mask = torch.triu(torch.ones(4, 4, dtype=torch.bool), diagonal=1)
scores = scores.masked_fill(causal_mask, float("-inf"))
weights = torch.softmax(scores, dim=-1)
out = weights @ v

print("input shape:             ", tuple(x.shape))
print("query/key/value shape:   ", tuple(q.shape))
print("attention scores shape:  ", tuple(scores.shape))
print("attention weights:\n", weights[0].round(decimals=3))
print("output shape:            ", tuple(out.shape))

# Sanity check: every visible row is a probability distribution.
assert torch.allclose(weights.sum(dim=-1), torch.ones(1, 4))
# In causal attention, token i cannot see any token j > i.
assert torch.all(weights[0][causal_mask] == 0)
