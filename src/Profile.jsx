import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Lấy thông tin người dùng
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Không thể tải thông tin cá nhân!");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/profile",
        { name: user.name, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ " + res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-large">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h1>{user.name}</h1>
          <p className="email">{user.email}</p>
          <p className="role">🎯 Vai trò: {user.role?.toUpperCase()}</p>
          <p className="id">🆔 ID: {user._id}</p>
          <p className="created">
            ⏰ Ngày tạo: {new Date(user.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="profile-form-card">
        <h2>✏️ Cập nhật thông tin cá nhân</h2>
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
