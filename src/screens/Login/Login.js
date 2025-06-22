import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const SERVER_URI = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loadUserVotes } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  const onSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      //console.log("Google login success:", decoded);

      // Create user data object
      const userData = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        token: credentialResponse.credential,
      };

      // Use the AuthContext login function
      await login(userData);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: decoded.name,
          picture: decoded.picture,
          email: decoded.email,
        }),
        // credentials: "include",
      });
      const data = await response.json();
      if(response?.ok) {
        localStorage.setItem("userData", JSON.stringify(data?.user));
        //console.log("local data = ", JSON.parse(localStorage.getItem("userData")));
      }

      // Redirect to home page
      navigate("/");
    } catch (error) {
      //console.error("Error decoding Google token:", error);
    }
  };

  const onError = () => {
    //console.error("Login Failed");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.svg" alt="VibeVote Logo" className="login-logo" />
          <h1 className="login-title">VibeVote</h1>
        </div>
        <p className="login-description">
          Vote on your favorite songs and see what others think!
        </p>
        <div className="login-button-container">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap
            shape="pill"
            size="large"
            text="continue_with"
            theme="filled_blue"
          />
        </div>
        <p className="login-footer">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Login;
