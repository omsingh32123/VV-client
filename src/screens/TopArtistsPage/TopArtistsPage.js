import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import "./TopArtistsPage.css";

const SERVER_URI = process.env.BACKEND_URL || "http://localhost:5000";

function TopArtistsPage() {
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const { isAuthenticated } = useAuth();

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

  // Fetch top artists
  useEffect(() => {
    const fetchTopArtists = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SERVER_URI}/api/artists/top?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setArtists(data);
        }
      } catch (error) {
        //console.error("Error fetching top artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
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
          <i className="fas fa-users me-2"></i>
          Top Artists
        </h1>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading artist rankings...</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="artist-ranking-container">
                {artists.length > 0 ? (
                  artists.map((artist, index) => (
                    <div 
                      key={artist.id}
                      className={`artist-card ${index < 3 ? 'top-three' : ''}`}
                    >
                      <div className={`ranking-badge ${
                        index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="artist-card-content">
                        <img 
                          src={artist.image} 
                          alt={artist.name} 
                          className="artist-image" 
                        />
                        
                        <div className="artist-details">
                          <h3 className="artist-name">{artist.name}</h3>
                          
                          <div className="vote-stats">
                            <div className="stats-row">
                              <div className="stat-item">
                                <span className="stat-label">Total Votes:</span>
                                <span className="stat-value">{artist.totalVotes}</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-label">Songs:</span>
                                <span className="stat-value">{artist.songCount}</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-label">Avg. per Song:</span>
                                <span className="stat-value">
                                  {artist.songCount > 0 ? (artist.totalVotes / artist.songCount).toFixed(1) : 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="vote-breakdown">
                            <div className="vote-bar-container">
                              <div 
                                className="vote-bar w" 
                                style={{width: `${(artist.votes.W / artist.totalVotes) * 100}%`}}
                                title={`${artist.votes.W} W Votes`}
                              ></div>
                              <div 
                                className="vote-bar mid" 
                                style={{width: `${(artist.votes.Mid / artist.totalVotes) * 100}%`}}
                                title={`${artist.votes.Mid} Mid Votes`}
                              ></div>
                              <div 
                                className="vote-bar l" 
                                style={{width: `${(artist.votes.L / artist.totalVotes) * 100}%`}}
                                title={`${artist.votes.L} L Votes`}
                              ></div>
                            </div>
                            
                            <div className="vote-breakdown-text">
                              <span className="w-votes">{Math.round((artist.votes.W / artist.totalVotes) * 100)}% W</span>
                              <span className="mid-votes">{Math.round((artist.votes.Mid / artist.totalVotes) * 100)}% Mid</span>
                              <span className="l-votes">{Math.round((artist.votes.L / artist.totalVotes) * 100)}% L</span>
                            </div>
                          </div>
                          
                          {index < 3 && (
                            <div className={`top-badge ${
                              index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
                            }`}>
                              {index === 0 ? '🏆 #1 Artist' : index === 1 ? '🥈 #2 Artist' : '🥉 #3 Artist'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-list">No artist rankings available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopArtistsPage; 