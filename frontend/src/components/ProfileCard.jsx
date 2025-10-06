import React from "react";
import { Link } from "react-router-dom";

export default function ProfileCard() {
  return (
    // Main card container
    <div className="card bg-base-100 shadow-xl p-4">
      <div className="flex flex-col">
        
        {/* Profile Picture */}
        <div className="avatar online placeholder mb-4">
          <div className="bg-neutral text-neutral-content rounded-full w-16">
            <span className="text-3xl">A</span>
          </div>
        </div>
        

        {/* User Info */}
        <h2 className="card-title text-lg">Username</h2>
        <p className="text-sm text-base-content/70 mb-2">@username_handle</p>
        <p className="text-sm max-w-xs mx-auto">
          This is a short but engaging bio describing the user and their creative work.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 my-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-base">101</p>
            <p className="text-base-content/60">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-base">90</p>
            <p className="text-base-content/60">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-base">10.1k</p>
            <p className="text-base-content/60">Saves</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-base">52</p>
            <p className="text-base-content/60">Uploads</p>
          </div>
        </div>

        {/* Action Button */}
        <Link to="/profile" className="btn btn-primary btn-block rounded-full">
          View Profile
        </Link>
      </div>
    </div>
  );
}