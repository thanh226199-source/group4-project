// src/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Tải danh sách user khi vào trang
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách người dùng (có thể bạn không có quyền Admin)"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // ✅ Xóa user
  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa người dùng này không?");
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      alert("Đã xóa người dùng thành công!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Không thể xóa người dùng (có thể bạn không có quyền)"
      );
    }
  };

  if (loading) return <p>Đang tải danh sách...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Danh sách người dùng (Admin)</h2>
      {users.length === 0 ? (
        <p>Không có người dùng nào.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => handleDelete(u._id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
