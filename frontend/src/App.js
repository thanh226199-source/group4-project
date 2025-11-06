import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { api } from "./api";
import UserList from "./UserList";
import AddUser from "./AddUser";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Forbidden from "./components/Forbidden";

// 🆕 Import thêm 2 trang mới
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import "./App.css";

function Home({ userRole, isLoggedIn, fetchUsers, users, showToast }) {
  return (
    <>
      {isLoggedIn && userRole === "admin" ? (
        <>
          <h1 className="h1">👥 Quản lý người dùng (Admin)</h1>
          <div className="card">
            <AddUser fetchUsers={fetchUsers} showToast={showToast} />
          </div>
          <div className="card" style={{ marginTop: "20px" }}>
            <UserList
              users={users}
              fetchUsers={fetchUsers}
              showToast={showToast}
            />
          </div>
        </>
      ) : (
        <Forbidden />
      )}
    </>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // ✅ Giữ trạng thái đăng nhập khi reload trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      if (role === "admin") fetchUsers();
    }
  }, []);

  // ✅ Lấy danh sách user (Admin)
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách người dùng:", err.message);
      setUsers([]);
    }
  };

  // ✅ Hiển thị thông báo ngắn (toast)
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  // ✅ Đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUsers([]);
    showToast("Đã đăng xuất!");
    navigate("/login");
  };

  let profile = {};
  try {
    const stored = localStorage.getItem("profile");
    profile = stored && stored !== "undefined" ? JSON.parse(stored) : {};
  } catch {
    profile = {};
  }

  return (
    <div className="container">
      {/* Thanh điều hướng */}
      <nav className="toolbar">
        <div>
          <Link to="/">🏠 Trang chủ</Link> |{" "}
          <Link to="/signup">Đăng ký</Link> |{" "}
          <Link to="/login">Đăng nhập</Link> |{" "}
          {isLoggedIn && <Link to="/profile">Hồ sơ</Link>}
        </div>

        {isLoggedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>
              👋 Xin chào, <b>{profile.name || "Người dùng"}</b> (
              {userRole === "admin" ? "Admin" : "User"} )
            </span>
            <button onClick={handleLogout} className="btn btn-ghost">
              🔓 Đăng xuất
            </button>
          </div>
        )}
      </nav>

      {/* Định tuyến */}
      <Routes>
        {/* Trang chủ */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              userRole === "admin" ? (
                <Home
                  isLoggedIn={isLoggedIn}
                  userRole={userRole}
                  fetchUsers={fetchUsers}
                  users={users}
                  showToast={showToast}
                />
              ) : (
                <Forbidden />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Trang đăng nhập */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={userRole === "admin" ? "/" : "/profile"} replace />
            ) : (
              <Login
                onLoginSuccess={(token, role, profileData) => {
                  localStorage.setItem("token", token);
                  localStorage.setItem("role", role);
                  localStorage.setItem("profile", JSON.stringify(profileData));
                  setIsLoggedIn(true);
                  setUserRole(role);
                  if (role === "admin") {
                    fetchUsers();
                    navigate("/");
                  } else {
                    navigate("/profile");
                  }
                }}
              />
            )
          }
        />

        {/* Trang đăng ký */}
        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to={userRole === "admin" ? "/" : "/profile"} replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* Hồ sơ cá nhân */}
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
        />

        {/* 🆕 Quên mật khẩu */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🆕 Đặt lại mật khẩu */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>

      {/* Toast thông báo */}
      {toast && (
        <div className={`toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ✅ Gói BrowserRouter để App chạy được với react-router-dom
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
