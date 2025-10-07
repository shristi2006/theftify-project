import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactSketchCanvas } from "react-sketch-canvas";
import ReactQuill from 'react-quill'; // NEW: Import Quill editor
import 'react-quill/dist/quill.snow.css'; // NEW: Import Quill's CSS for styling

export default function Upload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  
  // Shared form fields
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postCategory, setPostCategory] = useState("Art");
  const [tags, setTags] = useState("");
  
  // State for 'Upload' tab
  const [postFiles, setPostFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // Ref for 'Draw' tab
  const canvasRef = useRef(null);

  // NEW: State for 'Write' tab
  const [editorContent, setEditorContent] = useState("");

  const handleFileChange = (e) => {
    // ... (this function remains the same)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let submissionData = {
      title: postTitle,
      description: postDescription,
      category: postCategory,
      tags: tags.split(',').map(tag => tag.trim()),
    };

    if (activeTab === 'upload') {
      if (postFiles.length === 0) {
        alert("Please select at least one image to upload.");
        return;
      }
      submissionData.files = postFiles;
    } else if (activeTab === 'draw') {
      const drawingDataUrl = await canvasRef.current.exportImage("png");
      submissionData.drawing = drawingDataUrl;
    } else { // activeTab is 'write'
      if (editorContent.length < 10) { // Basic check for empty content
        alert("Please write something in the editor.");
        return;
      }
      submissionData.textContent = editorContent; // Add editor's HTML content
    }
    
    console.log("Submitting Post:", submissionData);
    alert("Post submitted successfully! (Check the console for the data)");
    navigate("/");
  };
  
  // ... (useEffect remains the same)

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Create a New Post</h2>
          <Link to="/" className="btn btn-ghost btn-circle">✕</Link>
        </div>

        {/* NEW: Added the 'Write' tab */}
        <div className="tabs tabs-boxed">
          <a className={`tab flex-1 ${activeTab === 'upload' ? 'tab-active' : ''}`} onClick={() => setActiveTab('upload')}>Upload Files</a> 
          <a className={`tab flex-1 ${activeTab === 'draw' ? 'tab-active' : ''}`} onClick={() => setActiveTab('draw')}>Draw</a>
          <a className={`tab flex-1 ${activeTab === 'write' ? 'tab-active' : ''}`} onClick={() => setActiveTab('write')}>Write</a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Content Area */}
          {activeTab === 'upload' && (
            <div className="form-control">
              {/* File upload JSX from before... */}
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="form-control">
              {/* Canvas JSX from before... */}
            </div>
          )}
          
          {/* NEW: Rich Text Editor for the 'Write' tab */}
          {activeTab === 'write' && (
            <div className="form-control bg-base-content text-base-100 rounded-lg">
              <label className="label"><span className="label-text text-base-100 px-1">Write your Poem or Article</span></label>
              <ReactQuill 
                theme="snow" 
                value={editorContent} 
                onChange={setEditorContent}
                className="h-64"
                placeholder="Start writing..."
              />
            </div>
          )}

          {/* Shared Form Fields (Title is always required) */}
          <div className="form-control">
            <label htmlFor="title" className="label"><span className="label-text">Title</span></label>
            <input id="title" type="text" placeholder="Enter a title for your post" className="input input-bordered w-full" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
          </div>

          {/* Optional fields can be hidden for 'Write' tab if desired */}
          {activeTab !== 'write' && (
             <div className="form-control">
              <label htmlFor="description" className="label"><span className="label-text">Description</span></label>
              <textarea id="description" className="textarea textarea-bordered h-24" placeholder="Tell us about your work..." value={postDescription} onChange={(e) => setPostDescription(e.target.value)}></textarea>
            </div>
          )}

          {/* Tags and Category are always useful */}
          <div className="form-control">
            <label htmlFor="tags" className="label"><span className="label-text">Tags</span></label>
            <input id="tags" type="text" placeholder="e.g. poem, story, nature" className="input input-bordered w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
            <label className="label"><span className="label-text-alt">Separate tags with a comma</span></label>
          </div>
          <div className="form-control">
            <label htmlFor="category" className="label"><span className="label-text">Category</span></label>
            <select id="category" className="select select-bordered" value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
              <option>Art</option>
              <option>Writing</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full">Submit Post</button>
        </form>
      </div>
    </div>
  );
}