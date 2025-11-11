import React from "react";
import { useNavigate } from "react-router-dom";
import "./Forbidden.css";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-page">
      <div className="forbidden-card">
        <h1>🚫 Không có quyền truy cập</h1>
        <p>Bạn không có quyền truy cập vào trang này.</p>
        <button onClick={() => navigate("/profile")}>⬅ Quay lại Hồ sơ</button>
      </div>
    </div>
  );
}
