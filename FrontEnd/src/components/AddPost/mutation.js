export const addPost = async (postContent) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token not found");
    }
    console.log(token);

    const response = await fetch("http://127.0.0.1:8000/create_post", {
      method: "POST", // Corrected to POST
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ content: postContent }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("addPost Error:", error);
    throw error;
  }
};
