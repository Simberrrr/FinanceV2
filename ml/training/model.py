from __future__ import annotations

import pickle
from typing import Any

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from training.transaction_classifier import canonicalize_category


def load_training_data(training_csv: str = "data/transactions_auto_labeled.csv") -> pd.DataFrame:
    df = pd.read_csv(training_csv)
    df["label"] = df.get("corrected_category", "").fillna("").replace("", None)
    df["label"] = df["label"].combine_first(df["predicted_category"])
    df["label"] = df["label"].astype(str).apply(canonicalize_category)

    # Keep only trainable rows.
    df = df[~df["label"].isin(["Unknown", "LOW_CONFIDENCE"])]
    df = df.dropna(subset=["label", "description"])
    return df


def train_model(training_frame: pd.DataFrame) -> dict[str, Any]:
    X = training_frame["description"]
    y = training_frame["label"]

    min_class_count = y.value_counts().min()
    stratify = y if min_class_count >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        strip_accents="unicode",
        lowercase=True,
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    classifier = LogisticRegression(
        C=5.0,
        max_iter=1000,
        class_weight="balanced",
    )
    classifier.fit(X_train_tfidf, y_train)

    y_pred = classifier.predict(X_test_tfidf)
    report = classification_report(y_test, y_pred)
    matrix = pd.DataFrame(
        confusion_matrix(y_test, y_pred, labels=classifier.classes_),
        index=classifier.classes_,
        columns=classifier.classes_,
    )

    return {
        "vectorizer": vectorizer,
        "classifier": classifier,
        "report": report,
        "confusion_matrix": matrix,
    }


def save_model(model_bundle: dict[str, Any], output_path: str = "models/categorizer.pkl") -> None:
    with open(output_path, "wb") as model_file:
        pickle.dump(
            {
                "vectorizer": model_bundle["vectorizer"],
                "classifier": model_bundle["classifier"],
            },
            model_file,
        )


def train_and_save(
    training_csv: str = "data/transactions_auto_labeled.csv",
    output_model_path: str = "models/categorizer.pkl",
) -> dict[str, Any]:
    training_frame = load_training_data(training_csv)
    model_bundle = train_model(training_frame)
    save_model(model_bundle, output_model_path)
    return {"rows": len(training_frame), **model_bundle}


if __name__ == "__main__":
    result = train_and_save()
    print(f"Training on {result['rows']} labeled transactions")
    print("\nClassification Report:")
    print(result["report"])
    print("Confusion Matrix:")
    print(result["confusion_matrix"])
    print("\nModel saved to models/categorizer.pkl")