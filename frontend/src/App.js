import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Spending from "./pages/Spending";
import Assets from "./pages/Assets";
import AccountDetail from "./pages/AccountDetail";
import AIAgent from "./pages/AIAgent";

function App() {
  return (
    <div className="App bg-gray-950 text-gray-100 min-h-screen">
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/spending" element={<Spending />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:accountId" element={<AccountDetail />} />
              <Route path="/ai" element={<AIAgent />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;