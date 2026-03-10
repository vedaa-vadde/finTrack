import numpy as np
from sklearn.ensemble import IsolationForest
import pandas as pd

# very basic heuristic categorizer for now
def categorize_transaction(description: str) -> str:
    desc = description.lower()
    if any(word in desc for word in ["starbucks", "mcdonalds", "restaurant", "food", "cafe", "burger", "zomato", "swiggy", "blinkit", "zepto", "kfc", "dominos", "grocery", "dmart", "bigbasket"]):
        return "Food"
    if any(word in desc for word in ["uber", "lyft", "taxi", "gas", "transit", "train", "flight", "ola", "rapido", "irctc", "makemytrip", "redbus", "petrol", "fuel"]):
        return "Transport"
    if any(word in desc for word in ["amazon", "walmart", "target", "shopping", "clothes", "flipkart", "myntra", "ajio", "meesho", "nykaa", "reliance"]):
        return "Shopping"
    if any(word in desc for word in ["rent", "mortgage", "electric", "water", "internet", "utility", "bescom", "electricity", "mobile", "recharge", "jio", "airtel", "broadband", "emi"]):
        return "Housing & Utilities"
    if any(word in desc for word in ["netflix", "spotify", "hulu", "cinema", "movie", "bookmyshow", "pvr", "hotstar", "prime", "sony"]):
        return "Entertainment"
    if any(word in desc for word in ["gym", "health", "pharmacy", "doctor", "apollo", "pharmeasy", "1mg", "hospital", "clinic"]):
        return "Healthcare"
    return "Other"

# isolation forest for anomaly detection
def detect_anomalies(transactions: list) -> list:
    if not transactions:
        return []
    
    df = pd.DataFrame(transactions)
    if len(df) < 5:
        # Not enough data for Isolation Forest. Use a simple fallback threshold for INR
        # For instance, > 10000 can be flagged if we don't know the user's history yet
        return (df['amount'] > 10000).tolist()
        
    # Features for anomaly detection: amount
    X = df[['amount']].values
    
    # Isolation Forest
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X)
    
    # Predict (-1 is anomaly, 1 is normal)
    predictions = model.predict(X)
    
    # Convert to boolean (True if anomaly, False otherwise)
    is_anomaly = (predictions == -1).tolist()
    return is_anomaly
