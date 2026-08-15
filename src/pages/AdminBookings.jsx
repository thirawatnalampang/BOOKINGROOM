import { useEffect, useState } from "react";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");

  // =====================================================
  // โหลดรายการจอง
  // =====================================================
  const loadBookings = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/bookings"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "ไม่สามารถโหลดรายการจองได้"
        );
      }

      setBookings(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load admin bookings error:",
        error
      );

      alert("ไม่สามารถโหลดรายการจองได้");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // =====================================================
  // อัปเดตสถานะ
  // =====================================================
  const updateStatus = async (id, status) => {
    const message =
      status === "approved"
        ? "คุณต้องการอนุมัติรายการจองนี้หรือไม่?"
        : "คุณต้องการไม่อนุมัติรายการจองนี้หรือไม่?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setUpdatingId(id);

      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "ไม่สามารถอัปเดตสถานะได้"
        );
        return;
      }

      alert(
        data.message ||
          "อัปเดตสถานะสำเร็จ"
      );

      await loadBookings();
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      alert(
        "ไม่สามารถเชื่อมต่อ Server ได้"
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

    const [year, month, day] =
      value.split("-");

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

    return (
      purposes[purpose] ||
      purpose ||
      "-"
    );
  };

  // =====================================================
  // Statistics
  // =====================================================
  const totalBookings = bookings.length;

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status === "pending"
    ).length;

  const approvedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "approved"
    ).length;

  const rejectedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "rejected"
    ).length;

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status === "cancelled"
    ).length;

  // =====================================================
  // Filter
  // =====================================================
  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.status === filter
        );

  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="my-bookings-page">

        <div className="content-heading">
          <div>
            <h2>
              จัดการรายการจอง
            </h2>

            <p>
              กำลังโหลดรายการจอง...
            </p>
          </div>
        </div>

        <div className="booking-loading">
          <div className="loading-spinner"></div>

          <p>
            กำลังโหลดข้อมูล...
          </p>
        </div>

      </div>
    );
  }

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
          <h2>
            จัดการรายการจอง
          </h2>

          <p>
            ตรวจสอบและอนุมัติคำขอจองห้องประชุม
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

        {/* ทั้งหมด */}
        <div
          className={`booking-summary-card ${
            filter === "all"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("all")
          }
        >
          <div className="summary-icon blue">
            ▤
          </div>

          <div>
            <span>
              ทั้งหมด
            </span>

            <strong>
              {totalBookings}
            </strong>
          </div>
        </div>


        {/* รออนุมัติ */}
        <div
          className={`booking-summary-card ${
            filter === "pending"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("pending")
          }
        >
          <div className="summary-icon orange">
            ◷
          </div>

          <div>
            <span>
              รออนุมัติ
            </span>

            <strong>
              {pendingBookings}
            </strong>
          </div>
        </div>


        {/* อนุมัติแล้ว */}
        <div
          className={`booking-summary-card ${
            filter === "approved"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("approved")
          }
        >
          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>
              อนุมัติแล้ว
            </span>

            <strong>
              {approvedBookings}
            </strong>
          </div>
        </div>


        {/* ไม่อนุมัติ */}
        <div
          className={`booking-summary-card ${
            filter === "rejected"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("rejected")
          }
        >
          <div className="summary-icon red">
            ✕
          </div>

          <div>
            <span>
              ไม่อนุมัติ
            </span>

            <strong>
              {rejectedBookings}
            </strong>
          </div>
        </div>


        {/* ยกเลิก */}
        <div
          className={`booking-summary-card ${
            filter === "cancelled"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("cancelled")
          }
        >
          <div className="summary-icon gray">
            −
          </div>

          <div>
            <span>
              ยกเลิก
            </span>

            <strong>
              {cancelledBookings}
            </strong>
          </div>
        </div>

      </div>


      {/* =================================================
          FILTER
      ================================================= */}
      <div className="booking-filter">

        {/* ทั้งหมด */}
        <button
          type="button"
          className={
            filter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("all")
          }
        >
          ทั้งหมด
          <span>
            {totalBookings}
          </span>
        </button>


        {/* รออนุมัติ */}
        <button
          type="button"
          className={
            filter === "pending"
              ? "active pending-filter"
              : ""
          }
          onClick={() =>
            setFilter("pending")
          }
        >
          รออนุมัติ
          <span>
            {pendingBookings}
          </span>
        </button>


        {/* อนุมัติแล้ว */}
        <button
          type="button"
          className={
            filter === "approved"
              ? "active approved-filter"
              : ""
          }
          onClick={() =>
            setFilter("approved")
          }
        >
          อนุมัติแล้ว
          <span>
            {approvedBookings}
          </span>
        </button>


        {/* ไม่อนุมัติ */}
        <button
          type="button"
          className={
            filter === "rejected"
              ? "active rejected-filter"
              : ""
          }
          onClick={() =>
            setFilter("rejected")
          }
        >
          ไม่อนุมัติ
          <span>
            {rejectedBookings}
          </span>
        </button>


        {/* ยกเลิก */}
        <button
          type="button"
          className={
            filter === "cancelled"
              ? "active cancelled-filter"
              : ""
          }
          onClick={() =>
            setFilter("cancelled")
          }
        >
          ยกเลิก
          <span>
            {cancelledBookings}
          </span>
        </button>

      </div>


      {/* =================================================
          RESULT HEADER
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
            {filter !== "all"
              ? "ไม่พบรายการจอง"
              : "ยังไม่มีรายการจอง"}
          </h3>

          <p>
            {filter !== "all"
              ? "ไม่มีรายการจองในสถานะนี้"
              : "ยังไม่มีรายการจองห้องประชุม"}
          </p>

        </div>

      ) : (

        /* =================================================
           BOOKING LIST
        ================================================= */
        <div className="booking-list">

          {filteredBookings.map(
            (booking) => {

              const status =
                getStatus(
                  booking.status
                );

              const startDate =
                String(
                  booking.start_date || ""
                ).substring(0, 10);

              const endDate =
                String(
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
                          {booking.title ||
                            "ไม่มีหัวข้อ"}
                        </h3>

                        <span className="booking-room">
                          {booking.room_code ||
                            "-"}
                          {" · "}
                          {booking.room_name ||
                            "-"}
                        </span>

                      </div>

                    </div>


                    {/* STATUS */}
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
                        {booking.booking_name ||
                          "-"}
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
                          ? booking.start_time.slice(
                              0,
                              5
                            )
                          : "-"}

                        {" - "}

                        {booking.end_time
                          ? booking.end_time.slice(
                              0,
                              5
                            )
                          : "-"}

                      </strong>

                    </div>


                    {/* ผู้เข้าร่วม */}
                    <div className="booking-info-item">

                      <small>
                        ผู้เข้าร่วม
                      </small>

                      <strong>

                        {booking.participants ??
                          0}
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
                      ADMIN ACTION
                  ================================================= */}
                  {booking.status ===
                    "pending" && (

                    <div className="admin-booking-actions">

                      <button
                        type="button"
                        className="approve-button"
                        disabled={
                          updatingId ===
                          booking.id
                        }
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            "approved"
                          )
                        }
                      >
                        {updatingId ===
                        booking.id
                          ? "กำลังดำเนินการ..."
                          : "✓ อนุมัติ"}
                      </button>


                      <button
                        type="button"
                        className="reject-button"
                        disabled={
                          updatingId ===
                          booking.id
                        }
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            "rejected"
                          )
                        }
                      >
                        {updatingId ===
                        booking.id
                          ? "กำลังดำเนินการ..."
                          : "✕ ไม่อนุมัติ"}
                      </button>

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
            }
          )}

        </div>
      )}

    </div>
  );
}

export default AdminBookings;