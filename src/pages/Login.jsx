import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Username หรือ Password ไม่ถูกต้อง"
        );
        return;
      }

      console.log("LOGIN DATA:", data);
      console.log("LOGIN USER:", data.user);

      // เก็บข้อมูล User
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // แจ้ง Sidebar / Component อื่นว่ามีการเปลี่ยน User
      window.dispatchEvent(
        new Event("userChanged")
      );

      console.log(
        "SAVED USER:",
        localStorage.getItem("user")
      );

      // เข้า Dashboard
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบ Backend"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-background-circle circle-one"></div>
      <div className="login-background-circle circle-two"></div>

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            ▣
          </div>

          <div>
            <div className="login-logo-title">
              E-Booking
            </div>

            <div className="login-logo-subtitle">
              ระบบจองห้องประชุม
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h2>
            ยินดีต้อนรับ
          </h2>

          <p>
            เข้าสู่ระบบเพื่อใช้งานระบบจองห้องประชุม
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* Username */}
          <div className="form-group">

            <label>
              Username
            </label>

            <div className="login-input-wrapper">

              <span className="input-icon">
                
              </span>

              <input
                type="text"
                name="username"
                placeholder="กรอก Username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
              />

            </div>

          </div>

          {/* Password */}
          <div className="form-group">

            <label>
              Password
            </label>

            <div className="login-input-wrapper">

              <span className="input-icon">
                
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="กรอก Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                disabled={loading}
              >
                {showPassword ? "ซ่อน" : "แสดง"}
              </button>

            </div>

          </div>

          {/* Login button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <span>→</span>
              </>
            )}

          </button>

        </form>

        {/* Footer */}
        <div className="login-footer">
          E-Booking System
          <br />
          Version 1.0.0
        </div>

      </div>
    </div>
  );
}

export default Login;