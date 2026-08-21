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

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const newPreview = URL.createObjectURL(file);

    setImage(file);
    setPreview(newPreview);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              เพิ่มห้องประชุม
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              เพิ่มข้อมูลห้องประชุมใหม่เข้าสู่ระบบ
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← กลับ
          </button>
        </div>

        {/* =================================================
            FORM CARD
        ================================================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* ERROR */}
          {error && (
            <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >

            {/* =================================================
                IMAGE SECTION
            ================================================= */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  รูปห้องประชุม
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  เพิ่มรูปเพื่อให้ผู้ใช้งานเห็นภาพห้อง
                </p>
              </div>

              <div className="w-full">
                {preview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview ห้องประชุม"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* REMOVE */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      title="ลบรูป"
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-xl text-white backdrop-blur-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ×
                    </button>

                    {/* FILE NAME */}
                    <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {image?.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {image
                            ? `${(
                                image.size /
                                1024 /
                                1024
                              ).toFixed(2)} MB`
                            : ""}
                        </p>
                      </div>

                      <label className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                        เปลี่ยนรูป

                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageChange}
                          disabled={loading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 text-center transition hover:border-green-400 hover:bg-green-50/30">

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-gray-400 shadow-sm">
                      ＋
                    </div>

                    <strong className="text-base font-semibold text-gray-700">
                      เพิ่มรูปห้องประชุม
                    </strong>

                    <span className="mt-1 text-sm text-gray-500">
                      คลิกเพื่อเลือกรูปภาพ
                    </span>

                    <small className="mt-3 text-xs leading-5 text-gray-400">
                      JPG, PNG หรือ WEBP
                      <br />
                      ขนาดไม่เกิน 5MB
                    </small>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* =================================================
                FORM FIELDS
            ================================================= */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* ROOM CODE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รหัสห้อง{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="room_code"
                  placeholder="เช่น RM-001"
                  value={form.room_code}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* ROOM NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ชื่อห้องประชุม{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="เช่น ห้องประชุม A"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* BUILDING */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  อาคาร{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="building"
                  placeholder="เช่น อาคาร 1"
                  value={form.building}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* CAPACITY */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  จำนวนผู้รองรับ{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    placeholder="เช่น 20"
                    value={form.capacity}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    คน
                  </span>
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  สถานะห้อง
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รายละเอียดห้อง
                </label>

                <textarea
                  name="description"
                  placeholder="เช่น มีโปรเจคเตอร์, กระดานไวท์บอร์ด, เครื่องปรับอากาศ..."
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  สามารถใส่รายละเอียดอุปกรณ์หรือสิ่งอำนวยความสะดวกของห้องได้
                </p>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/rooms")}
                disabled={loading}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
    </div>
  );
}

export default AddRoom;