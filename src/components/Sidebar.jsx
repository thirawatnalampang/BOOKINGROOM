import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [user, setUser] = useState(null);

  // =========================================
  // โหลด User
  // =========================================
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

    // โหลดครั้งแรก
    loadUser();

    // ฟัง event ตอน localStorage เปลี่ยน
    window.addEventListener("storage", loadUser);

    // event สำหรับการเปลี่ยน user ภายใน tab เดียวกัน
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  const isAdmin = user?.role === "admin";

  console.log("SIDEBAR USER:", user);
  console.log("IS ADMIN:", isAdmin);

  // =========================================
  // USER MENU
  // =========================================
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

  // =========================================
  // ADMIN MENU
  // =========================================
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
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">
        <div>
          <div className="logo-title">
            E-Booking
          </div>

          <div className="logo-subtitle">
            ระบบจองห้องประชุม
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">

        {menuItems.map((item) => (
          <NavLink
            key={`${item.path}-${item.label}`}
            to={item.path}
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="menu-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* SETTINGS */}
        <div className="menu-group">

          <button
            type="button"
            className="menu-item"
          >
            <span className="menu-icon">
              ⚙
            </span>

            <span>
              การตั้งค่า
            </span>

            <span className="arrow">
              ⌄
            </span>
          </button>

        </div>

      </nav>

      {/* BOTTOM */}
      <div className="sidebar-bottom">

        <div className="system-version">
          E-Booking System
          <br />
          Version 1.0.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;