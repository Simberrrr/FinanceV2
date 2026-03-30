from __future__ import annotations

import pickle
import re
from pathlib import Path
from typing import Any, Mapping, Sequence

import pandas as pd

CANONICAL_CATEGORIES = [
    "Transportation",
    "Groceries",
    "Dining",
    "Entertainment",
    "Shopping/Personal Care",
    "Health/Education",
    "Utilities/Subscriptions",
    "Transfers",
]

DOWNLOAD_TRANSACTIONS_REQUIRED_COLUMNS = [
    "Account Type",
    "Account Number",
    "Transaction Date",
    "Cheque Number",
    "Description 1",
    "Description 2",
    "CAD$",
    "USD$",
]

CATEGORY_ALIASES = {
    "shopping / personal care": "Shopping/Personal Care",
    "shopping/personal care": "Shopping/Personal Care",
    "shopping & personal care": "Shopping/Personal Care",
    "utilities / subscriptions": "Utilities/Subscriptions",
    "utilities/subscriptions": "Utilities/Subscriptions",
    "entertainment": "Entertainment",
    "dining": "Dining",
    "health": "Health/Education",
    "health/education": "Health/Education",
}

CATEGORY_KEYWORDS = {
    "Transportation": [
        "uber",
        "lyft",
        "shell",
        "esso",
        "circle k",
        "petro canada",
        "petro-canada",
        "taxi",
        "transit",
        "parking",
        "onroute",
        "bike share",
        "uberdirect"
    ],
    "Groceries": [
        "costco",
        "walmart",
        "metro",
        "loblaws",
        "sobeys",
        "whole foods",
        "no frills",
        "fortinos",
        "freshco",
        "food basics",
        "foodland"
    ],
    "Dining": [
        "starbucks",
        "tim hortons",
        "mcdonald",
        "kfc",
        "chicken",
        "chipotle",
        "restaurant",
        "cafe",
        "pizzeria",
        "pizza",
        "burger",
        "wings",
        "sushi",
        "noodles",
        "ramen",
        "hotpot",
        "vietnamese",
        "cuisine",
        "coffeebar",
        "milktea",
        "grill",
        "bar and grill",
        "tst",
        "milk tea",
        "juice",
        "coffee",
        "buns",
    ],
    "Entertainment": [
        "netflix",
        "spotify",
        "steam",
        "cineplex",
        "movie",
        "blue mtn",
        "blue mountain",
        "concert",
        "climbing",
        "whistler",
        "ski",
        "snowboard",
        "steel peak",
        "cannabis",
    ],
    "Shopping/Personal Care": [
        "amazon",
        "h&m",
        "zara",
        "dollarama",
        "sephora",
        "sport chek",
        "indigo",
        "best buy",
        "the bay",
        "old navy",
    ],
    "Health/Education": [
        "pharmacy",
        "shoppers",
        "rexall",
        "hospital",
        "clinic",
        "dental",
        "doctor",
        "physio",
        "massage",
        "medic",
        "athletics",
        "pharm",
    ],
    "Utilities/Subscriptions": [
        "rogers",
        "bell",
        "telus",
        "hydro",
        "enbridge",
        "notify.careers",
        "google",
        "apple",
        "microsoft",
        "icloud",
        "adobe",
    ],
    "Transfers": [
        "payment - thank you",
        "paiement - merci",
        "payment thank you",
        "credit card payment",
        "online payment",
        "automatic payment",
        "balance payment",
    ],
}


def _build_pattern(keyword: str) -> re.Pattern[str]:
    escaped = re.escape(keyword)
    pattern = r"(?<!\w)" + escaped + r"(?!\w)"
    return re.compile(pattern, re.IGNORECASE)


COMPILED_KEYWORDS = {
    category: [(keyword, _build_pattern(keyword)) for keyword in keywords]
    for category, keywords in CATEGORY_KEYWORDS.items()
}


def canonicalize_category(category: str | None) -> str:
    if not category:
        return "Unknown"
    cleaned = category.strip()
    if cleaned in CANONICAL_CATEGORIES:
        return cleaned
    canonical = CATEGORY_ALIASES.get(cleaned.lower())
    if canonical:
        return canonical
    return cleaned


