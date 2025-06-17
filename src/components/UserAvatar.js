import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./UserAvatar.css";

function UserAvatar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const viewVoteHistory = () => {
    setDropdownOpen(false);
    navigate("/vote-history");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="user-avatar-container" ref={dropdownRef}>
      <div className="user-avatar" onClick={toggleDropdown}>
        <img
          src={user.picture}
          alt={user.name}
          className="avatar-img"
          title={user.name}
        />
      </div>

      {dropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <img
              src={user.picture}
              alt={user.name}
              className="dropdown-avatar"
            />
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          {/* <div className="dropdown-divider"></div> */}
          {/* <button className="dropdown-item" onClick={viewVoteHistory}>
            <i className="fas fa-history"></i> My Vote History
          </button> */}
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
