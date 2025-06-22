import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import axios from "axios";
const SERVER_URI = process.env.BACKEND_URL;
const socket = io(SERVER_URI);


function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, userData, loadUserVotes, saveUserVote, userVotesCache, logout } =  useAuth();
  const [tracks, setTracks] = useState([]);
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState({}); // Track which songs the user has voted on 
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const searchTimeout = useRef(null);
  

  // Modal state
  const [selectedSong, setSelectedSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [songVoters, setSongVoters] = useState({ L: [], Mid: [], W: [] });
  const [loadingVoters, setLoadingVoters] = useState(false);
  

  // Check authentication and initialize user votes from cache
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } 
  }, [isAuthenticated]);

  useEffect(() => {
    if (!userData && !isAuthenticated()) {
      navigate("/login");
    } else if (!userData && isAuthenticated()) {
      logout();
    }
  }, [userData]);

  // Always load user votes when component mounts and the user is authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadUserVotesHistory();
    }
  }, []);

  // Load user's previous votes
  const loadUserVotesHistory = async () => {
    if (!user || !user.id) return;
    
    try {
      const userVotesData = await loadUserVotes(userData._id);
      if (userVotesData && Object.keys(userVotesData).length > 0) {
        setUserVotes(userVotesData);
      }
    } catch (error) {
      //console.error("Error loading user vote history");
    }
  };

  // Fetch voters for the selected song
  const fetchSongVoters = async (trackId) => {
    if (!trackId) return;
    
    setLoadingVoters(true);
    try {
      const response = await fetch(`${SERVER_URI}/api/songs/voters/${trackId}`);
      if (response.ok) {
        const data = await response.json();
        setSongVoters(data);
      } else {
        setSongVoters({ L: [], Mid: [], W: [] });
      }
    } catch (error) {
      //console.error("Error fetching song voters");
      setSongVoters({ L: [], Mid: [], W: [] });
    } finally {
      setLoadingVoters(false);
    }
  };

  // Save darkMode value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    // Apply dark mode class to body element for full page effect
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Apply appropriate class for modal open state
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [darkMode, showModal]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply modal-open class when modal is shown
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  // Check if user has already voted on a track
  const fetchUserVoteStatus = async (trackId) => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(`${SERVER_URI}/api/songs/is-song-voted`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId: trackId,
          userId: userData.id
        }),
      });
      if (!response.ok) return;

      const data = await response.json();
      if (data.hasVoted) {
        setUserVotes((prev) => ({
          ...prev,
          [trackId]: data.voteType,
        }));
      }
    } catch (error) {
      //console.error("Error checking user vote status");
    }
  };

  // Load user votes when tracks change
  useEffect(() => {
    if (isAuthenticated() && tracks.length > 0) {
      tracks.forEach((track) => {
        fetchUserVoteStatus(track.id);
      });
    }
  }, [tracks, isAuthenticated]);

  // Listen for socket events
  useEffect(() => {
    // Listen for incoming vote updates
    socket.on("voteUpdate", (data) => {
      const trackID = data?.trackId;
      const updatedVotes = data?.votes;

      if (trackID !== undefined && updatedVotes !== undefined) {
        setVotes((prev) => ({ ...prev, [trackID]: updatedVotes }));

        // Update selected song votes if it's currently displayed in modal
        if (selectedSong && selectedSong.id === trackID) {
          setSelectedSong((prev) => ({
            ...prev,
            votes: updatedVotes,
          }));
          
          // Refresh voters list when a new vote is cast
          fetchSongVoters(trackID);
        }
      }
    });

    return () => {
      socket.off("voteUpdate"); // Cleanup on unmount
    };
  }, [selectedSong]);

  // Initial load
  useEffect(() => {
    setOffset(0); // Reset offset on initial load
    getSpotifyTracks(true);
  }, []); // Empty dependency array for initial load only

  const getSpotifyTracks = async (newSearch = false, limit=10) => {
    if (loading) {
      return;
    }
    
    setLoading(true);
    try {
      const query = search.length !== 0 ? search : "Trending";
      // Reset offset to 0 for new searches
      if (newSearch) {
        setOffset(0);
      }
      
      const response = await fetch(`${SERVER_URI}/api/spotify/search?query=${query}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        // //console.error("Error response:", response.status, errorData);
        if (response.status === 429) {
          alert("Rate limit exceeded. Please try again in a few moments.");
        } else {
          alert("Error loading tracks. Please try again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.length === 0) {
        setLoading(false);
        return;
      }
      
      // Only append new tracks if we're not doing a new search
      if (newSearch) {
        // //console.log("Setting new tracks for search");
        setTracks(data);
      } else {
        // //console.log("Appending new tracks to existing ones");
        setTracks(prevTracks => [...prevTracks, ...data]);
      }
      
      // Update offset for next fetch
      const newOffset = offset + data.length;
      // //console.log("Updating offset to:", newOffset);
      setOffset(newOffset);

      // Fetch votes for new tracks
      // //console.log("Fetching votes for new tracks");
      data.forEach((track) => fetchVotes(track.id));

      // Check user vote status for new tracks
      if (isAuthenticated()) {
        // //console.log("Fetching user vote status for new tracks");
        data.forEach((track) =>
          fetchUserVoteStatus(track.id)
        );
      }
    } catch (error) {
      //console.error("Error in getSpotifyTracks:", error);
    } finally {
      //console.log("Finished loading tracks");
      setLoading(false);
    }
  };

  const fetchVotes = async (trackId) => {
    try {
      const response = await fetch(`${SERVER_URI}/api/songs/song-votes/${trackId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      //console.log(response);
      if (!response.ok) {
        setVotes((prev) => ({ ...prev, [trackId]: { L: 0, Mid: 0, W: 0 } }));
        return;
      } else {
        const data = await response.json();
        //console.log(data);
        
        setVotes((prev) => ({ ...prev, [trackId]: { 
          L: data?.votes?.Lvotes?.length, 
          Mid: data?.votes?.Midvotes?.length,
          W: data?.votes?.Wvotes?.length
        }}));
      }
    } catch (error) {
      //console.error("Error fetching votes:", error);
    }
  };

  const handleVote = async (trackId, voteType) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${SERVER_URI}/api/songs/cast-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId,
          userId: userData._id,
          voteType
        }),
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        alert(errorData.message);
        return;
      }

      const updatedVotes = await response.json();
      if(updatedVotes.hasVoted) {
        setVotes((prev) => ({ ...prev, [trackId]: updatedVotes.votes }));
      }
      

      // Update user votes record locally AND in cache
      const newUserVotes = saveUserVote(user.id, trackId, voteType);
      setUserVotes(newUserVotes);

      // Update selected song votes if it's currently displayed in modal
      if (selectedSong && selectedSong.id === trackId) {
        setSelectedSong((prev) => ({
          ...prev,
          votes: updatedVotes.votes,
        }));
      }
    } catch (error) {
      //console.error("Error voting:", error);
      alert("Error casting vote. Please try again.");
    }
  };

  // Open song details modal
  const openSongDetails = (track) => {
    const trackVotes = votes[track.id] || { L: 0, Mid: 0, W: 0 };
    setSelectedSong({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      artistId: track.artists[0].id,
      album: track.album.name,
      releaseDate: track.album.release_date,
      image: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      votes: trackVotes,
      popularity: track.popularity,
      external_url: track.external_urls.spotify,
      duration: track.duration_ms,
    });

    // Check if the user has already voted on this track
    if (isAuthenticated() && user && !userVotes[track.id]) {
      fetchUserVoteStatus(track.id);
    }
    
    // Fetch voters for this song
    fetchSongVoters(track.id);

    // Add a small delay to allow animations to work properly
    setTimeout(() => {
      setShowModal(true);
    }, 50);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedSong(null);
    }, 300); // Wait for closing animation
  };

  // Handle background click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Infinite Scroll Logic
  useEffect(() => {
    //console.log("Setting up infinite scroll observer");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          //console.log("Load more trigger intersected, loading more tracks...");
          getSpotifyTracks(false);
        }
      },
      { threshold: 0.1 }
    );

    const loadMoreTrigger = document.getElementById("load-more-trigger");
    if (loadMoreTrigger) {
      //console.log("Observing load more trigger");
      observer.observe(loadMoreTrigger);
    } else {
      //console.log("Load more trigger element not found");
    }

    return () => {
      if (loadMoreTrigger) {
        //console.log("Cleaning up observer");
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [loading, tracks]); // Add tracks as dependency

  // Debounce Search Input
  useEffect(() => {
    if (searchTimeout.current) {
      //console.log("Clearing existing search timeout");
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      if (search.trim()) {
        //console.log("Search timeout triggered, searching for:", search);
        setOffset(0); // Reset offset on new search
        getSpotifyTracks(true);
      }
    }, 500);
  }, [search]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  // Render voter avatars for a specific vote type
  

  const VotersList = ({ voteType, trackId }) => {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchVoters = async () => {
        try {
          setLoading(true);
          //console.log("Fetching voters for trackId:", trackId, "voteType:", voteType);
          
          // Use the correct API endpoint with SERVER_URI
          const response = await fetch(`${SERVER_URI}/api/songs/voters/${trackId}?voteType=${voteType}`);

          
          if (!response.ok) {
            //console.error(`Error response: ${response.status}`);
            setVoters([]);
            setLoading(false);
            return;
          }
          
          const data = await response.json();
          //console.log("Voters data received:", data);
          
          const filteredVoters = data.filter(voter => voter.voteType === voteType);

          setVoters(filteredVoters||[]);
          //console.log("voters", voters);
          setLoading(false);
        } catch (error) {
          //console.error("Error fetching voters:", error);
          setVoters([]);
          setLoading(false);
        }
      };
  
      if (trackId) {
        fetchVoters();
      }
    }, [voteType, trackId]);
  
    if (loading) {
      return (
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading voters...</span>
          </div>
          <span className="ms-2">Loading voters...</span>
        </div>
      );
    }
  
    if (voters.length === 0) {
      return (
        <div className="text-center text-muted p-3">
          <i className="fas fa-user-slash me-2"></i>
          No {voteType} votes yet
        </div>
      );
    }
  
    const typeClass = voteType === "W" ? "success" : voteType === "Mid" ? "warning" : "danger";
  
    return (
      <div className="voters-grid-container">
        <div className="voters-grid">
          {voters.map((voter) => (
            <div key={voter.id} className="voter-card">
              <div className="voter-avatar-container">
                {voter.picture ? (
                  <img
                    src={voter.picture}
                    alt={voter.name}
                    className={`voter-avatar border-${typeClass} aspect-square`}
                  />
                ) : (
                  <div className={`voter-avatar-placeholder bg-${typeClass}`}>
                    {voter.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="voter-name">{voter.name}</span>
              {/* <button className={`btn btn-sm btn-outline-${typeClass} connect-btn`}>
                <i className="fas fa-user-plus me-1"></i>
                Connect
              </button> */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        handleSearch={handleSearch}
        search={search}
        getTracks={getSpotifyTracks}
        // getTracks={getTracks}
      />

      <div className="container-fluid mt-4">
        <div className="row collage-layout">
          {tracks.map((track, index) => {
            const trackVotes = votes[track.id] || { L: 1, Mid: 1, W: 1 };
            const totalVotes = trackVotes.L + trackVotes.Mid + trackVotes.W;
            const percentages = {
              L: (trackVotes.L / totalVotes) * 100,
              Mid: (trackVotes.Mid / totalVotes) * 100,
              W: (trackVotes.W / totalVotes) * 100,
            };

            // Determine the size class of the item based on index and popularity
            let sizeClass = "";
            if (index % 10 === 0 || track.popularity > 80) {
              sizeClass = "featured"; // Large square - spans 2x2
            } else if (index % 7 === 0 || track.popularity > 70) {
              sizeClass = "horizontal"; // Wide rectangle - spans 2x1
            } else if (index % 5 === 0 || track.popularity > 75) {
              sizeClass = "vertical"; // Tall rectangle - spans 1x2
            }

            return (
              <div
                key={track.id}
                className={`collage-item ${sizeClass}`}
                onClick={() => openSongDetails(track)}
              >
                <div className="collage-image-container">
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="collage-image"
                  />
                  <div className="collage-content">
                    <h5 className="collage-title">{track.name}</h5>
                    <p className="collage-artist">
                      <i className="fas fa-user-circle me-1"></i>
                      {track.artists[0].name}
                    </p>

                    <div className="collage-votes">
                      <div
                        className="collage-votes-bar l"
                        style={{ width: `${percentages.L}%` }}
                      ></div>
                      <div
                        className="collage-votes-bar mid"
                        style={{ width: `${percentages.Mid}%` }}
                      ></div>
                      <div
                        className="collage-votes-bar w"
                        style={{ width: `${percentages.W}%` }}
                      ></div>
                    </div>

                    <div className="collage-action">
                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSongDetails(track);
                        }}
                      >
                        <i className="fas fa-info-circle me-1"></i> Details
                      </button>

                      {userVotes[track.id] ? (
                        <div className="voted-status mt-2">
                          <span
                            className={`badge bg-${
                              userVotes[track.id] === "L"
                                ? "danger"
                                : userVotes[track.id] === "Mid"
                                ? "warning"
                                : "success"
                            }`}
                          >
                            Voted: {userVotes[track.id]}
                          </span>
                        </div>
                      ) : (
                        <div className="btn-group mt-2">
                          <button
                            className="btn btn-sm btn-danger vote-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(track.id,"L");
                            }}
                          >
                            L
                          </button>
                          <button
                            className="btn btn-sm btn-warning vote-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(track.id,"Mid");
                            }}
                          >
                            Mid
                          </button>
                          <button
                            className="btn btn-sm btn-success vote-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(track.id,"W");
                            }}
                          >
                            W
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div id="load-more-trigger" style={{ height: "10px" }}></div>
        {loading && (
          <div className="loading-indicator">
            <i className="fas fa-compact-disc fa-spin me-2"></i>
            Loading tracks
          </div>
        )}
      </div>

      {/* Song Details Modal */}
      {selectedSong && (
        <div
          className={`modal-backdrop ${showModal ? "show" : ""}`}
          onClick={handleBackdropClick}
        >
          <div className={`song-modal ${showModal ? "show" : ""}`}>
            <button className="modal-close-btn" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-content p-4">
              <div className="row">
                <div className="col-lg-4">
                  <img
                    src={selectedSong.image}
                    alt={selectedSong.name}
                    className="img-fluid modal-image w-100"
                  />

                  {selectedSong.previewUrl && (
                    <div className="mt-4">
                      <h5>
                        <i className="fas fa-headphones me-2"></i>Preview
                      </h5>
                      <audio
                        src={selectedSong.previewUrl}
                        controls
                        className="w-100 mt-2"
                      ></audio>
                    </div>
                  )}
                </div>

                <div className="col-lg-8">
                  <div className="song-details">
                    <h2 className="mb-2">
                      <i className="fas fa-music me-2"></i>
                      {selectedSong.name}
                    </h2>

                    <h4 className="text-muted mb-4">
                      <i className="fas fa-user me-2"></i>
                      {selectedSong.artist}
                    </h4>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="stats-card">
                          <h5>
                            <i className="fas fa-compact-disc me-2"></i>Album
                          </h5>
                          <p className="mb-0">{selectedSong.album}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="stats-card">
                          <h5>
                            <i className="fas fa-calendar-alt me-2"></i>Release
                            Date
                          </h5>
                          <p className="mb-0">{selectedSong.releaseDate}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="stats-card">
                          <h5>
                            <i className="fas fa-clock me-2"></i>Duration
                          </h5>
                          <p className="mb-0">
                            {formatDuration(selectedSong.duration)}
                          </p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="stats-card">
                          <h5>
                            <i className="fas fa-chart-line me-2"></i>Popularity
                          </h5>
                          <div className="progress mt-2">
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${selectedSong.popularity}%` }}
                            >
                              {selectedSong.popularity}/100
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="song-stats">
                      <div className="stats-card">
                        <h5 className="mb-3">
                          <i className="fas fa-vote-yea me-2"></i>Vote
                          Statistics
                        </h5>

                        <div className="vote-stat-container">
                          <div className="vote-stat-label l">
                            <i className="fas fa-thumbs-down"></i>L Votes
                          </div>
                          <div className="vote-stat-bar">
                            <div
                              className="vote-stat-fill l"
                              style={{
                                width: `${
                                  (selectedSong.votes.L /
                                    (selectedSong.votes.L +
                                      selectedSong.votes.Mid +
                                      selectedSong.votes.W)) *
                                  100
                                }%`,
                              }}
                            >
                              <span className="vote-stat-value">
                                {selectedSong.votes.L}
                              </span>
                            </div>
                          </div>

                          <div className="vote-stat-label mid">
                            <i className="fas fa-minus"></i>
                            Mid Votes
                          </div>
                          <div className="vote-stat-bar">
                            <div
                              className="vote-stat-fill mid"
                              style={{
                                width: `${
                                  (selectedSong.votes.Mid /
                                    (selectedSong.votes.L +
                                      selectedSong.votes.Mid +
                                      selectedSong.votes.W)) *
                                  100
                                }%`,
                              }}
                            >
                              <span className="vote-stat-value">
                                {selectedSong.votes.Mid}
                              </span>
                            </div>
                          </div>

                          <div className="vote-stat-label w">
                            <i className="fas fa-fire"></i>W Votes
                          </div>
                          <div className="vote-stat-bar">
                            <div
                              className="vote-stat-fill w"
                              style={{
                                width: `${
                                  (selectedSong.votes.W /
                                    (selectedSong.votes.L +
                                      selectedSong.votes.Mid +
                                      selectedSong.votes.W)) *
                                  100
                                }%`,
                              }}
                            >
                              <span className="vote-stat-value">
                                {selectedSong.votes.W}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-center my-3">
                          <i className="fas fa-chart-bar me-2"></i>
                          Total Votes:{" "}
                          <strong>
                            {selectedSong.votes.L +
                              selectedSong.votes.Mid +
                              selectedSong.votes.W}
                          </strong>
                        </p>
                        
                        {/* Voters Section */}
                        <h5 className="mb-3 mt-4">
                          <i className="fas fa-users me-2"></i>Who Voted
                        </h5>
                        
                        <div className="voters-section">
                          <ul className="nav nav-tabs" id="votersTab" role="tablist">
                            <li className="nav-item" role="presentation">
                              <button 
                                className="nav-link active" 
                                id="w-voters-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#w-voters" 
                                type="button" 
                                role="tab" 
                                aria-controls="w-voters" 
                                aria-selected="true"
                              >
                                <i className="fas fa-fire text-success me-1"></i>
                                W <span className="badge bg-success ms-1">{selectedSong.votes.W}</span>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button 
                                className="nav-link" 
                                id="mid-voters-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#mid-voters" 
                                type="button" 
                                role="tab" 
                                aria-controls="mid-voters" 
                                aria-selected="false"
                              >
                                <i className="fas fa-minus text-warning me-1"></i>
                                Mid <span className="badge bg-warning ms-1">{selectedSong.votes.Mid}</span>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button 
                                className="nav-link" 
                                id="l-voters-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#l-voters" 
                                type="button" 
                                role="tab" 
                                aria-controls="l-voters" 
                                aria-selected="false"
                              >
                                <i className="fas fa-thumbs-down text-danger me-1"></i>
                                L <span className="badge bg-danger ms-1">{selectedSong.votes.L}</span>
                              </button>
                            </li>
                          </ul>
                          <div className="tab-content" id="votersTabContent">
                            <div 
                              className="tab-pane fade show active" 
                              id="w-voters" 
                              role="tabpanel" 
                              aria-labelledby="w-voters-tab"
                            >
                              <div className="voters-container">
                              <VotersList voteType="W" trackId={selectedSong.id} />
                              </div>
                            </div>
                            <div 
                              className="tab-pane fade" 
                              id="mid-voters" 
                              role="tabpanel" 
                              aria-labelledby="mid-voters-tab"
                            >
                              <div className="voters-container">
                              <VotersList voteType="Mid" trackId={selectedSong.id} />
                              </div>
                            </div>
                            <div 
                              className="tab-pane fade" 
                              id="l-voters" 
                              role="tabpanel" 
                              aria-labelledby="l-voters-tab"
                            >
                              <div className="voters-container">
                              <VotersList voteType="L" trackId={selectedSong.id} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <h5 className="mb-3 mt-4">
                          <i className="fas fa-star me-2"></i>Cast Your Vote
                        </h5>
                        {userVotes[selectedSong.id] ? (
                          <div className="already-voted">
                            <div
                              className={`alert alert-${
                                userVotes[selectedSong.id] === "L"
                                  ? "danger"
                                  : userVotes[selectedSong.id] === "Mid"
                                  ? "warning"
                                  : "success"
                              } text-center`}
                            >
                              <i
                                className={`fas fa-${
                                  userVotes[selectedSong.id] === "L"
                                    ? "thumbs-down"
                                    : userVotes[selectedSong.id] === "Mid"
                                    ? "minus"
                                    : "fire"
                                } me-2`}
                              ></i>
                              You've already voted{" "}
                              <strong>{userVotes[selectedSong.id]}</strong> for
                              this song
                            </div>
                          </div>
                        ) : (
                          <div className="vote-buttons">
                            <button
                              className="btn btn-danger vote-btn"
                              onClick={() =>
                                handleVote(selectedSong.id,"L")
                              }
                            >
                              <i className="fas fa-thumbs-down me-1"></i> L
                            </button>
                            <button
                              className="btn btn-warning vote-btn"
                              onClick={() =>
                                handleVote(selectedSong.id,"Mid")
                              }
                            >
                              <i className="fas fa-minus me-1"></i> Mid
                            </button>
                            <button
                              className="btn btn-success vote-btn"
                              onClick={() =>
                                handleVote(selectedSong.id,"W")
                              }
                            >
                              <i className="fas fa-fire me-1"></i> W
                            </button>
                          </div>
                        )}
                      </div>

                      <a
                        href={selectedSong.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary w-100"
                      >
                        <i className="fab fa-spotify me-2"></i> Listen on
                        Spotify
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
