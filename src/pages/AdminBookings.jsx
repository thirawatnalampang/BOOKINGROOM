import { useEffect, useMemo, useState } from "react";

// =====================================================
// CONSTANTS
// =====================================================

const API_URL = "http://localhost:5000/api";

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG = {
  pending: {
    text: "รออนุมัติ",
    icon: "◷",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    iconBg: "bg-amber-50 text-amber-600",
  },

  approved: {
    text: "อนุมัติแล้ว",
    icon: "✓",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
  },

  rejected: {
    text: "ไม่อนุมัติ",
    icon: "✕",
    badge: "border-red-200 bg-red-50 text-red-700",
    iconBg: "bg-red-50 text-red-600",
  },

  cancelled: {
    text: "ยกเลิก",
    icon: "−",
    badge: "border-gray-200 bg-gray-100 text-gray-600",
    iconBg: "bg-gray-100 text-gray-600",
  },
};

const DEFAULT_STATUS = {
  text: "-",
  icon: "•",
  badge: "border-gray-200 bg-gray-100 text-gray-600",
  iconBg: "bg-gray-100 text-gray-600",
};

// =====================================================
// PURPOSE
// =====================================================

const PURPOSE_MAP = {
  meeting: "ประชุม",
  training: "อบรม",
  presentation: "นำเสนอ",
  interview: "สัมภาษณ์",
};

// =====================================================
// HELPERS
// =====================================================

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] ?? {
      ...DEFAULT_STATUS,
      text: status || "-",
    }
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  const value = String(date).substring(0, 10);
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "-";
  }

  return `${day}/${month}/${year}`;
};

const formatTime = (time) => {
  return time ? String(time).slice(0, 5) : "-";
};

const getPurpose = (purpose) => {
  return PURPOSE_MAP[purpose] || purpose || "-";
};

const formatCreatedDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("th-TH");
};

// =====================================================
// LOADING
// =====================================================

function LoadingState() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            จัดการรายการจอง
          </h2>

          <p className="mt-1 text-sm text-gray-500 md:text-base">
            กำลังโหลดรายการจอง...
          </p>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-500">
            กำลังโหลดข้อมูล...
          </p>

        </div>
      </div>
    </div>
  );
}

// =====================================================
// PAGE HEADER
// =====================================================

function PageHeader({ onRefresh }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          จัดการรายการจอง
        </h2>

        <p className="mt-1 text-sm text-gray-500 md:text-base">
          ตรวจสอบและอนุมัติคำขอจองห้องประชุม
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
      >
        <span className="text-lg">↻</span>
        รีเฟรช
      </button>

    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  count,
  icon,
  iconBg,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex min-w-0 items-center gap-4 rounded-2xl border
        bg-white p-5 text-left shadow-sm
        transition-all duration-200
        ${
          active
            ? "border-emerald-500 ring-2 ring-emerald-100"
            : "border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      <div
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-xl text-xl font-bold
          ${iconBg}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <span className="block text-sm text-gray-500">
          {label}
        </span>

        <strong className="mt-0.5 block text-2xl font-bold text-gray-900">
          {count}
        </strong>
      </div>
    </button>
  );
}

// =====================================================
// SUMMARY
// =====================================================

function BookingSummary({
  counts,
  filter,
  onFilter,
}) {
  const cards = [
    {
      key: "all",
      label: "ทั้งหมด",
      count: counts.all,
      icon: "▤",
      iconBg: "bg-blue-50 text-blue-600",
    },

    {
      key: "pending",
      label: "รออนุมัติ",
      count: counts.pending,
      icon: "◷",
      iconBg: "bg-amber-50 text-amber-600",
    },

    {
      key: "approved",
      label: "อนุมัติแล้ว",
      count: counts.approved,
      icon: "✓",
      iconBg: "bg-emerald-50 text-emerald-600",
    },

    {
      key: "rejected",
      label: "ไม่อนุมัติ",
      count: counts.rejected,
      icon: "✕",
      iconBg: "bg-red-50 text-red-600",
    },

    {
      key: "cancelled",
      label: "ยกเลิก",
      count: counts.cancelled,
      icon: "−",
      iconBg: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          count={card.count}
          icon={card.icon}
          iconBg={card.iconBg}
          active={filter === card.key}
          onClick={() => onFilter(card.key)}
        />
      ))}

    </div>
  );
}

// =====================================================
// FILTER
// =====================================================

