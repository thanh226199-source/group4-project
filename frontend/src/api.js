// src/api.js
import axios from "axios";

// ✅ Tạo instance axios chung cho toàn dự án
export const api = axios.create({
  baseURL: "http://localhost:5000/api", // ⚙️ đảm bảo backend đang chạy ở http://localhost:5000
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: tự động thêm token Authorization cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Không có token → không gắn header
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor: xử lý lỗi trả về từ server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn("⚠️ Token hết hạn hoặc không hợp lệ, cần đăng nhập lại.");
      // Xóa token cũ
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("profile");

      // ⚙️ Điều hướng người dùng trở lại trang login
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);
