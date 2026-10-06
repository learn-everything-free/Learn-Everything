## What you'll practice

- **Serve the Model on a Port** — practice · intermediate

## A command you'll meet

```bash
docker run -d -p 8000:80 vllm-serve:v1
```

`-p 8000:80` publishes the container on host port 8000 — the last hop between a
model sitting on a disk and a model answering requests. Open the task below for
the full walkthrough.
