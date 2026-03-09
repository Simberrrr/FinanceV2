import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import pickle

# =====================================
# 1️⃣ Load Labeled Training Data
# =====================================

df = pd.read_csv("transactions_auto_labeled.csv")

# Use corrected_category if provided, otherwise fall back to predicted_category
df["label"] = df["corrected_category"].fillna("").replace("", None)
df["label"] = df["label"].combine_first(df["predicted_category"])

# Drop rows with no usable label or that are payment transactions
df = df[~df["label"].isin(["Unknown", "LOW_CONFIDENCE", "Ignore"])]
df = df.dropna(subset=["label", "description"])

print(f"Training on {len(df)} labeled transactions")
print(df["label"].value_counts())


# =====================================
# 2️⃣ Train / Test Split
# =====================================

X = df["description"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)


# =====================================
# 3️⃣ Build the Pipeline
# =====================================

# TF-IDF converts text into numeric vectors
# Each unique word/ngram becomes a feature
# The score reflects how distinctive that word is for a given transaction
vectorizer = TfidfVectorizer(
    analyzer="word",
    ngram_range=(1, 2),   # unigrams + bigrams e.g. "tim hortons" as one feature
    min_df=1,             # include even rare words (small dataset)
    sublinear_tf=True,    # dampens very frequent terms
    strip_accents="unicode",
    lowercase=True,
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf  = vectorizer.transform(X_test)


# Logistic Regression is a simple linear classifier
# C controls regularization — lower = simpler model, higher = fits training data more closely
clf = LogisticRegression(
    C=5.0,
    max_iter=1000,
    class_weight="balanced",  # handles imbalanced categories (e.g. lots of Dining, few Health)
)

clf.fit(X_train_tfidf, y_train)


# =====================================
# 4️⃣ Evaluate
# =====================================

y_pred = clf.predict(X_test_tfidf)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
cm = pd.DataFrame(
    confusion_matrix(y_test, y_pred, labels=clf.classes_),
    index=clf.classes_,
    columns=clf.classes_
)
print(cm)


# =====================================
# 5️⃣ Save the Model
# =====================================

with open("categorizer.pkl", "wb") as f:
    pickle.dump({"vectorizer": vectorizer, "classifier": clf}, f)

print("\nModel saved to categorizer.pkl")