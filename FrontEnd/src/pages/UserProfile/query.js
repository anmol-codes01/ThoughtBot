export const fetchUserProfile = async (user_id) => {
  try {
    const token = localStorage.getItem("token");

    // Fetch user profile data using the user ID
    const response = await fetch(
      `http://127.0.0.1:8000/user_profile/${user_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,

          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response is okay
    if (!response.ok) {
      // If the response status is not okay, throw an error
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchUserProfile Error:", error);
    throw error;
  }
};

export const fetchUserStatus = async () => {
  try {
    // Retrieve the token from local storage
    const token = localStorage.getItem("token");

    // Check if the token is present
    if (!token) {
      // Handle the case where the token is not available
      throw new Error("Token not found");
    }

    // Fetch user status with the Authorization header

    const response = await fetch("http://127.0.0.1:8000/get_user_status/", {
      method: "GET", // Set the HTTP method to GET
      credentials: "include",

      headers: {
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
    console.error("fetchUserStatus Error:", error);
    throw error;
  }
};
