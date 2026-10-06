# Chunking Documents

Retrieval-augmented generation cannot feed a whole document to a model — it feeds pieces. Chunking is the act of splitting a long document into those pieces: small enough to embed precisely, big enough to make sense alone. A manifest that lists every chunk keeps the pipeline honest about what exists.

## What you'll practice

- **Split a Document into Chunks** — practice · beginner

## A command you'll meet

```bash
echo chunk-01.txt > manifest.txt
```

Open any task below to get the full step-by-step walkthrough — every command is explained, and the lab validator checks what you actually built.
