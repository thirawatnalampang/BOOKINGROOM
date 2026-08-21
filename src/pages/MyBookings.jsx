import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// =====================================================
// CONSTANTS
// =====================================================

const API_URL = "http://localhost:5000/api";

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

const PURPOSE_MAP = {
  meeting: "ประชุม",
  training: "อบรม",
  presentation: "นำเสนอ",
  interview: "สัมภาษณ์",
};

const FILTERS = [
  {
    key: null,
    label: "ทั้งหมด",
  },
  {
    key: "pending",
    label: "รออนุมัติ",
  },
  {
    key: "approved",
    label: "อนุมัติแล้ว",
  },
  {
    key: "rejected",
    label: "ไม่อนุมัติ",
  },
  {
    key: "cancelled",
    label: "ยกเลิก",
  },
];

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

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getPageTitle = (status) => {
  const titles = {
    pending: "รายการรออนุมัติ",
    approved: "รายการที่อนุมัติแล้ว",
    rejected: "รายการที่ไม่อนุมัติ",
    cancelled: "รายการที่ยกเลิก",
  };

  return titles[status] || "การจองของฉัน";
};

const getPageDescription = (status) => {
  if (status === "pending") {
    return "ตรวจสอบรายการจองที่กำลังรอการอนุมัติ";
  }

  return "ตรวจสอบรายการจองและสถานะการอนุมัติของคุณ";
};

// =====================================================
// LOADING STATE
// =====================================================

function LoadingState() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            การจองของฉัน
          </h2>

          <p className="mt-1 text-sm text-gray-500 md:text-base">
            กำลังโหลดรายการจอง...
          </p>
        </div>

        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

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
// EMPTY STATE
// =====================================================

function EmptyState({ statusFilter }) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center shadow-sm">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
        ▤
      </div>

      <h3 className="text-lg font-semibold text-gray-800">
        {statusFilter
          ? "ไม่พบรายการจอง"
          : "ยังไม่มีรายการจอง"}
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {statusFilter
          ? "ไม่มีรายการจองในสถานะนี้"
          : "คุณยังไม่มีรายการจองห้องประชุม"}
      </p>

    </div>
  );
}

// =====================================================
// PAGE HEADER
// =====================================================

