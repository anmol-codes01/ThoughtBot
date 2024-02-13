export const fetchFollowingPosts = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token not found");
    }

    const response = await fetch(
      `http://127.0.0.1:8000/following_posts/?page=${page}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      // If the response status is not okay, throw an error
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching following posts:", error.message);
    throw new Error("Error fetching following posts");
  }
};
