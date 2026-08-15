import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  // =====================================================
  // โหลดข้อมูลการจอง
  // =====================================================
  const loadBookings = async () => {
    try {
      setLoading(true);

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setBookings([]);
        return;
      }

      const user = JSON.parse(savedUser);

      const response = await fetch(
        `http://localhost:5000/api/bookings/my/${user.id}`
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลการจองได้");
      }

      const data = await response.json();

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load bookings error:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // =====================================================
  // กรองสถานะ
  // =====================================================
  const filteredBookings = bookings.filter((booking) => {
    if (!statusFilter) return true;

    return booking.status === statusFilter;
  });

  // =====================================================
  // Status
  // =====================================================
  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          text: "รออนุมัติ",
          className: "pending",
          icon: "◷",
        };

      case "approved":
        return {
          text: "อนุมัติแล้ว",
          className: "approved",
          icon: "✓",
        };

      case "rejected":
        return {
          text: "ไม่อนุมัติ",
          className: "rejected",
          icon: "✕",
        };

      case "cancelled":
        return {
          text: "ยกเลิก",
          className: "cancelled",
          icon: "−",
        };

      default:
        return {
          text: status || "-",
          className: "",
          icon: "•",
        };
    }
  };

  // =====================================================
  // Format Date
  // =====================================================
  const formatDate = (date) => {
    if (!date) return "-";

    const value = String(date).substring(0, 10);

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
      return "-";
    }

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // Format Purpose
  // =====================================================
  const getPurpose = (purpose) => {
    const purposes = {
      meeting: "ประชุม",
      training: "อบรม",
      presentation: "นำเสนอ",
      interview: "สัมภาษณ์",
    };

    return purposes[purpose] || purpose || "-";
  };

  // =====================================================
  // เปลี่ยน Filter
  // =====================================================
  const handleFilter = (status) => {
    if (status === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="my-bookings-page">

        <div className="content-heading">
          <div>
            <h2>การจองของฉัน</h2>
            <p>กำลังโหลดรายการจอง...</p>
          </div>
        </div>

        <div className="booking-loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

      </div>
    );
  }

  // =====================================================
  // จำนวนแต่ละสถานะ
  // =====================================================
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === "approved"
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  // =====================================================
  // Title
  // =====================================================
  const pageTitle =
    statusFilter === "pending"
      ? "รายการรออนุมัติ"
      : statusFilter === "approved"
      ? "รายการที่อนุมัติแล้ว"
      : statusFilter === "rejected"
      ? "รายการที่ไม่อนุมัติ"
      : statusFilter === "cancelled"
      ? "รายการที่ยกเลิก"
      : "การจองของฉัน";

  const pageDescription =
    statusFilter === "pending"
      ? "ตรวจสอบรายการจองที่กำลังรอการอนุมัติ"
      : "ตรวจสอบรายการจองและสถานะการอนุมัติ";

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="my-bookings-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="content-heading">

        <div>
          <h2>{pageTitle}</h2>

          <p>
            {pageDescription}
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadBookings}
        >
          ↻ รีเฟรช
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}
      <div className="booking-summary">

        <div
          className={`booking-summary-card ${
            !statusFilter ? "active" : ""
          }`}
          onClick={() => handleFilter("all")}
        >
          <div className="summary-icon blue">
            ▤
          </div>

          <div>
            <span>ทั้งหมด</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>


        <div
          className={`booking-summary-card ${
            statusFilter === "pending" ? "active" : ""
          }`}
          onClick={() => handleFilter("pending")}
        >
          <div className="summary-icon orange">
            ◷
          </div>

          <div>
            <span>รออนุมัติ</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>


        <div
          className={`booking-summary-card ${
            statusFilter === "approved" ? "active" : ""
          }`}
          onClick={() => handleFilter("approved")}
        >
          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>อนุมัติแล้ว</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>


        <div
          className={`booking-summary-card ${
            statusFilter === "rejected" ? "active" : ""
          }`}
          onClick={() => handleFilter("rejected")}
        >
          <div className="summary-icon red">
            ✕
          </div>

          <div>
            <span>ไม่อนุมัติ</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>


      {/* =================================================
          FILTER
      ================================================= */}
      <div className="booking-filter">

        <button
          type="button"
          className={!statusFilter ? "active" : ""}
          onClick={() => handleFilter("all")}
        >
          ทั้งหมด
          <span>{bookings.length}</span>
        </button>

        <button
          type="button"
          className={
            statusFilter === "pending"
              ? "active pending-filter"
              : ""
          }
          onClick={() => handleFilter("pending")}
        >
          รออนุมัติ
          <span>{pendingCount}</span>
        </button>

        <button
          type="button"
          className={
            statusFilter === "approved"
              ? "active approved-filter"
              : ""
          }
          onClick={() => handleFilter("approved")}
        >
          อนุมัติแล้ว
          <span>{approvedCount}</span>
        </button>

        <button
          type="button"
          className={
            statusFilter === "rejected"
              ? "active rejected-filter"
              : ""
          }
          onClick={() => handleFilter("rejected")}
        >
          ไม่อนุมัติ
          <span>{rejectedCount}</span>
        </button>

        <button
          type="button"
          className={
            statusFilter === "cancelled"
              ? "active cancelled-filter"
              : ""
          }
          onClick={() => handleFilter("cancelled")}
        >
          ยกเลิก
          <span>{cancelledCount}</span>
        </button>

      </div>


      {/* =================================================
          COUNT
      ================================================= */}
      <div className="booking-result-header">

        <strong>
          รายการจอง
        </strong>

        <span>
          พบ {filteredBookings.length} รายการ
        </span>

      </div>


      {/* =================================================
          EMPTY
      ================================================= */}
      {filteredBookings.length === 0 ? (

        <div className="rooms-empty booking-empty">

          <div className="empty-icon">
            ▤
          </div>

          <h3>
            {statusFilter
              ? "ไม่พบรายการจอง"
              : "ยังไม่มีรายการจอง"}
          </h3>

          <p>
            {statusFilter
              ? "ไม่มีรายการจองในสถานะนี้"
              : "คุณยังไม่มีรายการจองห้องประชุม"}
          </p>

        </div>

      ) : (

        /* =================================================
           BOOKING LIST
        ================================================= */
        <div className="booking-list">

          {filteredBookings.map((booking) => {

            const status = getStatus(
              booking.status
            );

            const startDate = String(
              booking.start_date || ""
            ).substring(0, 10);

            const endDate = String(
              booking.end_date || ""
            ).substring(0, 10);

            const isMultiDay =
              startDate &&
              endDate &&
              startDate !== endDate;

            return (

              <div
                className="booking-card"
                key={booking.id}
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}
                <div className="booking-card-header">

                  <div className="booking-title-area">

                    <div className="booking-number">
                      #{booking.id}
                    </div>

                    <div>

                      <h3>
                        {booking.title || "ไม่มีหัวข้อ"}
                      </h3>

                      <span className="booking-room">
                        {booking.room_code || "-"}
                        {" · "}
                        {booking.room_name || "-"}
                      </span>

                    </div>

                  </div>


                  <span
                    className={`booking-status ${status.className}`}
                  >
                    <span>
                      {status.icon}
                    </span>

                    {status.text}
                  </span>

                </div>


                {/* =================================================
                    INFO
                ================================================= */}
                <div className="booking-card-info">


                  {/* ผู้จอง */}
                  <div className="booking-info-item">

                    <small>
                      ผู้จอง
                    </small>

                    <strong>
                      {booking.booking_name || "-"}
                    </strong>

                  </div>


                  {/* วันที่ */}
                  <div className="booking-info-item">

                    <small>
                      วันที่
                    </small>

                    <strong>

                      {formatDate(
                        booking.start_date
                      )}

                      {isMultiDay &&
                        ` - ${formatDate(
                          booking.end_date
                        )}`}

                    </strong>

                  </div>


                  {/* เวลา */}
                  <div className="booking-info-item">

                    <small>
                      เวลา
                    </small>

                    <strong>

                      {booking.start_time
                        ? booking.start_time.slice(0, 5)
                        : "-"}

                      {" - "}

                      {booking.end_time
                        ? booking.end_time.slice(0, 5)
                        : "-"}

                    </strong>

                  </div>


                  {/* ผู้เข้าร่วม */}
                  <div className="booking-info-item">

                    <small>
                      ผู้เข้าร่วม
                    </small>

                    <strong>

                      {booking.participants ?? 0}
                      {" คน"}

                    </strong>

                  </div>


                  {/* วัตถุประสงค์ */}
                  <div className="booking-info-item">

                    <small>
                      วัตถุประสงค์
                    </small>

                    <strong>
                      {getPurpose(
                        booking.purpose
                      )}
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    EXTRA
                ================================================= */}
                {(booking.equipment ||
                  booking.note) && (

                  <div className="booking-extra-wrapper">

                    {booking.equipment && (
                      <div className="booking-extra">

                        <strong>
                          อุปกรณ์
                        </strong>

                        <span>
                          {booking.equipment}
                        </span>

                      </div>
                    )}


                    {booking.note && (
                      <div className="booking-extra">

                        <strong>
                          หมายเหตุ
                        </strong>

                        <span>
                          {booking.note}
                        </span>

                      </div>
                    )}

                  </div>

                )}


                {/* =================================================
                    FOOTER
                ================================================= */}
                <div className="booking-card-footer">

                  <span>
                    สร้างรายการเมื่อ{" "}
                    {booking.created_at
                      ? new Date(
                          booking.created_at
                        ).toLocaleDateString(
                          "th-TH"
                        )
                      : "-"}

                  </span>

                  <span>
                    Booking #{booking.id}
                  </span>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default MyBookings;