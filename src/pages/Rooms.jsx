import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

// =====================================================
// ICONS
// =====================================================

const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="11" cy="11" r="7" />
    <path
      strokeLinecap="round"
      d="m20 20-4-4"
    />
  </svg>
);

const BuildingIcon = () => (
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
      d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M8 7h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2M2 21h20"
    />
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

const EditIcon = () => (
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
      d="M12 20h9"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"
    />
  </svg>
);

const TrashIcon = () => (
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
      d="M3 6h18"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 6V4h8v2m-9 0 1 15h8l1-15"
    />
    <path
      strokeLinecap="round"
      d="M10 11v6m4-6v6"
    />
  </svg>
);

const CalendarIcon = () => (
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
      height="17"
      rx="2"
    />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      d="M12 5v14M5 12h14"
    />
  </svg>
);

// =====================================================
// HELPERS
// =====================================================

const getCurrentUser = () => {
  const savedUser =
    localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "ไม่สามารถอ่านข้อมูล User:",
      error
    );

    return null;
  }
};

// =====================================================
// LOADING
// =====================================================

function RoomsLoading() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

      <p className="mt-4 text-sm text-gray-500">
        กำลังโหลดข้อมูลห้องประชุม...
      </p>
    </div>
  );
}

// =====================================================
// EMPTY
// =====================================================

function RoomsEmpty({
  search,
  onClear,
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CalendarIcon />
      </div>

      <h3 className="text-lg font-semibold text-gray-800">
        ไม่พบห้องประชุม
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        ลองค้นหาด้วยชื่อห้อง รหัสห้อง หรืออาคารอื่น
      </p>

      {search && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          ล้างการค้นหา
        </button>
      )}
    </div>
  );
}

// =====================================================
// ROOM STATUS
// =====================================================

function RoomStatus({ available }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur ${
        available
          ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
          : "border-gray-200 bg-gray-100/95 text-gray-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          available
            ? "bg-emerald-500"
            : "bg-gray-400"
        }`}
      />

      {available
        ? "พร้อมใช้งาน"
        : "ปิดใช้งาน"}
    </span>
  );
}

// =====================================================
// ROOM DETAILS
// =====================================================

function RoomDetails({ room }) {
  return (
    <div className="mt-5 space-y-3">

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-400">
          <BuildingIcon />
        </span>

        <span className="truncate">
          {room.building || "-"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-400">
          <UsersIcon />
        </span>

        <span>
          รองรับ {room.capacity || 0} คน
        </span>
      </div>

    </div>
  );
}

// =====================================================
// USER ROOM ACTION
// =====================================================

function UserRoomActions({
  room,
  available,
  onSelect,
}) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={() => onSelect(room)}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        available
          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          : "cursor-not-allowed bg-gray-100 text-gray-400"
      }`}
    >
      {available
        ? "▣ เลือกห้องนี้"
        : "ปิดใช้งาน"}
    </button>
  );
}

// =====================================================
// ADMIN ROOM ACTIONS
// =====================================================

