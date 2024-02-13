export const likePost = async (postId) => {
  try {
    // Retrieve the token from local storage
    const token = localStorage.getItem("token");

    // Check if the token is present
    if (!token) {
      // Handle the case where the token is not available
      throw new Error("Token not found");
    }

    // Send a PUT request to like the post with the Authorization header

    const response = await fetch(`http://127.0.0.1:8000/like_post/${postId}`, {
      method: "PUT", // Set the HTTP method to PUT
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    // Check if the response is okay
    if (!response.ok) {
      // If the response status is not okay, throw an error
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("likePost Error:", error);
    throw error;
  }
};

export const editPost = async ({ postId, editedContent }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // Handle the case where the token is not available
      throw new Error("Token not found");
    }

    const response = await fetch(`http://127.0.0.1:8000/edit_post/${postId}`, {
      method: "PUT",
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ content: editedContent }),
    });

    if (!response.ok) {
      throw new Error("Failed to edit post");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("editPost Error:", error);
    throw error;
  }
};
