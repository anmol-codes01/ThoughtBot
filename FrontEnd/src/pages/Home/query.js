export const fetchAllPosts = async (page = 1) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/?page=${page}`);

    if (!response.ok) {
      // If the response status is not okay, throw an error
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    throw new Error("Error fetching posts");
  }
};
