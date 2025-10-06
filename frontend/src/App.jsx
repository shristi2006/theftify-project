import { Route, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import UploadPage from "./pages/UploadPage";
import toast from "react-hot-toast";

const App = () => {
  return (
    <div data-theme="forest">
      <button className="btn btn-primary" onClick={() => toast.success("congrats")}>click me</button>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </div>
  );
};
export default App;
