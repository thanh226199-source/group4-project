import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users'); // baseURL + /users
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi tải danh sách');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      alert('Xóa thành công');
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý người dùng</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="8">
        <thead>
          <tr>
            <th>#</th><th>Tên</th><th>Email</th><th>Role</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u._id}>
              <td>{idx+1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleDelete(u._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
