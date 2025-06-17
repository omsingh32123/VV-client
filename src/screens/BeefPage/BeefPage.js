import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import "./BeefPage.css";

// Sample beef data - in a real app, this would come from the backend
const SAMPLE_BEEFS = [
  {
    id: 1,
    title: "Drake vs Kendrick Lamar",
    description: "One of hip-hop's biggest beefs in 2024",
    rapper1: {
      name: "Drake",
      image: "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
      songs: [
        { title: "Push Ups", votes: { W: 150, Mid: 75, L: 50 } },
        { title: "Taylor Made Freestyle", votes: { W: 120, Mid: 90, L: 70 } },
        { title: "Family Matters", votes: { W: 180, Mid: 60, L: 40 } }
      ]
    },
    rapper2: {
      name: "Kendrick Lamar",
      image: "https://i.scdn.co/image/ab6761610000e5ebf1833080d9bbb87c92180900",
      songs: [
        { title: "Meet The Grahams", votes: { W: 250, Mid: 45, L: 30 } },
        { title: "Euphoria", votes: { W: 220, Mid: 60, L: 35 } },
        { title: "Not Like Us", votes: { W: 300, Mid: 40, L: 20 } }
      ]
    }
  },
  {
    id: 2,
    title: "Emiway vs Raftaar",
    description: "Famous Indian hip-hop rivalry",
    rapper1: {
      name: "Emiway",
      image: "https://i.scdn.co/image/ab6761610000e5eb9e46a78c2f574be3dfc5e748",
      songs: [
        { title: "Samajh Mein Aaya Kya", votes: { W: 110, Mid: 80, L: 60 } },
        { title: "Giraftaar", votes: { W: 130, Mid: 70, L: 50 } }
      ]
    },
    rapper2: {
      name: "Raftaar",
      image: "https://i.scdn.co/image/ab6761610000e5eb2f7edb3017511da7120fdf49",
      songs: [
        { title: "Sheikh Chilli", votes: { W: 120, Mid: 75, L: 55 } },
        { title: "Bantai", votes: { W: 140, Mid: 65, L: 45 } }
      ]
    }
  },
  {
    id: 3,
    title: "KR$NA vs Muhfaad",
    description: "Legendary battle in Indian hip-hop scene",
    rapper1: {
      name: "KR$NA",
      image: "https://i.scdn.co/image/ab6761610000e5eb8b7b3499a9eac5c307e8e001",
      songs: [
        { title: "Maharani", votes: { W: 180, Mid: 50, L: 20 } },
        { title: "Makasam", votes: { W: 210, Mid: 40, L: 15 } },
        { title: "Untitled", votes: { W: 160, Mid: 55, L: 25 } }
      ]
    },
    rapper2: {
      name: "Muhfaad",
      image: "https://i.scdn.co/image/ab6761610000e5eb82491c1a79601dca7ba01ca3",
      songs: [
        { title: "Bhoot Banega", votes: { W: 120, Mid: 70, L: 45 } },
        { title: "Punya Paap", votes: { W: 135, Mid: 65, L: 40 } },
        { title: "Dussehra", votes: { W: 130, Mid: 60, L: 50 } }
      ]
    }
  },
  {
    id: 4,
    title: "Seedha Maut vs SOS",
    description: "Delhi's underground rap collective clash",
    rapper1: {
      name: "Seedha Maut",
      image: "https://i.scdn.co/image/ab6761610000e5eb1d5f934df3e3ed92fc0dc2ec",
      songs: [
        { title: "Nanchaku", votes: { W: 140, Mid: 60, L: 30 } },
        { title: "Kyu", votes: { W: 155, Mid: 50, L: 25 } }
      ]
    },
    rapper2: {
      name: "SOS",
      image: "https://i.scdn.co/image/ab6761610000e5ebb3a3701a041e832524302d52",
      songs: [
        { title: "Red Light", votes: { W: 125, Mid: 70, L: 35 } },
        { title: "Batti", votes: { W: 130, Mid: 65, L: 40 } }
      ]
    }
  },
  {
    id: 5,
    title: "KR$NA vs Emiway",
    description: "One of the biggest beefs in Indian hip-hop history",
    rapper1: {
      name: "KR$NA",
      image: "https://i.scdn.co/image/ab6761610000e5eb8b7b3499a9eac5c307e8e001",
      songs: [
        { title: "Say My Name", votes: { W: 190, Mid: 45, L: 25 } },
        { title: "Lil Bunty", votes: { W: 220, Mid: 40, L: 20 } },
        { title: "Machayenge 4", votes: { W: 205, Mid: 50, L: 15 } }
      ]
    },
    rapper2: {
      name: "Emiway",
      image: "https://i.scdn.co/image/ab6761610000e5eb9e46a78c2f574be3dfc5e748",
      songs: [
        { title: "Chusamba", votes: { W: 150, Mid: 80, L: 45 } },
        { title: "Kr L∅da Sign", votes: { W: 140, Mid: 75, L: 60 } },
        { title: "M4", votes: { W: 160, Mid: 70, L: 50 } }
      ]
    }
  },
  {
    id: 6,
    title: "Tupac vs Biggie",
    description: "The most notorious East Coast-West Coast rivalry",
    rapper1: {
      name: "Tupac",
      image: "https://i.scdn.co/image/ab6761610000e5eb9c5d138d3715160bafd1e1d3",
      songs: [
        { title: "Hit 'Em Up", votes: { W: 300, Mid: 40, L: 10 } },
        { title: "Against All Odds", votes: { W: 280, Mid: 45, L: 15 } }
      ]
    },
    rapper2: {
      name: "Biggie",
      image: "https://i.scdn.co/image/ab6761610000e5eb15ef5c42f6c7f7c99a69bd8a",
      songs: [
        { title: "Who Shot Ya", votes: { W: 290, Mid: 35, L: 15 } },
        { title: "Long Kiss Goodnight", votes: { W: 270, Mid: 50, L: 20 } }
      ]
    }
  },
  {
    id: 7,
    title: "Jay-Z vs Nas",
    description: "Classic New York hip-hop battle",
    rapper1: {
      name: "Jay-Z",
      image: "https://i.scdn.co/image/ab6761610000e5eb875ef6ebb1fea88e42b4ce8e",
      songs: [
        { title: "Takeover", votes: { W: 240, Mid: 50, L: 20 } },
        { title: "Blueprint 2", votes: { W: 210, Mid: 60, L: 30 } }
      ]
    },
    rapper2: {
      name: "Nas",
      image: "https://i.scdn.co/image/ab6761610000e5eb7e1fbc307d78262ac0ecc0f2",
      songs: [
        { title: "Ether", votes: { W: 260, Mid: 45, L: 15 } },
        { title: "Last Real N**** Alive", votes: { W: 230, Mid: 55, L: 25 } }
      ]
    }
  },
  {
    id: 8,
    title: "Eminem vs Machine Gun Kelly",
    description: "Modern mainstream rap rivalry",
    rapper1: {
      name: "Eminem",
      image: "https://i.scdn.co/image/ab6761610000e5eba00b11c129b27a88fc72f36b",
      songs: [
        { title: "Not Alike", votes: { W: 210, Mid: 60, L: 30 } },
        { title: "Killshot", votes: { W: 275, Mid: 45, L: 20 } }
      ]
    },
    rapper2: {
      name: "MGK",
      image: "https://i.scdn.co/image/ab6761610000e5ebaad81e365cb018372eac299f",
      songs: [
        { title: "Rap Devil", votes: { W: 190, Mid: 70, L: 40 } },
        { title: "Lately", votes: { W: 145, Mid: 85, L: 50 } }
      ]
    }
  }
];

function BeefPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [beefs, setBeefs] = useState(SAMPLE_BEEFS);
  const [selectedBeef, setSelectedBeef] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
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

  // Open beef details modal
  const openBeefDetails = (beef) => {
    setSelectedBeef(beef);
    setTimeout(() => {
      setShowModal(true);
    }, 50);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedBeef(null);
    }, 300); // Wait for closing animation
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Calculate winner for each song
  const calculateSongWinner = (song1, song2) => {
    const song1Score = song1.votes.W - song1.votes.L;
    const song2Score = song2.votes.W - song2.votes.L;
    return song1Score > song2Score ? 1 : song1Score < song2Score ? 2 : 0;
  };

  // Calculate overall winner
  const calculateOverallWinner = (beef) => {
    let rapper1Wins = 0;
    let rapper2Wins = 0;
    
    // Compare equal number of songs
    const songsToCompare = Math.min(beef.rapper1.songs.length, beef.rapper2.songs.length);
    
    for (let i = 0; i < songsToCompare; i++) {
      const winner = calculateSongWinner(beef.rapper1.songs[i], beef.rapper2.songs[i]);
      if (winner === 1) rapper1Wins++;
      if (winner === 2) rapper2Wins++;
    }
    
    if (rapper1Wins > rapper2Wins) return beef.rapper1.name;
    if (rapper2Wins > rapper1Wins) return beef.rapper2.name;
    return "Draw";
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
          <i className="fas fa-bolt me-2"></i>
          Hip-Hop Beefs & Rivalries
        </h1>

        <div className="row">
          {beefs.map((beef) => (
            <div key={beef.id} className="col-md-6 mb-4">
              <div 
                className="beef-card" 
                onClick={() => openBeefDetails(beef)}
              >
                <div className="beef-card-header">
                  <h3>{beef.title}</h3>
                  <p>{beef.description}</p>
                </div>
                <div className="beef-rappers">
                  <div className="rapper-side left">
                    <img 
                      src={beef.rapper1.image} 
                      alt={beef.rapper1.name} 
                      className="rapper-image"
                    />
                    <h4>{beef.rapper1.name}</h4>
                  </div>
                  <div className="versus">VS</div>
                  <div className="rapper-side right">
                    <img 
                      src={beef.rapper2.image} 
                      alt={beef.rapper2.name}
                      className="rapper-image"
                    />
                    <h4>{beef.rapper2.name}</h4>
                  </div>
                </div>
                <div className="beef-card-footer">
                  <button className="btn btn-primary">
                    <i className="fas fa-poll me-1"></i> View Battle Stats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Beef Details Modal */}
      {selectedBeef && (
        <div
          className={`modal-backdrop ${showModal ? "show" : ""}`}
          onClick={handleBackdropClick}
        >
          <div className={`beef-modal ${showModal ? "show" : ""}`}>
            <button className="modal-close-btn" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-content p-4">
              <h2 className="beef-modal-title">{selectedBeef.title}</h2>
              <p className="beef-modal-description">{selectedBeef.description}</p>

              <div className="rappers-header">
                <div className="rapper-profile">
                  <img 
                    src={selectedBeef.rapper1.image} 
                    alt={selectedBeef.rapper1.name}
                    className="rapper-profile-image"
                  />
                  <h3>{selectedBeef.rapper1.name}</h3>
                </div>
                <div className="vs-badge">VS</div>
                <div className="rapper-profile">
                  <img 
                    src={selectedBeef.rapper2.image} 
                    alt={selectedBeef.rapper2.name}
                    className="rapper-profile-image"
                  />
                  <h3>{selectedBeef.rapper2.name}</h3>
                </div>
              </div>

              <div className="beef-songs-comparison">
                <h4 className="text-center mb-4">Diss Tracks Comparison</h4>
                
                <div className="songs-container">
                  {selectedBeef.rapper1.songs.map((song, index) => {
                    const song2 = selectedBeef.rapper2.songs[index];
                    if (!song2) return null;
                    
                    const winner = calculateSongWinner(song, song2);
                    
                    return (
                      <div key={index} className="song-battle-row">
                        <div className={`song-card ${winner === 1 ? 'winner' : ''}`}>
                          <h5>{song.title}</h5>
                          <div className="song-stats">
                            <div className="stat">
                              <span className="text-success">{song.votes.W}</span> W votes
                            </div>
                            <div className="stat">
                              <span className="text-warning">{song.votes.Mid}</span> Mid votes
                            </div>
                            <div className="stat">
                              <span className="text-danger">{song.votes.L}</span> L votes
                            </div>
                          </div>
                        </div>
                        
                        <div className="battle-vs">VS</div>
                        
                        <div className={`song-card ${winner === 2 ? 'winner' : ''}`}>
                          <h5>{song2.title}</h5>
                          <div className="song-stats">
                            <div className="stat">
                              <span className="text-success">{song2.votes.W}</span> W votes
                            </div>
                            <div className="stat">
                              <span className="text-warning">{song2.votes.Mid}</span> Mid votes
                            </div>
                            <div className="stat">
                              <span className="text-danger">{song2.votes.L}</span> L votes
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="beef-conclusion">
                  <h4>Battle Conclusion</h4>
                  <div className="conclusion-box">
                    <p>Based on the vote statistics, the winner of this beef is:</p>
                    <div className="winner-badge">
                      <i className="fas fa-crown me-2"></i>
                      {calculateOverallWinner(selectedBeef)}
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

export default BeefPage; 