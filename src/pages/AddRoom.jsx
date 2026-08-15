import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddRoom() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    room_code: "",
    name: "",
    building: "",
    capacity: "",
    description: "",
    status: "available",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CHANGE FORM
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // IMAGE
  // =====================================================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "รองรับเฉพาะไฟล์ JPG, JPEG, PNG และ WEBP เท่านั้น"
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("รูปภาพต้องมีขนาดไม่เกิน 5MB");

      e.target.value = "";
      return;
    }

    // ลบ preview เดิม
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================
  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------
    // Validate
    // -----------------------------
    if (!form.room_code.trim()) {
      setError("กรุณากรอกรหัสห้อง");
      return;
    }

    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อห้องประชุม");
      return;
    }

    if (!form.building.trim()) {
      setError("กรุณากรอกอาคาร");
      return;
    }

    if (!form.capacity) {
      setError("กรุณากรอกจำนวนผู้รองรับ");
      return;
    }

    if (Number(form.capacity) <= 0) {
      setError("จำนวนผู้รองรับต้องมากกว่า 0");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "room_code",
        form.room_code.trim()
      );

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "building",
        form.building.trim()
      );

      formData.append(
        "capacity",
        form.capacity
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "status",
        form.status
      );

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://localhost:5000/api/rooms",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("ADD ROOM STATUS:", response.status);
      console.log("ADD ROOM RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "ไม่สามารถเพิ่มห้องได้"
        );
      }

      alert("เพิ่มห้องประชุมเรียบร้อยแล้ว");

      navigate("/rooms");
    } catch (error) {
      console.error("Add room error:", error);

      setError(
        error.message ||
          "ไม่สามารถเพิ่มห้องประชุมได้"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="rooms-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="content-heading">

        <div>
          <h2>เพิ่มห้องประชุม</h2>

          <p>
            เพิ่มข้อมูลห้องประชุมใหม่เข้าสู่ระบบ
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/rooms")}
          disabled={loading}
        >
          ← กลับ
        </button>

      </div>

      {/* =================================================
          FORM CARD
      ================================================= */}
      <div className="add-room-card">

        {/* ERROR */}
        {error && (
          <div className="add-room-error">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <form
          className="add-room-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              IMAGE SECTION
          ================================================= */}
          <div className="add-room-image-section">

            <div className="section-title">
              <h3>รูปห้องประชุม</h3>

              <p>
                เพิ่มรูปเพื่อให้ผู้ใช้งานเห็นภาพห้อง
              </p>
            </div>

            <div className="room-image-upload">

              {preview ? (
                <div className="room-image-preview">

                  <img
                    src={preview}
                    alt="Preview ห้องประชุม"
                  />

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    title="ลบรูป"
                  >
                    ×
                  </button>

                  <div className="image-name">
                    {image?.name}
                  </div>

                </div>
              ) : (
                <label className="image-upload-box">

                  <div className="upload-icon">
                    ＋
                  </div>

                  <strong>
                    เพิ่มรูปห้องประชุม
                  </strong>

                  <span>
                    คลิกเพื่อเลือกรูปภาพ
                  </span>

                  <small>
                    JPG, PNG หรือ WEBP
                    <br />
                    ขนาดไม่เกิน 5MB
                  </small>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={loading}
                  />

                </label>
              )}

            </div>

          </div>


          {/* =================================================
              FORM FIELDS
          ================================================= */}
          <div className="add-room-fields">

            {/* ROOM CODE */}
            <div className="form-group">

              <label>
                รหัสห้อง <span>*</span>
              </label>

              <input
                type="text"
                name="room_code"
                placeholder="เช่น RM-001"
                value={form.room_code}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* ROOM NAME */}
            <div className="form-group">

              <label>
                ชื่อห้องประชุม <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                placeholder="เช่น ห้องประชุม A"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* BUILDING */}
            <div className="form-group">

              <label>
                อาคาร <span>*</span>
              </label>

              <input
                type="text"
                name="building"
                placeholder="เช่น อาคาร 1"
                value={form.building}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* CAPACITY */}
            <div className="form-group">

              <label>
                จำนวนผู้รองรับ <span>*</span>
              </label>

              <div className="input-with-unit">

                <input
                  type="number"
                  name="capacity"
                  min="1"
                  placeholder="เช่น 20"
                  value={form.capacity}
                  onChange={handleChange}
                  disabled={loading}
                />

                <span>คน</span>

              </div>

            </div>


            {/* STATUS */}
            <div className="form-group">

              <label>
                สถานะห้อง
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={loading}
              >

                <option value="available">
                  พร้อมใช้งาน
                </option>

                <option value="disabled">
                  ปิดใช้งาน
                </option>

              </select>

            </div>


            {/* DESCRIPTION */}
            <div className="form-group full">

              <label>
                รายละเอียดห้อง
              </label>

              <textarea
                name="description"
                placeholder="เช่น มีโปรเจคเตอร์, กระดานไวท์บอร์ด, เครื่องปรับอากาศ..."
                value={form.description}
                onChange={handleChange}
                rows="5"
                disabled={loading}
              />

              <small className="field-hint">
                สามารถใส่รายละเอียดอุปกรณ์หรือสิ่งอำนวยความสะดวกของห้องได้
              </small>

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}
          <div className="add-room-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/rooms")}
              disabled={loading}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  ＋ เพิ่มห้องประชุม
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddRoom;