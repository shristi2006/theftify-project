import React from 'react'
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Search Results</h1>
      <p className="mt-4 text-lg">
        Showing results for: <span className="font-semibold">{query}</span>
      </p>
    </div>
  )
}

export default Search;