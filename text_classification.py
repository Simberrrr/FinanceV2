import re
import pandas as pd

# =====================================
# 1️⃣ Load Raw Transactions CSV
# =====================================
INPUT_FILE = "test.csv"
AUTO_LABELED_FILE = "transactions_auto_labeled.csv"

df = pd.read_csv(INPUT_FILE)
print(f"Loaded {len(df)} transactions from {INPUT_FILE}")

if "Description 1" not in df.columns:
    raise ValueError("CSV must contain a 'Description 1' column.")

df["description"] = df["Description 1"].astype(str)


# =====================================
# 2️⃣ Rule-Based Auto Categorization
# =====================================

category_keywords = {
    "Transportation": [
        "uber", "lyft", "shell", "esso", "circle k", "petro canada",
        "taxi", "transit", "parking", "onroute", "bike share", "petro-canada"
    ],
    "Groceries": [
        "costco", "walmart", "metro", "loblaws", "sobeys",
        "whole foods", "no frills", "fortinos", "freshco", "food basics"
    ],
    "Dining": [
        "starbucks", "tim hortons", "mcdonald", "kfc", "chipotle",
        "restaurant", "cafe", "pizzeria", "pizza", "burger", "wings",
        "sushi", "noodles", "ramen", "hotpot", "vietnamese", "cuisine",
        "coffeebar", "milktea", "grill", "bar and grill", "tst", "tea",
        "coffee", "buns"
    ],
    "Entertainment": [
        "netflix", "spotify", "steam", "cineplex", "movie", "blue mtn", "blue mountain",
        "concert", "climbing", "whistler", "ski", "snowboard", "steel peak", "cannabis"
    ],
    "Shopping / Personal Care": [
        "amazon", "h&m", "zara", "dollarama", "sephora",
        "sport chek", "indigo", "best buy", "the bay", "old navy"
    ],
    "Health": [
        "pharmacy", "shoppers", "rexall", "hospital", "clinic",
        "dental", "doctor", "physio", "massage", "medic", "athletics",
        "pharm"
    ],
    "Utilities / Subscriptions": [
        "rogers", "bell", "telus", "hydro", "enbridge", "notify.careers",
        "google", "apple", "microsoft", "icloud", "adobe"
    ],
}

def build_pattern(keyword: str) -> re.Pattern:
    """Compile a case-insensitive word-boundary pattern, handling special chars."""
    escaped = re.escape(keyword)
    # Use lookaround instead of \b to handle keywords with special chars like &
    pattern = r"(?<!\w)" + escaped + r"(?!\w)"
    return re.compile(pattern, re.IGNORECASE)

# Pre-compile all patterns once for performance
compiled_keywords = {
    cat: [(kw, build_pattern(kw)) for kw in keywords]
    for cat, keywords in category_keywords.items()
}

def auto_categorize(description: str, min_score: int = 1) -> tuple[str, int, list[str]]:
    scores = {cat: 0 for cat in compiled_keywords}
    matched_keywords = []
    for category, kw_patterns in compiled_keywords.items():
        for kw, pattern in kw_patterns:
            if pattern.search(description):
                scores[category] += 1
                matched_keywords.append(f"{category}:{kw}")

    best_score = max(scores.values())

    if best_score < min_score:
        return "Unknown", 0, []

    # Detect ties — return LOW_CONFIDENCE if multiple categories score equally
    
    top_categories = [cat for cat, score in scores.items() if score == best_score]
    if len(top_categories) > 1:
        return "LOW_CONFIDENCE", best_score, matched_keywords

    return top_categories[0], best_score, matched_keywords


# Apply and expand the tuple result into separate columns
results = df["description"].apply(auto_categorize)
df["predicted_category"] = results.apply(lambda x: x[0])
df["confidence_score"]   = results.apply(lambda x: x[1])
df["matched_keywords"]   = results.apply(lambda x: ", ".join(x[2]))

print("\nAuto-labeling complete.")
print(df["predicted_category"].value_counts())
print(f"\nLow confidence:  {(df['predicted_category'] == 'LOW_CONFIDENCE').sum()}")
print(f"Unknown:         {(df['predicted_category'] == 'Unknown').sum()}")


# =====================================
# 3️⃣ Save For Manual Correction
# =====================================

# Sort so LOW_CONFIDENCE and Unknown rows float to the top for easy review
df_sorted = df.sort_values(
    by=["confidence_score", "predicted_category"],
    ascending=[True, False]
)

df_sorted.to_csv(AUTO_LABELED_FILE, index=False)
print(f"\nSaved to: {AUTO_LABELED_FILE}")
print("Add a 'corrected_category' column, fix incorrect labels, then save.")

# =====================================
# 3️⃣ Save For Manual Correction
# =====================================

OUTPUT_COLUMNS = [
    "Transaction Date", "Cheque Number", "Description 1", "Description 2",
    "CAD$", "USD$", "description", "predicted_category", "corrected_category",
    # "confidence_score", "matched_keywords"
]

# Add empty corrected_category column for manual review
df_sorted["corrected_category"] = ""

df_sorted = df.sort_values(
    by=["confidence_score", "predicted_category"],
    ascending=[True, False]
)

# Only keep columns that actually exist in the dataframe (avoids errors if e.g. USD$ isn't in your CSV)
existing_columns = [col for col in OUTPUT_COLUMNS if col in df_sorted.columns]
df_sorted[existing_columns].to_csv(AUTO_LABELED_FILE, index=False)

print(f"\nSaved to: {AUTO_LABELED_FILE}")
print("Fill in the 'corrected_category' column, then save.")


# =====================================
# 4️⃣ Create Final Training File (after manual correction)
# =====================================

# df_corrected = pd.read_csv("transactions_auto_labeled.csv")
# if "corrected_category" not in df_corrected.columns:
#     raise ValueError("You must add a 'corrected_category' column first.")
#
# training_data = df_corrected[["description", "corrected_category"]].copy()
# training_data = training_data.rename(columns={"corrected_category": "category"})
# training_data = training_data[training_data["category"].str.strip() != ""]
#
# training_data.to_csv("training_data.csv", index=False)
# print(f"Training data saved: {len(training_data)} rows")