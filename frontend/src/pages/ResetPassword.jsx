import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { api } from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", { token, password });
      setMessage(res.data.message || "✅ Mật khẩu đã được thay đổi thành công!");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Token không hợp lệ hoặc đã hết hạn."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-[400px] p-8 border border-gray-200">
        <div className="flex justify-center mb-4">
          <Lock className="text-green-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Đặt lại mật khẩu
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Nhập mật khẩu mới để tiếp tục đăng nhập vào tài khoản của bạn.
        </p>
        {token ? (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="🔒 Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium transition ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-600">
            ⚠️ Liên kết đặt lại mật khẩu không hợp lệ.
          </p>
        )}

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
