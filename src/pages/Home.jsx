import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

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
      equipment: "Projector, TV, Whiteboard",
    },
  ];

  const handleBooking = (roomId) => {
    navigate(`/booking?room=${roomId}`);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">

          <p className="hero-small">
            MEETING ROOM BOOKING SYSTEM
          </p>

          <h1>
            จองห้องประชุม
            <br />
            <span>ง่ายและรวดเร็ว</span>
          </h1>

          <p className="hero-description">
            ค้นหาห้องประชุม ตรวจสอบเวลาว่าง
            <br />
            และจองห้องประชุมได้ในที่เดียว
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/rooms")}
          >
            ดูห้องประชุม
          </button>

        </div>
      </section>

      <section className="rooms-section">

        <div className="section-header">

          <div>
            <p className="section-small">
              AVAILABLE ROOMS
            </p>

            <h2>ห้องประชุม</h2>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/rooms")}
          >
            ดูทั้งหมด →
          </button>

        </div>

        <div className="rooms-grid">

          {rooms.map((room) => (

            <div
              className="room-card"
              key={room.id}
            >

              <div className="room-image">
                <div className="room-placeholder">
                  🏢
                </div>
              </div>

              <div className="room-info">

                <div className="room-status">
                  <span></span>
                  ว่าง
                </div>

                <h3>
                  {room.name}
                </h3>

                <p>
                  📍 {room.location}
                </p>

                <p>
                  👥 รองรับ {room.capacity} คน
                </p>

                <p>
                  🖥️ {room.equipment}
                </p>

                <button
                  className="book-btn"
                  onClick={() =>
                    handleBooking(room.id)
                  }
                >
                  จองห้องประชุม
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>
    </main>
  );
}

export default Home;