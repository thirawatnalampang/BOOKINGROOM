import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // =========================
  // User
  // =========================
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Invalid user:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

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

  // =========================
  // Apply Dark Mode
  // =========================
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // =========================
  // Language
  // =========================
  const toggleLanguage = () => {
    const newLanguage =
      language === "TH" ? "EN" : "TH";

    setLanguage(newLanguage);
    localStorage.setItem(
      "language",
      newLanguage
    );
  };

  // =========================
  // Dark Mode
  // =========================
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("userChanged")
    );

    navigate("/login");
  };

  return (
    <header
      className="
        fixed left-[250px] right-0 top-0 z-30
        flex h-[82px]
        items-center justify-between
        border-b border-slate-200
        bg-white px-6
        shadow-sm
        transition-colors duration-300

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* LEFT */}
      <div>
        <h1
          className="
            text-xl font-bold
            text-slate-800

            dark:text-white
          "
        >
          E-Booking
        </h1>

        <span
          className="
            text-xs
            text-slate-500

            dark:text-slate-400
          "
        >
          {language === "TH"
            ? "ระบบจองห้องประชุม"
            : "Meeting Room Booking System"}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Language */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={
            language === "TH"
              ? "เปลี่ยนเป็นภาษาอังกฤษ"
              : "Switch to Thai"
          }
          className="
            flex items-center gap-1
            rounded-lg
            border border-slate-200
            bg-white px-3 py-2
            text-sm font-medium
            text-slate-600
            transition
            hover:bg-slate-100

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-300
            dark:hover:bg-slate-700
          "
        >
          {language}

          <span className="text-xs">
            ⌄
          </span>
        </button>

        {/* Dark Mode */}
        <button
          type="button"
          onClick={toggleDarkMode}
          title={
            darkMode
              ? "เปลี่ยนเป็นธีมสว่าง"
              : "เปลี่ยนเป็นธีมมืด"
          }
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            border border-slate-200
            bg-white
            text-lg
            text-slate-600
            transition
            hover:bg-slate-100

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-yellow-400
            dark:hover:bg-slate-700
          "
        >
          {darkMode ? "☀" : "☾"}
        </button>

        {/* USER */}
        {user ? (
          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-slate-200
              bg-white px-3 py-2

              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            {/* Avatar */}
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                bg-blue-100
                text-lg

                dark:bg-blue-900/40
              "
            >
              👤
            </div>

            {/* Info */}
            <div className="hidden min-w-0 sm:block">
              <strong
                className="
                  block max-w-[160px]
                  truncate
                  text-sm font-semibold
                  text-slate-800

                  dark:text-white
                "
              >
                {user.full_name ||
                  user.username ||
                  "ผู้ใช้งาน"}
              </strong>

              <span
                className="
                  block text-xs
                  text-slate-500

                  dark:text-slate-400
                "
              >
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
              onClick={handleLogout}
              title={
                language === "TH"
                  ? "ออกจากระบบ"
                  : "Logout"
              }
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                text-lg
                text-slate-500
                transition
                hover:bg-red-50
                hover:text-red-600

                dark:text-slate-400
                dark:hover:bg-red-900/20
                dark:hover:text-red-400
              "
            >
              ⇥
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="
              rounded-lg
              bg-blue-600
              px-4 py-2
              text-sm font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            {language === "TH"
              ? "เข้าสู่ระบบ"
              : "Login"}
          </button>
        )}

        {/* Menu */}
        <button
          type="button"
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            text-xl
            text-slate-600
            transition
            hover:bg-slate-100

            dark:text-slate-300
            dark:hover:bg-slate-800
          "
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Topbar;