import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";   
import AddProperty from "./AddProperty"; 

import Login from "./login";
import Register from "./Register";
import ProfileSetup from "./profile";
import Dashboard from "./dashboard";
import MyListings from "./MyListings";
import PropertyDetails from "./PropertyDetails";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/property/:id" element={<PropertyDetails />} />

        {/* Protected Private Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/add-property" element={<AddProperty />} /> 
          <Route path="/my-listings" element={<MyListings />} /> 
          <Route path="/my-properties" element={<MyListings />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



export default App;
 
