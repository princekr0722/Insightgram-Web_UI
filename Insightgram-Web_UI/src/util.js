import {
    baseUrl,
    baseMessagingUrl,
    viewUserProfilePhotoEP,
    tokenValidityCheckEp,
    newsfeedPostsEP,
    postContentEP,
    likePostEP,
    unlikePostEP,
    haveUserLikedAlready,
    commentOnPostEP,
    searchUserEP,
    myProfileEP,
    userProfileEP,
    userPostsEP,
    isFollowerCheckEP,
    userFollowEP,
    userUnfollowEP,
    editPersonalInfoEP,
    editProfileInfoEP,
    changeProfilePhotoEP,
    deleteProfilePhotoEP,
    addProfilePhotoEP,
    logOutUserEP,
    otherCommentsOfPostEP,
    deleteCommentEP,
    likePageEP,
    deletePostEP,
    editPostCaptionEP,
    getUserBasicInfoByUsernameEP,
    createPostEP,

    postStoryEP,
    getUsersWhoHaveStoryEP,
    deleteStoryByIdEP,
    viewStoryByIdEP,
    getStoriesOfUserEP,
    seeStoryViewsEP,

    // MESSAGING :
    getConverationsEP,
    getChatMessagesEP,
    // editChatMessageEP,
    // deleteChatMessageEP,
    // getChatMessageEP,


} from "../src/api_endpoints.js";

export {
    isMobile,
    showFooterAlert,
    getUserProfilePhoto,
    isTokenValid,
    getNewsfeedPosts,
    getPostContentUrl,
    likePost,
    unlikePost,
    haveUserLikedPostAlready,
    commentOnPost,
    searchUsers,
    createPost,
    getMyProfile,
    getUserProfile,
    getUserPosts,
    isAFollowerOf,
    followUser,
    unfollowUser,
    editUserPersonalInfo,
    editUserProfileInfo,
    addUserDp,
    changeUserDp,
    deleteUserDp,
    logOutUser,
    getPostTime,
    getOtherCommentsOfPost,
    deleteComment,
    getLikesPageOf,
    deleteUserPost,
    editPostCaption,
    getUserBasicInfoByUsername,
    getTimePast,
    getDate,

    createStory,
    getUsersWhoHaveStory,
    getStoriesOfUser,
    viewStoryById,
    deleteStoryById,


    // MESSAGING:
    connectToMessaging,
    getConverations,
    getChatMessagesPage,



};

