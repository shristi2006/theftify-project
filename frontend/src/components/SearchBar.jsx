import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const handleSearch = (event) => {
    if (event.key === "Enter" && query.trim() !== "") {
      navigate(`/search?q=${query}`);
      setQuery("");
    }
  };
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search . . ."
        className="input input-bordered w-full rounded-full py-2 pl-10 pr-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
    </div>
  );
}