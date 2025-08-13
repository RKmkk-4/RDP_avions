import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PetriNetSimulator from "./components/PetriNetSimulator";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PetriNetSimulator />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;