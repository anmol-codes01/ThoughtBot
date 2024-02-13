import React, { useState, useEffect } from "react";
import AddPost from "../../components/AddPost/AddPost";
import { useQuery } from "react-query";
import { fetchAllPosts } from "./query";
import PostCard from "../../components/PostCard/PostCard";
import { useRef } from "react";

const Home = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useQuery(
    ["posts", page],
    () => fetchAllPosts(page)
  );
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(null);

  // State to store the newly created post
  const [newPost, setNewPost] = useState(null);

  const scrollPositionRef = useRef(0);

  // Function to handle receiving the new post data from AddPost component
  const handleNewPost = (post) => {
    setNewPost(post);
  };

  // Function to handle infinite scroll
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !isFetching &&
      page < totalPages
    ) {
      scrollPositionRef.current = window.scrollY;

      // User has scrolled to the bottom and there are more pages, fetch the next page
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Add an event listener to the window for scroll events
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, isFetching, totalPages]);

  // Update posts state and total pages when data changes
  useEffect(() => {
    if (data) {
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setTotalPages(data.totalPages);
    }
    if (newPost) {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    window.scrollTo(0, scrollPositionRef.current);
  }, [data, newPost]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error loading posts</p>;
  }

  return (
    <div>
      <AddPost onNewPost={handleNewPost} /> {/* Pass the callback as a prop */}
      {/* Display your posts here */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {isFetching && <p>Loading more...</p>}
      {!isFetching && page >= totalPages && <p>No more posts</p>}
    </div>
  );
};

export default Home;
