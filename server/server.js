const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Expense = require("./models/Expense"); // Correct import without .default

const app = express();

// Middleware
app.use(
  cors(({
  origin: 'http://localhost:5173',  // Allow requests from the frontend
  credentials: true,               // Allow credentials (cookies, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],    // Allowed headers
}))
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://snafisa001:l0qwD4GofRkHy5G0@cluster0.henkt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Routes

// Test route to check if server is working
app.get("/api/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Server is working!", timestamp: new Date() });
});

// GET all expenses - THIS WAS MISSING!
app.get("/api/expenses", async (req, res) => {
  try {
    console.log("GET /api/expenses - Fetching all expenses...");
    
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    
    console.log(`Found ${expenses.length} expenses`);
    res.status(200).json(expenses);
    
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ 
      error: "Failed to fetch expenses",
      message: error.message 
    });
  }
});


// GET single expense by ID
app.get("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      error: "Failed to fetch expense",
      message: error.message,
    });
  }
});

// POST create new expense
app.post("/api/expenses", async (req, res) => {
  console.log("POST /api/expenses endpoint hit");
  console.log("Request body:", req.body);

  try {
    const { title, amount, date, category } = req.body;

    // Validation
    if (!title || !amount || !date || !category) {
      console.log("Validation failed: missing fields");
      return res.status(400).json({
        error: "All fields are required: title, amount, date, category",
      });
    }

    // Validate category
    const validCategories = [
      "Food",
      "Travel",
      "Entertainment",
      "Bills",
      "Others",
    ];
    if (!validCategories.includes(category)) {
      console.log("Validation failed: invalid category");
      return res.status(400).json({
        error:
          "Invalid category. Must be one of: Food, Travel, Entertainment, Bills, Others",
      });
    }

    // Validate amount
    if (isNaN(amount) || amount < 0) {
      console.log("Validation failed: invalid amount");
      return res.status(400).json({
        error: "Amount must be a valid positive number",
      });
    }

    const newExpense = new Expense({
      title: title.trim(),
      amount: parseFloat(amount),
      date: new Date(date),
      category,
    });

    console.log("Attempting to save expense:", newExpense);
    const savedExpense = await newExpense.save();
    console.log("Expense saved successfully:", savedExpense);
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error creating expense:", error);

    res.status(500).json({
      error: "Failed to create expense",
      message: error.message,
    });
  }
});

// PUT update expense by ID
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date, category } = req.body;

    // Validation
    if (!title || !amount || !date || !category) {
      return res.status(400).json({
        error: "All fields are required: title, amount, date, category",
      });
    }

    const validCategories = [
      "Food",
      "Travel",
      "Entertainment",
      "Bills",
      "Others",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error:
          "Invalid category. Must be one of: Food, Travel, Entertainment, Bills, Others",
      });
    }

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        error: "Amount must be a valid positive number",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        amount: parseFloat(amount),
        date: new Date(date),
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);

    res.status(500).json({
      error: "Failed to update expense",
      message: error.message,
    });
  }
});

// DELETE expense by ID
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({
      message: "Expense deleted successfully",
      deletedExpense,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      error: "Failed to delete expense",
      message: error.message,
    });
  }
});

// GET expenses summary/statistics
app.get("/api/expenses/stats/summary", async (req, res) => {
  try {
    const totalExpenses = await Expense.countDocuments();
    const totalAmount = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const categoryStats = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      totalExpenses,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      categoryStats,
    });
  } catch (error) {
    console.error("Error fetching expenses summary:", error);
    res.status(500).json({
      error: "Failed to fetch expenses summary",
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});



const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
