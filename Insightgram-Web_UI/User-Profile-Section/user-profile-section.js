import {
    getUserProfilePhoto,
    getPostContentUrl,
    getMyProfile,
    getUserProfile,
    getUserPosts,
    isAFollowerOf,
    followUser,
    unfollowUser,
    editUserPersonalInfo,
    editUserProfileInfo,
    showFooterAlert,
    addUserDp,
    changeUserDp,
    deleteUserDp,
    logOutUser,


} from "../src/util.js";

let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken")) || "";
let messageAccessToken = JSON.parse(localStorage.getItem("insightgramMessagingToken"));
let currentUser = JSON.parse(localStorage.getItem("insightgramUserDetails")) || null;

let parentWindow = window.parent;

window.addEventListener('message', function (event) {
    let message = event.data[0];
    if (message == "showMyProfile") {
        showMyProfile();
    } else if (message == "showUserProfile") {
        showUserProfile(event.data[1]);
    } else if (message == "showMyNewPostInProfileSec") {
        showMyNewPostInProfileSec(event.data[1]);
    } else if (message == "removePostCard") {
        let postId = event.data[1];
        removePostCard(postId);
    }
    else {
        console.log("Illegal Argument")
    }
});
let userDP = document.querySelector("#user-dp .user_profile_photo");
let username = document.querySelectorAll("#user-main-details .username");
let postsCounter = document.querySelector("#counters>div:nth-child(1)");
let followersCounter = document.querySelector("#counters>div:nth-child(2)")
let followingsCounter = document.querySelector("#counters>div:nth-child(3)")
let fullname = document.querySelector("#user-other-details .fullname");
let bio = document.querySelector("#user-other-details .bio");
let website = document.querySelector("#user-other-details .website");
let userPostsContainer = document.querySelector("#user-posts-container .body");
let postsSecBtn = document.querySelector("#user-posts-container .posts-sec-btn");
let reelsSecBtn = document.querySelector("#user-posts-container .reels-sec-btn");
let currentUserProfileOpts = document.querySelector("#current-user-profile");
let otherUserProfileOpts = document.querySelector("#other-user-profile");
let overlayEditProfileSec = document.querySelector(".overlay-screen.edit-profile-sec");
let overlayChangeDpWindow = document.querySelector(".overlay-screen.change-dp-window");

async function showMyProfile() {
    let myProfileDto = await getMyProfile(jwtToken);

    showCurrentUserOptions();
    loadBasicUserDetails(myProfileDto);
    userPostsPageWise(currentUser.userId);

}
async function showUserProfile(userId) {
    let userProfileDto = await getUserProfile(userId, jwtToken);

    let isFollower = await isAFollowerOf(userId, jwtToken);
    if (isFollower == null) return;

    showOtherUserOptions(isFollower, userProfileDto);
    loadBasicUserDetails(userProfileDto);

    if (userProfileDto.accountType == "PRIVATE" && !isFollower) {
        showPrivateAccMsg();
    } else {
        userPostsPageWise(userId);
    }
}
function showCurrentUserOptions() {
    if (otherUserProfileOpts != null) otherUserProfileOpts.style.display = "none";
    currentUserProfileOpts.style.display = "flex";

    let editProfileBtn = document.querySelector("#current-user-profile .edit-profile-btn")
    let moreProfileOptBtn = document.querySelector("#current-user-profile .more-options")
    let moreOptsList = moreProfileOptBtn.querySelector(".more-opts-list");
    let logOutBtn = moreProfileOptBtn.querySelector("#log-out-btn");

    editProfileBtn.addEventListener("click", showEditProfileSec);
    moreProfileOptBtn.addEventListener("click", showMoreOpts);
    logOutBtn.addEventListener("click", logOutUserLogic);

    async function logOutUserLogic() {
        let logOutMsg = await logOutUser(jwtToken, messageAccessToken);
        
        if (logOutMsg) {
            showFooterAlert(logOutMsg, false);
            localStorage.clear();
            hideMoreOpts();
            setTimeout(() => {
                parent.location.reload();
            }, 3000);
        }
    }
    function showMoreOpts() {
        moreOptsList.style.display = "flex";
        moreProfileOptBtn.removeEventListener("click", showMoreOpts);
        moreProfileOptBtn.addEventListener("click", hideMoreOpts);
    }
    function hideMoreOpts() {
        moreOptsList.style.display = "none";
        moreProfileOptBtn.addEventListener("click", showMoreOpts);
        moreProfileOptBtn.removeEventListener("click", hideMoreOpts);
    }
}
function showOtherUserOptions(isFollower, user) {
    if (currentUserProfileOpts != null) currentUserProfileOpts.style.display = "none";

    otherUserProfileOpts.style.display = "flex";
    let followUnfollowBtn = otherUserProfileOpts.querySelector(".follow-unfollow-btn");
    let messageBtn = otherUserProfileOpts.querySelector(".message-btn");

    if (isFollower) {
        activeUnfollowBtn("Unfollow");
    } else {
        if (user.accountType == "PRIVATE") {
            messageBtn.remove();
            activeFollowRequestBtn();
        } else {
            activeFollowBtn();
        }
    }
    addMessageBtnLogic();
    function addMessageBtnLogic() {
        messageBtn.addEventListener("click", ()=>{
            parentWindow.postMessage(["openMessengerForUser",{
                userId : user.userId,
                profilePhoto : user.profilePhoto,
                username : user.username,
                userFullName : user.firstName + " " + user.lastName,
            }]);
        });
    }
    function activeUnfollowBtn() {
        followUnfollowBtn.removeEventListener("click", followUserRequestLogic);
        followUnfollowBtn.removeEventListener("click", followUserLogic);
        followUnfollowBtn.removeEventListener("click", cancleRequestLogic);

        followUnfollowBtn.innerHTML = "Unfollow";
        followUnfollowBtn.classList.remove("blue");
        followUnfollowBtn.classList.add("gray");
        followUnfollowBtn.addEventListener("click", unfollowUserLogic);
    }
    function activeCancelRequestBtn() {
        followUnfollowBtn.removeEventListener("click", followUserRequestLogic);
        followUnfollowBtn.removeEventListener("click", followUserLogic);
        followUnfollowBtn.removeEventListener("click", unfollowUserLogic);

        followUnfollowBtn.innerHTML = "Cancel Request";
        followUnfollowBtn.classList.remove("blue");
        followUnfollowBtn.classList.add("gray");
        followUnfollowBtn.addEventListener("click", cancleRequestLogic);
    }
    function activeFollowBtn() {
        followUnfollowBtn.removeEventListener("click", unfollowUserLogic);
        followUnfollowBtn.removeEventListener("click", followUserRequestLogic);
        followUnfollowBtn.removeEventListener("click", cancleRequestLogic);

        followUnfollowBtn.innerHTML = "Follow";
        followUnfollowBtn.classList.remove("gray");
        followUnfollowBtn.classList.add("blue");
        followUnfollowBtn.addEventListener("click", followUserLogic);

        if (user.accountType == "PRIVATE") {
            messageBtn.remove();
        }
    }
    function activeFollowRequestBtn() {
        followUnfollowBtn.removeEventListener("click", unfollowUserLogic);
        followUnfollowBtn.removeEventListener("click", followUserRequestLogic);
        followUnfollowBtn.removeEventListener("click", cancleRequestLogic);
        followUnfollowBtn.removeEventListener("click", followUserLogic);

        followUnfollowBtn.innerHTML = "Follow";
        followUnfollowBtn.classList.remove("gray");
        followUnfollowBtn.classList.add("blue");
        followUnfollowBtn.addEventListener("click", followUserRequestLogic);
    }
    async function followUserLogic() {
        let ifFollowed = await followUser(user.userId, jwtToken);
        if (ifFollowed) {
            activeUnfollowBtn("Unfollow");
            let followerCount = followersCounter.querySelector(".count");
            followerCount.innerHTML = user.noOfFollowers + 1;
            user.noOfFollowers++;
            if (user.noOfFollowers + 1 == 1) followersCounter.querySelector(".countOf").innerHTML = "follower";

        }
    }
    async function unfollowUserLogic() {
        let isFollowed = await unfollowUser(user.userId, jwtToken);
        if (isFollowed) {
            activeFollowBtn();
            let followerCount = followersCounter.querySelector(".count");
            followerCount.innerHTML = user.noOfFollowers - 1;
            user.noOfFollowers--;
            if (user.noOfFollowers - 1 == 1) followersCounter.querySelector(".countOf").innerHTML = "follower";
        }
    }
    async function followUserRequestLogic() {
        let isRequestSent = await followUser(user.userId, jwtToken);

        if (isRequestSent) {
            activeCancelRequestBtn();
        }
    }
    async function cancleRequestLogic() {
        console.log("Unimplemented feature yet!");
        let requestCancled = true;
        if (requestCancled) {
            activeFollowBtn();
        }
    }
}

let currentUserProfilePhoto;

async function loadBasicUserDetails(user) {
    if (user.profilePhoto != null)
        userDP.src = await getUserProfilePhoto(user.userId, jwtToken);

    if (user.userId == currentUser.userId) {
        userDP.addEventListener("click", showOverlayChangeDpWindow);
    }
    currentUserProfilePhoto = userDP.src;

    username.forEach(u => {
        u.innerHTML = user.username;
    })

    postsCounter.querySelector(".count").innerHTML = user.noOfPosts;
    if (user.noOfPosts == 1) postsCounter.querySelector(".countOf").innerHTML = "post";

    followersCounter.querySelector(".count").innerHTML = user.noOfFollowers;
    if (user.noOfFollowers == 1) followersCounter.querySelector(".countOf").innerHTML = "follower";

    followingsCounter.querySelector(".count").innerHTML = user.noOfFollowing;
    if (user.noOfFollowing == 1) followingsCounter.querySelector(".countOf").innerHTML = "following";

    fullname.innerHTML = user.firstName + " " + user.lastName;

    if (bio != null) bio.innerHTML = user.bio;
    else bio.remove();

    if (website != null) website.innerHTML = user.website;
    else website.remove();


}
function showEditProfileSec() {
    document.body.style.overflowY = "hidden";
    overlayEditProfileSec.style.display = "flex";
    overlayEditProfileSec.addEventListener("click", removeOverlayScreen);

    let userProfilePhoto = overlayEditProfileSec.querySelector(".user_profile_photo");
    let changeDpOpt = overlayEditProfileSec.querySelector(".change-dp-opt");
    let username = overlayEditProfileSec.querySelector(".username");
    let websiteField = overlayEditProfileSec.querySelector("#website");
    let bioField = overlayEditProfileSec.querySelector("#bio");
    let bioLenghtCount = overlayEditProfileSec.querySelector(".bio-lenght-count");
    let bioLengthLimit = overlayEditProfileSec.querySelector(".bio-length-limit");
    let genderField = overlayEditProfileSec.querySelector("#gender");
    let submitBtn = overlayEditProfileSec.querySelector(".form");

    userProfilePhoto.src = currentUserProfilePhoto;
    username.innerHTML = currentUser.username;
    websiteField.value = currentUser.website || "";
    bioField.value = currentUser.bio || "";
    bioLenghtCount.innerHTML = currentUser.bio ? currentUser.bio.length : 0;
    bioLengthLimit.innerHTML = 150;
    if (currentUser.gender == "MALE") {
        genderField.value = "MALE";
    } else if (currentUser.gender == "FEMALE") {
        genderField.value = "FEMALE";
    } else if (currentUser.gender == "OTHERS") {
        genderField.value = "OTHERS";
    } else {
        genderField.value = "PREFER_NOT_TO_SAY";
    }

    changeDpOpt.addEventListener("click", showOverlayChangeDpWindow);
    bioField.addEventListener("input", countLengthOfBio);
    submitBtn.addEventListener("submit", submitChanges);

    async function submitChanges(event) {
        event.preventDefault();

        let profileInfoForm = {
            website: websiteField.value.trim() || null,
            bio: bioField.value.trim() || null,
            gender: genderField.value,
        };

        let savedMessage = await editUserProfileInfo(profileInfoForm, jwtToken);
        if (savedMessage) {
            currentUser.website = profileInfoForm.website;
            website.innerHTML = profileInfoForm.website;
            currentUser.bio = profileInfoForm.bio;
            bio.innerHTML = profileInfoForm.bio;
            currentUser.gender = profileInfoForm.gender;
            localStorage.setItem("insightgramUserDetails", JSON.stringify(currentUser));
            showFooterAlert(savedMessage, false);
            removeOverlayScreen();
        }
    }
    function countLengthOfBio(event) {
        bioLenghtCount.innerHTML = event.currentTarget.value.length;
    }
    function removeOverlayScreen(event) {
        if (!event || event.target == overlayEditProfileSec) {
            overlayEditProfileSec.removeEventListener("click", removeOverlayScreen);
            submitBtn.removeEventListener("submit", submitChanges);
            bioField.removeEventListener("input", countLengthOfBio);
            overlayEditProfileSec.style.display = "none";
            document.body.style.overflowY = "auto";
        }
    }
}
function showOverlayChangeDpWindow() {
    let uploadDpBtn = overlayChangeDpWindow.querySelector("#upload-dp-btn");
    let uploadDpField = overlayChangeDpWindow.querySelector("#upload-dp-field");
    let removeDpBtn = overlayChangeDpWindow.querySelector("#remove-dp-btn");
    let cancelBtn = overlayChangeDpWindow.querySelector(".close-window-btn");

    overlayChangeDpWindow.addEventListener("click", closeUploadProfileWindowWithBackground);
    uploadDpBtn.addEventListener("click", addUploadBtnLogic)
    cancelBtn.addEventListener("click", closeUploadProfileWindow);
    removeDpBtn.addEventListener("click", addRemoveDpBtnLogic)
    overlayChangeDpWindow.style.display = "flex";

    function addUploadBtnLogic() {
        uploadDpField.click();
        uploadDpField.addEventListener("change", uploadDp);
    }
    async function uploadDp() {
        if (uploadDpField.value) {
            let newUploadedDp = uploadDpField.files[0];
            uploadDpField.value = null;
            uploadDpField.files = null;

            let newDpURL;
            if (!currentUser.profilePhoto) {
                newDpURL = await addUserDp(newUploadedDp, jwtToken);
            } else {
                newDpURL = await changeUserDp(newUploadedDp, jwtToken);
            }
            if (newDpURL) {
                changeEveryDpInPage(newDpURL);
                closeUploadProfileWindow();
            } else {
            }
        } else {
            uploadDpField.removeEventListener("change", uploadDp);
            uploadDpField.addEventListener("change", uploadDp);
        }
    }
    async function addRemoveDpBtnLogic() {
        let isDeleted = await deleteUserDp(jwtToken);
        if (isDeleted) {
            changeEveryDpInPage();
            closeUploadProfileWindow();
        }
    }
    function closeUploadProfileWindowWithBackground(event) {
        if (event.target == event.currentTarget) {
            closeUploadProfileWindow();
        }
    }
    function closeUploadProfileWindow() {
        overlayChangeDpWindow.style.display = "none";
        uploadDpBtn.removeEventListener("click", addUploadBtnLogic);
        uploadDpField.removeEventListener("change", uploadDp);
        removeDpBtn.removeEventListener("click", addRemoveDpBtnLogic);
        cancelBtn.removeEventListener("click", closeUploadProfileWindow);
        overlayChangeDpWindow.removeEventListener("click", closeUploadProfileWindowWithBackground);
    }
}

function changeEveryDpInPage(newDpURL = "/Insightgram-Web_UI/Images/no_profile_photo.jpg") {
    currentUser.profilePhoto = newDpURL == "/Insightgram-Web_UI/Images/no_profile_photo.jpg" ? null : newDpURL;
    localStorage.setItem("insightgramUserDetails", JSON.stringify(currentUser));
    currentUserProfilePhoto = newDpURL;
    let allDp = document.querySelectorAll(".user_profile_photo");
    allDp.forEach(dp => {
        dp.src = newDpURL;
    });
}

let pageNumber = 1;
let pageSize = 15;
async function userPostsPageWise(userId) {
    window.addEventListener("scroll", loadPostsPageOnReachingEnd);
    loadPostsPageOnReachingEnd()

    async function loadPostsPageOnReachingEnd() {
        let distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

        if (distanceToBottom <= 15) {
            window.removeEventListener("scroll", loadPostsPageOnReachingEnd);
            let pageOfPosts = await getUserPosts(userId, jwtToken, pageSize, pageNumber);

            if (pageOfPosts == null || pageOfPosts.pageContent.length == 0) {
                if (pageNumber == 1 && pageOfPosts.pageContent.length == 0) showNoPostMessage();
            } else {
                pageNumber++;
                hideNoPostMessage();
                for (let postDto of pageOfPosts.pageContent) {
                    userPostsContainer.insertAdjacentHTML("beforeend", await getPostCard(postDto))
                    addPostCardLogic(userPostsContainer.lastChild, postDto);
                }
                window.addEventListener("scroll", loadPostsPageOnReachingEnd);
            }
        }
    }
}
function showNoPostMessage() {
    userPostsContainer.innerHTML = null;
    userPostsContainer.innerHTML = `<div id="no-post-msg">No Posts Yet</div>`
}
function hideNoPostMessage() {
    let noPostMsg = userPostsContainer.querySelector("#no-post-msg");
    if (noPostMsg != null) noPostMsg.remove();
}
function showPrivateAccMsg() {
    userPostsContainer.innerHTML = null;
    userPostsContainer.innerHTML =
        `<div id="private-acc-msg">
        <span>This Account is Private</span>
        <span>Follow to see their photos and videos.</span>
    </div>`;
}
function hidePrivateAccMsg() {
    let privateAccMsg = userPostsContainer.querySelector("#private-acc-msg");
    if (privateAccMsg != null) privateAccMsg.remove();
}
async function getPostCard(postDto) {
    let thumbnailURL = "/Insightgram-Web_UI/Images/default_thumbnail.png";
    if (postDto.content[0].contentType.split("/")[0] == "video") {
        thumbnailURL = "/Insightgram-Web_UI/Images/default_video_thumbnail.png";
    } else {
        thumbnailURL = await getPostContentUrl(postDto.content[0].contentId, jwtToken);
    }

    let postCard =
        `<div class="post-card" data-postid="${postDto.postId}">
        <img src="${thumbnailURL}" alt="">
        <div class="post-like-comment-count">
            <div>
                <svg aria-label="Like" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                <span class="like-count">${postDto.noOfLikes}</span>
            </div>
            <div>
                <svg aria-label="Comment" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment</title><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path></svg>
                <span class="comment-count">${postDto.noOfComments}</span>
            </div>
        </div>
        ${postDto.content.length == 1 ? ""
            : `<div class="carousel-post">
                <svg aria-label="Carousel" class="x1lliihq x1n2onr6" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
            </div>`}
    </div>`;
    return postCard;
}
async function showMyNewPostInProfileSec(postDto) {
    let newPostCard = await getPostCard(postDto);
    hideNoPostMessage();
    userPostsContainer.insertAdjacentHTML("afterbegin", newPostCard);
    addPostCardLogic(userPostsContainer.firstChild, postDto);
    postsCounter.querySelector(".count").innerHTML = +postsCounter.querySelector(".count").innerHTML + 1;
    if (+postsCounter.querySelector(".count").innerHTML == 1) postsCounter.querySelector(".countOf").innerHTML = "post";
}
function addPostCardLogic(postCard, postDto) {
    postCard.addEventListener("click", () => {
        parentWindow.postMessage(["showDetailedPost", {
            post: postDto
        }])
    })
}

function removePostCard(postId) {
    let postCardElement = document.querySelector(`.post-card[data-postid="${postId}"]`);
    postCardElement.remove();

    postCardElement = document.querySelector(`.post-card`);
    if (!postCardElement) {
        showNoPostMessage();
    }
}

// SHOW FOLLOWERS and FOLLOWINGS