from __future__ import annotations

import pandas as pd

from transaction_classifier import classify_download_transactions_frame


def auto_label_transactions(
    input_file: str = "download-transactions.csv",
    output_file: str = "transactions_auto_labeled.csv",
    model_path: str = "categorizer.pkl",
) -> pd.DataFrame:
    df = pd.read_csv(input_file)
    labeled = classify_download_transactions_frame(df, model_path=model_path)

    labeled["corrected_category"] = ""
    sorted_output = labeled.sort_values(
        by=["confidence_score", "predicted_category"],
        ascending=[True, False],
    )

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
    existing_columns = [column for column in output_columns if column in sorted_output.columns]
    sorted_output[existing_columns].to_csv(output_file, index=False)
    return sorted_output


if __name__ == "__main__":
    labeled_frame = auto_label_transactions()
    print(f"Auto-labeling complete for {len(labeled_frame)} rows.")
    print(labeled_frame["predicted_category"].value_counts())