// MESSAGING APP
let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));
/*
    {
        method : "GET",
        headers : {
            "Authorization": "Bearer " + jwtToken,
        }
    }
*/
async function getChatMessagesPage(username, messageAccessToken, pageSize, pageNumber) {
    username = username.trim();
    let jwtToken = messageAccessToken.trim();
    if (!(username || jwtToken)) return null;

    try {
        let ep = getChatMessagesEP.replace(":username", username).replace(":pageSize", pageSize).replace(":pageNumber", pageNumber);
        let response = await fetch(baseMessagingUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let pageOfMessages = await response.json();
        return pageOfMessages;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getConverations(username, messageAccessToken) {
    username = username.trim();
    let jwtToken = messageAccessToken.trim();

    if (!(username || jwtToken)) {
        return null;
    }

    try {
        let response = await fetch(baseMessagingUrl + getConverationsEP, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let conversations = await response.json();
        return conversations;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function connectToMessaging(username, messageAccessToken, onMessageReceived = (payload) => { showFooterAlert("No message handler found") }) {
    username = username.trim();
    let jwtToken = messageAccessToken.trim();

    if (!username || !jwtToken) return null;

    var stompClient = null;
    try {
        var socket = new SockJS(baseMessagingUrl + '/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({
            Authorization: "Bearer " + jwtToken,
        }, onConnected, onError);
    } catch (error) {
        showFooterAlert(error);
    }

    function onConnected() {

        stompClient.subscribe('/queue/' + username, onMessageReceived, {
            Authorization: "Bearer " + jwtToken,
        });
    }
    function onError(error) {
        showFooterAlert(error);
    }

    return stompClient;
}

// MAIN APP

async function deleteStoryById(storyId, jwtToken) {
    try {
        let ep = deleteStoryByIdEP.replace(":storyId", storyId);
        let response = await fetch(baseUrl + ep, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if(!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        return await response.text();
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function viewStoryById(storyId, jwtToken) {
    try {
        let ep = viewStoryByIdEP.replace(":storyId", storyId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let blob = await response.blob();
        let storyContentUrl = URL.createObjectURL(blob);
        return storyContentUrl;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getStoriesOfUser(userId, jwtToken) {
    try {
        let ep = getStoriesOfUserEP.replace(":userId", userId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let storiesOfUser = await response.json();
        return storiesOfUser;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function createStory(file, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (!file || !jwtToken) return null;

    try {
        const formData = new FormData();
        formData.append('file', file);

        let response = await fetch(baseUrl + postStoryEP, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            },
            body: formData
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let storyDto = await response.json()

        return storyDto;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getUsersWhoHaveStory(jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (!jwtToken) return;

    try {
        let response = await fetch(baseUrl + getUsersWhoHaveStoryEP, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let userBasicInfos = await response.json();
        return userBasicInfos;
    } catch (error) {
        showFooterAlert(error);
    }
}
async function getUserBasicInfoByUsername(username, jwtToken = "") {
    username = username.trim();
    jwtToken = jwtToken.trim();
    if (!(username || jwtToken)) {
        return null;
    }
    try {
        let ep = getUserBasicInfoByUsernameEP.replace(":username", username);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text())
        }

        let userBasicInfo = await response.json();
        return userBasicInfo;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function editPostCaption(postId = 0, newCaption = "", jwtToken = "") {
    jwtToken = jwtToken.trim();
    newCaption = newCaption.trim();
    if (!(postId || newCaption || jwtToken)) {
        return false;
    }

    try {
        let ep = editPostCaptionEP
            .replace(":postId", postId)
            .replace(":caption", newCaption);
        let response = await fetch(baseUrl + ep, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function getLikesPageOf(postId, pageSize = 30, pageNumber = 1, jwtToken = "") {
    if (!postId || !pageSize || !pageNumber || !jwtToken) {
        return null;
    }

    try {
        let ep = likePageEP.replace(":postId", postId)
            .replace(":pageSize", pageSize)
            .replace(":pageNumber", pageNumber);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let likesPage = await response.json();
        return likesPage;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function deleteComment(postId, commentId, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (!postId || !commentId || !jwtToken) {
        return false;
    }

    try {
        let ep = deleteCommentEP.replace("?1", postId).replace("?2", commentId);
        let response = await fetch(baseUrl + ep, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function getOtherCommentsOfPost(postId, pageSize = 20, pageNumber = 1, sortBy = "DESC", jwtToken = "") {
    jwtToken = jwtToken.trim();
    sortBy = sortBy.toUpperCase();

    if (!postId || !jwtToken || (sortBy != "DESC" && sortBy != "ASC")) {
        return null;
    }

    try {
        let ep = otherCommentsOfPostEP.replace("?", postId)
            + `?pageSize=${pageSize}&pageNumber=${pageNumber}&sortType=${sortBy}`;
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let pageOfComments = await response.json();
        return pageOfComments;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function logOutUser(jwtToken = "", messageingToken = "") {
    jwtToken = jwtToken.trim();
    messageingToken = messageingToken.trim();
    if (jwtToken == "" || messageingToken == "") return null;

    try {
        
        let response = await fetch(baseUrl + logOutUserEP, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "MessageingToken": messageingToken
            }
        });
        
        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }
        
        return await response.text();
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function addUserDp(dp, jwtToken) {
    jwtToken = jwtToken.trim();
    if (dp == null || jwtToken == "") {
        return null;
    }

    try {
        const formDate = new FormData();
        formDate.append("profilePhoto", dp);
        let response = await fetch(baseUrl + addProfilePhotoEP, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            },
            body: formDate,
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let newProfilePhotoUrl = URL.createObjectURL(await response.blob());
        showFooterAlert("Added profile photo", false)
        return newProfilePhotoUrl;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function deleteUserDp(jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (jwtToken == "") return false;

    try {
        let response = await fetch(baseUrl + deleteProfilePhotoEP, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let deletedDpMsg = await response.text();
        showFooterAlert(deletedDpMsg, false);
        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function changeUserDp(dp, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (dp == null || jwtToken == "") {
        return null;
    }

    try {
        const formDate = new FormData();
        formDate.append("profilePhoto", dp);
        let response = await fetch(baseUrl + changeProfilePhotoEP, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            },
            body: formDate,
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let newProfilePhotoUrl = URL.createObjectURL(await response.blob());
        showFooterAlert("Changed profile photo", false)
        return newProfilePhotoUrl;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function editUserPersonalInfo(personalInfoForm, jwtToken = "") {

    jwtToken = jwtToken.trim();
    if (personalInfoForm == null || jwtToken == "") {
        return null;
    }

    try {

        let response = await fetch(baseUrl + editPersonalInfoEP, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            },
            body: JSON.stringify(personalInfoForm)
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let message = await response.text();
        return message;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function editUserProfileInfo(profileInfoForm, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (profileInfoForm == null || jwtToken == "") {
        return null;
    }

    try {

        let response = await fetch(baseUrl + editProfileInfoEP, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + jwtToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileInfoForm),
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let message = await response.text();
        return message;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function unfollowUser(userId = 0, jwtToken = null) {
    if (userId == 0 || jwtToken == null) {
        return false;
    }

    try {
        let ep = userUnfollowEP.replace("?", userId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        let msg = await response.text();

        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function followUser(userId = 0, jwtToken = null) {
    if (userId == 0 || jwtToken == null) {
        return false;
    }

    try {
        let ep = userFollowEP.replace("?", userId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            let errorMessage = await response.text();
            throwCustomErrorMessage(errorMessage);
        }

        let msg = await response.text();

        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function isAFollowerOf(userId = 0, jwtToken = null) {
    if (userId == 0 || jwtToken == null) {
        showFooterAlert();
        return null;
    }
    if (userId == currentUserDetails.userId) return false;
    try {
        let ep = isFollowerCheckEP.replace("?", userId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwStatusCodeError(response);
        }

        return await response.json();
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function deleteUserPost(postId = 0, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (!postId || !jwtToken) {
        return false;
    }

    try {

        let ep = deletePostEP.replace("?", postId);
        let response = await fetch(baseUrl + ep, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwCustomErrorMessage(await response.text());
        }

        return true;
    } catch (error) {
        showFooterAlert(error);
    }
    return false;
}
async function getUserPosts(userId, jwtToken = "", pageSize = 15, pageNumber = 1) {
    jwtToken = jwtToken.trim();
    if (userId == null || jwtToken == "") {
        return null;
    }

    try {
        let ep = userPostsEP.replace("?", userId);
        let pagingParam = "?pageNumber=" + pageNumber + "&pageSize=" + pageSize;
        let response = await fetch(baseUrl + ep + pagingParam, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwStatusCodeError();
            return null;
        }

        let postsPage = await response.json();
        return postsPage;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getUserProfile(userId, jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (userId == null || jwtToken == "") {
        return null;
    }
    try {
        let ep = userProfileEP.replace("?", userId)
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwStatusCodeError();
            return null;
        }

        let userProfileDto = await response.json();
        return userProfileDto;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getMyProfile(jwtToken = "") {
    jwtToken = jwtToken.trim();
    if (jwtToken == "") {
        return null;
    }
    try {
        let response = await fetch(baseUrl + myProfileEP, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwStatusCodeError();
            return null;
        }

        let myProfileDto = await response.json();
        return myProfileDto;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function createPost(files, postType, caption, jwtToken = "") {
    if (files == null || !(postType === "REEL" || postType === "PHOTO_OR_VIDEO") || jwtToken == null) {
        return null;
    }
    postType = postType.trim();
    caption = caption.trim();

    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
        formData.append('postType', postType);
        formData.append('caption', caption);

        const response = await fetch(baseUrl + createPostEP, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + jwtToken,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to create post');
        }

        const postDto = await response.json();
        return postDto;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function searchUsers(searchText, jwtToken, pageSize = 10, pageNumber = 1) {
    if (searchText == null || searchText.trim() == "" || jwtToken == null) {
        return null;
    }
    try {
        let ep = searchText + `?pageSize=${pageSize}&pageNumber=${pageNumber}`;
        let response = await fetch(baseUrl + searchUserEP + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        })

        if (!response.ok) {
            throwCustomErrorMessage(await response.text())
        }

        let searchedUsersPage = await response.json();
        return searchedUsersPage;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function commentOnPost(postId, comment, jwtToken) {
    if (!postId || !jwtToken) {
        return null;
    }

    try {

        let ep = commentOnPostEP.replace("?", postId);
        let response = await fetch(baseUrl + ep + "?comment=" + comment, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwtToken,
            }
        });

        if (!response.ok) {
            throwStatusCodeError(response);
        }

        let userComment = await response.json()
        return userComment;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function haveUserLikedPostAlready(postId, jwtToken) {
    if (!postId || !jwtToken) {
        return;
    }
    try {
        let ep = haveUserLikedAlready.replace("?", postId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        });

        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText);
        }

        let haveLiked = await response.json();
        return haveLiked;
    } catch (error) {
        showFooterAlert(error);
        return null;
    }
}
async function unlikePost(postId, jwtToken) {
    if (!postId || !jwtToken) {
        return;
    }

    try {

        let ep = unlikePostEP.replace("?", postId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        });

        if (!response.ok) {
            let errorMessage = await response.text();
            throwCustomErrorMessage(errorMessage);
        }

        return true;
    } catch (error) {
        showFooterAlert(error);
        return false;
    }
}
async function likePost(postId, jwtToken) {
    if (!postId || !jwtToken) {
        return false;
    }

    try {

        let ep = likePostEP.replace("?", postId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        });

        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        return true;
    } catch (error) {
        showFooterAlert(error);
        return false;
    }
}
async function getPostContentUrl(contentId, jwtToken) {
    try {
        let ep = postContentEP.replace("?", contentId);
        let response = await fetch(baseUrl + ep, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        })

        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText);
        }

        let blob = await response.blob();
        let contentUrl = URL.createObjectURL(blob);

        return contentUrl;
    } catch (error) {
        showFooterAlert(error);
    }
    return null;
}
async function getNewsfeedPosts(pageNumber = 1, pageSize = 10) {
    let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));

    let requestParam = `?pageSize=${pageSize}&pageNumber=${pageNumber}`

    try {
        let response = await fetch(baseUrl + newsfeedPostsEP + requestParam, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        });

        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText);
        }

        let posts = await response.json();
        return posts;
    } catch (error) {
        showFooterAlert(error)
    }
    return [];
}
function showFooterAlert(message = "Something went wrong, Please try again", isError = true, image = "/Insightgram-Web_UI/Images/error.png") {
    let border = "1px solid rgb(131, 131, 255)";
    let backgroundColor = "rgba(0, 0, 200, 0.050)";

    if (isError) {
        border = "1px solid rgb(255, 131, 131)";
        backgroundColor = "rgba(255, 0, 0, 0.050)";
    } else {
        image = "/Insightgram-Web_UI/Images/check-mark.png";
    }
    let footerAlert = `
        <div id='footer_alert' class="${isMobile()?"for-mobile":""}">
            <div style='margin: 0px; padding: 0px;'>
                <img src='${image}' alt='' id='footer_alert_symbol'>
            </div>
                <div><span>${message}</span></div>
        </div>`

    document.body.insertAdjacentHTML('beforeend', footerAlert);

    let footerAlerts = document.querySelectorAll("#footer_alert");

    footerAlerts.forEach((n) => {
        n.style.border = border;
        n.style.backgroundColor = backgroundColor;
        n.style.bottom = "30px";
    });

    setTimeout(() => {
        footerAlerts.forEach((n) => {
            n.remove();
        });
    }, 3200);
}
async function getUserProfilePhoto(userId, jwtToken) {
    if (!userId) {
        userId = -1;
    }
    let imageUrl;
    try {
        let endPoint = viewUserProfilePhotoEP.replace("?", userId);
        let response = await fetch(baseUrl + endPoint, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + jwtToken
            }
        });

        if (!response.ok) {
            imageUrl = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";
        } else {
            let blob = await response.blob();
            imageUrl = URL.createObjectURL(blob);
        }

    } catch (error) {
        imageUrl = "../Images/no_profile_photo.jpg";
        showFooterAlert(error)
    }

    if (currentUserDetails.userId == userId) {
        localStorage.setItem("currentUserProfilePhotoURL", JSON.stringify(imageUrl));
    }
    return imageUrl;
}
async function isTokenValid(jwtToken) {
    let response = await fetch(baseUrl + tokenValidityCheckEp, {
        method: "GET",
        headers: {
            "token": jwtToken
        }
    })

    if (!response.ok) {
        throw new Error("Internal server error, please try again");
    }

    return await response.json();
}
function throwStatusCodeError(response) {
    throw new Error(response.status + " " + response.statusText);
}
function throwCustomErrorMessage(message) {
    throw new Error(message);
}
function getTimePast(time) {
    return getPostTime(time);
}
function getPostTime(postTime) {
    // postTime = new Date(postTime)
    const dateString = postTime;
    const [time, date] = dateString.split(" ");

    // Rearrange date components to match "MM-DD-YYYY" format
    const [day, month, year] = date.split("-");
    const rearrangedDate = `${month}-${day}-${year}`;

    // Combine the rearranged date and time components
    const combinedString = `${rearrangedDate} ${time}`;

    // Create a new Date object from the combined string
    postTime = new Date(combinedString);
    let today = new Date();

    let yearDiff = today.getFullYear() - postTime.getFullYear();
    if (yearDiff >= 1) return yearDiff + "y";

    let monthsDiff = yearDiff * 12 + (today.getMonth - postTime.getMonth);
    if (monthsDiff >= 1) return monthsDiff == 1 ? monthsDiff + "month" : monthsDiff + "months";

    let timeDiff = today.getTime() - postTime.getTime();
    let daysDiff = Math.floor(timeDiff / (24 * 3600000));
    if (daysDiff >= 1) return daysDiff + "d";

    let hourDiff = Math.floor(timeDiff / 3600000);
    if (hourDiff >= 1) return hourDiff + "h";

    let minuteDiff = Math.floor(timeDiff / 60000);
    if (minuteDiff >= 1) return minuteDiff + "m";

    const secondDiff = Math.floor(timeDiff / 1000);
    return secondDiff + " s";
}
function getDate(timeString) {
    const dateString = timeString;

    // Step 1: Extract date and time components
    const [time, date] = dateString.split(" ");
    const [hours, minutes, seconds] = time.split(":");
    const [day, month, year] = date.split("-");

    // Step 2: Create a new Date object using the extracted components
    let convertedDate = new Date(year, month - 1, day, hours, minutes, seconds);
    return convertedDate;
}
function isMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile;
}