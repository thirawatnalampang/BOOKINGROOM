const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN:", username, password);

    if (!username || !password) {
      return res.status(400).json({
        message: "กรุณากรอก Username และ Password",
      });
    }

    const result = await pool.query(
      `
      SELECT id, username, password, full_name, role
      FROM users
      WHERE username = $1
      `,
      [username.trim()]
    );

    console.log("USER FROM DB:", result.rows);

    if (result.rows.length === 0) {
      console.log("❌ ไม่พบ Username:", username);

      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง",
      });
    }

    const user = result.rows[0];

    console.log("DB PASSWORD:", user.password);
    console.log("INPUT PASSWORD:", password);

    if (String(password) !== String(user.password)) {
      console.log("❌ Password ไม่ตรง");

      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง",
      });
    }

    console.log("✅ LOGIN SUCCESS:", user.username);

    return res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "ไม่สามารถเข้าสู่ระบบได้",
    });
  }
});

module.exports = router;