def rule_categorize(description: str, min_score: int = 1) -> tuple[str, int, list[str]]:
    text = str(description or "")
    scores = {category: 0 for category in COMPILED_KEYWORDS}
    matched_keywords: list[str] = []

    for category, keyword_patterns in COMPILED_KEYWORDS.items():
        for keyword, pattern in keyword_patterns:
            if pattern.search(text):
                scores[category] += 1
                matched_keywords.append(f"{category}:{keyword}")

    best_score = max(scores.values())
    if best_score < min_score:
        return "Unknown", 0, []

    top_categories = [cat for cat, score in scores.items() if score == best_score]
    if len(top_categories) > 1:
        return "LOW_CONFIDENCE", best_score, matched_keywords

    return canonicalize_category(top_categories[0]), best_score, matched_keywords


def load_model(model_path: str = "models/categorizer.pkl") -> dict[str, Any]:
    with open(model_path, "rb") as model_file:
        model = pickle.load(model_file)
    if "vectorizer" not in model or "classifier" not in model:
        raise ValueError("categorizer.pkl must contain 'vectorizer' and 'classifier'.")
    return model


def ml_predict(
    description: str,
    model: Mapping[str, Any] | None = None,
    model_path: str = "models/categorizer.pkl",
) -> tuple[str, float]:
    loaded_model = model or load_model(model_path)
    vectorizer = loaded_model["vectorizer"]
    classifier = loaded_model["classifier"]

    tfidf = vectorizer.transform([str(description or "")])
    predicted = classifier.predict(tfidf)[0]
    confidence = float(classifier.predict_proba(tfidf).max(axis=1)[0])
    return canonicalize_category(str(predicted)), round(confidence, 4)


def ml_predict_batch(
    descriptions: Sequence[str],
    model: Mapping[str, Any] | None = None,
    model_path: str = "models/categorizer.pkl",
) -> pd.DataFrame:
    loaded_model = model or load_model(model_path)
    vectorizer = loaded_model["vectorizer"]
    classifier = loaded_model["classifier"]

    text_list = [str(description or "") for description in descriptions]
    tfidf = vectorizer.transform(text_list)
    predicted = classifier.predict(tfidf)
    confidence = classifier.predict_proba(tfidf).max(axis=1)

    return pd.DataFrame(
        {
            "description": text_list,
            "predicted_category": [canonicalize_category(str(label)) for label in predicted],
            "confidence": confidence.round(4),
        }
    )


def hybrid_categorize(
    description: str,
    min_rule_score: int = 1,
    ml_confidence_threshold: float = 0.5,
    model: Mapping[str, Any] | None = None,
    model_path: str = "models/categorizer.pkl",
) -> dict[str, Any]:
    rule_category, score, matched_keywords = rule_categorize(description, min_score=min_rule_score)
    if rule_category not in {"Unknown", "LOW_CONFIDENCE"}:
        return {
            "category": rule_category,
            "source": "rule",
            "rule_score": score,
            "matched_keywords": matched_keywords,
            "ml_confidence": None,
        }

    if model is None and not Path(model_path).exists():
        return {
            "category": "LOW_CONFIDENCE",
            "source": "ml_unavailable",
            "rule_score": score,
            "matched_keywords": matched_keywords,
            "ml_confidence": None,
        }

    predicted_category, confidence = ml_predict(description=description, model=model, model_path=model_path)
    if confidence < ml_confidence_threshold:
        return {
            "category": "LOW_CONFIDENCE",
            "source": "ml_low_confidence",
            "rule_score": score,
            "matched_keywords": matched_keywords,
            "ml_confidence": confidence,
        }

    return {
        "category": predicted_category,
        "source": "ml",
        "rule_score": score,
        "matched_keywords": matched_keywords,
        "ml_confidence": confidence,
    }


def _parse_amount(raw_value: Any) -> float:
    if raw_value is None or (isinstance(raw_value, float) and pd.isna(raw_value)):
        return 0.0
    if isinstance(raw_value, (int, float)):
        return float(raw_value)

    text = str(raw_value).strip()
    if not text:
        return 0.0

    negative = text.startswith("(") and text.endswith(")")
    normalized = re.sub(r"[^0-9.\-]", "", text)
    if not normalized or normalized in {"-", ".", "-."}:
        return 0.0

    value = float(normalized)
    if negative:
        value = -abs(value)
    return value


