import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Username หรือ Password ไม่ถูกต้อง"
        );
        return;
      }

      console.log("LOGIN DATA:", data);
      console.log("LOGIN USER:", data.user);

      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // แจ้ง Component อื่นว่าข้อมูล User เปลี่ยน
      window.dispatchEvent(
        new Event("userChanged")
      );

      console.log(
        "SAVED USER:",
        localStorage.getItem("user")
      );

      // =================================================
      // REDIRECT
      // =================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-8">

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-green-200/40 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 blur-3xl" />

      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="relative z-10 w-full max-w-md">

        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 shadow-2xl shadow-emerald-900/10 backdrop-blur">

          {/* =================================================
              CARD CONTENT
          ================================================= */}

          <div className="px-6 py-8 sm:px-9 sm:py-10">

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/20">
                ▣
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  E-Booking
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  ระบบจองห้องประชุม
                </p>
              </div>

            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-7">

              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                ยินดีต้อนรับ
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                เข้าสู่ระบบเพื่อใช้งานระบบจองห้องประชุม
              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                  !
                </span>

                <span className="leading-5">
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* =================================================
                  USERNAME
              ================================================= */}

              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Username
                </label>

                <div className="relative">

                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                      />
                    </svg>
                  </div>

                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="กรอก Username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>
              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <div className="relative">

                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="10"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />
                    </svg>
                  </div>

                  <input
                    id="password"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-gray-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword
                      ? "ซ่อน"
                      : "แสดง"}
                  </button>

                </div>
              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ

                    <span className="text-lg transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-8 border-t border-gray-100 pt-5 text-center text-xs leading-5 text-gray-400">
              <p>E-Booking System</p>
              <p>Version 1.0.0</p>
            </div>

          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-5 text-center text-xs text-gray-400">
          Meeting Room Booking System
        </p>

      </div>
    </div>
  );
}

export default Login;