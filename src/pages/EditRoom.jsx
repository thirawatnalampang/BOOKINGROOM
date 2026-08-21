import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// =====================================================
// ICONS
// =====================================================

const ArrowLeftIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15 18-6-6 6-6"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="h-8 w-8"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16V4m0 0L7 9m5-5 5 5"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
    />
  </svg>
);

const ImageIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
    />

    <circle
      cx="8.5"
      cy="8.5"
      r="1.5"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 15-5-5L5 21"
    />
  </svg>
);

const PencilIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4 20 4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L6.5 16 4 20Z"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.5 6.5 3 3"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 7h16M10 11v6m4-6v6M9 7V4h6v3m-9 0 1 13h10l1-13"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5 12 4 4L19 6"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2M2 21h20"
    />
  </svg>
);

// =====================================================
// LOADING
// =====================================================

function EditRoomLoading() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-7">
          <div className="h-9 w-52 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-500">
            กำลังโหลดข้อมูลห้องประชุม...
          </p>

        </div>

      </div>
    </div>
  );
}

// =====================================================
// INPUT COMPONENT
// =====================================================

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  required = false,
  min,
}) {
  return (
    <div className="space-y-2">

      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      />

    </div>
  );
}

// =====================================================
// IMAGE UPLOAD
// =====================================================

function ImageUpload({
  preview,
  oldImage,
  roomName,
  onChange,
  onRemove,
  disabled,
}) {
  // ---------------------------------------------------
  // New image
  // ---------------------------------------------------

  if (preview) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

        <div className="relative aspect-video overflow-hidden bg-gray-100">

          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />

          <div className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
            รูปใหม่
          </div>

        </div>

        <div className="flex gap-3 p-4">

          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">

            <PencilIcon />

            เปลี่ยนรูป

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onChange}
              disabled={disabled}
              className="hidden"
            />

          </label>

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon />
            ลบรูป
          </button>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------
  // Existing image
  // ---------------------------------------------------

  if (oldImage) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

        <div className="relative aspect-video overflow-hidden bg-gray-100">

          <img
            src={`${SERVER_URL}${oldImage}`}
            alt={roomName}
            className="h-full w-full object-cover"
          />

          <div className="absolute left-3 top-3 rounded-full bg-gray-900/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            รูปปัจจุบัน
          </div>

        </div>

        <div className="p-4">

          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">

            <PencilIcon />

            เปลี่ยนรูป

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onChange}
              disabled={disabled}
              className="hidden"
            />

          </label>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------
  // No image
  // ---------------------------------------------------

  return (
    <label className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm transition group-hover:bg-emerald-100 group-hover:text-emerald-600">
        <UploadIcon />
      </div>

      <strong className="text-sm font-semibold text-gray-800">
        เพิ่มรูปห้องประชุม
      </strong>

      <span className="mt-2 text-xs leading-5 text-gray-400">
        คลิกเพื่อเลือกรูปภาพ
        <br />
        JPG, PNG หรือ WEBP
        <br />
        ขนาดไม่เกิน 5MB
      </span>

      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />

    </label>
  );
}

// =====================================================
// ERROR
// =====================================================

function ErrorMessage({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">

      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        !
      </span>

      <span>
        {error}
      </span>

    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

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
  // LOAD ROOM
  // =====================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/rooms/${id}`,
            {
              signal:
                controller.signal,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "ไม่สามารถโหลดข้อมูลห้องได้"
          );
        }

        setForm({
          room_code:
            data.room_code || "",
          name:
            data.name || "",
          building:
            data.building || "",
          capacity:
            data.capacity || "",
          description:
            data.description || "",
          status:
            data.status ||
            "available",
        });

        setOldImage(
          data.image || ""
        );
      } catch (error) {
        if (
          error.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Load room error:",
          error
        );

        setError(
          error.message ||
            "ไม่สามารถโหลดข้อมูลห้องได้"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      controller.abort();
    };
  }, [id]);

  // =====================================================
  // CLEANUP PREVIEW
  // =====================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =====================================================
  // CHANGE FORM
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // CHANGE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // Type validation
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "รองรับเฉพาะ JPG, JPEG, PNG และ WEBP"
      );

      e.target.value = "";
      return;
    }

    // Size validation
    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setError(
        "รูปภาพต้องมีขนาดไม่เกิน 5MB"
      );

      e.target.value = "";
      return;
    }

    // Revoke old preview
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    const newPreview =
      URL.createObjectURL(file);

    setImage(file);
    setPreview(newPreview);
    setError("");

    // Allow selecting same file again
    e.target.value = "";
  };

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setImage(null);
    setPreview("");
    setError("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required validation
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

    // Capacity validation
    if (
      Number(form.capacity) <= 0
    ) {
      setError(
        "จำนวนผู้รองรับต้องมากกว่า 0"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

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
        formData.append(
          "image",
          image
        );
      }

      const response =
        await fetch(
          `${API_URL}/rooms/${id}`,
          {
            method: "PUT",
            body: formData,
          }
        );

      const data =
        await response.json();

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
  // LOADING
  // =====================================================

  if (loading) {
    return <EditRoomLoading />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <PencilIcon />
              </div>

              <div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                  แก้ไขห้องประชุม
                </h2>

                <p className="mt-0.5 text-sm text-gray-500 md:text-base">
                  แก้ไขข้อมูลห้องประชุม
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/rooms")
            }
            disabled={saving}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeftIcon />
            กลับ
          </button>

        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="border-b border-gray-200 px-5 py-5 md:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BuildingIcon />
              </div>

              <div>

                <h3 className="font-semibold text-gray-900">
                  ข้อมูลห้องประชุม
                </h3>

                <p className="mt-0.5 text-sm text-gray-500">
                  แก้ไขรายละเอียดของห้องประชุม
                </p>

              </div>

            </div>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="p-5 md:p-7"
          >

            <ErrorMessage
              error={error}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">

              {/* =================================================
                  IMAGE
              ================================================= */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <ImageIcon />

                  <label className="text-sm font-semibold text-gray-700">
                    รูปห้องประชุม
                  </label>

                </div>

                <ImageUpload
                  preview={preview}
                  oldImage={oldImage}
                  roomName={form.name}
                  onChange={
                    handleImageChange
                  }
                  onRemove={
                    handleRemoveImage
                  }
                  disabled={saving}
                />

                <p className="mt-3 text-xs leading-5 text-gray-400">
                  รองรับ JPG, JPEG, PNG และ WEBP
                  <br />
                  ขนาดไฟล์ไม่เกิน 5MB
                </p>

              </div>

              {/* =================================================
                  FIELDS
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <FormField
                  label="รหัสห้อง"
                  name="room_code"
                  placeholder="เช่น RM-001"
                  value={
                    form.room_code
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

                <FormField
                  label="ชื่อห้องประชุม"
                  name="name"
                  placeholder="เช่น ห้องประชุม A"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

                <FormField
                  label="อาคาร"
                  name="building"
                  placeholder="เช่น อาคาร 1"
                  value={
                    form.building
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

                <FormField
                  label="รองรับได้"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="เช่น 20"
                  value={
                    form.capacity
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />

                {/* STATUS */}

                <div className="space-y-2 sm:col-span-2">

                  <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    สถานะ
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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

                <div className="space-y-2 sm:col-span-2">

                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    รายละเอียด
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="รายละเอียดเพิ่มเติมของห้องประชุม..."
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate("/rooms")
                }
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckIcon />

                    บันทึกการแก้ไข
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

export default EditRoom;