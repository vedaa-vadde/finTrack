const express = require("express");
const { addExpense, getExpenses, deleteExpense, uploadCSV } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protect);

router.route("/")
  .post(addExpense)
  .get(getExpenses);

router.route("/:id").delete(deleteExpense);

router.post("/upload", upload.single("file"), uploadCSV);

module.exports = router;
