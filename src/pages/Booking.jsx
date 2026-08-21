import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

// =====================================================
// ICONS
// =====================================================

const CalendarIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="2"
    />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const UserIcon = () => (
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
      d="M20 21a8 8 0 0 0-16 0"
    />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MeetingIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="14"
      rx="2"
    />
    <path d="M8 21h8M12 18v3" />
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

const InfoIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

const UsersIcon = () => (
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
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    />
    <circle cx="9" cy="7" r="4" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
  </svg>
);

// =====================================================
// SECTION HEADER
// =====================================================

function BookingSection({
  icon,
  title,
  children,
}) {
  return (
    <section className="border-b border-gray-100 p-5 last:border-b-0 md:p-7">

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <h3 className="text-base font-bold text-gray-900">
          {title}
        </h3>

      </div>

      {children}

    </section>
  );
}

// =====================================================
// FORM INPUT
// =====================================================

function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  min,
  max,
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
        required={required}
        min={min}
        max={max}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />

    </div>
  );
}

// =====================================================
// LOADING
// =====================================================

function LoadingRoom() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-500">
            กำลังโหลดข้อมูลห้อง...
          </p>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// EMPTY ROOM
// =====================================================

function RoomNotFound() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <BuildingIcon />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-500">
              ไม่พบข้อมูลห้องประชุม
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

