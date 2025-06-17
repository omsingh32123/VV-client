import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import UserVoteHistory from "../../components/UserVoteHistory";
import "./VoteHistoryPage.css";

function VoteHistoryPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

      <div className="container mt-4">
        <div className="vote-history-header">
          <h2>
            <i className="fas fa-history me-3"></i>
            My Vote History
          </h2>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Songs
          </button>
        </div>

        <UserVoteHistory />
      </div>
    </div>
  );
}

export default VoteHistoryPage;
