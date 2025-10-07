import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  // 1. Get the 'logout' function from the hook
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-base-200 text-base-content shadow-md">
      <Link to="/">
        <h1 className="text-3xl font-bold">theftify</h1>
      </Link>

      <SearchBar />

      {isAuthenticated ? (
        // If logged in, show profile icon AND a logout button
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <img 
              src={user.picture} 
              alt={user.name} 
              className="w-10 h-10 rounded-full cursor-pointer" 
            />
          </Link>
          <button 
            className="btn btn-ghost" 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log Out
          </button>
        </div>
      ) : (
        // If logged out, show login button
        <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
          Log In
        </button>
      )}
    </nav>
  );
}