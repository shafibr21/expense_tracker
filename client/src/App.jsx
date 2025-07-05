import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    category: "Food",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Categories for dropdown
  const categories = ["Food", "Travel", "Entertainment", "Bills", "Others"];

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/expenses");
      setExpenses(response.data);
    } catch (err) {
      setError("Failed to fetch expenses");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:5000/api/expenses", {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setExpenses((prev) => [response.data, ...prev]);
      setFormData({
        title: "",
        amount: "",
        date: "",
        category: "Food",
      });
    } catch (err) {
      setError("Failed to add expense");
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(`http://localhost:5000/api/expenses/${id}`);
        setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      } catch (err) {
        setError("Failed to delete expense");
        console.error("Error deleting expense:", err);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total amount
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your daily expenses in Taka (TK)</p>
      </header>

      {/* Add Expense Form */}
      <div className="form-container">
        <h2>Add New Expense</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="title">Expense Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter expense title"
              maxLength="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (TK)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Expenses Summary */}
      <div className="summary">
        <h3>Total Expenses: {totalAmount.toFixed(2)} TK</h3>
        <p>Total Records: {expenses.length}</p>
      </div>

      {/* Expenses Table */}
      <div className="expenses-container">
        <h2>All Expenses</h2>
        {loading && <p>Loading expenses...</p>}

        {expenses.length === 0 ? (
          <p className="no-expenses">
            No expenses found. Add your first expense above!
          </p>
        ) : (
          <div className="table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount (TK)</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="title-cell">{expense.title}</td>
                    <td className="amount-cell">{expense.amount.toFixed(2)}</td>
                    <td className="date-cell">{formatDate(expense.date)}</td>
                    <td className="category-cell">
                      <span
                        className={`category-badge ${expense.category.toLowerCase()}`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="delete-btn"
                        title="Delete expense"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
