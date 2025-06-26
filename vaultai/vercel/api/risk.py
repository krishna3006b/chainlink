import json

def risk_tier(credit_score, income, asset_value):
    if credit_score >= 750 and income >= 100000 and asset_value >= 300000:
        return "A"
    elif credit_score >= 650 and income >= 50000 and asset_value >= 100000:
        return "B"
    else:
        return "C"

def handler(request):
    try:
        data = request.json()
        credit_score = data.get("credit_score")
        income = data.get("income")
        asset_value = data.get("asset_value")
        tier = risk_tier(credit_score, income, asset_value)
        return {
            "statusCode": 200,
            "body": json.dumps({"risk_tier": tier}),
            "headers": {"Content-Type": "application/json"}
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }