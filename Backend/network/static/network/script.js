document.addEventListener('DOMContentLoaded', function(){

    function fetchInitialDataAndUpdatePage() {
        // Fetch initial data from the server
        fetch('/get_initial_like_data')
            .then(response => response.json())
            .then(data => {
                // Loop through the data and update like buttons and counts
                data.forEach(initialLikeData => {
                    const postId = initialLikeData.post_id;
                    const liked = initialLikeData.liked;
                    const likeCount = initialLikeData.like_count;

                    // Update like buttons based on initial data
                    const likeButton = document.querySelector(`#like-btn-${postId}`);
                    if (likeButton) {
                        if (liked) {
                            likeButton.textContent = "Unlike";
                        } else {
                            likeButton.textContent = "Like";
                        }
                    }

                    // Update like counts based on initial data
                    const likeCountElement = document.querySelector(`#like-count-${postId}`);
                    if (likeCountElement) {
                        likeCountElement.textContent = likeCount;
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching initial data:', error);
            });
    }
    

    if (window.location.pathname.startsWith('/user_profile/')) {

        function fetchInitialFollowDataAndUpdatePage() {
            let followBtn= document.querySelector('[id^="follow-btn-"]');
            const userId= followBtn.getAttribute('data-user-id')

            // Fetch initial data from the server
            fetch(`/get_initial_follow_data/${userId}`)
                .then(response => response.json())
                .then(data => {
                    // Loop through the data and update follow buttons
                    data.forEach(initialFollowData => {
                        const userId = initialFollowData.user_id;
                        const followed = initialFollowData.followed;
                        const followerCount = initialFollowData.follower_count;
                        const followingCount = initialFollowData.following_count;
        
                        // Update follow buttons based on initial data
                        const followButton = document.querySelector(`#follow-btn-${userId}`);
                        if (followButton) {
                            if (followed) {
                                followButton.textContent = "Unfollow";
                            } else {
                                followButton.textContent = "Follow";
                            }
                        }

                        const followerCountElement = document.querySelector('#follower-count');
                        if (followerCountElement) {
                            followerCountElement.textContent = `Followers: ${followerCount}`;
                        }

                        const followingCountElement = document.querySelector('#following-count');
                        if (followingCountElement) {
                            followingCountElement.textContent = `Following: ${followingCount}`;
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching initial follow data:', error);
                });
        }
    fetchInitialFollowDataAndUpdatePage();
    }

    // Call the fetchInitialDataAndUpdatePage function
    fetchInitialDataAndUpdatePage();
    


    let likeButtons = document.querySelectorAll('[id^="like-btn-"]');
    likeButtons.forEach(like_button => {

        
        like_button.addEventListener('click', function(){
        
            const postId = like_button.getAttribute('data-post-id');
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`/like_post/${postId}`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken, // Include the CSRF token in the request headers
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.liked) {
                    like_button.textContent = "Unlike";
                } else {
                    like_button.textContent = "Like";
                }

                // Update the like count element

                const likeCount= document.querySelector(`#like-count-${postId}`);
                if (likeCount) {
                    likeCount.textContent = data.like_count;
                }

            });
        });

    });


    //handle edit button click

    let editButtons = document.querySelectorAll('[id^="edit-btn-"]');
    editButtons.forEach(editButton => {
        editButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default form submission behavior

            const postId = editButton.getAttribute('data-post-id');
            const postContentElement = document.querySelector(`#post-content-${postId}`);
            const editContainer = document.querySelector('#edit-post-container');
            const editTextarea = document.querySelector('#edit-post-textarea');
            const saveButton = document.querySelector('#save-edit-button');

            // Replace post content with textarea
            postContentElement.style.display = 'none';
            editContainer.style.display = 'block';
            editTextarea.value = postContentElement.textContent;
            saveButton.style.display = 'block';
            editButton.style.display = 'none';
        });
    });
    //function to reset edit container state after the new changes are made and saved succesfully
    function resetEditState(postId) {
        const postContentElement = document.querySelector(`#post-content-${postId}`);
        const editContainer = document.querySelector('#edit-post-container');
        const saveButton = document.querySelector('#save-edit-button');
        const editButton = document.querySelector(`#edit-btn-${postId}`);

        postContentElement.style.display = 'block';
        editContainer.style.display = 'none';
        saveButton.style.display = 'none';
        editButton.style.display = 'block';
    }


    let saveButtons = document.querySelectorAll('[id^="save-edit-button"]');
    saveButtons.forEach(saveButton => {
        saveButton.addEventListener('click', function() {
            const postId = saveButton.getAttribute('data-post-id');
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const newContent = document.querySelector('#edit-post-textarea').value;

       

            // Send edited content to the server
            fetch(`/edit_post/${postId}`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'applicaton/json',
                },
                body: JSON.stringify({ new_content: newContent }),
            })
        .then(response => response.json())

        .then(data => {
            if (data.success) {
                resetEditState(postId);
                document.querySelector(`#post-content-${postId}`).textContent = newContent;
            }
        });
    });
});
    


    

    
    if (window.location.pathname.startsWith('/user_profile/')) {
        let followBtn= document.querySelector('[id^="follow-btn-"]');
        followBtn.addEventListener('click', function(){
            
            const userId= followBtn.getAttribute('data-user-id')
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`/follow/${userId}`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken, // Include the CSRF token in the request headers
                }
            })
            .then(response => response.json())
                .then(data => {
                    
                    const followCount= document.querySelector("#follower-count");
                    
                    if (followCount) {
                        followCount.textContent ="Followers: " + data.follow_count 
                            }

                    
                    if (data.followed) {
                        followBtn.textContent = "Unfollow";
                    } else {
                        followBtn.textContent = "Follow";
                    }
                //const followCount= document.querySelector("#follower-count");
                //if (followCount) {
                    //followCount.textContent ="Followers: " + data.follow_count 
                    //  }

                    

                    

                });
            


        })
    }


});