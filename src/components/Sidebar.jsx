import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [user, setUser] = useState(null);

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
        console.error("Invalid user data:", error);
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

  const isAdmin = user?.role === "admin";

  const userMenuItems = [
    {
      path: "/",
      icon: "▦",
      label: "แดชบอร์ด",
    },
    {
      path: "/my-bookings",
      icon: "☷",
      label: "การจองของฉัน",
    },
    {
      path: "/rooms",
      icon: "✎",
      label: "จองห้อง",
    },
    {
      path: "/rooms",
      icon: "▣",
      label: "ห้องทั้งหมด",
    },
  ];

  const adminMenuItems = [
    {
      path: "/",
      icon: "▦",
      label: "แดชบอร์ด",
    },
    {
      path: "/rooms",
      icon: "▣",
      label: "ห้องทั้งหมด",
    },
    {
      path: "/admin/bookings",
      icon: "♙",
      label: "การอนุมัติการจอง",
    },
    {
      path: "/users",
      icon: "♧",
      label: "ผู้ใช้",
    },
  ];

  const menuItems = isAdmin
    ? adminMenuItems
    : userMenuItems;

  return (
    <aside
      className="
        fixed left-0 top-0 z-40
        flex h-screen w-[250px] flex-col
        border-r border-slate-200
        bg-white
        shadow-sm
        transition-colors duration-300

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* LOGO */}
      <div
        className="
          flex h-[82px] items-center
          border-b border-slate-200
          px-6

          dark:border-slate-700
        "
      >
        <div>
          <div
            className="
              text-xl font-bold
              tracking-tight
              text-slate-800

              dark:text-white
            "
          >
            E-Booking
          </div>

          <div
            className="
              mt-1 text-xs
              text-slate-500

              dark:text-slate-400
            "
          >
            ระบบจองห้องประชุม
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={`${item.path}-${item.label}`}
              to={item.path}
              className={({ isActive }) =>
                `
                group flex items-center gap-3
                rounded-xl px-4 py-3
                text-sm font-medium
                transition-all duration-200

                ${
                  isActive
                    ? `
                      bg-blue-600
                      text-white
                      shadow-sm
                    `
                    : `
                      text-slate-600
                      hover:bg-slate-100
                      hover:text-blue-600

                      dark:text-slate-300
                      dark:hover:bg-slate-800
                      dark:hover:text-blue-400
                    `
                }
                `
              }
            >
              <span
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  text-base
                "
              >
                {item.icon}
              </span>

              <span className="flex-1">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* SETTINGS */}
        <div className="mt-4">
          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-xl px-4 py-3
              text-sm font-medium
              text-slate-600
              transition-all duration-200
              hover:bg-slate-100
              hover:text-blue-600

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-blue-400
            "
          >
            <span
              className="
                flex h-8 w-8
                items-center justify-center
                text-base
              "
            >
              ⚙
            </span>

            <span className="flex-1 text-left">
              การตั้งค่า
            </span>

            <span className="text-xs">
              ⌄
            </span>
          </button>
        </div>
      </nav>

      {/* BOTTOM */}
      <div
        className="
          border-t border-slate-200
          px-6 py-5

          dark:border-slate-700
        "
      >
        <div
          className="
            text-xs leading-5
            text-slate-400

            dark:text-slate-500
          "
        >
          E-Booking System
          <br />
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;