function PageHeader({
  title,
  description,
  onRefresh,
  refreshing,
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500 md:text-base">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={
            refreshing
              ? "animate-spin text-lg"
              : "text-lg"
          }
        >
          ↻
        </span>

        {refreshing
          ? "กำลังโหลด..."
          : "รีเฟรช"}
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
  active,
  iconBg,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
        active
          ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-100"
          : "border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
      }`}
    >

      {/* ICON */}

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${
          active
            ? "bg-emerald-100 text-emerald-700"
            : iconBg
        }`}
      >
        {icon}
      </div>

      {/* TEXT */}

      <div>
        <span
          className={`block text-sm ${
            active
              ? "font-semibold text-emerald-700"
              : "text-gray-500"
          }`}
        >
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
  bookings,
  counts,
  statusFilter,
  onFilter,
}) {
  const cards = [
    {
      key: null,
      label: "ทั้งหมด",
      count: bookings.length,
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
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {cards.map((card) => (
        <SummaryCard
          key={card.key ?? "all"}
          label={card.label}
          count={card.count}
          icon={card.icon}
          iconBg={card.iconBg}
          active={statusFilter === card.key}
          onClick={() =>
            onFilter(card.key)
          }
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
  total,
  statusFilter,
  onFilter,
}) {
  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">

      <div className="flex min-w-max gap-1">

        {FILTERS.map((filter) => {
          const isActive =
            statusFilter === filter.key;

          const count =
            filter.key === null
              ? total
              : counts[filter.key] ?? 0;

          return (
            <button
              key={filter.key ?? "all"}
              type="button"
              onClick={() =>
                onFilter(filter.key)
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >

              {filter.label}

              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
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

      <div>
        <strong className="text-lg font-semibold text-gray-900">
          รายการจอง
        </strong>

        <p className="mt-0.5 text-sm text-gray-500">
          รายละเอียดการจองห้องประชุมของคุณ
        </p>
      </div>

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
// BOOKING CARD
// =====================================================

function BookingCard({ booking }) {
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

          {/* BOOKING ID */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
            #{booking.id}
          </div>

          {/* TITLE */}

          <div className="min-w-0">

            <h3 className="truncate text-lg font-semibold text-gray-900">
              {booking.title ||
                "ไม่มีหัวข้อ"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {booking.room_code || "-"}
              {" · "}
              {booking.room_name || "-"}
            </p>

          </div>

        </div>

        {/* STATUS */}

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.badge}`}
        >
          <span>
            {status.icon}
          </span>

          {status.text}
        </span>

      </div>

      {/* =================================================
          MAIN INFO
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-5 md:p-6">

        <BookingInfo
          label="ผู้จอง"
          value={
            booking.booking_name || "-"
          }
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
          EXTRA INFO
      ================================================= */}

      {(booking.equipment ||
        booking.note) && (
        <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4 md:px-6">

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
          FOOTER
      ================================================= */}

      <div className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between md:px-6">

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
// BOOKING LIST
// =====================================================

function BookingList({ bookings }) {
  return (
    <div className="space-y-4">

      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
        />
      ))}

    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

function MyBookings() {
  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const statusFilter =
    searchParams.get("status");

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  const loadBookings = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const savedUser =
          localStorage.getItem("user");

        if (!savedUser) {
          setBookings([]);
          return;
        }

        let user;

        try {
          user = JSON.parse(
            savedUser
          );
        } catch (parseError) {
          console.error(
            "User JSON ไม่ถูกต้อง:",
            parseError
          );

          setBookings([]);
          return;
        }

        const userId =
          user.user_id ?? user.id;

        if (!userId) {
          console.error(
            "ไม่พบ User ID:",
            user
          );

          setBookings([]);
          return;
        }

        const response =
          await fetch(
            `${API_URL}/bookings/my/${userId}`,
            {
              signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            "ไม่สามารถดึงข้อมูลการจองได้"
          );
        }

        const data =
          await response.json();

        setBookings(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        if (
          error.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Load bookings error:",
          error
        );

        setBookings([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const controller =
      new AbortController();

    loadBookings(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [loadBookings]);

  // =====================================================
  // FILTERED BOOKINGS
  // =====================================================

  const filteredBookings =
    useMemo(() => {
      if (!statusFilter) {
        return bookings;
      }

      return bookings.filter(
        (booking) =>
          booking.status ===
          statusFilter
      );
    }, [
      bookings,
      statusFilter,
    ]);

  // =====================================================
  // STATUS COUNTS
  // =====================================================

  const counts = useMemo(() => {
    return bookings.reduce(
      (result, booking) => {
        if (
          Object.prototype.hasOwnProperty.call(
            STATUS_CONFIG,
            booking.status
          )
        ) {
          result[
            booking.status
          ] += 1;
        }

        return result;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      }
    );
  }, [bookings]);

  // =====================================================
  // FILTER HANDLER
  // =====================================================

  const handleFilter =
    useCallback(
      (status) => {
        if (!status) {
          setSearchParams({});
          return;
        }

        setSearchParams({
          status,
        });
      },
      [setSearchParams]
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <LoadingState />;
  }

  // =====================================================
  // PAGE INFO
  // =====================================================

  const pageTitle =
    getPageTitle(
      statusFilter
    );

  const pageDescription =
    getPageDescription(
      statusFilter
    );

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
          title={pageTitle}
          description={
            pageDescription
          }
          onRefresh={() =>
            loadBookings()
          }
          refreshing={loading}
        />

        {/* =================================================
            SUMMARY
        ================================================= */}

        <BookingSummary
          bookings={bookings}
          counts={counts}
          statusFilter={
            statusFilter
          }
          onFilter={
            handleFilter
          }
        />

        {/* =================================================
            FILTER
        ================================================= */}

        <BookingFilter
          counts={counts}
          total={bookings.length}
          statusFilter={
            statusFilter
          }
          onFilter={
            handleFilter
          }
        />

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <ResultHeader
          count={
            filteredBookings.length
          }
        />

        {/* =================================================
            LIST / EMPTY
        ================================================= */}

        {filteredBookings.length ===
        0 ? (
          <EmptyState
            statusFilter={
              statusFilter
            }
          />
        ) : (
          <BookingList
            bookings={
              filteredBookings
            }
          />
        )}

      </div>
    </div>
  );
}

export default MyBookings;