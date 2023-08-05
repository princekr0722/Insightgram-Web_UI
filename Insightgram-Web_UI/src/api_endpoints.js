let baseUrl = "http://localhost:8088";
let baseMessagingUrl = "http://localhost:8089";

// let baseUrl = "http://localhost:8080";
// let baseMessagingUrl = baseUrl;

// MAIN APP
let logInEP = "/main-app/signIn";
let signUpEP = "/main-app/signUp";
let signOutEP = "/main-app/signOut";
let userNameAvailiblity = "/main-app/username/check/";
let mobileNumberAvailiblity = "/main-app/mobileNumber/check/";
let viewUserProfilePhotoEP = "/main-app/user/?/profilePhoto"
let tokenValidityCheckEp = "/main-app/token/check";
let newsfeedPostsEP = "/main-app/newsFeed/posts";
let createPostEP = "/main-app/post";
let postContentEP = "/main-app/post/content/?";
let haveUserLikedAlready = "/main-app/post/?/isLiked";
let likePostEP = "/main-app/post/?/like";
let unlikePostEP = "/main-app/post/?/unlike"
let commentOnPostEP = "/main-app/post/?";
let searchUserEP = "/main-app/users/search/";
let myProfileEP = "/main-app/myProfile";
let userProfileEP = "/main-app/user/?/profile";
let userPostsEP = "/main-app/user/?/posts";
let isFollowerCheckEP = "/main-app/user/?/isfollower/check";
let userFollowEP = "/main-app/user/?/follow";
let userUnfollowEP = "/main-app/user/?/unfollow";
let editPersonalInfoEP = "/main-app/user/personalInfo";
let editProfileInfoEP = "/main-app/user/profileInfo";
let addProfilePhotoEP = "/main-app/user/profilePhoto";
let changeProfilePhotoEP = "/main-app/user/profilePhoto";
let deleteProfilePhotoEP = "/main-app/user/profilePhoto";
let logOutUserEP = "/main-app/signOut";
let otherCommentsOfPostEP = "/main-app/post/?/comments";
let deleteCommentEP = "/main-app/post/?1/comment/?2";
let likePageEP = "/main-app/post/:postId/likes?pageSize=:pageSize&pageNumber=:pageNumber";
let deletePostEP = "/main-app/user/post/?";
let editPostCaptionEP = "/main-app/user/post/:postId?caption=:caption";
let getUserBasicInfoByUsernameEP = "/main-app/user/:username/info";
let postStoryEP = "/main-app/story";
let deleteStoryByIdEP = "/main-app/story/:storyId";
let viewStoryByIdEP = "/main-app/story/:storyId";
let getStoriesOfUserEP = "/main-app/user/:userId/stories";
let seeStoryViewsEP = "/main-app/story/:storyId/views?pageSize=:pageSize&pageNumber=:pageNumber";
let getUsersWhoHaveStoryEP = "/main-app/following/stories";

// MESSAGING APP
let getConverationsEP = "/chat-app/message/conversations";
let getChatMessagesEP = "/chat-app/:username/messages?pageSize=:pageSize&pageNumber=:pageNumber";
// let editChatMessageEP = "/chat-app/:receiver/message/:messageId?newMessage=:newMessage";
// let deleteChatMessageEP = "/chat-app/:receiver/message/:messageId";
// let getChatMessageEP = "/chat-app/:username/message/:messageId";

export {
    baseUrl,
    logInEP,
    signUpEP,
    signOutEP,
    mobileNumberAvailiblity,
    userNameAvailiblity,
    viewUserProfilePhotoEP,
    tokenValidityCheckEp,
    newsfeedPostsEP,
    postContentEP,
    haveUserLikedAlready,
    likePostEP,
    unlikePostEP,
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
    postStoryEP,
    deleteStoryByIdEP,
    viewStoryByIdEP,
    getStoriesOfUserEP,
    seeStoryViewsEP,
    getUsersWhoHaveStoryEP,
    createPostEP,


    baseMessagingUrl,
    getConverationsEP,
    getChatMessagesEP,
    // editChatMessageEP,
    // deleteChatMessageEP,
    // getChatMessageEP,
};
