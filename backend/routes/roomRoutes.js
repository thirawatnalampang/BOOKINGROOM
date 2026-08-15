const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pool = require("../db");

// =====================================================
// UPLOAD CONFIG
// =====================================================

const uploadDir = path.join(
  __dirname,
  "../uploads/rooms"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDir
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {

      const ext =
        path.extname(
          file.originalname
        );

      const fileName =
        `room-${Date.now()}-${Math.round(
          Math.random() * 100000
        )}${ext}`;

      cb(
        null,
        fileName
      );
    },
  });

const upload = multer({

  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "รองรับเฉพาะ JPG, JPEG, PNG และ WEBP"
        )
      );
    }
  },
});

// =====================================================
// GET ALL ROOMS
// =====================================================

router.get(
  "/",
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM rooms
          ORDER BY id ASC
        `);

      res.json(
        result.rows
      );

    } catch (error) {

      console.error(
        "Get rooms error:",
        error
      );

      res.status(500).json({
        message:
          "ไม่สามารถดึงข้อมูลห้องประชุมได้",
        error:
          error.message,
      });
    }
  }
);

// =====================================================
// GET ROOM BY ID
// =====================================================

router.get(
  "/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const result =
        await pool.query(
          `
          SELECT *
          FROM rooms
          WHERE id = $1
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "ไม่พบห้องประชุม",
          });
      }

      res.json(
        result.rows[0]
      );

    } catch (error) {

      console.error(
        "Get room error:",
        error
      );

      res.status(500).json({
        message:
          "ไม่สามารถดึงข้อมูลห้องประชุมได้",
        error:
          error.message,
      });
    }
  }
);

// =====================================================
// POST CREATE ROOM
// =====================================================

router.post(
  "/",
  upload.single("image"),
  async (req, res) => {

    try {

      console.log(
        "========== ADD ROOM =========="
      );

      console.log(
        "BODY:",
        req.body
      );

      console.log(
        "FILE:",
        req.file
      );

      const {
        room_code,
        name,
        building,
        capacity,
        description,
        status,
      } = req.body;

      // =================================================
      // VALIDATE
      // =================================================

      if (
        !room_code?.trim() ||
        !name?.trim() ||
        !building?.trim() ||
        !capacity
      ) {

        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res
          .status(400)
          .json({
            message:
              "กรุณากรอกข้อมูลห้องให้ครบ",
          });
      }

      // =================================================
      // IMAGE
      // =================================================

      let image = null;

      if (req.file) {

        image =
          `/uploads/rooms/${req.file.filename}`;
      }

      // =================================================
      // INSERT
      // =================================================

      const result =
        await pool.query(
          `
          INSERT INTO rooms
          (
            room_code,
            name,
            building,
            capacity,
            description,
            image,
            status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING *
          `,
          [
            room_code.trim(),
            name.trim(),
            building.trim(),
            Number(capacity),
            description
              ? description.trim()
              : "",
            image,
            status ||
              "available",
          ]
        );

      console.log(
        "ROOM CREATED:",
        result.rows[0]
      );

      res
        .status(201)
        .json({
          message:
            "เพิ่มห้องประชุมสำเร็จ",
          room:
            result.rows[0],
        });

    } catch (error) {

      console.error(
        "Create room error:",
        error
      );

      if (req.file) {

        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      // รหัสห้องซ้ำ

      if (
        error.code ===
        "23505"
      ) {

        return res
          .status(409)
          .json({
            message:
              "รหัสห้องนี้มีอยู่แล้ว",
          });
      }

      res
        .status(500)
        .json({
          message:
            "ไม่สามารถเพิ่มห้องประชุมได้",
          error:
            error.message,
        });
    }
  }
);

// =====================================================
// DELETE ROOM
// =====================================================

router.delete(
  "/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      // หา room ก่อน

      const roomResult =
        await pool.query(
          `
          SELECT *
          FROM rooms
          WHERE id = $1
          `,
          [id]
        );

      if (
        roomResult.rows.length === 0
      ) {

        return res
          .status(404)
          .json({
            message:
              "ไม่พบห้องประชุม",
          });
      }

      const room =
        roomResult.rows[0];

      // ลบ DB

      const result =
        await pool.query(
          `
          DELETE FROM rooms
          WHERE id = $1
          RETURNING *
          `,
          [id]
        );

      // ลบรูป

      if (room.image) {

        const imagePath =
          path.join(
            __dirname,
            "..",
            room.image
          );

        if (
          fs.existsSync(
            imagePath
          )
        ) {

          fs.unlink(
            imagePath,
            () => {}
          );
        }
      }

      res.json({
        message:
          "ลบห้องประชุมสำเร็จ",
        room:
          result.rows[0],
      });

    } catch (error) {

      console.error(
        "Delete room error:",
        error
      );

      // มี booking อยู่

      if (
        error.code ===
        "23503"
      ) {

        return res
          .status(409)
          .json({
            message:
              "ไม่สามารถลบห้องนี้ได้ เนื่องจากมีรายการจองที่เกี่ยวข้อง",
          });
      }

      res
        .status(500)
        .json({
          message:
            "ไม่สามารถลบห้องประชุมได้",
          error:
            error.message,
        });
    }
  }
);

