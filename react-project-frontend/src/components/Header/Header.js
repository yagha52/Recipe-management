import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../kitchen-logo.png";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );

  useEffect(() => {
    const updateAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUser(
        localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null
      );
    };

    window.addEventListener("authUpdated", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    
    return () => {
      window.removeEventListener("authUpdated", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    alert("Logout successful!");
    navigate("/");
  };

  const handleAddRecipe = () => {
    navigate('/add-recipe'); 
  };


  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-logo-title">
          <Link to="/" className="nav-link">
            <img src={logo} alt="kitchen" className="header-img" />
            <h1 className="title">The Kitchen Diaries</h1>
          </Link>
        </div>

        <div className="auth-buttons">
          {isLoggedIn && user ? (
            <>
              {user.id === 1 && ( 
                <>
                  <button className="auth-button" onClick={handleAddRecipe}>
                    Add Recipe
                  </button>
                </>
              )}
              <button className="auth-button" onClick={() => navigate('/saved-recipes')}>
                Saved bookmarks
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="auth-button login-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="auth-button signup-btn"
                onClick={() => navigate('/login?mode=signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

