import json

def handler(request):
    try:
        # Read and parse JSON from request body
        body = request.body.decode()
        data = json.loads(body)

        credit_score = data.get("credit_score")
        income = data.get("income")
        asset_value = data.get("asset_value")

        if credit_score is None or income is None or asset_value is None:
            raise ValueError("Missing input fields")

        # Risk logic
        if credit_score >= 750 and income >= 100000 and asset_value >= 300000:
            tier = "A"
        elif credit_score >= 650 and income >= 50000 and asset_value >= 100000:
            tier = "B"
        else:
            tier = "C"

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"risk_tier": tier})
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
