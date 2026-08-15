import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
    console.error("ไม่สามารถอ่านข้อมูล User:", error);
  }

  const isAdmin = currentUser?.role === "admin";

  // =====================================================
  // โหลดข้อมูลห้อง
  // =====================================================
  const loadRooms = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/rooms"
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลห้องได้");
      }

      const data = await response.json();

      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Rooms error:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // =====================================================
  // Search
  // =====================================================
  const filteredRooms = rooms.filter((room) => {
    const keyword = search.toLowerCase().trim();

    return (
      String(room.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(room.room_code || "")
        .toLowerCase()
        .includes(keyword) ||
      String(room.building || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =====================================================
  // ลบห้อง - ADMIN
  // =====================================================
  const handleDeleteRoom = async (room) => {
    const confirmDelete = window.confirm(
      `ต้องการลบห้อง "${room.name}" ใช่หรือไม่?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${room.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "ไม่สามารถลบห้องได้"
        );
      }

      setRooms((prevRooms) =>
        prevRooms.filter(
          (item) => item.id !== room.id
        )
      );

      alert("ลบห้องเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Delete room error:", error);

      alert(
        error.message || "ไม่สามารถลบห้องได้"
      );
    }
  };

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="rooms-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="content-heading">

        <div>
          <h2>ห้องทั้งหมด</h2>

          <p>
            {isAdmin
              ? "จัดการห้องประชุม เพิ่ม แก้ไข และลบห้อง"
              : "เรียกดูห้องประชุมและเลือกห้องสำหรับการจอง"}
          </p>
        </div>

        <div className="room-actions">

          {/* USER */}
          {!isAdmin && (
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              ▤ การจองของฉัน
            </button>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate("/rooms/add")
              }
            >
              ＋ เพิ่มห้องประชุม
            </button>
          )}

        </div>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}
      <div className="room-toolbar">

        <div className="room-count">
          ห้องประชุมทั้งหมด{" "}
          <strong>{filteredRooms.length}</strong>{" "}
          ห้อง
        </div>

        <div className="room-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="ค้นหาชื่อห้อง / รหัสห้อง / อาคาร..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>
      </div>

      {/* =================================================
          ROOMS
      ================================================= */}
      <div className="rooms-container">

        {/* Loading */}
        {loading && (
          <div className="rooms-loading">

            <div className="loading-spinner"></div>

            <span>
              กำลังโหลดข้อมูลห้องประชุม...
            </span>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          filteredRooms.length === 0 && (
            <div className="rooms-empty">

              <div className="rooms-empty-icon">
                ▣
              </div>

              <h3>
                ไม่พบห้องประชุม
              </h3>

              <p>
                ลองค้นหาด้วยชื่อห้อง รหัสห้อง หรืออาคารอื่น
              </p>

              {search && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSearch("")}
                >
                  ล้างการค้นหา
                </button>
              )}

            </div>
          )}

        {/* Room Grid */}
        {!loading &&
          filteredRooms.length > 0 && (
            <div className="rooms-grid">

              {filteredRooms.map((room) => {

                const isAvailable =
                  room.status === "available";

                return (
                  <div
                    className="room-card"
                    key={room.id}
                  >

                    {/* IMAGE */}
                    <div className="room-image-wrapper">

                      <img
                        src={
                          room.image
                            ? `http://localhost:5000${room.image}`
                            : "/images/default-room.jpg"
                        }
                        alt={room.name}
                        className="room-image"
                      />

                      <div
                        className={`room-status-badge ${
                          isAvailable
                            ? "available"
                            : "disabled"
                        }`}
                      >
                        <span></span>

                        {isAvailable
                          ? "พร้อมใช้งาน"
                          : "ปิดใช้งาน"}
                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="room-card-content">

                      <h3>
                        {room.name}
                      </h3>

                      <div className="room-code">
                        {room.room_code}
                      </div>

                      <div className="room-details">

                        <div>
                          <span>⌂</span>
                          <span>
                            {room.building || "-"}
                          </span>
                        </div>

                        <div>
                          <span>♙</span>
                          <span>
                            รองรับ {room.capacity || 0} คน
                          </span>
                        </div>

                      </div>

                      {/* BUTTONS */}
                      <div className="room-buttons">

                        {/* USER */}
                        {!isAdmin && (
                          <button
                            type="button"
                            className="select-room-button"
                            disabled={!isAvailable}
                            onClick={() =>
                              navigate(
                                `/booking?room=${room.id}`
                              )
                            }
                          >
                            {isAvailable
                              ? "▣ เลือกห้องนี้"
                              : "ปิดใช้งาน"}
                          </button>
                        )}

                        {/* ADMIN */}
                        {isAdmin && (
                          <div className="admin-room-actions">

                            <button
                              type="button"
                              className="edit-room-button"
                              onClick={() =>
                                navigate(
                                  `/rooms/edit/${room.id}`
                                )
                              }
                            >
                              ✎ แก้ไข
                            </button>

                            <button
                              type="button"
                              className="delete-room-button"
                              onClick={() =>
                                handleDeleteRoom(room)
                              }
                            >
                              🗑 ลบ
                            </button>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </div>
    </div>
  );
}

export default Rooms;