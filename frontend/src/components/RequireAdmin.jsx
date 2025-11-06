import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  if (!profile || profile.role !== 'admin') {
    alert('Bạn không có quyền truy cập trang này.');
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAdmin;
