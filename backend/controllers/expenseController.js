const Expense = require("../models/Expense");
const fs = require("fs");
const csv = require("csv-parser");
// We will use axios or native fetch to call AI service later
// const axios = require("axios");

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, date, category } = req.body;
    
    let finalCategory = category;
    if (!finalCategory || finalCategory === "Uncategorized") {
      try {
        const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/categorize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, amount: Number(amount) })
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          finalCategory = data.category;
        }
      } catch (err) {
        console.error("AI Categorize Error:", err.message);
        finalCategory = "Uncategorized";
      }
    }

    let isAnomaly = false;
    try {
      const pastExpenses = await Expense.find({ userId: req.user._id }).select('description amount -_id');
      const transactionsPayload = pastExpenses.map(e => ({ description: e.description, amount: e.amount }));
      transactionsPayload.push({ description, amount: Number(amount) });

      const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/detect-anomaly`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: transactionsPayload })
      });
      if (aiRes.ok) {
        const data = await aiRes.json();
        isAnomaly = data.anomalies[transactionsPayload.length - 1];
      }
    } catch (err) {
      console.error("AI Anomaly Error:", err.message);
    }
    
    // In actual implementation we will call AI service here to categorize if empty
    // and detect anomaly, but for now we create it directly.
    const expense = await Expense.create({
      userId: req.user._id,
      amount: Number(amount),
      description,
      date: date || Date.now(),
      category: finalCategory || "Uncategorized",
      isAnomaly
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload a CSV file" });

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Empty CSV file" });
          }
          
          // Map to format
          const mappedData = results.map(r => ({
            description: r.description || r.Description || "Unknown",
            amount: Number(r.amount || r.Amount || 0),
            date: r.date || r.Date || Date.now(),
            category: r.category || r.Category || ""
          }));

          // Call AI to detect anomalies in bulk
          let anomalies = [];
          try {
             const aiReq = mappedData.map(m => ({ description: m.description, amount: m.amount }));
             const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/detect-anomaly`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions: aiReq })
             });
             if (aiRes.ok) {
                const data = await aiRes.json();
                anomalies = data.anomalies;
             }
          } catch (e) {
             console.error("Bulk AI Anomaly Error:", e.message);
          }

          const expensesToSave = [];
          for (let i = 0; i < mappedData.length; i++) {
            const item = mappedData[i];
            
            // Call AI to prioritize categories if missing
            let cat = item.category;
            if (!cat || cat === "Uncategorized") {
               try {
                  const cRes = await fetch(`${process.env.AI_SERVICE_URL}/categorize`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: item.description, amount: item.amount })
                  });
                  if (cRes.ok) {
                    const cData = await cRes.json();
                    cat = cData.category;
                  }
               } catch (e) { }
            }

            expensesToSave.push({
              userId: req.user._id,
              amount: item.amount,
              description: item.description,
              date: item.date,
              category: cat || "Uncategorized",
              isAnomaly: anomalies[i] || false
            });
          }

          await Expense.insertMany(expensesToSave);
          fs.unlinkSync(req.file.path);
          res.json({ message: "File processed and uploaded successfully", count: expensesToSave.length });
        } catch (e) {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ message: e.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
