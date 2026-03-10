from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from models import categorize_transaction, detect_anomalies
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    description: str
    amount: float

class TransactionList(BaseModel):
    transactions: List[Transaction]

@app.post("/categorize")
def categorize(transaction: Transaction):
    try:
        category = categorize_transaction(transaction.description)
        return {"category": category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-anomaly")
def detect_anomaly(data: TransactionList):
    try:
        results = detect_anomalies([{"description": t.description, "amount": t.amount} for t in data.transactions])
        return {"anomalies": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
