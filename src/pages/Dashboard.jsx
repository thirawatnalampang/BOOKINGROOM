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
    currentUser = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error(
      "ไม่สามารถอ่านข้อมูล User:",
      error
    );
  }

  const isAdmin =
    currentUser?.role === "admin";

  // =====================================================
  // โหลดข้อมูล Dashboard
  // =====================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [roomsResponse, bookingsResponse] =
          await Promise.all([
            fetch(
              "http://localhost:5000/api/rooms"
            ),
            fetch(
              "http://localhost:5000/api/bookings"
            ),
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

        const roomsData =
          await roomsResponse.json();

        const bookingsData =
          await bookingsResponse.json();

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
        console.error(
          "Dashboard error:",
          error
        );

        setRooms([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // วันที่ประเทศไทย
  // =====================================================
  const today = new Date();

  const todayString =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(today);

  // =====================================================
  // การจองวันนี้
  // =====================================================
  const todayBookings = bookings.filter(
    (booking) => {
      if (!booking.start_date) {
        return false;
      }

      const bookingDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(
          new Date(booking.start_date)
        );

      return bookingDate === todayString;
    }
  );

  // =====================================================
  // Statistics
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
        .map(
          (booking) => booking.room_id
        )
    ),
  ];

  const availableRooms = Math.max(
    totalRooms -
      bookedRoomIds.length,
    0
  );

  // =====================================================
  // Pending ทั้งหมด
  // =====================================================
  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status === "pending"
    );

  // =====================================================
  // Approved ทั้งหมด
  // =====================================================
  const approvedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "approved"
    );

  const statistics = [
    {
      title: "ห้องประชุมทั้งหมด",
      value: totalRooms,
      detail: "ห้อง",
      icon: "▣",
      className: "blue",
    },
    {
      title: "ห้องว่างวันนี้",
      value: availableRooms,
      detail: "ห้อง",
      icon: "✓",
      className: "green",
    },
    {
      title: "รออนุมัติ",
      value: pendingBookings.length,
      detail: "รายการ",
      icon: "◷",
      className: "orange",
    },
    {
      title: "การจองวันนี้",
      value: todayBookings.length,
      detail: "รายการ",
      icon: "▤",
      className: "purple",
    },
  ];

  // =====================================================
  // Status
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
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="dashboard">

        <div className="dashboard-loading">

          <div className="dashboard-spinner"></div>

          <h3>
            กำลังโหลด Dashboard
          </h3>

          <p>
            กำลังดึงข้อมูลห้องประชุมและรายการจอง...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="dashboard-header">

        <div>

          <h2>
            แดชบอร์ด
          </h2>

          <p>
            ภาพรวมระบบจองห้องประชุม
          </p>

        </div>

        <button
          type="button"
          className="dashboard-book-button"
          onClick={() =>
            navigate("/rooms")
          }
        >

          <span>
            ＋
          </span>

          จองห้องประชุม

        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}
      <div className="statistics">

        {statistics.map((item) => (

          <div
            className="stat-card"
            key={item.title}
          >

            <div
              className={`stat-icon ${item.className}`}
            >
              {item.icon}
            </div>

            <div className="stat-content">

              <span>
                {item.title}
              </span>

              <div className="stat-number">

                <strong>
                  {item.value}
                </strong>

                <small>
                  {item.detail}
                </small>

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* =================================================
          DASHBOARD GRID
      ================================================= */}
      <div className="dashboard-grid">

        {/* =================================================
            TODAY BOOKINGS
        ================================================= */}
        <section className="panel booking-panel">

          <div className="panel-header">

            <div>

              <h3>
                การจองวันนี้
              </h3>

              <p>
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


            {/* =================================================
                ดูทั้งหมด ตาม Role
            ================================================= */}
            <button
              type="button"
              className="link-button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings"
                    : "/my-bookings"
                )
              }
            >

              ดูทั้งหมด →

            </button>

          </div>


          {/* =================================================
              TODAY SUMMARY
          ================================================= */}
          <div className="booking-summary">

            <div>

              <span>
                ทั้งหมดวันนี้
              </span>

              <strong>
                {todayBookings.length}
              </strong>

            </div>


            <div>

              <span>
                อนุมัติแล้ว
              </span>

              <strong>
                {
                  todayBookings.filter(
                    (item) =>
                      item.status ===
                      "approved"
                  ).length
                }
              </strong>

            </div>


            <div>

              <span>
                รออนุมัติ
              </span>

              <strong>
                {
                  todayBookings.filter(
                    (item) =>
                      item.status ===
                      "pending"
                  ).length
                }
              </strong>

            </div>

          </div>


          {/* =================================================
              BOOKING TABLE
          ================================================= */}
          <div className="booking-table-wrapper">

            <table className="booking-table">

              <thead>

                <tr>

                  <th>
                    ห้องประชุม
                  </th>

                  <th>
                    หัวข้อ
                  </th>

                  <th>
                    ผู้จอง
                  </th>

                  <th>
                    เวลา
                  </th>

                  <th>
                    สถานะ
                  </th>

                </tr>

              </thead>


              <tbody>

                {todayBookings.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="empty-table"
                    >

                      <div>

                        <span>
                          ▤
                        </span>

                        <strong>
                          วันนี้ยังไม่มีรายการจอง
                        </strong>

                        <small>
                          ยังไม่มีการจองห้องประชุมในวันนี้
                        </small>

                      </div>

                    </td>

                  </tr>

                ) : (

                  todayBookings
                    .slice(0, 5)
                    .map(
                      (
                        booking,
                        index
                      ) => (

                        <tr
                          key={
                            booking.id ||
                            index
                          }
                        >

                          {/* ห้อง */}
                          <td>

                            <div className="table-room">

                              <strong>
                                {booking.room_name ||
                                  `ห้องประชุม ${booking.room_id}`}
                              </strong>

                              {booking.room_code && (
                                <small>
                                  {
                                    booking.room_code
                                  }
                                </small>
                              )}

                            </div>

                          </td>


                          {/* หัวข้อ */}
                          <td>

                            {booking.title ||
                              "-"}

                          </td>


                          {/* ผู้จอง */}
                          <td>

                            {booking.booking_name ||
                              "-"}

                          </td>


                          {/* เวลา */}
                          <td>

                            <span className="booking-time">

                              {booking.start_time
                                ? booking.start_time.substring(
                                    0,
                                    5
                                  )
                                : "-"}

                              {" - "}

                              {booking.end_time
                                ? booking.end_time.substring(
                                    0,
                                    5
                                  )
                                : "-"}

                            </span>

                          </td>


                          {/* สถานะ */}
                          <td>

                            <span
                              className={`status ${booking.status}`}
                            >

                              <span></span>

                              {getStatusText(
                                booking.status
                              )}

                            </span>

                          </td>

                        </tr>

                      )
                    )

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================================
            QUICK MENU
        ================================================= */}
        <section className="panel quick-panel">

          <div className="panel-header">

            <div>

              <h3>
                เมนูด่วน
              </h3>

              <p>
                ทางลัดสำหรับการใช้งานระบบ
              </p>

            </div>

          </div>


          <div className="quick-menu">


            {/* =================================================
                ดูห้อง
            ================================================= */}
            <button
              type="button"
              onClick={() =>
                navigate("/rooms")
              }
            >

              <span className="quick-icon blue">
                ▣
              </span>

              <div>

                <strong>
                  ดูห้องประชุม
                </strong>

                <small>
                  ตรวจสอบห้องและสถานะ
                </small>

              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>


            {/* =================================================
                จองห้อง
            ================================================= */}
            <button
              type="button"
              onClick={() =>
                navigate("/rooms")
              }
            >

              <span className="quick-icon green">
                ＋
              </span>

              <div>

                <strong>
                  จองห้องประชุม
                </strong>

                <small>
                  สร้างรายการจองใหม่
                </small>

              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>


            {/* =================================================
                รออนุมัติ
            ================================================= */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings?status=pending"
                    : "/my-bookings?status=pending"
                )
              }
            >

              <span className="quick-icon orange">
                ◷
              </span>

              <div>

                <strong>
                  รออนุมัติ
                </strong>

                <small>
                  {isAdmin
                    ? "ตรวจสอบรายการจองที่รออนุมัติ"
                    : "ดูรายการจองที่รออนุมัติ"}
                </small>

              </div>

              <span className="quick-count">
                {pendingBookings.length}
              </span>

              <span className="quick-arrow">
                →
              </span>

            </button>


            {/* =================================================
                USER → รายการจองของฉัน
                ADMIN → จัดการรายการจอง
            ================================================= */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/admin/bookings"
                    : "/my-bookings"
                )
              }
            >

              <span className="quick-icon purple">
                ▦
              </span>

              <div>

                <strong>
                  {isAdmin
                    ? "จัดการรายการจอง"
                    : "รายการจองของฉัน"}
                </strong>

                <small>
                  {isAdmin
                    ? "ตรวจสอบและจัดการรายการจองทั้งหมด"
                    : "ตรวจสอบรายการจองของฉัน"}
                </small>

              </div>

              <span className="quick-arrow">
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