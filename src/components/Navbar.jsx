import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      className="
        sticky top-0 z-50
        border-b border-slate-200
        bg-white
        shadow-sm
        transition-colors duration-300

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <div
        className="
          mx-auto flex h-[70px]
          max-w-7xl
          items-center justify-between
          px-6
        "
      >
        {/* LOGO */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            text-xl font-bold
            tracking-tight
            text-slate-800
            transition
            hover:opacity-80

            dark:text-white
          "
        >
          MEETING
          <span className="text-blue-600 dark:text-blue-400">
            ROOM
          </span>
        </button>

        {/* MENU */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              rounded-lg
              px-4 py-2
              text-sm font-medium
              text-slate-600
              transition
              hover:bg-slate-100
              hover:text-blue-600

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-blue-400
            "
          >
            หน้าหลัก
          </button>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
            className="
              rounded-lg
              px-4 py-2
              text-sm font-medium
              text-slate-600
              transition
              hover:bg-slate-100
              hover:text-blue-600

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-blue-400
            "
          >
            ห้องประชุม
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
            className="
              rounded-lg
              px-4 py-2
              text-sm font-medium
              text-slate-600
              transition
              hover:bg-slate-100
              hover:text-blue-600

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-blue-400
            "
          >
            การจองของฉัน
          </button>

          {/* LOGIN */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              ml-2
              rounded-lg
              bg-blue-600
              px-5 py-2.5
              text-sm font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              hover:shadow-md
              active:scale-95
            "
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;