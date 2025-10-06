import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-base-200 text-base-content shadow-md">
      <Link to="/">
        <h1 className="text-3xl font-bold">theftify</h1>
      </Link>
      <SearchBar />
      <Link to="/profile">
        <div className="w-10 h-10 bg-green-500 rounded-full cursor-pointer"></div>
      </Link>
    </nav>
  );
}