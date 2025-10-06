import React from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewUploadButton() {
  return (
    <Link to="/upload" className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-primary p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
      <Plus className="w-6 h-6 md:w-8 md:h-8 text-primary-content" />
    </Link>
  );
}