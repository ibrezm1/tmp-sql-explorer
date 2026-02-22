# SQL Architect: Schema Explorer & AI Agent

A powerful, client-side React application designed to help Database Administrators and Architects visualize SQL Server schemas, analyze foreign key relationships, and interact with an AI-powered database assistant.

---

## 🚀 Features

- **Schema Visualization**: Upload CSV extracts from SQL Server to view tables, columns, and data types in a modern, card-based UI.
- **Advanced Filtering**: Segregated search bars to filter by Table Name or Column/Description metadata.
- **Relationship Mapping**: Automatically detects and displays Foreign Key relationships between tables.
- **Architecture AI**: Integrated Gemini-powered chat agent that understands your uploaded schema and answers architectural questions.
- **SQL Query Guide**: Built-in help page with optimized SQL queries to extract metadata from SQL Server Management Studio (SSMS).
- **Template Downloads**: Download correctly formatted CSV templates to ensure seamless data import.

---

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sql-architect.git
   cd sql-architect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Key:**
   Open `src/App.jsx` (or `schema_explorer.jsx`) and set your Gemini API key:
   ```javascript
   const API_KEY = "YOUR_GOOGLE_GEMINI_API_KEY";
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

---

## 📊 Data Preparation

To use your own data:

1. Navigate to the **Query Guide** within the application.
2. Copy the provided SQL queries.
3. Run them in SQL Server Management Studio.
4. Export the results as CSV (Comma Delimited).
5. Upload the files into the app.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).