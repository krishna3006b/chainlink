# api/score.py


from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route("/api/score", methods=["POST"])
def score():
    try:
        data = request.get_json()
        credit_score = data.get("credit_score")
        income = data.get("income")
        asset_value = data.get("asset_value")

        if credit_score is None or income is None or asset_value is None:
            raise ValueError("Missing input fields")

        if credit_score >= 750 and income >= 100000 and asset_value >= 300000:
            tier = "A"
        elif credit_score >= 650 and income >= 50000 and asset_value >= 100000:
            tier = "B"
        else:
            tier = "C"

        return jsonify({"risk_tier": tier})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