// =====================================================
// MULTER ERROR
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Room route error:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {

      return res
        .status(400)
        .json({
          message:
            error.code ===
            "LIMIT_FILE_SIZE"
              ? "รูปภาพต้องมีขนาดไม่เกิน 5MB"
              : error.message,
        });
    }

    if (error) {

      return res
        .status(400)
        .json({
          message:
            error.message ||
            "เกิดข้อผิดพลาด",
        });
    }

    next();
  }
);
// =====================================================
// PUT แก้ไขห้อง
// =====================================================

router.put(
  "/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        room_code,
        name,
        building,
        capacity,
        description,
        status,
      } = req.body;

      // ===============================================
      // ตรวจสอบข้อมูล
      // ===============================================

      if (
        !room_code ||
        !name ||
        !building ||
        !capacity
      ) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }

        return res.status(400).json({
          message:
            "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
        });
      }

      if (Number(capacity) <= 0) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }

        return res.status(400).json({
          message:
            "จำนวนผู้รองรับต้องมากกว่า 0",
        });
      }

      // ===============================================
      // หา room เดิม
      // ===============================================

      const roomResult = await pool.query(
        `
        SELECT *
        FROM rooms
        WHERE id = $1
        `,
        [id]
      );

      if (roomResult.rows.length === 0) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }

        return res.status(404).json({
          message:
            "ไม่พบห้องประชุม",
        });
      }

      const oldRoom = roomResult.rows[0];

      // ===============================================
      // รูปภาพ
      // ===============================================

      let image = oldRoom.image;

      // ถ้ามีรูปใหม่
      if (req.file) {
        image =
          `/uploads/rooms/${req.file.filename}`;
      }

      // ===============================================
      // UPDATE DATABASE
      // ===============================================

      const result = await pool.query(
        `
        UPDATE rooms
        SET
          room_code = $1,
          name = $2,
          building = $3,
          capacity = $4,
          description = $5,
          image = $6,
          status = $7
        WHERE id = $8
        RETURNING *
        `,
        [
          room_code.trim(),
          name.trim(),
          building.trim(),
          Number(capacity),
          description || "",
          image,
          status || "available",
          id,
        ]
      );

      // ===============================================
      // ถ้ามีรูปใหม่ → ลบรูปเก่า
      // ===============================================

      if (
        req.file &&
        oldRoom.image
      ) {
        const oldImagePath =
          path.join(
            __dirname,
            "..",
            oldRoom.image
          );

        if (
          fs.existsSync(oldImagePath)
        ) {
          fs.unlink(
            oldImagePath,
            (error) => {
              if (error) {
                console.error(
                  "ลบรูปเก่าไม่สำเร็จ:",
                  error
                );
              }
            }
          );
        }
      }

      // ===============================================
      // RESPONSE
      // ===============================================

      res.status(200).json({
        message:
          "แก้ไขห้องประชุมสำเร็จ",
        room: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update room error:",
        error
      );

      // ถ้า DB error และมีรูปใหม่
      // ลบรูปใหม่ทิ้ง
      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      // room_code ซ้ำ
      if (
        error.code === "23505"
      ) {
        return res.status(409).json({
          message:
            "รหัสห้องนี้มีอยู่แล้ว",
        });
      }

      res.status(500).json({
        message:
          "ไม่สามารถแก้ไขห้องประชุมได้",
        error: error.message,
      });
    }
  }
);
module.exports = router;