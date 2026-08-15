const express = require("express");
const router = express.Router();

const pool = require("../db");

// =====================================================
// GET ผู้ใช้ทั้งหมด
// GET /api/users
// =====================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        username,
        full_name,
        role
      FROM users
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
      error: error.message,
    });
  }
});

module.exports = router;