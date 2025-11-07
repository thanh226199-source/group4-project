import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Đường dẫn đúng phải có /api/auth/signup
      await axios.post("http://localhost:5000/api/auth/signup", form);
      setMessage("✅ Đăng ký thành công! Hãy đăng nhập.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("❌ Lỗi khi đăng ký:", err);
      setMessage("❌ Email đã tồn tại hoặc lỗi hệ thống!");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Tạo tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Họ và tên..."
            required
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email..."
            type="email"
            required
            onChange={handleChange}
          />
          <input
            name="password"
            placeholder="Mật khẩu..."
            type="password"
            required
            onChange={handleChange}
          />
          <button type="submit" className="btn-primary">
            Đăng ký
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <p>
          Đã có tài khoản?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
}
