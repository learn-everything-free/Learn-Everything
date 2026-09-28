# High-Throughput Inference with vLLM

Serving Large Language Models in production requires managing massive GPU memory footprints while minimizing Time to First Token (TTFT) and maximizing tokens per second per dollar.

## The Memory Bottleneck: KV Cache

During autoregressive generation, keys and values computed for previous tokens must be stored in GPU VRAM (the KV cache). Standard implementations suffer from severe fragmentation (up to 60–80% wasted memory).

## PagedAttention Architecture

vLLM solves memory fragmentation by adapting virtual memory paging from operating systems:
- Key-value vectors are split into fixed-size physical memory pages.
- Non-contiguous physical memory blocks are linked via page tables.
- Enables continuous batching: new incoming requests can be joined into existing running batches dynamically without waiting for sequences to finish.
