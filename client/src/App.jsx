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
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    month: "",
  });

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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.amount !== "" &&
      !isNaN(formData.amount) &&
      parseFloat(formData.amount) > 0 &&
      formData.date !== "" &&
      formData.category !== ""
    );
  };

  // Add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please fill in all fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:5005/api/expenses", {
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

  // Format date for display (DD-MM-YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter expenses based on filters
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    // Category filter
    if (filters.category && expense.category !== filters.category) {
      return false;
    }

    // Month filter
    if (filters.month) {
      const expenseMonth = expenseDate.toISOString().slice(0, 7); // YYYY-MM format
      if (expenseMonth !== filters.month) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      if (expenseDate < startDate || expenseDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Find highest expense
  const highestExpense = filteredExpenses.reduce((highest, expense) => {
    return expense.amount > (highest?.amount || 0) ? expense : highest;
  }, null);

  // Calculate expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      month: "",
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your daily expenses in Taka (৳)</p>
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
            <label htmlFor="amount">Amount (৳)</label>
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

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !isFormValid()}
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Filters Section */}
      <div className="filters-container">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="categoryFilter">Filter by Category</label>
            <select
              id="categoryFilter"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="monthFilter">Filter by Month</label>
            <input
              type="month"
              id="monthFilter"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="summary-container">
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p className="amount">৳{totalAmount.toFixed(2)}</p>
            <span className="count">{filteredExpenses.length} records</span>
          </div>

          <div className="summary-card">
            <h3>Highest Expense</h3>
            {highestExpense ? (
              <>
                <p className="amount">৳{highestExpense.amount.toFixed(2)}</p>
                <span className="title">{highestExpense.title}</span>
                <span className="category">{highestExpense.category}</span>
              </>
            ) : (
              <p className="no-data">No expenses found</p>
            )}
          </div>

          <div className="summary-card category-summary">
            <h3>Expenses by Category</h3>
            <div className="category-list">
              {Object.entries(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}:</span>
                    <span className="category-amount">
                      ৳{amount.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No expenses found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="expenses-container">
        <h2>All Expenses</h2>
        {loading && <p>Loading expenses...</p>}

        {filteredExpenses.length === 0 ? (
          <p className="no-expenses">
            {filters.category ||
            filters.month ||
            filters.startDate ||
            filters.endDate
              ? "No expenses found matching the current filters."
              : "No expenses found. Add your first expense above!"}
          </p>
        ) : (
          <div className="table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount (৳)</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="title-cell">{expense.title}</td>
                    <td className="amount-cell">
                      ৳{expense.amount.toFixed(2)}
                    </td>
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
