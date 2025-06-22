import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import "./MostVotedPage.css";

const SERVER_URI = process.env.BACKEND_URL;

function MostVotedPage() {
  const [loading, setLoading] = useState(true);
  const [wSongs, setWSongs] = useState([]);
  const [midSongs, setMidSongs] = useState([]);
  const [lSongs, setLSongs] = useState([]);
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

  // Fetch most voted songs for each category
  useEffect(() => {
    const fetchMostVotedSongs = async () => {
      setLoading(true);
      try {
        // Fetch W songs
        const wResponse = await fetch(`${SERVER_URI}/api/songs/most-voted?voteType=W&limit=50`);
        if (wResponse.ok) {
          const wData = await wResponse.json();
          setWSongs(wData);
        }

        // Fetch Mid songs
        const midResponse = await fetch(`${SERVER_URI}/api/songs/most-voted?voteType=Mid&limit=50`);
        if (midResponse.ok) {
          const midData = await midResponse.json();
          setMidSongs(midData);
        }

        // Fetch L songs
        const lResponse = await fetch(`${SERVER_URI}/api/songs/most-voted?voteType=L&limit=50`);
        if (lResponse.ok) {
          const lData = await lResponse.json();
          setLSongs(lData);
        }
      } catch (error) {
        //console.error("Error fetching most voted songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostVotedSongs();
  }, []);

  // Calculate vote percentage for each song
  const calculatePercentage = (song, voteType) => {
    const total = song.votes.L + song.votes.Mid + song.votes.W;
    if (total === 0) return 0;
    
    return Math.round((song.votes[voteType] / total) * 100);
  };

  // Render song card
  const renderSongCard = (song, voteType, index) => {
    const percentage = calculatePercentage(song, voteType);
    const colorClass = voteType === 'W' ? 'success' : voteType === 'Mid' ? 'warning' : 'danger';
    
    return (
      <div 
        key={song.id} 
        className={`song-card ${voteType.toLowerCase()}-card mb-3`}
      >
        <div className={`ranking-badge ${index === 0 ? 'top-rank' : ''}`}>
          {index === 0 ? 
            <i className={`fas fa-crown`}></i> : 
            (index + 1)}
        </div>
        <div className="song-card-content">
          <img 
            src={song.image} 
            alt={song.name} 
            className="song-image" 
          />
          <div className="song-details">
            <h5 className="song-title">{song.name}</h5>
            <p className="song-artist">{song.artist}</p>
            <div className="vote-percentage">
              <div className={`progress bg-light`}>
                <div 
                  className={`progress-bar bg-${colorClass}`} 
                  role="progressbar" 
                  style={{width: `${percentage}%`}} 
                  aria-valuenow={percentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {percentage}% {voteType}
                </div>
              </div>
              <div className="total-votes">
                <small>{song.votes[voteType]} {voteType} votes out of {song.votes.L + song.votes.Mid + song.votes.W} total</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <i className="fas fa-chart-bar me-2"></i>
          Most Voted Songs
        </h1>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading song rankings...</p>
          </div>
        ) : (
          <div className="row">
            {/* W Songs Column */}
            <div className="col-md-4">
              <div className="category-card w-category">
                <h3 className="category-title">
                  <i className="fas fa-fire me-2"></i>
                  Most W Voted
                </h3>
                <div className="category-description">
                  Songs that users consider "winners" and truly great
                </div>
                
                <div className="songs-list">
                  {wSongs.length > 0 ? (
                    wSongs.map((song, index) => renderSongCard(song, 'W', index))
                  ) : (
                    <div className="empty-list">No songs found</div>
                  )}
                </div>
              </div>
            </div>

            {/* Mid Songs Column */}
            <div className="col-md-4">
              <div className="category-card mid-category">
                <h3 className="category-title">
                  <i className="fas fa-minus me-2"></i>
                  Most Mid Voted
                </h3>
                <div className="category-description">
                  Songs that users consider average or just okay
                </div>
                
                <div className="songs-list">
                  {midSongs.length > 0 ? (
                    midSongs.map((song, index) => renderSongCard(song, 'Mid', index))
                  ) : (
                    <div className="empty-list">No songs found</div>
                  )}
                </div>
              </div>
            </div>

            {/* L Songs Column */}
            <div className="col-md-4">
              <div className="category-card l-category">
                <h3 className="category-title">
                  <i className="fas fa-thumbs-down me-2"></i>
                  Most L Voted
                </h3>
                <div className="category-description">
                  Songs that users consider less appealing
                </div>
                
                <div className="songs-list">
                  {lSongs.length > 0 ? (
                    lSongs.map((song, index) => renderSongCard(song, 'L', index))
                  ) : (
                    <div className="empty-list">No songs found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MostVotedPage; 