function AdminRoomActions({
  room,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-2 gap-2">

      <button
        type="button"
        onClick={() => onEdit(room)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <EditIcon />
        แก้ไข
      </button>

      <button
        type="button"
        onClick={() => onDelete(room)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <TrashIcon />
        ลบ
      </button>

    </div>
  );
}

// =====================================================
// ROOM CARD
// =====================================================

function RoomCard({
  room,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
}) {
  const isAvailable =
    room.status === "available";

  const imageUrl = room.image
    ? `${SERVER_URL}${room.image}`
    : "/images/default-room.jpg";

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative h-52 overflow-hidden bg-gray-100">

        <img
          src={imageUrl}
          alt={room.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "/images/default-room.jpg";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute right-4 top-4">
          <RoomStatus
            available={isAvailable}
          />
        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5">

        <h3 className="truncate text-lg font-bold text-gray-900">
          {room.name}
        </h3>

        <div className="mt-1 inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
          {room.room_code}
        </div>

        <RoomDetails room={room} />

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-6">
          {isAdmin ? (
            <AdminRoomActions
              room={room}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <UserRoomActions
              room={room}
              available={isAvailable}
              onSelect={onSelect}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// =====================================================
// PAGE HEADER
// =====================================================

function RoomsHeader({
  isAdmin,
  onAdd,
  onMyBookings,
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          ห้องทั้งหมด
        </h2>

        <p className="mt-1 text-sm text-gray-500 md:text-base">
          {isAdmin
            ? "จัดการห้องประชุม เพิ่ม แก้ไข และลบห้อง"
            : "เรียกดูห้องประชุมและเลือกห้องสำหรับการจอง"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        {!isAdmin && (
          <button
            type="button"
            onClick={onMyBookings}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98]"
          >
            ▤
            การจองของฉัน
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]"
          >
            <PlusIcon />
            เพิ่มห้องประชุม
          </button>
        )}

      </div>
    </div>
  );
}

// =====================================================
// SEARCH TOOLBAR
// =====================================================

function RoomsToolbar({
  count,
  search,
  onSearch,
  onClear,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

      <div className="text-sm text-gray-500">
        ห้องประชุมทั้งหมด{" "}
        <strong className="font-bold text-gray-900">
          {count}
        </strong>{" "}
        ห้อง
      </div>

      <div className="relative w-full sm:max-w-md">

        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <SearchIcon />
        </div>

        <input
          type="text"
          placeholder="ค้นหาชื่อห้อง / รหัสห้อง / อาคาร..."
          value={search}
          onChange={(e) =>
            onSearch(e.target.value)
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
        />

        {search && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-xl text-gray-400 transition hover:text-gray-700"
          >
            ×
          </button>
        )}

      </div>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // USER / ROLE
  // =====================================================

  const currentUser = useMemo(
    () => getCurrentUser(),
    []
  );

  const isAdmin =
    currentUser?.role === "admin";

  // =====================================================
  // LOAD ROOMS
  // =====================================================

  const loadRooms = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/rooms`,
            { signal }
          );

        if (!response.ok) {
          throw new Error(
            "ไม่สามารถโหลดข้อมูลห้องได้"
          );
        }

        const data =
          await response.json();

        setRooms(
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
          "Rooms error:",
          error
        );

        setRooms([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadRooms(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [loadRooms]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredRooms =
    useMemo(() => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return rooms;
      }

      return rooms.filter(
        (room) =>
          String(room.name || "")
            .toLowerCase()
            .includes(keyword) ||
          String(
            room.room_code || ""
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            room.building || ""
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [rooms, search]);

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteRoom =
    useCallback(
      async (room) => {
        const confirmDelete =
          window.confirm(
            `ต้องการลบห้อง "${room.name}" ใช่หรือไม่?`
          );

        if (!confirmDelete) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/rooms/${room.id}`,
              {
                method: "DELETE",
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "ไม่สามารถลบห้องได้"
            );
          }

          setRooms(
            (prevRooms) =>
              prevRooms.filter(
                (item) =>
                  item.id !== room.id
              )
          );

          window.alert(
            "ลบห้องเรียบร้อยแล้ว"
          );
        } catch (error) {
          console.error(
            "Delete room error:",
            error
          );

          window.alert(
            error.message ||
              "ไม่สามารถลบห้องได้"
          );
        }
      },
      []
    );

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleSelectRoom =
    useCallback(
      (room) => {
        navigate(
          `/booking?room=${room.id}`
        );
      },
      [navigate]
    );

  const handleEditRoom =
    useCallback(
      (room) => {
        navigate(
          `/rooms/edit/${room.id}`
        );
      },
      [navigate]
    );

  const handleAddRoom =
    useCallback(() => {
      navigate("/rooms/add");
    }, [navigate]);

  const handleMyBookings =
    useCallback(() => {
      navigate("/my-bookings");
    }, [navigate]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        <RoomsHeader
          isAdmin={isAdmin}
          onAdd={handleAddRoom}
          onMyBookings={
            handleMyBookings
          }
        />

        <RoomsToolbar
          count={filteredRooms.length}
          search={search}
          onSearch={setSearch}
          onClear={() => setSearch("")}
        />

        {/* =================================================
            ROOM CONTENT
        ================================================= */}

        {loading ? (
          <RoomsLoading />
        ) : filteredRooms.length ===
          0 ? (
          <RoomsEmpty
            search={search}
            onClear={() => setSearch("")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map(
              (room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isAdmin={isAdmin}
                  onSelect={
                    handleSelectRoom
                  }
                  onEdit={
                    handleEditRoom
                  }
                  onDelete={
                    handleDeleteRoom
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

export default Rooms;