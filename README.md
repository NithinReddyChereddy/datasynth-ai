# 🌌 DataSynth AI | Next-Gen Intelligence Hub

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**DataSynth AI** is a premium, full-stack data analytics platform that transforms raw datasets into actionable intelligence. By combining high-performance Python analysis with Google's Gemini AI, it provides automated insights, predictive trends, and stunning glassmorphic visualizations in real-time.

---

## ✨ Key Features

- **🚀 Instant Analysis**: High-speed processing for CSV and Excel datasets using Pandas and Scipy.
- **🤖 AI-Driven Insights**: Automated summary generation and interactive chat interface powered by Google Gemini Pro.
- **📊 Dynamic Visual Gallery**: Interactive temporal charts, heatmaps, and statistical distributions.
- **🛡️ Intelligent Validation**: Automatic detection of data anomalies, outliers, and missing values.
- **🌗 Premium UI/UX**: State-of-the-art glassmorphism design system with seamless dark/light mode transition.
- **📅 Smart filtering**: Advanced time-series detection and custom range filtering.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Asynchronous Python)
- **Engine**: Pandas, NumPy, SciPy
- **AI Integration**: Google Generative AI (Gemini Pro)
- **Environment**: Python 3.10+

### Frontend
- **Framework**: React 18 (Vite + TypeScript)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts / Custom SVG

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate 
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_api_key_here
```
Run the API:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory (optional for production):
```env
VITE_API_BASE_URL=http://localhost:8000
```
Run the dashboard:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/            # FastAPI Application
│   ├── main.py        # API Entry point
│   ├── analyzer.py    # Core Data Logic
│   └── ai_service.py  # Gemini Integration
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Modular UI System
│   │   └── App.tsx     # Application Core
└── README.md
```

---

## 🎨 Design System
The application uses a custom-built design system based on:
- **Depth**: Multi-layered backdrop blurs.
- **Focus**: Emerald and Primary glows for interaction feedback.
- **Typography**: Inter / System Sans for maximum readability.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by AI for the future of Data.
