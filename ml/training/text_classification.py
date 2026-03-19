from __future__ import annotations

from pathlib import Path

import pandas as pd

from training.transaction_classifier import classify_download_transactions_frame


def auto_label_transactions(
    input_file: str = "data/download-transactions.csv",
    output_file: str = "data/transactions_auto_labeled.csv",
    model_path: str = "models/categorizer.pkl",
) -> pd.DataFrame:
    df = pd.read_csv(input_file)
    labeled = classify_download_transactions_frame(df, model_path=model_path)

    labeled["corrected_category"] = ""

    output_columns = [
        "Transaction Date",
        "Cheque Number",
        "Description 1",
        "Description 2",
        "CAD$",
        "USD$",
        "description",
        "predicted_category",
        "classification_source",
        "confidence_score",
        "matched_keywords",
        "corrected_category",
    ]
    existing_columns = [column for column in output_columns if column in labeled.columns]
    new_rows = labeled[existing_columns]

    existing = pd.read_csv(output_file) if Path(output_file).exists() else pd.DataFrame()
    if not existing.empty:
        combined = pd.concat([existing, new_rows], ignore_index=True)
        combined = combined.drop_duplicates(
            subset=["Transaction Date", "description", "CAD$"], keep="first"
        )
    else:
        combined = new_rows

    sorted_output = combined.sort_values(
        by=["confidence_score", "predicted_category"],
        ascending=[True, False],
    )
    sorted_output.to_csv(output_file, index=False)
    return sorted_output


if __name__ == "__main__":
    labeled_frame = auto_label_transactions()
    print(f"Auto-labeling complete for {len(labeled_frame)} rows.")
    print(labeled_frame["predicted_category"].value_counts())