import React from "react";
import { useQuery } from "react-query";
import { fetchFollowingPosts } from "./query";
import { useState, useEffect } from "react";
import PostCard from "../../components/PostCard/PostCard";

const FollowingPosts = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useQuery(
    ["posts", page],
    () => fetchFollowingPosts(page)
  );
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(null);

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !isFetching &&
      page < totalPages
    ) {
      // User has scrolled to the bottom and there are more pages, fetch the next page
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, isFetching, totalPages]);

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error loading posts</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Followed user's posts</h2>
      {/* Display your posts here */}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {isFetching && <p>Loading more...</p>}
      {!isFetching && page >= totalPages && <p>No more posts</p>}
    </div>
  );
};

export default FollowingPosts;
