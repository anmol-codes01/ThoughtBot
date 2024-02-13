import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FollowingPosts from "./pages/FollowingPosts";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/index";
import UserProfile from "./pages/UserProfile";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user_profile/:user_id" element={<UserProfile />} />
        <Route path="/following_posts" element={<FollowingPosts />} />
      </Routes>
    </Router>
  );
}

export default App;
