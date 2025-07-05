const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Food", "Travel", "Entertainment", "Bills", "Others"],
        message:
          "Category must be one of: Food, Travel, Entertainment, Bills, Others",
      },
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  }
);

// Create and export the model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
