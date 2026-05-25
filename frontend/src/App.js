import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('access_token') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="review" element={<Review />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}