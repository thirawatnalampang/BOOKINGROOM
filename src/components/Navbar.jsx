function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          MEETING<span>ROOM</span>
        </div>

        <div className="menu">
          <a href="#">หน้าหลัก</a>
          <a href="#">ห้องประชุม</a>
          <a href="#">การจองของฉัน</a>
          <button className="login-btn">เข้าสู่ระบบ</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;