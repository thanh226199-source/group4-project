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
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import Forbidden from "./components/Forbidden";
import "./App.css";

function Home({ isLoggedIn, fetchUsers, users, showToast }) {
  return (
    <>
      {isLoggedIn ? (
        <>
          <h1 className="h1">👥 Quản lý người dùng</h1>
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
        <div className="home-wrapper">
          <div className="home-card">
            <div className="home-icon">🔒</div>
            <h2 className="home-title">
              Bạn cần đăng nhập để xem danh sách người dùng
            </h2>
            <p className="home-subtitle">
              Vui lòng đăng nhập để truy cập hệ thống quản lý.
            </p>
            <Link to="/login" className="home-button">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
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

      if (role === "admin") {
        fetchUsers();
      }
    }
  }, []);

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

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUsers([]);
    showToast("Đã đăng xuất!");
    navigate("/login");
  };

  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  return (
    <div className="container">
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
              {userRole === "admin" ? "Admin" : "User"})
            </span>
            <button onClick={handleLogout} className="btn btn-ghost">
              🔓 Đăng xuất
            </button>
          </div>
        )}
      </nav>

      <Routes>
        {/* Trang chủ: chỉ Admin mới xem được danh sách user */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              userRole === "admin" ? (
                <Home
                  isLoggedIn={isLoggedIn}
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
              <Navigate
                to={userRole === "admin" ? "/" : "/profile"}
                replace
              />
            ) : (
              <Login
                onLoginSuccess={(token, role) => {
                  localStorage.setItem("token", token);
                  localStorage.setItem("role", role);
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
              <Navigate
                to={userRole === "admin" ? "/" : "/profile"}
                replace
              />
            ) : (
              <Signup />
            )
          }
        />

        {/* Trang hồ sơ cá nhân */}
        <Route
          path="/profile"
          element={
            isLoggedIn ? <Profile /> : <Navigate to="/login" replace />
          }
        />
      </Routes>

      {toast && (
        <div className={`toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
