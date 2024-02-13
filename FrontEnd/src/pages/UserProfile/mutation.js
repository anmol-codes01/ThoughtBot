export const followUser = async (userId) => {
  try {
    // Retrieve the token from local storage
    const token = localStorage.getItem("token");

    // Check if the token is present
    if (!token) {
      // Handle the case where the token is not available
      throw new Error("Token not found");
    }

    // Send a PUT request to follow the user with the Authorization header

    const response = await fetch(`http://127.0.0.1:8000/follow/${userId}`, {
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
    console.error("followUser Error:", error);
    throw error;
  }
};
