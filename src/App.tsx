import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./login";
import Register from "./Register";
import ProfileSetup from "./profile";
import Dashboard from "./dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 
