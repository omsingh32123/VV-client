import React from "react";
import { Link, useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import "./Header.css";

function Header({ toggleDarkMode, darkMode, handleSearch, search, getTracks }) {
  const navigate = useNavigate();
  
  return (
    <>
      <nav className={`navbar ${darkMode ? 'bg-dark navbar-gradient-dark' : 'navbar-gradient-light'}`}>
        <div className="container-fluid d-flex align-items-center">
          <Link className="navbar-brand" to="/">
            <img src="/logo.svg" alt="VibeVote Logo" className="logo" />
            <span>VibeVote</span>
          </Link>

          <div className="flex-grow-1 mx-3">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="form-control search-input"
                type="search"
                placeholder="Search for songs..."
                aria-label="Search"
              />
            </div>
          </div>

          <button
            onClick={() => getTracks(true)}
            className="btn btn-primary me-2"
          >
            <i className="fas fa-music me-1"></i> Find Tracks
          </button>

          <button
            onClick={toggleDarkMode}
            className="btn btn-outline-secondary theme-toggle me-2"
          >
            <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
            {darkMode ? "Light" : "Dark"}
          </button>

          <UserAvatar />
        </div>
      </nav>
      
      {/* Navigation Buttons Row */}
      <div className={`nav-buttons-container ${darkMode ? 'navbar-gradient-dark' : 'navbar-gradient-light'} py-2`}>
        <div className="container-fluid d-flex justify-content-center">
          <button 
            className="btn btn-outline-primary mx-2"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-fire me-1"></i> Trending
          </button>
          <button 
            className="btn btn-outline-primary mx-2"
            onClick={() => navigate('/most-voted')}
          >
            <i className="fas fa-chart-bar me-1"></i> Most Voted Songs
          </button>
          <button 
            className="btn btn-outline-primary mx-2"
            onClick={() => navigate('/top-artists')}
          >
            <i className="fas fa-users me-1"></i> Top Artists
          </button>
          <button 
            className="btn btn-outline-primary mx-2"
            onClick={() => navigate('/top-voters')}
          >
            <i className="fas fa-trophy me-1"></i> Most Voting Users
          </button>
          <button 
            className="btn btn-outline-primary mx-2"
            onClick={() => navigate('/beefs')}
          >
            <i className="fas fa-bolt me-1"></i> Rap Beefs
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
