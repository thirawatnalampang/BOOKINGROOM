import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  // =========================
  // Language
  // =========================
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "TH"
  );

  // =========================
  // Dark Mode
  // =========================
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // =========================
  // Toggle Language
  // =========================
  const toggleLanguage = () => {
    const newLanguage = language === "TH" ? "EN" : "TH";

    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // =========================
  // Toggle Dark Mode
  // =========================
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <div className="page-title">
          <h1>E-Booking</h1>

          <span>
            {language === "TH"
              ? "ระบบจองห้องประชุม"
              : "Meeting Room Booking System"}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {/* Language */}
        <button
          type="button"
          className="language"
          onClick={toggleLanguage}
          title={
            language === "TH"
              ? "เปลี่ยนเป็นภาษาอังกฤษ"
              : "Switch to Thai"
          }
        >
          {language}
          <span>⌄</span>
        </button>

        {/* Dark Mode */}
        <button
          type="button"
          className="topbar-button theme-button"
          onClick={toggleDarkMode}
          title={
            darkMode
              ? "เปลี่ยนเป็นธีมสว่าง"
              : "เปลี่ยนเป็นธีมมืด"
          }
        >
          {darkMode ? "☀" : "☾"}
        </button>

        {/* USER */}
        {user ? (
          <div className="user-profile">

            {/* Avatar */}
            <div className="user-avatar">
              👤
            </div>

            {/* User info */}
            <div className="user-info">
              <strong>
                {user.full_name ||
                  user.username ||
                  "ผู้ใช้งาน"}
              </strong>

              <span>
                {user.role === "admin"
                  ? language === "TH"
                    ? "ผู้ดูแลระบบ"
                    : "Administrator"
                  : language === "TH"
                    ? "ผู้ใช้งานทั่วไป"
                    : "User"}
              </span>
            </div>

            {/* Logout */}
            <button
              type="button"
              className="user-arrow"
              title={
                language === "TH"
                  ? "ออกจากระบบ"
                  : "Logout"
              }
              onClick={handleLogout}
            >
              ⇥
            </button>

          </div>
        ) : (
          <button
            type="button"
            className="login-button"
            onClick={() => navigate("/login")}
          >
            {language === "TH"
              ? "เข้าสู่ระบบ"
              : "Login"}
          </button>
        )}

        {/* Menu */}
        <button
          type="button"
          className="menu-button"
        >
          ☰
        </button>

      </div>
    </header>
  );
}

export default Topbar;