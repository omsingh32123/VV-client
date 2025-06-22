import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import "./TopVotersPage.css";

const SERVER_URI = process.env.REACT_APP_BACKEND_URL;

function TopVotersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const { isAuthenticated, userData } = useAuth();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Fetch top voters
  useEffect(() => {
    const fetchTopVoters = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SERVER_URI}/api/users/top-voters?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        //console.error("Error fetching top voters:", error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVoters();
  }, []);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        handleSearch={() => {}}
        search=""
        getTracks={() => {}}
      />

      <div className="container-fluid mt-4">
        <h1 className="text-center main-title mb-4">
          <i className="fas fa-trophy me-2"></i>
          Most Voting Users
        </h1>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading voter rankings...</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="user-ranking-container">
                {users.length > 0 ? (
                  users.map((user, index) => {
                    const isCurrentUser = userData && userData._id === user._id;
                    
                    return (
                      <div 
                        key={user._id}
                        className={`user-card ${index < 3 ? 'top-three' : ''} ${isCurrentUser ? 'current-user' : ''}`}
                      >
                        <div className={`ranking-badge ${
                          index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
                        }`}>
                          {index + 1}
                        </div>
                        
                        {isCurrentUser && (
                          <div className="current-user-badge">
                            <i className="fas fa-user me-1"></i> You
                          </div>
                        )}
                        
                        <div className="user-card-content">
                          <div className="user-avatar">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={user.username} 
                                className="user-image" 
                              />
                            ) : (
                              <div className="user-initial">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          <div className="user-details">
                            <h3 className="user-name">{user.username}</h3>
                            
                            <div className="vote-stats">
                              <div className="stats-row">
                                <div className="stat-item">
                                  <span className="stat-label">Total Votes</span>
                                  <span className="stat-value">{user.totalVotes}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">Unique Songs</span>
                                  <span className="stat-value">{user.uniqueSongs}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">Joined</span>
                                  <span className="stat-value">
                                    {new Date(user.joinedDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="vote-breakdown">
                              <div className="vote-bar-container">
                                <div 
                                  className="vote-bar w" 
                                  style={{width: `${(user.voteDistribution.W / user.totalVotes) * 100}%`}}
                                  title={`${user.voteDistribution.W} W Votes`}
                                ></div>
                                <div 
                                  className="vote-bar mid" 
                                  style={{width: `${(user.voteDistribution.Mid / user.totalVotes) * 100}%`}}
                                  title={`${user.voteDistribution.Mid} Mid Votes`}
                                ></div>
                                <div 
                                  className="vote-bar l" 
                                  style={{width: `${(user.voteDistribution.L / user.totalVotes) * 100}%`}}
                                  title={`${user.voteDistribution.L} L Votes`}
                                ></div>
                              </div>
                              
                              <div className="vote-breakdown-text">
                                <span className="w-votes">{Math.round((user.voteDistribution.W / user.totalVotes) * 100)}% W</span>
                                <span className="mid-votes">{Math.round((user.voteDistribution.Mid / user.totalVotes) * 100)}% Mid</span>
                                <span className="l-votes">{Math.round((user.voteDistribution.L / user.totalVotes) * 100)}% L</span>
                              </div>
                            </div>
                            
                            {/* <div className="user-actions">
                              <button className="btn btn-connect" onClick={(e) => {
                                e.stopPropagation();
                                // Connect functionality will be implemented later
                                alert(`Connect with ${user.username} functionality coming soon!`);
                              }}>
                                <i className="fas fa-user-plus me-1"></i> Connect
                              </button>
                            </div> */}
                            
                            {index < 3 && (
                              <div className={`top-badge ${
                                index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
                              }`}>
                                {index === 0 ? '🏆 Top Voter' : index === 1 ? '🥈 #2 Voter' : '🥉 #3 Voter'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-list">No voter rankings available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopVotersPage; 