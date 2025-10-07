import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import ProfileCard from "../components/ProfileCard";
import NewUpload from "../components/NewUpload";

const allPosts = [
  { id: 1, title: 'Post 1', category: 'Art', type: 'New' },
  { id: 2, title: 'Post 2', category: 'Writing', type: 'Following' },
  { id: 3, title: 'Post 3', category: 'Art', type: 'Random' },
  { id: 4, title: 'Post 4', category: 'Writing', type: 'New' },
  { id: 5, title: 'Post 5', category: 'Art', type: 'Following' },
  { id: 6, title: 'Post 6', category: 'Writing', type: 'Random' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth0(); 
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeFeedTab, setActiveFeedTab] = useState("Following");

  const categories = ["All", "Art", "Writing"];
  const feedTabs = ["New", "Following", "Random"];

  const displayedPosts = allPosts
    .filter((post) => selectedCategory === "All" || post.category === selectedCategory)
    .filter((post) => post.type === activeFeedTab);

  return (
    <div className="h-screen flex flex-col bg-base-200">
      <Navbar />
      <div className="container mx-auto flex gap-4 p-4 flex-1 overflow-hidden">
        
        {/* === SIDEBAR (Updated Look) === */}
        <aside className="hidden md:flex md:flex-col md:w-1/5 lg:w-1/6">
          {/* 3. Replaced ul with a div and gap for better spacing */}
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <button
                key={category}
                // 1 & 3. Clearer selection, rounded buttons
                className={`btn rounded-full justify-start ${selectedCategory === category ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-auto">
             <Link to="/about" className="btn btn-ghost rounded-full justify-start">
                About Us
             </Link>
          </div>
        </aside>

        {/* === MAIN FEED (Updated Look) === */}
        <main className="w-full md:w-4/5 lg:w-3/5 border-x border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            {/* 1 & 3. Pill-shaped container for the buttons */}
            <div className="join rounded-full w-full">
              {feedTabs.map((tab) => (
                <button
                  key={tab}
                  className={`join-item btn flex-1 ${activeFeedTab === tab ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveFeedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayedPosts.length > 0 ? (
                displayedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="text-center p-8 text-base-content/60">
                    <p>No posts found.</p>
                </div>
            )}
          </div>
        </main>

        {/* <<< CHANGE #3: Conditionally render the entire right sidebar */}
        {isAuthenticated && (
          <aside className="hidden lg:block lg:w-1/s5">
             <ProfileCard />
          </aside>
        )}
      </div>
      <NewUpload />
    </div>
  );
}