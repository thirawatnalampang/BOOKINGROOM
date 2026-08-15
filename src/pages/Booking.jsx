import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");

  const user = savedUser
    ? JSON.parse(savedUser)
    : null;
const roomId = searchParams.get("room");

const [room, setRoom] = useState(null);
const [loadingRoom, setLoadingRoom] = useState(true);
const [loading, setLoading] = useState(false);

 const [form, setForm] = useState({
  bookingName: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  title: "",
  participants: "",
  purpose: "",
  equipment: [],
  note: "",
});

  // โหลดข้อมูลห้องที่เลือก
  useEffect(() => {
    if (!roomId) {
      setLoadingRoom(false);
      return;
    }

    fetch(`http://localhost:5000/api/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("ไม่พบห้อง");
        }

        return res.json();
      })
      .then((data) => {
        setRoom(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoadingRoom(false);
      });
  }, [roomId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, value]
        : prev.equipment.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!room) {
      alert("ไม่พบข้อมูลห้องประชุม");
      return;
    }

    if (form.endDate < form.startDate) {
      alert("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม");
      return;
    }

    if (
  form.startDate === form.endDate &&
  form.endTime <= form.startTime
) {
  alert("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
  return;
}

    if (Number(form.participants) > room.capacity) {
      alert(`ห้องนี้รองรับได้สูงสุด ${room.capacity} คน`);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
  body: JSON.stringify({
  user_id: user.id,
  booking_name: form.bookingName,
  room_id: Number(roomId),
  title: form.title,
  start_date: form.startDate,
  end_date: form.endDate,
  start_time: form.startTime,
  end_time: form.endTime,
  participants: Number(form.participants),
  purpose: form.purpose,
  equipment: form.equipment.join(", "),
  note: form.note,
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "ไม่สามารถจองห้องได้");
        return;
      }

      alert("ส่งคำขอจองห้องเรียบร้อยแล้ว");

      navigate("/my-bookings");
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="booking-page">
        <div className="rooms-loading">
          กำลังโหลดข้อมูลห้อง...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="booking-page">
        <div className="rooms-empty">
          ไม่พบข้อมูลห้องประชุม
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">

      <div className="content-heading">
        <div>
          <h2>จองห้องประชุม</h2>
          <p>
            กรอกข้อมูลเพื่อส่งคำขอจองห้องประชุม
          </p>
        </div>
      </div>

      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >

        {/* ห้องประชุม */}

        <div className="booking-section">

          <h3>ข้อมูลห้องประชุม</h3>

          <div className="selected-room">

            <div className="selected-room-icon">
              ▣
            </div>

            <div>
              <strong>{room.name}</strong>

              <span>
                {room.room_code} · {room.building} ·
                {" "}รองรับ {room.capacity} คน
              </span>
            </div>

            <span className="available-text">
              ● พร้อมใช้งาน
            </span>

          </div>

        </div>

        {/* วันเวลา */}

        <div className="booking-section">

          <h3>วันและเวลา</h3>

          <div className="form-grid four">

            <div className="form-group">
              <label>วันที่เริ่ม *</label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>วันที่สิ้นสุด *</label>

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>เวลาเริ่ม *</label>

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>เวลาสิ้นสุด *</label>

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="booking-info">
            ℹ️ หากเลือกหลายวัน ระบบจะถือว่าเป็นการจอง
            ช่วงเวลาเดียวกันในแต่ละวันของช่วงวันที่เลือก
          </div>

        </div>

{/* ผู้จอง */}
<div className="booking-section">

  <h3>ข้อมูลผู้จอง</h3>

  <div className="form-grid">

    <div className="form-group full">

      <label>ชื่อผู้จอง *</label>

      <input
        type="text"
        name="bookingName"
        placeholder="กรอกชื่อผู้จอง"
        value={form.bookingName}
        onChange={handleChange}
        required
      />

    </div>

  </div>

</div>
        {/* รายละเอียด */}

        <div className="booking-section">

          <h3>รายละเอียดการประชุม</h3>

          <div className="form-grid">

            <div className="form-group full">

              <label>หัวข้อการประชุม *</label>

              <input
                type="text"
                name="title"
                placeholder="เช่น ประชุมทีมประจำสัปดาห์"
                value={form.title}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>จำนวนผู้เข้าร่วม *</label>

              <input
                type="number"
                name="participants"
                min="1"
                max={room.capacity}
                placeholder={`สูงสุด ${room.capacity} คน`}
                value={form.participants}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>วัตถุประสงค์</label>

              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
              >
                <option value="">
                  เลือกวัตถุประสงค์
                </option>

                <option value="meeting">
                  ประชุม
                </option>

                <option value="training">
                  อบรม
                </option>

                <option value="presentation">
                  นำเสนอ
                </option>

                <option value="interview">
                  สัมภาษณ์
                </option>

                <option value="other">
                  อื่น ๆ
                </option>
              </select>

            </div>

            <div className="form-group full">

              <label>อุปกรณ์ที่ต้องการ</label>

              <div className="equipment-options">

                {[
                  "Projector",
                  "TV",
                  "Whiteboard",
                  "Microphone",
                ].map((item) => (
                  <label key={item}>

                    <input
                      type="checkbox"
                      value={item}
                      checked={form.equipment.includes(item)}
                      onChange={handleEquipmentChange}
                    />

                    {item}

                  </label>
                ))}

              </div>

            </div>

            <div className="form-group full">

              <label>หมายเหตุเพิ่มเติม</label>

              <textarea
                name="note"
                rows="4"
                placeholder="รายละเอียดเพิ่มเติม..."
                value={form.note}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>

        <div className="booking-footer">

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/rooms")}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            className="submit-booking-button"
            disabled={loading}
          >
            {loading
              ? "กำลังส่งคำขอ..."
              : "ส่งคำขอจอง"}
          </button>

        </div>

      </form>
    </div>
  );
}

export default Booking;