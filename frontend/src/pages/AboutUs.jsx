import React from "react";
import Navbar from "../components/Navbar";


export default function AboutUs() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="mb-4">
          Welcome to Theftify, a platform dedicated to sharing and discovering
          creative works. Our mission is to empower artists and writers by
          providing a space to showcase their talents and connect with others.
        </p>
        <p>
          Whether you're here to explore new art, read captivating stories, or
          share your own creations, we hope you find inspiration and
          community.
        </p>
      </div>
    </div>
  );
}