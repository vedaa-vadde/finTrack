const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, default: "Uncategorized" },
  isAnomaly: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
