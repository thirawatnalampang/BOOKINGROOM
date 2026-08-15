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

  // รองรับทั้ง user_id และ id
  const currentUserId =
    currentUser?.user_id ??
    currentUser?.id ??
    null;

  // =====================================================
  // โหลดข้อมูล Dashboard
  //
  // IMPORTANT:
  // ดึง bookings ทั้งหมด เพราะ Dashboard
  // "การจองวันนี้" ต้องเห็นเหมือนกันทุกคน
  // =====================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          roomsResponse,
          bookingsResponse,
        ] = await Promise.all([
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
  //
  // ทุกคนเห็นเหมือนกัน
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

      return (
        formattedDate === todayString
      );
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
  // ห้องว่างวันนี้
  // =====================================================
  const totalRooms = rooms.length;

  const bookedRoomIds = [
    ...new Set(
      todayBookings
        .filter(
          (booking) =>
            booking.status ===
              "approved" ||
            booking.status ===
              "pending"
        )
        .map(
          (booking) =>
            booking.room_id
        )
    ),
  ];

  const availableRooms = Math.max(
    totalRooms -
      bookedRoomIds.length,
    0
  );

  // =====================================================
  // PENDING ทั้งระบบ
  //
  // ใช้กับ:
  // Dashboard > Statistics > รออนุมัติ
  //
  // ทุก User เห็นเหมือนกัน
  // =====================================================
  const allPendingBookings =
    bookings.filter(
      (booking) =>
        booking.status === "pending"
    );

  // =====================================================
  // PENDING ของ User ปัจจุบัน
  //
  // ใช้กับ:
  // Dashboard > เมนูด่วน > รออนุมัติ
  //
  // USER
  // -> เห็นเฉพาะของตัวเอง
  //
  // ADMIN
  // -> เห็นทั้งหมด
  // =====================================================
  const myPendingBookings =
    bookings.filter(
      (booking) => {
        // ต้องเป็น pending ก่อน
        if (
          booking.status !==
          "pending"
        ) {
          return false;
        }

        // Admin เห็นทั้งหมด
        if (isAdmin) {
          return true;
        }

        // User เห็นเฉพาะของตัวเอง
        return (
          String(
            booking.user_id
          ) ===
          String(
            currentUserId
          )
        );
      }
    );

  // =====================================================
  // Statistics
  //
  // สำคัญ:
  // รออนุมัติ = ALL pending
  // ไม่ใช่ pending ของ User
  // =====================================================
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
      value:
        allPendingBookings.length,
      detail: "รายการ",
      icon: "◷",
      className: "orange",
    },

    {
      title: "การจองวันนี้",
      value:
        todayBookings.length,
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
            กำลังดึงข้อมูลห้องประชุม
            และรายการจอง...
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
          ทุกคนเห็นเหมือนกัน
      ================================================= */}
      <div className="statistics">

        {statistics.map(
          (item) => (

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

          )
        )}

      </div>


      {/* =================================================
          DASHBOARD GRID
      ================================================= */}
      <div className="dashboard-grid">


        {/* =================================================
            TODAY BOOKINGS
            ทุกคนเห็นเหมือนกัน
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
                    weekday:
                      "long",

                    day:
                      "numeric",

                    month:
                      "long",

                    year:
                      "numeric",
                  }
                )}
              </p>

            </div>


            {/* ดูทั้งหมด */}
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
              ทุกคนเห็นเหมือนกัน
          ================================================= */}
          <div className="booking-summary">

            <div>

              <span>
                ทั้งหมดวันนี้
              </span>

              <strong>
                {
                  todayBookings.length
                }
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
              ทุกคนเห็นเหมือนกัน
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

                {todayBookings.length ===
                0 ? (

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
                                {
                                  booking.room_name ||
                                  `ห้องประชุม ${booking.room_id}`
                                }
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

                            {
                              booking.title ||
                              "-"
                            }

                          </td>


                          {/* ผู้จอง */}
                          <td>

                            {
                              booking.booking_name ||
                              "-"
                            }

                          </td>


                          {/* เวลา */}
                          <td>

                            <span className="booking-time">

                              {
                                booking.start_time
                                  ? booking.start_time.substring(
                                      0,
                                      5
                                    )
                                  : "-"
                              }

                              {" - "}

                              {
                                booking.end_time
                                  ? booking.end_time.substring(
                                      0,
                                      5
                                    )
                                  : "-"
                              }

                            </span>

                          </td>


                          {/* สถานะ */}
                          <td>

                            <span
                              className={`status ${booking.status}`}
                            >

                              <span></span>

                              {
                                getStatusText(
                                  booking.status
                                )
                              }

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
                สำคัญที่สุด
                USER = ของตัวเอง
                ADMIN = ของทุกคน
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

              {/* =============================================
                  จำนวน Pending ของคนนี้

                  User:
                  -> myPendingBookings

                  Admin:
                  -> pending ทั้งระบบ
              ============================================= */}
              <span className="quick-count">
                {
                  myPendingBookings.length
                }
              </span>

              <span className="quick-arrow">
                →
              </span>

            </button>


            {/* =================================================
                USER -> รายการจองของฉัน
                ADMIN -> จัดการรายการจอง
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