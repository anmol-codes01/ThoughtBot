import React, { useState, useEffect } from "react";
import { SlUserFollowing } from "react-icons/sl";
import { FaHome } from "react-icons/fa";

import { CgProfile } from "react-icons/cg";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { useQuery } from "react-query";
import { fetchUserStatus } from "./query";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, isError } = useQuery("user_status", fetchUserStatus);

  useEffect(() => {
    // Check for token in the query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Handle authentication using the token
      console.log("Authenticated with token:", token);

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Redirect to the desired page
      navigate("/");
    }

    setNav(false);
  }, [location.search, navigate]);

  // Check if there's a token in localStorage
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  if (isLoading) {
    // Render a loading spinner or message
    return <p>Loading...</p>;
  }

  if (isError) {
    // Render an error message or handle the error appropriately
    return <p>Error loading user status</p>;
  }

  const handleLogin = () => {
    // Redirect the user to the Django login page
    window.location.href = "http://127.0.0.1:8000/login";
  };

  const handleLogout = () => {
    fetch("http://127.0.0.1:8000/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // You can pass an empty object in the body
    })
      .then((response) => {
        if (response.ok) {
          localStorage.removeItem("token");

          // If the logout request is successful, redirect to the desired page
          window.location.href = "/"; // Redirect to the homepage
        } else {
          // Handle logout failure
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="max-w-[1640px] mx-auto flex justify-between items-center p-4">
      {/* left side */}
      <div className="flex items-center">
        <div onClick={() => setNav(!nav)} className="cursor-pointer">
          <AiOutlineMenu size={30} />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl px-2">
          Thought<span className="font-bold">Bot</span>
        </h1>
      </div>

      {/* following, login, and register */}
      {isLoggedIn ? (
        <Link to="/following_posts">
          <button className="bg-white text-black flex items-center py-2 ">
            <SlUserFollowing size={20} className="mr-2" /> Following
          </button>
        </Link>
      ) : (
        <>
          <button
            className="text-2xl sm:text-3xl lg:text-4xl px-2"
            onClick={handleLogin} // Redirect to Django login page
          >
            {" "}
            Login{" "}
          </button>

          <button className="text-2xl sm:text-3xl lg:text-4xl px-2">
            {" "}
            Register{" "}
          </button>
        </>
      )}

      {/* mobile menu overlay */}
      {nav && (
        <div className="bg-black/80 fixed w-full h-screen z-10 top-0 left-0 "></div>
      )}

      {/* side drawer menu */}
      <div
        className={
          nav
            ? "fixed top-0 left-0 w-[300px] h-screen bg-white z-10 duration-300"
            : "fixed top-0 left-[-100%] w-[300px] h-screen bg-white z-10 duration-300"
        }
      >
        <AiOutlineClose
          onClick={() => setNav(!nav)}
          className="absolute right-4 top-4 cursor-pointer"
          size={30}
        />

        <h2 className="text-2xl p-4">
          Thought <span className="font-bold">Bot</span>
        </h2>

        <nav>
          <ul className="flex flex-col p-4 text-gray-800">
            <Link to="/">
              <li className="text-xl py-4 flex">
                <FaHome size={25} className="mr-4" /> Home
              </li>
            </Link>
            {isLoggedIn ? (
              <>
                {/* Render logout button when logged in */}
                <Link to={`/user_profile/${data.user_id}`}>
                  <li className="text-xl py-4 flex">
                    <CgProfile size={25} className="mr-4" /> My Profile
                  </li>
                </Link>
                <li>
                  <button onClick={handleLogout} className="text-xl py-4 flex">
                    <CiLogout size={25} className="mr-4" /> Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Render login and register buttons when not logged in */}
                <li>
                  <button>Login</button>
                </li>
                <li>
                  <button>Register</button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