def summarize_monthly_metrics(
    transactions: pd.DataFrame | Sequence[Mapping[str, Any]],
    date_column: str = "Transaction Date",
    amount_column: str = "CAD$",
    category_column: str = "category",
) -> dict[str, Any]:
    if isinstance(transactions, pd.DataFrame):
        frame = transactions.copy()
    else:
        frame = pd.DataFrame(list(transactions))

    if frame.empty:
        return {}

    required_columns = [date_column, amount_column, category_column]
    missing = [column for column in required_columns if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    frame[date_column] = pd.to_datetime(frame[date_column], errors="coerce")
    frame = frame.dropna(subset=[date_column])
    if frame.empty:
        return {}

    frame["amount_value"] = frame[amount_column].apply(_parse_amount)
    if frame["amount_value"].eq(0).all():
        return {}

    # Support both signed debits (-) and already-normalized positive spend values.
    if (frame["amount_value"] < 0).any():
        frame = frame[frame["amount_value"] < 0].copy()
        frame["spend"] = frame["amount_value"].abs()
    else:
        frame = frame[frame["amount_value"] > 0].copy()
        frame["spend"] = frame["amount_value"]

    if frame.empty:
        return {}

    frame["canonical_category"] = frame[category_column].apply(
        lambda value: canonicalize_category(str(value))
    )
    frame["month"] = frame[date_column].dt.to_period("M").astype(str)
    frame["day"] = frame[date_column].dt.date.astype(str)

    summary: dict[str, Any] = {}
    for month, month_frame in frame.groupby("month"):
        total_spent = float(month_frame["spend"].sum())
        daily = month_frame.groupby("day", as_index=False)["spend"].sum()
        category_breakdown = month_frame.groupby("canonical_category", as_index=False)["spend"].sum()
        category_breakdown = category_breakdown.sort_values("spend", ascending=False)

        top_category_row = category_breakdown.iloc[0]
        top_amount = float(top_category_row["spend"])
        top_name = str(top_category_row["canonical_category"])
        top_percent = (top_amount / total_spent * 100) if total_spent else 0.0

        summary[month] = {
            "totalSpent": round(total_spent, 2),
            "averagePerDay": round(float(daily["spend"].mean()), 2),
            "topCategory": {
                "name": top_name,
                "amount": round(top_amount, 2),
                "percentOfTotal": round(top_percent, 2),
            },
            "dailySeries": [
                {"date": str(row["day"]), "amount": round(float(row["spend"]), 2)}
                for _, row in daily.sort_values("day").iterrows()
            ],
            "categoryBreakdown": [
                {
                    "name": str(row["canonical_category"]),
                    "amount": round(float(row["spend"]), 2),
                    "percentOfTotal": round(
                        (float(row["spend"]) / total_spent * 100) if total_spent else 0.0,
                        2,
                    ),
                }
                for _, row in category_breakdown.iterrows()
            ],
        }

    return summary


def validate_download_transactions_schema(frame: pd.DataFrame) -> None:
    missing = [
        column for column in DOWNLOAD_TRANSACTIONS_REQUIRED_COLUMNS if column not in frame.columns
    ]
    if missing:
        raise ValueError(
            "Input CSV must match download-transactions.csv schema. "
            f"Missing columns: {missing}"
        )


def classify_download_transactions_frame(
    frame: pd.DataFrame,
    model_path: str = "models/categorizer.pkl",
    min_rule_score: int = 1,
    ml_confidence_threshold: float = 0.5,
) -> pd.DataFrame:
    validate_download_transactions_schema(frame)
    output = frame.copy()
    output["description"] = output["Description 1"].astype(str)
    return classify_frame_hybrid(
        output,
        description_column="description",
        model_path=model_path,
        min_rule_score=min_rule_score,
        ml_confidence_threshold=ml_confidence_threshold,
    )


def classify_frame_hybrid(
    frame: pd.DataFrame,
    description_column: str = "description",
    model_path: str = "models/categorizer.pkl",
    min_rule_score: int = 1,
    ml_confidence_threshold: float = 0.5,
) -> pd.DataFrame:
    if description_column not in frame.columns:
        raise ValueError(f"Missing '{description_column}' column.")

    model: dict[str, Any] | None = None
    if Path(model_path).exists():
        model = load_model(model_path)

    output = frame.copy()
    hybrid_results = output[description_column].astype(str).apply(
        lambda text: hybrid_categorize(
            text,
            min_rule_score=min_rule_score,
            ml_confidence_threshold=ml_confidence_threshold,
            model=model,
            model_path=model_path,
        )
    )
    output["predicted_category"] = hybrid_results.apply(lambda result: result["category"])
    output["classification_source"] = hybrid_results.apply(lambda result: result["source"])
    output["confidence_score"] = hybrid_results.apply(
        lambda result: result["rule_score"] if result["source"] == "rule" else result["ml_confidence"]
    )
    output["matched_keywords"] = hybrid_results.apply(
        lambda result: ", ".join(result["matched_keywords"])
    )
    return output
