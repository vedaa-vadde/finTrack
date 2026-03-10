# 📈 FinTrack - AI-Powered Financial Intelligence

FinTrack is a full-stack financial intelligence platform designed to give you deep visibility into your spending behavior. Unlike traditional banking apps, FinTrack uses Machine Learning to not only track expenses but to intelligently categorize them and detect fraudulent anomalies in real-time.

## ✨ Key Features

- **🔐 Secure User Authentication:** Full JWT-based login/signup with encrypted passwords.
- **📊 Expense Tracking Dashboard:** Add, edit, delete, and visualize expenses through an intuitive UI.
- **🤖 AI Expense Categorization:** Powered by a Python NLP engine, automatically categorizes transactions (e.g., Swiggy -> Food, Uber -> Transport) adapted for international and Indian contexts.
- **🚨 Fraud / Anomaly Detection:** Uses Scikit-learn's `IsolationForest` ML model to analyze your spending history and flag highly unusual charges to protect your account.
- **📁 CSV Bank Statement Uploads:** Bulk upload historical transactions and have them categorized and checked for anomalies instantly.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- Chart.js (Visualizations)

**Backend Microservice:**
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT & Bcrypt (Auth)
- Multer & CSV-Parser (File Uploads)

**AI & Machine Learning Microservice:**
- Python 3 & FastAPI
- Scikit-learn (Machine Learning Models)
- Pandas (Data Processing)

---

## 🚀 Getting Started

You will need to run three separate processes for the entire application to function correctly.

### 1. Database Setup
Make sure you have [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

### 2. Backend Setup (Port :5004)
Navigate to the `backend` directory, install dependencies, and start the local server.

```bash
cd backend
npm install
npm start
```

*Note: The backend requires a `.env` file containing `PORT`, `MONGO_URI`, `JWT_SECRET`, and `AI_SERVICE_URL`. See the backend code for details.*

### 3. AI Service Setup (Port :8002)
Navigate to the `ai-service` directory, set up your Python virtual environment, and install the AI tools.

```bash
cd ai-service
python -m venv venv
# Activate on Windows:
venv\Scripts\activate
# Activate on Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup (Port :5177)
Navigate to the `frontend` directory, install the Vite/React dependencies, and spin up the UI.

```bash
cd frontend
npm install
npm run dev
```

Your app should now be running locally! Open your browser to the local Vite URL (typically `http://localhost:5177`) to see the Dashboard.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## 📝 License
This project is open-source and available under the MIT License.
