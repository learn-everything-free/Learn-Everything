# Embeddings and Vector Search

Retrieval-Augmented Generation (RAG) grounds language models in authoritative private data by converting text into high-dimensional vector spaces.

## Semantic Vector Spaces

Embedding models map sentences to dense numerical vectors (typically 768 to 3072 dimensions) where geometric proximity reflects conceptual similarity.

- **Cosine Distance:** Computes the cosine of the angle between two vectors: $sim(A,B) = \frac{A \cdot B}{\|A\| \|B\|}$.
- **HNSW Indices:** Hierarchical Navigable Small World graphs enable sub-millisecond approximate nearest neighbor (ANN) search over millions of vectors.

## Chunking Strategies

Raw documents must be split into digestible chunks before embedding:
1. **Fixed-Size with Overlap:** e.g., 512 tokens with 50-token overlap to prevent splitting sentences mid-thought.
2. **Semantic / Recursive Character Splitting:** Splits on paragraph double-newlines first, then sentences, then words.
3. **Hierarchical Chunking:** Parents hold broad context for generation; small children vectors are matched during retrieval.
