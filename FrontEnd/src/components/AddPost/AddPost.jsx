import React, { useState } from "react";
import { useMutation } from "react-query";
import { addPost } from "./mutation";

const AddPost = ({ onNewPost }) => {
  const [postContent, setPostContent] = useState("");

  const { mutate: addPostMutation } = useMutation(addPost, {
    onSuccess: (data) => {
      if (data.success) {
        // Set the new post state
        onNewPost(data.post);
        setPostContent(""); // Clear the input field after successful submission
      } else {
        // Handle error case
        console.error("Failed to create post:", data.message);
      }
    },
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log("Post content:", postContent);

    addPostMutation(postContent);

    // Add your logic to submit the post content to the server
    console.log("Post submitted:", postContent);

    // Clear the input field after submitting
    setPostContent("");
  };

  // const isLoggedIn = Boolean(localStorage.getItem("token"));

  // if (!isLoggedIn) {
  //   // If the user is not logged in, don't render the AddPost component
  //   return null;
  // }

  return (
    <div className="max-w-[1640px] mx-auto p-4">
      <form
        onSubmit={handlePostSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="postContent"
        >
          What's on your mind ?
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          id="postContent"
          placeholder="Share your thoughts..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        ></textarea>
        <div className="flex items-center justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPost;
