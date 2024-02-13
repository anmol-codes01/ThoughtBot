import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { fetchUserProfile, fetchUserStatus } from "./query";
import { followUser } from "./mutation";
import PostCard from "../../components/PostCard/PostCard";

const UserProfile = () => {
  const { user_id } = useParams();

  // Fetch user profile data
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery(["userProfile", user_id], () => fetchUserProfile(user_id));

  // Fetch user status data
  const {
    data: userStatus,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useQuery("user_status", fetchUserStatus);

  const [followed, setFollowed] = useState(false); // Initialize to false
  const [FollowingCount, setFollowingCount] = useState(0);
  const [FollowerCount, setFollowerCount] = useState(0);

  // Update FollowingCount when userData is available
  useEffect(() => {
    if (userData) {
      setFollowingCount(userData.following_count);
      setFollowerCount(userData.follower_count);
      setFollowed(userData.is_following);
    }
  }, [userData]);

  console.log(followed);

  const { mutate: followMutation } = useMutation(followUser, {
    onSuccess: (data) => {
      setFollowed(data.followed);
      setFollowerCount(data.follow_count);
    },
  });

  const handleFollowClick = () => {
    followMutation(userData.user.id);
  };

  // Loading and error handling
  if (isLoading || isLoadingUser) {
    return <p>Loading...</p>;
  }

  if (isError || isErrorUser) {
    return <p>Error: {error?.message || "Unknown error"}</p>;
  }

  if (!userData || !userStatus) {
    return <p>No user data found.</p>;
  }

  return (
    <div>
      {/* User info, follow button, follower, following counts */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 my-8">
        <div className="flex flex-col mb-4">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl font-bold">@{userData.user.username}</h1>
          </div>
          <div className="flex items-center justify-center mb-4">
            {userData.user.username !== userStatus.username && (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleFollowClick}
              >
                {followed ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Following</p>
              <p>{FollowingCount}</p>
            </div>
            <div>
              <p className="font-semibold">Followers</p>
              <p>{FollowerCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User's posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          @{userData.user.username}'s Posts
        </h2>
        {userData.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
