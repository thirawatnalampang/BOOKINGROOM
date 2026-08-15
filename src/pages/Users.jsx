import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users"
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }

      const data = await response.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="rooms-loading">
        กำลังโหลดข้อมูลผู้ใช้...
      </div>
    );
  }

  return (
    <div className="users-page">

      <div className="content-heading">
        <div>
          <h2>ผู้ใช้</h2>
          <p>จัดการข้อมูลผู้ใช้งานระบบ</p>
        </div>
      </div>

      <div className="panel">

        <div className="panel-header">
          <div>
            <h3>รายชื่อผู้ใช้</h3>
            <p>
              ผู้ใช้ทั้งหมด {users.length} คน
            </p>
          </div>
        </div>

        <div className="booking-table-wrapper">
          <table className="booking-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>ชื่อ-นามสกุล</th>
                <th>สิทธิ์</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    ยังไม่มีข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>

                    <td>
                      {user.id}
                    </td>

                    <td>
                      <strong>
                        {user.username}
                      </strong>
                    </td>

                    <td>
                      {user.full_name || "-"}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          user.role === "admin"
                            ? "approved"
                            : "pending"
                        }`}
                      >
                        {user.role === "admin"
                          ? "ผู้ดูแลระบบ"
                          : "ผู้ใช้งาน"}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

export default Users;