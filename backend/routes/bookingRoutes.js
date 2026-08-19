const express = require("express");
const router = express.Router();

const pool = require("../db");
const { sendEmail } = require("../services/notificationService");
const formatThaiDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "-";

  return String(time).slice(0, 5);
};
// =====================================================
// GET รายการจองทั้งหมด
// ใช้สำหรับ Dashboard / Admin
// =====================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.*,
        r.name AS room_name,
        r.room_code,
        u.full_name AS full_name,
        u.username AS username
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      message: "ไม่สามารถดึงข้อมูลการจองได้",
      error: error.message,
    });
  }
});

// =====================================================
// GET รายการจองของ User
// GET /api/bookings/my/:userId
// =====================================================
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        b.*,
        r.name AS room_name,
        r.room_code
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get my bookings error:", error);

    res.status(500).json({
      message: "ไม่สามารถดึงรายการจองของคุณได้",
      error: error.message,
    });
  }
});

// =====================================================
// POST สร้างรายการจอง
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      booking_name,
      room_id,
      title,
      start_date,
      end_date,
      start_time,
      end_time,
      participants,
      purpose,
      equipment,
      note,
    } = req.body;

    // =================================================
    // ตรวจข้อมูลเบื้องต้น
    // =================================================
    if (
      !user_id ||
      !booking_name ||
      !room_id ||
      !title ||
      !start_date ||
      !end_date ||
      !start_time ||
      !end_time ||
      !participants
    ) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
      });
    }

    // =================================================
    // ตรวจ User + ดึง Email
    // =================================================
    const userResult = await pool.query(
      `
      SELECT
        id,
        email,
        full_name,
        username
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลผู้ใช้งาน",
      });
    }

    const user = userResult.rows[0];

    // =================================================
    // ตรวจว่ามีห้องจริงหรือไม่
    // =================================================
    const roomResult = await pool.query(
      "SELECT * FROM rooms WHERE id = $1",
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบห้องประชุม",
      });
    }

    const room = roomResult.rows[0];

    // =================================================
    // ตรวจว่าห้องเปิดใช้งานหรือไม่
    // =================================================
    if (room.status !== "available") {
      return res.status(400).json({
        message: "ห้องนี้ไม่พร้อมใช้งาน",
      });
    }

    // =================================================
    // ตรวจจำนวนคน
    // =================================================
    if (Number(participants) > room.capacity) {
      return res.status(400).json({
        message: `ห้องนี้รองรับได้สูงสุด ${room.capacity} คน`,
      });
    }

    // =================================================
    // ตรวจเวลาชน
    // =================================================
    const conflictResult = await pool.query(
      `
      SELECT
        id,
        title,
        start_date,
        end_date,
        start_time,
        end_time,
        status
      FROM bookings
      WHERE room_id = $1
        AND status IN ('pending', 'approved')
        AND start_date <= $3::date
        AND end_date >= $2::date
        AND start_time < $5::time
        AND end_time > $4::time
      LIMIT 1
      `,
      [
        room_id,
        start_date,
        end_date,
        start_time,
        end_time,
      ]
    );

    if (conflictResult.rows.length > 0) {
      const conflict = conflictResult.rows[0];

      return res.status(409).json({
        message:
          conflict.status === "approved"
            ? "ห้องนี้ถูกอนุมัติให้จองในช่วงเวลาที่เลือกแล้ว"
            : "ห้องนี้มีคำขอจองในช่วงเวลาที่เลือกแล้ว",
        conflict: conflict,
      });
    }

    // =================================================
    // บันทึกการจอง
    // =================================================
    const result = await pool.query(
      `
      INSERT INTO bookings (
        user_id,
        booking_name,
        room_id,
        title,
        start_date,
        end_date,
        start_time,
        end_time,
        participants,
        purpose,
        equipment,
        note
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::date,
        $6::date,
        $7::time,
        $8::time,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING *
      `,
      [
        user_id,
        booking_name,
        room_id,
        title,
        start_date,
        end_date,
        start_time,
        end_time,
        participants,
        purpose,
        equipment,
        note,
      ]
    );
    const startDate = formatThaiDate(start_date);
    const endDate = formatThaiDate(end_date);

    const dateText =
      startDate === endDate
        ? startDate
        : `${startDate} ถึง ${endDate}`;

    const startTime = formatTime(start_time);
    const endTime = formatTime(end_time);
    // =================================================
    // ส่ง Email แจ้งเตือนผู้จอง
    // =================================================
    await sendEmail(
      user.email,
      "ได้รับคำขอจองห้องประชุมแล้ว",
      `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        line-height: 1.6;
      ">

        <h2>ได้รับคำขอจองห้องประชุมแล้ว</h2>

        <p>
          ระบบได้รับคำขอจองห้องประชุมของคุณเรียบร้อยแล้ว
        </p>

        <hr>

        <p>
          <strong>ผู้จอง:</strong>
          ${booking_name}
        </p>

        <p>
          <strong>หัวข้อ:</strong>
          ${title}
        </p>

        <p>
          <strong>ห้อง:</strong>
          ${room.name}
          (${room.room_code})
        </p>

        <p>
          <strong>วันที่:</strong> 
${dateText}
        </p>

        <p>
         <strong>เวลา:</strong> 
${startTime} - ${endTime} น.
        </p>

        <p>
          <strong>จำนวนผู้เข้าร่วม:</strong>
          ${participants} คน
        </p>

        <p>
          <strong>สถานะ:</strong>
          <span style="
            color: orange;
            font-weight: bold;
          ">
            รออนุมัติ
          </span>
        </p>

        <hr>

        <p>
          กรุณารอผู้ดูแลระบบตรวจสอบรายการจอง
        </p>

        <p>
          ระบบจองห้องประชุม
        </p>

      </div>
      `
    );

    // =================================================
    // Response
    // =================================================
    res.status(201).json({
      message: "ส่งคำขอจองห้องเรียบร้อยแล้ว",
      booking: result.rows[0],
    });

  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      message: "ไม่สามารถสร้างรายการจองได้",
      error: error.message,
    });
  }
});

// =====================================================
// PATCH อัปเดตสถานะการจอง
// ใช้สำหรับ Admin
// =====================================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const allowedStatus = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
    ];

    // =================================================
    // ตรวจสถานะ
    // =================================================
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "สถานะไม่ถูกต้อง",
      });
    }

    // =================================================
    // ดึงข้อมูล Booking + User + Email
    // =================================================
    const bookingResult = await pool.query(
      `
      SELECT
        b.*,
        r.name AS room_name,
        r.room_code,
        u.email,
        u.full_name,
        u.username
      FROM bookings b
      JOIN rooms r
        ON b.room_id = r.id
      JOIN users u
        ON b.user_id = u.id
      WHERE b.id = $1
      `,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบรายการจอง",
      });
    }

  const booking = bookingResult.rows[0];

const startDate = formatThaiDate(booking.start_date);
const endDate = formatThaiDate(booking.end_date);

const dateText =
  startDate === endDate
    ? startDate
    : `${startDate} ถึง ${endDate}`;

const startTime = formatTime(booking.start_time);
const endTime = formatTime(booking.end_time);
    // =================================================
    // อัปเดตสถานะ
    // =================================================
    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    // =================================================
    // กำหนดข้อความ Email
    // =================================================
    let subject;
    let statusText;
    let statusColor;

    if (status === "approved") {
      subject = "การจองห้องประชุมได้รับการอนุมัติ";
      statusText = "อนุมัติแล้ว";
      statusColor = "green";
    } else if (status === "rejected") {
      subject = "การจองห้องประชุมไม่ได้รับการอนุมัติ";
      statusText = "ไม่อนุมัติ";
      statusColor = "red";
    } else if (status === "cancelled") {
      subject = "รายการจองห้องประชุมถูกยกเลิก";
      statusText = "ยกเลิก";
      statusColor = "gray";
    } else {
      subject = "อัปเดตสถานะการจองห้องประชุม";
      statusText = "รออนุมัติ";
      statusColor = "orange";
    }

    // =================================================
    // ส่ง Email
    // =================================================
    await sendEmail(
      booking.email,
      subject,
      `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        line-height: 1.6;
      ">

        <h2>แจ้งเตือนสถานะการจองห้องประชุม</h2>

        <p>
          รายการจองห้องประชุมของคุณมีการอัปเดตสถานะ
        </p>

        <hr>

        <p>
          <strong>ผู้จอง:</strong>
          ${booking.booking_name}
        </p>

        <p>
          <strong>หัวข้อ:</strong>
          ${booking.title}
        </p>

        <p>
          <strong>ห้อง:</strong>
          ${booking.room_name}
          (${booking.room_code})
        </p>

        <p>
          <strong>วันที่:</strong>
${dateText}
        </p>

        <p>
         <strong>เวลา:</strong>
${startTime} - ${endTime} น.
        </p>

        <p>
          <strong>จำนวนผู้เข้าร่วม:</strong>
          ${booking.participants} คน
        </p>

        <p>
          <strong>สถานะ:</strong>
          <span style="
            color: ${statusColor};
            font-weight: bold;
          ">
            ${statusText}
          </span>
        </p>

        <hr>

        <p>
          ระบบจองห้องประชุม
        </p>

      </div>
      `
    );

    // =================================================
    // Response
    // =================================================
    res.json({
      message:
        status === "approved"
          ? "อนุมัติการจองเรียบร้อยแล้ว"
          : status === "rejected"
          ? "ไม่อนุมัติการจองเรียบร้อยแล้ว"
          : "อัปเดตสถานะเรียบร้อยแล้ว",

      booking: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update booking status error:",
      error
    );

    res.status(500).json({
      message: "ไม่สามารถอัปเดตสถานะการจองได้",
      error: error.message,
    });
  }
});

module.exports = router;