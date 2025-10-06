import React from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";


export default function PostCard() { // Accept post data as a prop
  return (
    // 1. Set a max-width and center the card for larger screens
    <div className="bg-base-100 shadow-xl rounded-lg p-4 max-w-xl mx-auto">
      
      {/* 2. Use aspect ratio for the image so it scales correctly */}
      <div className="w-full aspect-video bg-base-300 mb-4 rounded-lg" />
      
      <div className="flex justify-between items-center">
        <div className="flex gap-3 sm:gap-4"> {/* 3. Slightly smaller gap on mobile */}
          <button className="btn btn-ghost btn-circle">
            <Heart className="w-6 h-6 hover:fill-pink-500 hover:text-pink-500 transition-colors" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
        <button className="btn btn-ghost btn-circle">
          <Bookmark className="w-6 h-6 hover:fill-white hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}