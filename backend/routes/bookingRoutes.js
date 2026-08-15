const express = require("express");
const router = express.Router();

const pool = require("../db");

// =====================================================
// GET รายการจองทั้งหมด
// ใช้สำหรับ Admin
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
    // ตรวจว่ามี User จริงหรือไม่
    // =================================================
    const userResult = await pool.query(
      `
      SELECT id
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
  SELECT id, title, start_date, end_date, start_time, end_time, status
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

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "สถานะไม่ถูกต้อง",
      });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบรายการจอง",
      });
    }

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