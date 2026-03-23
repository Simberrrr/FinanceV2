from __future__ import annotations

from flask import Flask, jsonify, request
import pandas as pd

from training.transaction_classifier import classify_frame_hybrid

app = Flask(__name__)


@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    if not data or "descriptions" not in data:
        return jsonify({"error": "Missing 'descriptions' field"}), 400

    descriptions = data["descriptions"]
    if not descriptions:
        return jsonify([]), 200

    df = pd.DataFrame({"description": descriptions})
    classified = classify_frame_hybrid(df, description_column="description")

    results = [
        {
            "description": row["description"],
            "category": row["predicted_category"],
            "confidence": row["confidence_score"],
        }
        for _, row in classified.iterrows()
    ]

    return jsonify(results), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
