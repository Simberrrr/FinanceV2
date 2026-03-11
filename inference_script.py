import pandas as pd
import pickle

# Load model
with open("categorizer.pkl", "rb") as f:
    model = pickle.load(f)

vectorizer = model["vectorizer"]
clf        = model["classifier"]

def predict(descriptions: list[str]) -> pd.DataFrame:
    tfidf = vectorizer.transform(descriptions)
    
    predicted  = clf.predict(tfidf)
    confidence = clf.predict_proba(tfidf).max(axis=1)  # highest class probability

    return pd.DataFrame({
        "description": descriptions,
        "predicted_category": predicted,
        "confidence": confidence.round(2)
    })

# Example
new_transactions = [
    "TIM HORTONS #1234",
    "AMAZON MKTPLACE",
    "PETRO CANADA 99",
]

print(predict(new_transactions))