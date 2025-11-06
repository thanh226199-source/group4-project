import React, { useState } from "react";
import { Mail } from "lucide-react";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "✅ Đã gửi email đặt lại mật khẩu!");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Lỗi khi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-[400px] p-8 border border-gray-200">
        <div className="flex justify-center mb-4">
          <Mail className="text-indigo-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Quên mật khẩu
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="📧 Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium transition ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
        {message && (
          <p
            className={`text-center mt-4 font-medium ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