function Booking() {
  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const savedUser =
    localStorage.getItem("user");

  const user = savedUser
    ? JSON.parse(savedUser)
    : null;

  const roomId =
    searchParams.get("room");

  // =====================================================
  // STATE
  // =====================================================

  const [room, setRoom] =
    useState(null);

  const [loadingRoom, setLoadingRoom] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
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

  // =====================================================
  // LOAD ROOM
  // =====================================================

  useEffect(() => {
    if (!roomId) {
      setLoadingRoom(false);
      return;
    }

    const controller =
      new AbortController();

    const loadRoom = async () => {
      try {
        setLoadingRoom(true);

        const response =
          await fetch(
            `${API_URL}/rooms/${roomId}`,
            {
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            "ไม่พบห้อง"
          );
        }

        const data =
          await response.json();

        setRoom(data);
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          console.error(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRoom(false);
        }
      }
    };

    loadRoom();

    return () => {
      controller.abort();
    };
  }, [roomId]);

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
  };

  // =====================================================
  // EQUIPMENT
  // =====================================================

  const handleEquipmentChange = (e) => {
    const {
      value,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      equipment: checked
        ? [
            ...prev.equipment,
            value,
          ]
        : prev.equipment.filter(
            (item) =>
              item !== value
          ),
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(
        "กรุณาเข้าสู่ระบบก่อนจองห้องประชุม"
      );

      navigate("/login");

      return;
    }

    if (!room) {
      alert(
        "ไม่พบข้อมูลห้องประชุม"
      );

      return;
    }

    // Date validation
    if (
      form.endDate <
      form.startDate
    ) {
      alert(
        "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม"
      );

      return;
    }

    // Time validation
    if (
      form.startDate ===
        form.endDate &&
      form.endTime <=
        form.startTime
    ) {
      alert(
        "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม"
      );

      return;
    }

    // Participants validation
    if (
      Number(form.participants) >
      room.capacity
    ) {
      alert(
        `ห้องนี้รองรับได้สูงสุด ${room.capacity} คน`
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/bookings`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              user_id:
                user.id,

              booking_name:
                form.bookingName,

              room_id:
                Number(roomId),

              title:
                form.title,

              start_date:
                form.startDate,

              end_date:
                form.endDate,

              start_time:
                form.startTime,

              end_time:
                form.endTime,

              participants:
                Number(
                  form.participants
                ),

              purpose:
                form.purpose,

              equipment:
                form.equipment.join(
                  ", "
                ),

              note:
                form.note,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "ไม่สามารถจองห้องได้"
        );

        return;
      }

      alert(
        "ส่งคำขอจองห้องเรียบร้อยแล้ว"
      );

      navigate(
        "/my-bookings"
      );
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      alert(
        "ไม่สามารถเชื่อมต่อ Server ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingRoom) {
    return <LoadingRoom />;
  }

  // =====================================================
  // ROOM NOT FOUND
  // =====================================================

  if (!room) {
    return <RoomNotFound />;
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

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <CalendarIcon />
            </div>

            <div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                จองห้องประชุม
              </h2>

              <p className="mt-0.5 text-sm text-gray-500 md:text-base">
                กรอกข้อมูลเพื่อส่งคำขอจองห้องประชุม
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >

          {/* =================================================
              ROOM
          ================================================= */}

          <BookingSection
            icon={<BuildingIcon />}
            title="ข้อมูลห้องประชุม"
          >

            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <MeetingIcon />
              </div>

              <div className="min-w-0 flex-1">

                <h4 className="text-base font-bold text-gray-900">
                  {room.name}
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  {room.room_code}
                  {" · "}
                  {room.building}
                  {" · "}
                  รองรับ {room.capacity} คน
                </p>

              </div>

              <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                พร้อมใช้งาน

              </div>

            </div>

          </BookingSection>

          {/* =================================================
              DATE / TIME
          ================================================= */}

          <BookingSection
            icon={<CalendarIcon />}
            title="วันและเวลา"
          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <FormInput
                label="วันที่เริ่ม"
                name="startDate"
                type="date"
                value={
                  form.startDate
                }
                onChange={
                  handleChange
                }
                required
              />

              <FormInput
                label="วันที่สิ้นสุด"
                name="endDate"
                type="date"
                value={
                  form.endDate
                }
                onChange={
                  handleChange
                }
                required
              />

              <FormInput
                label="เวลาเริ่ม"
                name="startTime"
                type="time"
                value={
                  form.startTime
                }
                onChange={
                  handleChange
                }
                required
              />

              <FormInput
                label="เวลาสิ้นสุด"
                name="endTime"
                type="time"
                value={
                  form.endTime
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">

              <InfoIcon />

              <span>
                หากเลือกหลายวัน ระบบจะถือว่าเป็นการจอง
                ช่วงเวลาเดียวกันในแต่ละวันของช่วงวันที่เลือก
              </span>

            </div>

          </BookingSection>

          {/* =================================================
              BOOKER
          ================================================= */}

          <BookingSection
            icon={<UserIcon />}
            title="ข้อมูลผู้จอง"
          >

            <FormInput
              label="ชื่อผู้จอง"
              name="bookingName"
              placeholder="กรอกชื่อผู้จอง"
              value={
                form.bookingName
              }
              onChange={
                handleChange
              }
              required
            />

          </BookingSection>

          {/* =================================================
              MEETING DETAILS
          ================================================= */}

          <BookingSection
            icon={<UsersIcon />}
            title="รายละเอียดการประชุม"
          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* TITLE */}

              <div className="sm:col-span-2">

                <FormInput
                  label="หัวข้อการประชุม"
                  name="title"
                  placeholder="เช่น ประชุมทีมประจำสัปดาห์"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* PARTICIPANTS */}

              <FormInput
                label="จำนวนผู้เข้าร่วม"
                name="participants"
                type="number"
                min="1"
                max={room.capacity}
                placeholder={`สูงสุด ${room.capacity} คน`}
                value={
                  form.participants
                }
                onChange={
                  handleChange
                }
                required
              />

              {/* PURPOSE */}

              <div className="space-y-2">

                <label
                  htmlFor="purpose"
                  className="block text-sm font-semibold text-gray-700"
                >
                  วัตถุประสงค์
                </label>

                <select
                  id="purpose"
                  name="purpose"
                  value={
                    form.purpose
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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

              {/* EQUIPMENT */}

              <div className="sm:col-span-2">

                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  อุปกรณ์ที่ต้องการ
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                  {[
                    "Projector",
                    "TV",
                    "Whiteboard",
                    "Microphone",
                  ].map(
                    (item) => {
                      const checked =
                        form.equipment.includes(
                          item
                        );

                      return (
                        <label
                          key={item}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            checked
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                          }`}
                        >

                          <input
                            type="checkbox"
                            value={item}
                            checked={
                              checked
                            }
                            onChange={
                              handleEquipmentChange
                            }
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />

                          <span>
                            {item}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>

              </div>

              {/* NOTE */}

              <div className="sm:col-span-2">

                <label
                  htmlFor="note"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  หมายเหตุเพิ่มเติม
                </label>

                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  value={
                    form.note
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>

            </div>

          </BookingSection>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 p-5 sm:flex-row sm:justify-end md:px-7">

            <button
              type="button"
              onClick={() =>
                navigate("/rooms")
              }
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  กำลังส่งคำขอ...
                </>
              ) : (
                <>
                  <CalendarIcon />
                  ส่งคำขอจอง
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Booking;