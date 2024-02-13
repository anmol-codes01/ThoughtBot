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
