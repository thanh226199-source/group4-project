import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const token = localStorage.getItem("token");

  // 🧩 Lấy thông tin người dùng (chỉ khi có token)
  useEffect(() => {
    if (!token) return;
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
    fetchProfile();
  }, [token]);

  // 📤 Khi chọn file avatar thì hiển thị preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // 💾 Cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("❌ Bạn chưa đăng nhập!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      if (newPassword) formData.append("password", newPassword);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.put("http://localhost:5000/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ " + res.data.message);
      setNewPassword("");
      setAvatarFile(null);
      setPreview(null);

      // load lại user sau khi update
      const updated = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(updated.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Nếu chưa đăng nhập
  if (!token) {
    return (
      <div className="profile-page">
        <div className="profile-form-card">
          <h2>🔒 Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem và chỉnh sửa thông tin cá nhân của bạn.</p>
        </div>
      </div>
    );
  }

  if (!user) return <div className="loading">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-large">
          {preview ? (
            <img src={preview} alt="Preview" className="avatar-img" />
          ) : user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>
          )}
        </div>
        <div>
          <h1>{user.name}</h1>
          <p className="email">📧 {user.email}</p>
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
            <label>Ảnh đại diện (upload ảnh mới)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="form-group">
            <label>Mật khẩu mới (nếu muốn đổi)</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
