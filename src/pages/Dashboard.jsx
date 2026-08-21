import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // USER / ROLE
  // =====================================================
  const savedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("ไม่สามารถอ่านข้อมูล User:", error);
  }

  const isAdmin = currentUser?.role === "admin";

  const currentUserId =
    currentUser?.user_id ??
    currentUser?.id ??
    null;

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [roomsResponse, bookingsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/rooms"),
            fetch("http://localhost:5000/api/bookings"),
          ]);

        if (!roomsResponse.ok) {
          throw new Error(
            "ไม่สามารถดึงข้อมูลห้องประชุมได้"
          );
        }

        if (!bookingsResponse.ok) {
          throw new Error(
            "ไม่สามารถดึงข้อมูลการจองได้"
          );
        }

        const roomsData = await roomsResponse.json();
        const bookingsData = await bookingsResponse.json();

        setRooms(
          Array.isArray(roomsData)
            ? roomsData
            : []
        );

        setBookings(
          Array.isArray(bookingsData)
            ? bookingsData
            : []
        );
      } catch (error) {
        console.error("Dashboard error:", error);

        setRooms([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // TODAY - THAILAND
  // =====================================================
  const today = new Date();

  const todayString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);

  // =====================================================
  // TODAY BOOKINGS
  // =====================================================
  const todayBookings = bookings
    .filter((booking) => {
      if (!booking.start_date) {
        return false;
      }

      const bookingDate = new Date(
        booking.start_date
      );

      const formattedDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(bookingDate);

      return formattedDate === todayString;
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || 0
      ).getTime();

      const dateB = new Date(
        b.created_at || 0
      ).getTime();

      return dateB - dateA;
    });

  // =====================================================
  // ROOMS
  // =====================================================
  const totalRooms = rooms.length;

  const bookedRoomIds = [
    ...new Set(
      todayBookings
        .filter(
          (booking) =>
            booking.status === "approved" ||
            booking.status === "pending"
        )
        .map((booking) => booking.room_id)
    ),
  ];

  const availableRooms = Math.max(
    totalRooms - bookedRoomIds.length,
    0
  );

  // =====================================================
  // ALL PENDING
  // =====================================================
  const allPendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  // =====================================================
  // CURRENT USER PENDING
  // =====================================================
  const myPendingBookings = bookings.filter(
    (booking) => {
      if (booking.status !== "pending") {
        return false;
      }

      if (isAdmin) {
        return true;
      }

      return (
        String(booking.user_id) ===
        String(currentUserId)
      );
    }
  );

  // =====================================================
  // STATISTICS
  // =====================================================
  const statistics = [
    {
      title: "ห้องประชุมทั้งหมด",
      value: totalRooms,
      detail: "ห้อง",
      icon: "▣",
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    {
      title: "ห้องว่างวันนี้",
      value: availableRooms,
      detail: "ห้อง",
      icon: "✓",
      iconClass:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    },
    {
      title: "รออนุมัติ",
      value: allPendingBookings.length,
      detail: "รายการ",
      icon: "◷",
      iconClass:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
    },
    {
      title: "การจองวันนี้",
      value: todayBookings.length,
      detail: "รายการ",
      icon: "▤",
      iconClass:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    },
  ];

  // =====================================================
  // STATUS TEXT
  // =====================================================
  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "อนุมัติแล้ว";

      case "pending":
        return "รออนุมัติ";

      case "rejected":
        return "ไม่อนุมัติ";

      case "cancelled":
        return "ยกเลิก";

      default:
        return status || "-";
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================
  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            กำลังโหลด Dashboard
          </h3>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            กำลังดึงข้อมูลห้องประชุมและรายการจอง...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            แดชบอร์ด
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ภาพรวมระบบจองห้องประชุม
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        >
          <span className="text-lg leading-none">
            ＋
          </span>

          จองห้องประชุม
        </button>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statistics.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-semibold ${item.iconClass}`}
            >
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.title}
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </strong>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.detail}
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">

        {/* =================================================
            TODAY BOOKINGS
        ================================================= */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* HEADER */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                การจองวันนี้
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {today.toLocaleDateString(
                  "th-TH",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings"
                    : "/my-bookings"
                )
              }
              className="self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ดูทั้งหมด →
            </button>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 dark:divide-gray-800 dark:border-gray-800">

            <div className="px-4 py-4 text-center">
              <span className="block text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                ทั้งหมดวันนี้
              </span>

              <strong className="mt-1 block text-xl font-bold text-gray-900 dark:text-white">
                {todayBookings.length}
              </strong>
            </div>

            <div className="px-4 py-4 text-center">
              <span className="block text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                อนุมัติแล้ว
              </span>

              <strong className="mt-1 block text-xl font-bold text-green-600 dark:text-green-400">
                {
                  todayBookings.filter(
                    (item) =>
                      item.status === "approved"
                  ).length
                }
              </strong>
            </div>

            <div className="px-4 py-4 text-center">
              <span className="block text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                รออนุมัติ
              </span>

              <strong className="mt-1 block text-xl font-bold text-orange-600 dark:text-orange-400">
                {
                  todayBookings.filter(
                    (item) =>
                      item.status === "pending"
                  ).length
                }
              </strong>
            </div>

          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[720px] text-left">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ห้องประชุม
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    หัวข้อ
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ผู้จอง
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    เวลา
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    สถานะ
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                {todayBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-16"
                    >
                      <div className="flex flex-col items-center justify-center text-center">

                        <span className="mb-3 text-4xl text-gray-300 dark:text-gray-600">
                          ▤
                        </span>

                        <strong className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          วันนี้ยังไม่มีรายการจอง
                        </strong>

                        <small className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          ยังไม่มีการจองห้องประชุมในวันนี้
                        </small>

                      </div>
                    </td>
                  </tr>
                ) : (
                  todayBookings
                    .slice(0, 5)
                    .map((booking, index) => (
                      <tr
                        key={
                          booking.id || index
                        }
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >

                        {/* ROOM */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <strong className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {booking.room_name ||
                                `ห้องประชุม ${booking.room_id}`}
                            </strong>

                            {booking.room_code && (
                              <small className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                {booking.room_code}
                              </small>
                            )}
                          </div>
                        </td>

                        {/* TITLE */}
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {booking.title || "-"}
                        </td>

                        {/* BOOKER */}
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {booking.booking_name || "-"}
                        </td>

                        {/* TIME */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                            {booking.start_time
                              ? booking.start_time.substring(
                                  0,
                                  5
                                )
                              : "-"}{" "}
                            -{" "}
                            {booking.end_time
                              ? booking.end_time.substring(
                                  0,
                                  5
                                )
                              : "-"}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {getStatusText(
                              booking.status
                            )}
                          </span>
                        </td>

                      </tr>
                    ))
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* =================================================
            QUICK MENU
        ================================================= */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* HEADER */}
          <div className="border-b border-gray-100 p-5 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              เมนูด่วน
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ทางลัดสำหรับการใช้งานระบบ
            </p>
          </div>

          {/* MENU */}
          <div className="space-y-2 p-4">

            {/* VIEW ROOMS */}
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                ▣
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  ดูห้องประชุม
                </strong>

                <small className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  ตรวจสอบห้องและสถานะ
                </small>
              </span>

              <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                →
              </span>
            </button>

            {/* BOOK ROOM */}
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl text-green-600 dark:bg-green-900/40 dark:text-green-400">
                ＋
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  จองห้องประชุม
                </strong>

                <small className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  สร้างรายการจองใหม่
                </small>
              </span>

              <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600 dark:group-hover:text-green-400">
                →
              </span>
            </button>

            {/* PENDING */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings?status=pending"
                    : "/my-bookings?status=pending"
                )
              }
              className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xl text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                ◷
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  รออนุมัติ
                </strong>

                <small className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {isAdmin
                    ? "ตรวจสอบรายการจองที่รออนุมัติ"
                    : "ดูรายการจองที่รออนุมัติ"}
                </small>
              </span>

              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                {myPendingBookings.length}
              </span>

              <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                →
              </span>
            </button>

            {/* MY BOOKINGS / ADMIN BOOKINGS */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings"
                    : "/my-bookings"
                )
              }
              className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                ▦
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {isAdmin
                    ? "จัดการรายการจอง"
                    : "รายการจองของฉัน"}
                </strong>

                <small className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {isAdmin
                    ? "ตรวจสอบและจัดการรายการจองทั้งหมด"
                    : "ตรวจสอบรายการจองของฉัน"}
                </small>
              </span>

              <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                →
              </span>
            </button>

          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;