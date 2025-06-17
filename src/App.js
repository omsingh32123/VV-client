import React from "react";
import HomePage from "./screens/HomePage/HomePage.js";
import Login from "./screens/Login/Login.js";
import VoteHistoryPage from "./screens/VoteHistoryPage/VoteHistoryPage.js";
import MostVotedPage from "./screens/MostVotedPage/MostVotedPage.js";
import TopArtistsPage from "./screens/TopArtistsPage/TopArtistsPage.js";
import TopVotersPage from "./screens/TopVotersPage/TopVotersPage.js";
import BeefPage from "./screens/BeefPage/BeefPage.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote-history"
            element={
              <ProtectedRoute>
                <VoteHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/most-voted"
            element={
              <ProtectedRoute>
                <MostVotedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/top-artists"
            element={
              <ProtectedRoute>
                <TopArtistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/top-voters"
            element={
              <ProtectedRoute>
                <TopVotersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beefs"
            element={
              <ProtectedRoute>
                <BeefPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
