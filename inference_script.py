from __future__ import annotations

import pandas as pd

from transaction_classifier import ml_predict_batch


def predict(descriptions: list[str], model_path: str = "categorizer.pkl") -> pd.DataFrame:
    return ml_predict_batch(descriptions=descriptions, model_path=model_path)


if __name__ == "__main__":
    new_transactions = [
        "TIM HORTONS #1234",
        "AMAZON MKTPLACE",
        "PETRO CANADA 99",
    ]
    print(predict(new_transactions))