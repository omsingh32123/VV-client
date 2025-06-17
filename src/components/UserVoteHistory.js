import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./UserVoteHistory.css";

function UserVoteHistory() {
  const { user, getUserVoteHistory } = useAuth();
  const [voteHistory, setVoteHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoteHistory = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const history = await getUserVoteHistory(user.id);
        setVoteHistory(history);
      } catch (error) {
        //////console.error("Error fetching vote history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteHistory();
  }, [user, getUserVoteHistory]);

  if (loading) {
    return (
      <div className="vote-history-loading">
        <i className="fas fa-spinner fa-spin me-2"></i> Loading your vote
        history...
      </div>
    );
  }

  if (voteHistory.length === 0) {
    return (
      <div className="vote-history-empty">
        <i className="fas fa-info-circle me-2"></i>
        You haven't voted on any songs yet!
      </div>
    );
  }

  return (
    <div className="vote-history-container">
      <h3 className="vote-history-title">
        <i className="fas fa-history me-2"></i>Your Vote History
      </h3>

      <div className="vote-history-grid">
        {voteHistory.map((vote) => (
          <div key={vote.trackId} className="vote-history-item">
            <img
              src={vote.albumImage}
              alt={vote.name}
              className="vote-history-image"
            />
            <div className="vote-history-content">
              <h4 className="vote-history-song">{vote.name}</h4>
              <p className="vote-history-artist">{vote.artist}</p>
              <div className={`vote-badge ${vote.voteType.toLowerCase()}`}>
                {vote.voteType}
              </div>
              <div className="vote-stats">
                <small>
                  <i className="fas fa-chart-bar me-1"></i>
                  Total votes: {vote.totalVotes}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserVoteHistory;
