import React from "react";
import { useQuery } from "react-query";
import { fetchUserStatus } from "./query";
import { useMutation } from "react-query";
import { likePost } from "./mutation";
import { editPost } from "./mutation";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const { data, isLoading, isError } = useQuery("user_status", fetchUserStatus);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  // State for editing the post
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const { mutate } = useMutation(likePost, {
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(data.like_count);
    },
  });

  const { mutate: editMutation } = useMutation(editPost, {
    onSuccess: (data) => {
      if (data.success) {
        // Update the post content in the component state
        setEditing(false);
        setEditedContent(data.content);
        console.log(editedContent);
      } else {
        // Handle edit failure
        console.error("Failed to edit post:", data.message);
      }
    },
  });

  if (isLoading) {
    // Render a loading spinner or message
    return <p>Loading...</p>;
  }

  if (isError) {
    // Render an error message or handle the error appropriately
    return <p>Error loading user status</p>;
  }

  const handleEditClick = () => {
    // Logic for handling edit button click
    setEditing(true);
  };

  const handleLikeClick = () => {
    mutate(post.id);
  };

  const handleSaveClick = () => {
    // Call the edit mutation to save the changes
    editMutation({ postId: post.id, editedContent });
  };

  return (
    <div className="flex flex-col border p-4 my-4 rounded-lg shadow-md">
      {/* username and edit button */}
      <div className="flex items-center justify-between mb-2">
        <Link to={`/user_profile/${post.user_id}`}>
          <p className="text-lg font-bold">@{post.author}</p>
        </Link>

        {data.is_authenticated && data.username === post.author && !editing && (
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={handleEditClick}
          >
            Edit
          </button>
        )}
        {editing && (
          <>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={handleSaveClick}
            >
              Save changes
            </button>
          </>
        )}
      </div>
      {/* content */}
      <div className="mb-4">
        <p className="text-gray-800">{post.content}</p>
      </div>
      {/* like button and like count */}
      {data.is_authenticated && (
        <div className="flex items-center">
          <button
            onClick={handleLikeClick}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            {liked ? "Unlike" : "Like"}
          </button>
          <p className="ml-2"> Liked by {likeCount} </p>
        </div>
      )}
    </div>
  );
};

export default PostCard;