function BookingFilter({
  counts,
  filter,
  onFilter,
}) {
  const filters = [
    {
      key: "all",
      label: "ทั้งหมด",
      count: counts.all,
    },

    {
      key: "pending",
      label: "รออนุมัติ",
      count: counts.pending,
    },

    {
      key: "approved",
      label: "อนุมัติแล้ว",
      count: counts.approved,
    },

    {
      key: "rejected",
      label: "ไม่อนุมัติ",
      count: counts.rejected,
    },

    {
      key: "cancelled",
      label: "ยกเลิก",
      count: counts.cancelled,
    },
  ];

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">

      <div className="flex min-w-max gap-1">

        {filters.map((item) => {
          const isActive = filter === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilter(item.key)}
              className={`
                rounded-xl px-4 py-2.5 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {item.label}

              <span
                className={`
                  ml-2 rounded-full px-2 py-0.5 text-xs
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {item.count}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}

// =====================================================
// RESULT HEADER
// =====================================================

function ResultHeader({ count }) {
  return (
    <div className="mb-4 flex items-center justify-between">

      <strong className="text-lg font-semibold text-gray-900">
        รายการจอง
      </strong>

      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
        พบ {count} รายการ
      </span>

    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function BookingInfo({
  label,
  value,
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// EXTRA INFO
// =====================================================

function ExtraInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">

      <p className="mb-1 text-xs font-semibold text-gray-400">
        {label}
      </p>

      <p className="text-sm text-gray-700">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// BOOKING CARD
// =====================================================

function BookingCard({
  booking,
  onUpdateStatus,
  updating,
}) {
  const status = getStatusConfig(
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">

        <div className="flex min-w-0 items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
            #{booking.id}
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-lg font-semibold text-gray-900">
              {booking.title || "ไม่มีหัวข้อ"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {booking.room_code || "-"}
              {" · "}
              {booking.room_name || "-"}
            </p>

          </div>
        </div>

        <span
          className={`
            inline-flex w-fit items-center gap-1.5
            rounded-full border px-3 py-1.5
            text-xs font-semibold
            ${status.badge}
          `}
        >
          <span>{status.icon}</span>
          {status.text}
        </span>

      </div>

      {/* =================================================
          INFO
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 border-b border-gray-100 p-5 sm:grid-cols-2 lg:grid-cols-5 md:p-6">

        <BookingInfo
          label="ผู้จอง"
          value={booking.booking_name || "-"}
        />

        <BookingInfo
          label="วันที่"
          value={
            <>
              {formatDate(
                booking.start_date
              )}

              {isMultiDay &&
                ` - ${formatDate(
                  booking.end_date
                )}`}
            </>
          }
        />

        <BookingInfo
          label="เวลา"
          value={`${formatTime(
            booking.start_time
          )} - ${formatTime(
            booking.end_time
          )}`}
        />

        <BookingInfo
          label="ผู้เข้าร่วม"
          value={`${booking.participants ?? 0} คน`}
        />

        <BookingInfo
          label="วัตถุประสงค์"
          value={getPurpose(
            booking.purpose
          )}
        />

      </div>

      {/* =================================================
          EXTRA
      ================================================= */}

      {(booking.equipment ||
        booking.note) && (

        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 md:px-6">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {booking.equipment && (
              <ExtraInfo
                label="อุปกรณ์"
                value={booking.equipment}
              />
            )}

            {booking.note && (
              <ExtraInfo
                label="หมายเหตุ"
                value={booking.note}
              />
            )}

          </div>

        </div>
      )}

      {/* =================================================
          ADMIN ACTION
      ================================================= */}

      {booking.status === "pending" && (

        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:justify-end md:px-6">

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onUpdateStatus(
                booking.id,
                "approved"
              )
            }
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating
              ? "กำลังดำเนินการ..."
              : "✓ อนุมัติ"}
          </button>

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onUpdateStatus(
                booking.id,
                "rejected"
              )
            }
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating
              ? "กำลังดำเนินการ..."
              : "✕ ไม่อนุมัติ"}
          </button>

        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex flex-col gap-1 bg-gray-50/50 px-5 py-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between md:px-6">

        <span>
          สร้างรายการเมื่อ{" "}
          {formatCreatedDate(
            booking.created_at
          )}
        </span>

        <span>
          Booking #{booking.id}
        </span>

      </div>

    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({ filter }) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
        ▤
      </div>

      <h3 className="text-lg font-semibold text-gray-800">
        {filter !== "all"
          ? "ไม่พบรายการจอง"
          : "ยังไม่มีรายการจอง"}
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {filter !== "all"
          ? "ไม่มีรายการจองในสถานะนี้"
          : "ยังไม่มีรายการจองห้องประชุม"}
      </p>

    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  const loadBookings = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/bookings`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "ไม่สามารถโหลดรายการจองได้"
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

      alert(
        "ไม่สามารถโหลดรายการจองได้"
      );

      setBookings([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadBookings();
  }, []);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    id,
    status
  ) => {
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
        `${API_URL}/bookings/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json();

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
  // COUNTS
  // =====================================================

  const counts = useMemo(() => {
    return {
      all: bookings.length,

      pending: bookings.filter(
        (booking) =>
          booking.status === "pending"
      ).length,

      approved: bookings.filter(
        (booking) =>
          booking.status === "approved"
      ).length,

      rejected: bookings.filter(
        (booking) =>
          booking.status === "rejected"
      ).length,

      cancelled: bookings.filter(
        (booking) =>
          booking.status === "cancelled"
      ).length,
    };
  }, [bookings]);

  // =====================================================
  // FILTERED BOOKINGS
  // =====================================================

  const filteredBookings = useMemo(() => {
    if (filter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) =>
        booking.status === filter
    );
  }, [bookings, filter]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <LoadingState />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeader
          onRefresh={loadBookings}
        />

        {/* =================================================
            SUMMARY
        ================================================= */}

        <BookingSummary
          counts={counts}
          filter={filter}
          onFilter={setFilter}
        />

        {/* =================================================
            FILTER
        ================================================= */}

        <BookingFilter
          counts={counts}
          filter={filter}
          onFilter={setFilter}
        />

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <ResultHeader
          count={filteredBookings.length}
        />

        {/* =================================================
            EMPTY / LIST
        ================================================= */}

        {filteredBookings.length === 0 ? (

          <EmptyState
            filter={filter}
          />

        ) : (

          <div className="space-y-4">

            {filteredBookings.map(
              (booking) => (

                <BookingCard
                  key={booking.id}
                  booking={booking}
                  updating={
                    updatingId ===
                    booking.id
                  }
                  onUpdateStatus={
                    updateStatus
                  }
                />

              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminBookings;