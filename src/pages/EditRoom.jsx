import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditRoom() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    room_code: "",
    name: "",
    building: "",
    capacity: "",
    description: "",
    status: "available",
  });

  const [oldImage, setOldImage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // โหลดข้อมูลห้อง
  // =====================================================

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/rooms/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "ไม่สามารถโหลดข้อมูลห้องได้"
          );
        }

        setForm({
          room_code: data.room_code || "",
          name: data.name || "",
          building: data.building || "",
          capacity: data.capacity || "",
          description: data.description || "",
          status: data.status || "available",
        });

        setOldImage(data.image || "");
      } catch (error) {
        console.error("Load room error:", error);

        setError(
          error.message ||
            "ไม่สามารถโหลดข้อมูลห้องได้"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id]);

  // =====================================================
  // เปลี่ยนข้อมูล
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
  // เลือกรูปใหม่
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // ตรวจสอบประเภทไฟล์
    if (!allowedTypes.includes(file.type)) {
      setError(
        "รองรับเฉพาะ JPG, JPEG, PNG และ WEBP"
      );

      e.target.value = "";
      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "รูปภาพต้องมีขนาดไม่เกิน 5MB"
      );

      e.target.value = "";
      return;
    }

    // ล้าง preview เดิม
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const newPreview =
      URL.createObjectURL(file);

    setImage(file);
    setPreview(newPreview);
    setError("");
  };

  // =====================================================
  // ยกเลิกรูปใหม่
  // =====================================================

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setError("");
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูล
    if (
      !form.room_code.trim() ||
      !form.name.trim() ||
      !form.building.trim() ||
      !form.capacity
    ) {
      setError(
        "กรุณากรอกข้อมูลที่จำเป็นให้ครบ"
      );

      return;
    }

    if (Number(form.capacity) <= 0) {
      setError(
        "จำนวนผู้รองรับต้องมากกว่า 0"
      );

      return;
    }

    try {
      setSaving(true);
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

      // ถ้าเลือกรูปใหม่
      if (image) {
        formData.append(
          "image",
          image
        );
      }

      console.log(
        "กำลังแก้ไขห้อง..."
      );

      const response = await fetch(
        `http://localhost:5000/api/rooms/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data =
        await response.json();

      console.log(
        "EDIT ROOM STATUS:",
        response.status
      );

      console.log(
        "EDIT ROOM RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "ไม่สามารถแก้ไขห้องได้"
        );
      }

      alert(
        "แก้ไขห้องประชุมเรียบร้อยแล้ว"
      );

      navigate("/rooms");

    } catch (error) {
      console.error(
        "Edit room error:",
        error
      );

      setError(
        error.message ||
          "ไม่สามารถแก้ไขห้องได้"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="rooms-page">

        <div className="rooms-loading">

          <div className="loading-spinner"></div>

          <span>
            กำลังโหลดข้อมูลห้องประชุม...
          </span>

        </div>

      </div>
    );
  }

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

          <h2>
            แก้ไขห้องประชุม
          </h2>

          <p>
            แก้ไขข้อมูลห้องประชุม
          </p>

        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/rooms")
          }
          disabled={saving}
        >
          ← กลับ
        </button>

      </div>


      {/* =================================================
          CARD
      ================================================= */}

      <div className="add-room-card">

        {/* ERROR */}

        {error && (
          <div className="add-room-error">

            <span>!</span>

            <span>
              {error}
            </span>

          </div>
        )}


        <form
          className="add-room-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="add-room-image-section">

            <label>
              รูปห้องประชุม
            </label>


            <div className="room-image-upload">

              {/* =========================================
                  เลือกรูปใหม่แล้ว
              ========================================= */}

              {preview ? (

                <div className="edit-room-image-box">

                  <img
                    src={preview}
                    alt="Preview"
                    className="edit-room-image"
                  />


                  <div className="edit-room-image-actions">

                    <label className="change-image-button">

                      เปลี่ยนรูป

                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                        disabled={saving}
                      />

                    </label>


                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={saving}
                    >
                      ลบรูป
                    </button>

                  </div>

                </div>

              ) : oldImage ? (

                /* =========================================
                    มีรูปเดิม
                ========================================= */

                <div className="edit-room-image-box">

                  <img
                    src={`http://localhost:5000${oldImage}`}
                    alt={form.name}
                    className="edit-room-image"
                  />


                  <div className="edit-room-image-actions">

                    <label className="change-image-button">

                      ✎ เปลี่ยนรูป

                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                        disabled={saving}
                      />

                    </label>

                  </div>

                </div>

              ) : (

                /* =========================================
                    ไม่มีรูป
                ========================================= */

                <label className="image-upload-box">

                  <div className="upload-icon">
                    ＋
                  </div>

                  <strong>
                    เพิ่มรูปห้อง
                  </strong>

                  <small>
                    JPG, PNG, WEBP
                    <br />
                    ขนาดไม่เกิน 5MB
                  </small>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    disabled={saving}
                  />

                </label>

              )}

            </div>

          </div>


          {/* =================================================
              FIELDS
          ================================================= */}

          <div className="add-room-fields">

            {/* ROOM CODE */}

            <div className="form-group">

              <label>
                รหัสห้อง *
              </label>

              <input
                type="text"
                name="room_code"
                placeholder="เช่น RM-001"
                value={
                  form.room_code
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />

            </div>


            {/* NAME */}

            <div className="form-group">

              <label>
                ชื่อห้องประชุม *
              </label>

              <input
                type="text"
                name="name"
                placeholder="เช่น ห้องประชุม A"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />

            </div>


            {/* BUILDING */}

            <div className="form-group">

              <label>
                อาคาร *
              </label>

              <input
                type="text"
                name="building"
                placeholder="เช่น อาคาร 1"
                value={
                  form.building
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />

            </div>


            {/* CAPACITY */}

            <div className="form-group">

              <label>
                รองรับได้ *
              </label>

              <input
                type="number"
                name="capacity"
                min="1"
                placeholder="เช่น 20"
                value={
                  form.capacity
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />

            </div>


            {/* STATUS */}

            <div className="form-group">

              <label>
                สถานะ
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
                disabled={saving}
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
                รายละเอียด
              </label>

              <textarea
                name="description"
                placeholder="รายละเอียดเพิ่มเติมของห้องประชุม..."
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                rows="5"
                disabled={saving}
              />

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="add-room-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/rooms")
              }
              disabled={saving}
            >
              ยกเลิก
            </button>


            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >

              {saving ? (
                <>
                  <span className="loading-spinner"></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  ✓ บันทึกการแก้ไข
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditRoom;