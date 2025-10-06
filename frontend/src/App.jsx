import { BrowserRouter, Routes, Route } from "react-router-dom";
//importing pages
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import UploadPage from "./pages/UploadPage";
import AboutUs from "./pages/AboutUs";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* defining routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;