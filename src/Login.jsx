import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🧹 Reset form và xóa thông tin cũ khi mở trang Login
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");

    // Reset form rỗng
    setForm({ email: "", password: "" });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      const { token, user } = res.data;

      // Lưu thông tin đăng nhập
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("profile", JSON.stringify(user));

      setMessage("✅ Đăng nhập thành công!");
      if (onLoginSuccess) onLoginSuccess(token, user.role);

      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error("❌ Lỗi khi đăng nhập:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "❌ Lỗi đăng nhập!");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="email"
            placeholder="Email..."
            type="email"
            required
            autoComplete="new-email" // 🚫 tắt autofill email
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            placeholder="Mật khẩu..."
            type="password"
            required
            autoComplete="new-password" // 🚫 tắt autofill password
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit" className="btn-primary">
            Đăng nhập
          </button>
        </form>

        {message && <p className="message">{message}</p>}
        <p>
          Chưa có tài khoản?{" "}
          <span className="link" onClick={() => navigate("/signup")}>
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
}
