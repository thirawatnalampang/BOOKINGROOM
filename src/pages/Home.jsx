import { useNavigate } from "react-router-dom";

// =====================================================
// ICONS
// =====================================================

const MapPinIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
    />

    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    />

    <circle cx="9" cy="7" r="4" />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
  </svg>
);

const MonitorIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="13"
      rx="2"
    />

    <path
      strokeLinecap="round"
      d="M8 21h8M12 17v4"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="h-4 w-4 transition-transform"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14m-6-6 6 6-6 6"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="h-9 w-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2M2 21h20"
    />
  </svg>
);

// =====================================================
// ROOM DATA
// =====================================================

const rooms = [
  {
    id: 1,
    name: "ห้องประชุม A",
    capacity: 10,
    location: "ชั้น 1",
    equipment: "Projector, TV",
  },
  {
    id: 2,
    name: "ห้องประชุม B",
    capacity: 20,
    location: "ชั้น 2",
    equipment: "Projector, Whiteboard",
  },
  {
    id: 3,
    name: "ห้องประชุม C",
    capacity: 30,
    location: "ชั้น 3",
    equipment:
      "Projector, TV, Whiteboard",
  },
];

// =====================================================
// ROOM CARD
// =====================================================

function RoomCard({
  room,
  onBooking,
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-gray-100">

        {/* Background decoration */}

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl transition group-hover:scale-125" />

        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />

        {/* Building */}

        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-lg shadow-emerald-900/5 transition duration-300 group-hover:scale-105">
          <BuildingIcon />
        </div>

        {/* Status */}

        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">

          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

          ว่าง
        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5">

        <div className="mb-4">

          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-600">
            Meeting Room
          </p>

          <h3 className="text-xl font-bold text-gray-900">
            {room.name}
          </h3>

        </div>

        {/* DETAILS */}

        <div className="space-y-3">

          <div className="flex items-center gap-3 text-sm text-gray-500">

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <MapPinIcon />
            </span>

            <span>
              {room.location}
            </span>

          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <UsersIcon />
            </span>

            <span>
              รองรับ{" "}
              <strong className="font-semibold text-gray-700">
                {room.capacity}
              </strong>{" "}
              คน
            </span>

          </div>

          <div className="flex items-start gap-3 text-sm text-gray-500">

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <MonitorIcon />
            </span>

            <span className="leading-5">
              {room.equipment}
            </span>

          </div>

        </div>

        {/* BOOK BUTTON */}

        <button
          type="button"
          onClick={() =>
            onBooking(room.id)
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98]"
        >
          จองห้องประชุม

          <ArrowIcon />
        </button>

      </div>
    </article>
  );
}

// =====================================================
// HOME
// =====================================================

function Home() {
  const navigate = useNavigate();

  const handleBooking = (roomId) => {
    navigate(`/booking?room=${roomId}`);
  };

  return (
    <main className="min-h-full bg-gray-50">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-600">

        {/* Background decorations */}

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />

        <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        {/* Grid pattern */}

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)",
            backgroundSize:
              "40px 40px",
          }}
        />

        {/* Hero content */}

        <div className="relative mx-auto flex min-h-[480px] max-w-7xl items-center px-5 py-20 md:min-h-[540px] md:px-8">

          <div className="max-w-2xl">

            <p className="mb-5 text-xs font-semibold tracking-[0.25em] text-emerald-100 md:text-sm">
              MEETING ROOM BOOKING SYSTEM
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">

              จองห้องประชุม

              <br />

              <span className="text-emerald-100">
                ง่ายและรวดเร็ว
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-emerald-50 md:text-lg md:leading-8">
              ค้นหาห้องประชุม ตรวจสอบเวลาว่าง
              <br className="hidden sm:block" />
              และจองห้องประชุมได้ในที่เดียว
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/rooms")
              }
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-50 hover:shadow-2xl active:scale-[0.98]"
            >
              ดูห้องประชุม

              <ArrowIcon />
            </button>

          </div>

          {/* Decorative right side */}

          <div className="pointer-events-none absolute bottom-0 right-8 hidden lg:block">

            <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">

              <div className="flex h-52 w-52 items-center justify-center rounded-full border border-white/10 bg-white/5">

                <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/10 text-white backdrop-blur">
                  <BuildingIcon />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          ROOMS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">

        {/* Section header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-emerald-600">
              AVAILABLE ROOMS
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              ห้องประชุม
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              เลือกห้องประชุมที่เหมาะกับการใช้งานของคุณ
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/rooms")
            }
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            ดูทั้งหมด

            <ArrowIcon />
          </button>

        </div>

        {/* Room grid */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBooking={
                handleBooking
              }
            />
          ))}

        </div>

      </section>

    </main>
  );
}

export default Home;