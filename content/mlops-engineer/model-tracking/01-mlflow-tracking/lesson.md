# Experiment Tracking with MLflow

Machine learning development is iterative and empirical. Without rigorous experiment tracking, models cannot be reliably reproduced, audited, or safely promoted to production staging.

## Core MLflow Abstractions

- **Experiments:** Logical grouping of runs addressing the same problem domain (e.g., `churn-prediction-v2`).
- **Runs:** A single execution of machine learning code recording:
  - **Parameters:** Learning rate, batch size, optimizer choice (`mlflow.log_param`).
  - **Metrics:** Training loss, validation accuracy, F1 score recorded across epochs (`mlflow.log_metric`).
  - **Artifacts:** Serialized model weights (`model.pt`), ONNX files, confusion matrices, requirements.txt.
  - **Tags:** Git commit hash, training dataset version, developer ID.

## Model Registry Lifecycle

Once a run achieves target performance, its weights are registered in the MLflow Model Registry:
`Draft` $\rightarrow$ `Candidate` $\rightarrow$ `Staging` $\rightarrow$ `Production`.
