import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

// =====================================================
// ICONS
// =====================================================

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

    <circle
      cx="9"
      cy="7"
      r="4"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
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
    <circle
      cx="12"
      cy="8"
      r="4"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 21a8 8 0 0 1 16 0"
    />
  </svg>
);

const ShieldIcon = () => (
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
      d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9 12 2 2 4-4"
    />
  </svg>
);

// =====================================================
// LOADING
// =====================================================

function UsersLoading() {
  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-7">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-gray-500">
            กำลังโหลดข้อมูลผู้ใช้...
          </p>

        </div>

      </div>
    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyUsers() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <UsersIcon />
      </div>

      <h3 className="text-base font-semibold text-gray-800">
        ยังไม่มีข้อมูลผู้ใช้
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        ยังไม่มีผู้ใช้งานในระบบ
      </p>

    </div>
  );
}

// =====================================================
// ROLE BADGE
// =====================================================

function RoleBadge({ role }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isAdmin
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {isAdmin
        ? "ผู้ดูแลระบบ"
        : "ผู้ใช้งาน"}
    </span>
  );
}

// =====================================================
// DESKTOP TABLE
// =====================================================

function UsersTable({ users }) {
  if (users.length === 0) {
    return <EmptyUsers />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] border-collapse">

        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              ID
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Username
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              ชื่อ-นามสกุล
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              สิทธิ์
            </th>

          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">

          {users.map((user) => (
            <tr
              key={user.id}
              className="transition hover:bg-emerald-50/40"
            >

              {/* ID */}
              <td className="px-6 py-4">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-semibold text-gray-600">
                  {user.id}
                </span>
              </td>

              {/* USERNAME */}
              <td className="px-6 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <UserIcon />
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </span>

                </div>

              </td>

              {/* NAME */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {user.full_name || "-"}
              </td>

              {/* ROLE */}
              <td className="px-6 py-4">
                <RoleBadge
                  role={user.role}
                />
              </td>

            </tr>
          ))}

        </tbody>

      </table>
    </div>
  );
}

// =====================================================
// MOBILE CARD
// =====================================================

function MobileUserCard({ user }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <UserIcon />
          </div>

          <div className="min-w-0">

            <p className="truncate font-semibold text-gray-900">
              {user.username}
            </p>

            <p className="mt-0.5 truncate text-sm text-gray-500">
              {user.full_name || "-"}
            </p>

          </div>

        </div>

        <RoleBadge
          role={user.role}
        />

      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">

        <span className="text-xs text-gray-400">
          User ID
        </span>

        <p className="mt-0.5 text-sm font-medium text-gray-700">
          #{user.id}
        </p>

      </div>

    </div>
  );
}

// =====================================================
// MOBILE USERS
// =====================================================

function MobileUsers({ users }) {
  if (users.length === 0) {
    return <EmptyUsers />;
  }

  return (
    <div className="space-y-3 p-4">
      {users.map((user) => (
        <MobileUserCard
          key={user.id}
          user={user}
        />
      ))}
    </div>
  );
}

// =====================================================
// SUMMARY
// =====================================================

function UsersSummary({ users }) {
  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const normalUserCount =
    users.length - adminCount;

  const items = [
    {
      label: "ผู้ใช้ทั้งหมด",
      value: users.length,
      icon: <UsersIcon />,
      className:
        "bg-blue-50 text-blue-600",
    },
    {
      label: "ผู้ดูแลระบบ",
      value: adminCount,
      icon: <ShieldIcon />,
      className:
        "bg-emerald-50 text-emerald-600",
    },
    {
      label: "ผู้ใช้งาน",
      value: normalUserCount,
      icon: <UserIcon />,
      className:
        "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.className}`}
          >
            {item.icon}
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {item.label}
            </p>

            <p className="mt-0.5 text-2xl font-bold text-gray-900">
              {item.value}
            </p>
          </div>

        </div>
      ))}

    </div>
  );
}

// =====================================================
// MAIN
// =====================================================

function Users() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async (
    signal
  ) => {
    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/users`,
          { signal }
        );

      if (!response.ok) {
        throw new Error(
          "ไม่สามารถดึงข้อมูลผู้ใช้ได้"
        );
      }

      const data =
        await response.json();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Load users error:",
        error
      );

      setUsers([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const controller =
      new AbortController();

    loadUsers(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <UsersLoading />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <UsersIcon />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                  ผู้ใช้
                </h2>

                <p className="mt-0.5 text-sm text-gray-500 md:text-base">
                  จัดการข้อมูลผู้ใช้งานระบบ
                </p>
              </div>

            </div>
          </div>

          <div className="text-sm text-gray-500">
            ผู้ใช้ทั้งหมด{" "}
            <strong className="font-semibold text-gray-900">
              {users.length}
            </strong>{" "}
            คน
          </div>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <UsersSummary
          users={users}
        />

        {/* =================================================
            USERS PANEL
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* PANEL HEADER */}

          <div className="border-b border-gray-200 px-5 py-5 md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <UsersIcon />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  รายชื่อผู้ใช้
                </h3>

                <p className="mt-0.5 text-sm text-gray-500">
                  ผู้ใช้ทั้งหมด{" "}
                  {users.length} คน
                </p>
              </div>

            </div>

          </div>

          {/* DESKTOP */}

          <div className="hidden md:block">
            <UsersTable
              users={users}
            />
          </div>

          {/* MOBILE */}

          <div className="md:hidden">
            <MobileUsers
              users={users}
            />
          </div>

        </div>

      </div>
    </div>
  );
}

export default Users;