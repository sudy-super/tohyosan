import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Vote from "./pages/Vote";
import Results from "./pages/Results";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Vote />} />
        <Route path="/:id/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
