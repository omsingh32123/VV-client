import React, { createContext, useState, useContext, useEffect } from "react";
const SERVER_URI = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));
  const [loading, setLoading] = useState(true);
  const [userVotesCache, setUserVotesCache] = useState({});

  // Load user previous votes
  useEffect(() => {
    if (userData) {
      const data = JSON.parse(localStorage.getItem("userData"));
      setUserData(data);
    }
  }, []);

  const loadUserVotes = async (userId) => {
    try {
      // Check if we have votes in localStorage first
      // const cachedVotes = localStorage.getItem(`userVotes_${userId}`);
      // if (cachedVotes) {
      //   const parsedVotes = JSON.parse(cachedVotes);
      //   setUserVotesCache(parsedVotes);
      //   return parsedVotes;
      // }

      // If not in localStorage, fetch from API
      const response = await fetch(
        `${SERVER_URI}/api/users/get-voted-songs/${userId}`
      );
      if (response.ok) {
        const tempData = await response.json();

        var votesData = {};
        tempData?.songs?.forEach((song) => {
          votesData[song?.songId?.trackId] = song?.voteType;
        });
        
        // Save to localStorage for future use
        if (Object.keys(votesData).length > 0) {
          localStorage.setItem(
            `userVotes_${userId}`,
            JSON.stringify(votesData)
          );
          setUserVotesCache(votesData);
        }

        return votesData;
      }
      return {};
    } catch (error) {
      //console.error("Error loading user votes:", error);
      return {};
    }
  };

  // Save a new vote to user's votes
  const saveUserVote = (userId, trackId, voteType) => {
    try {
      const updatedVotes = { ...userVotesCache, [trackId]: voteType };
      localStorage.setItem(`userVotes_${userId}`, JSON.stringify(updatedVotes));
      setUserVotesCache(updatedVotes);
      return updatedVotes;
    } catch (error) {
      //console.error("Error saving user vote:", error);
      return userVotesCache;
    }
  };

  // Get user vote history from the database with detailed song information
  const getUserVoteHistory = async (userId) => {
    try {
      const response = await fetch(
        `${SERVER_URI}/api/users/${userId}/votes/detailed`
      );
      if (response.ok) {
        const detailedVotes = await response.json();
        return detailedVotes;
      }
      return [];
    } catch (error) {
      //console.error("Error fetching detailed user vote history:", error);
      return [];
    }
  };

  // Get users who voted on a specific song
  const getSongVoters = async (trackId) => {
    try {
      const response = await fetch(
        `${SERVER_URI}/api/users/song/${trackId}/voters`
      );
      if (response.ok) {
        const voters = await response.json();
        return voters;
      }
      return [];
    } catch (error) {
      //console.error("Error fetching song voters:", error);
      return [];
    }
  };

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedUser = localStorage.getItem("user");
    const parsedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUser && parsedUserData) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserData(parsedUserData);
      // Also check for cached votes
      const cachedVotes = localStorage.getItem(`userVotes_${parsedUser.id}`);
      if (cachedVotes) {
        setUserVotesCache(JSON.parse(cachedVotes));
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Load user votes when logging in
    await loadUserVotes(userData._id);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userData");

    // Clear user votes cache when logging out
    if (user && user.id) {
      localStorage.removeItem(`userVotes_${user.id}`);
    }

    setUser(null);
    setUserVotesCache({});
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    userData,
    login,
    logout,
    isAuthenticated,
    loading,
    loadUserVotes,
    saveUserVote,
    userVotesCache,
    getUserVoteHistory,
    getSongVoters,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
