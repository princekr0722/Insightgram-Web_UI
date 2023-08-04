let baseUrl = "http://localhost:8088";
let baseMessagingUrl = "http://localhost:8089";

// MAIN APP
let logInEP = "/signIn";
let signUpEP = "/signUp";
let signOutEP = "/signOut";
let userNameAvailiblity = "/username/check/";
let mobileNumberAvailiblity = "/mobileNumber/check/";
let viewUserProfilePhotoEP = "/user/?/profilePhoto"
let tokenValidityCheckEp = "/token/check";
let newsfeedPostsEP = "/newsFeed/posts";
let postContentEP = "/post/content/?";
let haveUserLikedAlready = "/post/?/isLiked";
let likePostEP = "/post/?/like";
let unlikePostEP = "/post/?/unlike"
let commentOnPostEP = "/post/?";
let searchUserEP = "/users/search/";
let myProfileEP = "/myProfile";
let userProfileEP = "/user/?/profile";
let userPostsEP = "/user/?/posts";
let isFollowerCheckEP = "/user/?/isfollower/check";
let userFollowEP = "/user/?/follow";
let userUnfollowEP = "/user/?/unfollow";
let editPersonalInfoEP = "/user/personalInfo";
let editProfileInfoEP = "/user/profileInfo";
let addProfilePhotoEP = "/user/profilePhoto";
let changeProfilePhotoEP = "/user/profilePhoto";
let deleteProfilePhotoEP = "/user/profilePhoto";
let logOutUserEP = "/signOut";
let otherCommentsOfPostEP = "/post/?/comments";
let deleteCommentEP = "/post/?1/comment/?2";
let likePageEP = "/post/:postId/likes?pageSize=:pageSize&pageNumber=:pageNumber";
let deletePostEP = "/user/post/?";
let editPostCaptionEP = "/user/post/:postId?caption=:caption";
let getUserBasicInfoByUsernameEP = "/user/:username/info";
let postStoryEP = "/story";
let deleteStoryByIdEP = "/story/:storyId";
let viewStoryByIdEP = "/story/:storyId";
let getStoriesOfUserEP = "/user/:userId/stories";
let seeStoryViewsEP = "/story/:storyId/views?pageSize=:pageSize&pageNumber=:pageNumber";
let getUsersWhoHaveStoryEP = "/following/stories";

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


    baseMessagingUrl,
    getConverationsEP,
    getChatMessagesEP,
    // editChatMessageEP,
    // deleteChatMessageEP,
    // getChatMessageEP,
};
