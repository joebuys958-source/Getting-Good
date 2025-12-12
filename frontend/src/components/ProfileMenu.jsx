import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const email = user?.email || "user@email.com";
  const initial = email.charAt(0).toUpperCase();

  /* ---------------- Outside Click ---------------- */

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* ---------------- Close Animation ---------------- */

  function closeMenu() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }

  /* ---------------- Logout ---------------- */

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch {
      alert("Logout failed");
    }
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: 18,
        right: 22,
        zIndex: 50,
      }}
    >
      {/* Profile pill */}
      <div
        className={`glass profile-pill ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="profile-avatar">{initial}</div>
        <span style={{ fontSize: 14 }}>{email}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={`glass profile-dropdown ${
            closing ? "closing" : ""
          }`}
          style={{
            marginTop: 10,
            minWidth: 220,
            padding: 12,
            borderRadius: 18,
          }}
        >
          <div
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginBottom: 10,
            }}
          >
            Account
          </div>

          <div className="profile-item">💳 Subscription</div>
          <div className="profile-item">📄 Billing & Invoices</div>
          <div className="profile-item">⚙️ Account Settings</div>

          <div
            className="profile-item"
            style={{ color: "#ff9f1c", marginTop: 6 }}
            onClick={handleLogout}
          >
            🚪 Logout
          </div>
        </div>
      )}
    </div>
  );
}
