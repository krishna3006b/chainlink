import json

def risk_tier(credit_score, income, asset_value):
    if credit_score >= 750 and income >= 100000 and asset_value >= 300000:
        return "A"
    elif credit_score >= 650 and income >= 50000 and asset_value >= 100000:
        return "B"
    else:
        return "C"

def main():
    with open("borrowers.json") as f:
        borrowers = json.load(f)
    for b in borrowers:
        tier = risk_tier(b["credit_score"], b["income"], b["asset_value"])
        print(f"Borrower {b['address']} risk tier: {tier}")

if __name__ == "__main__":
    main()
