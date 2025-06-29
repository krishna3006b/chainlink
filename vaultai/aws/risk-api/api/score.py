import json

def handler(request):
    try:
        # Try to read raw body
        raw_body = request.body.decode("utf-8")
        
        # Log body content (optional debugging)
        print("Raw body:", raw_body)

        # Try to parse it
        data = json.loads(raw_body)

        # Log parsed data
        print("Parsed data:", data)

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

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"risk_tier": tier})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
