import {
    baseUrl
} from "../src/api_endpoints.js";

import {
    showFooterAlert,
    getUserProfilePhoto,
    getNewsfeedPosts,
    getPostContentUrl,
    likePost,
    unlikePost,
    haveUserLikedPostAlready,
    commentOnPost,
    isTokenValid,
    logOutUser,
    getPostTime,
    isAFollowerOf,
    getUsersWhoHaveStory,
    getStoriesOfUser,
    isMobile,

} from "../src/util.js"
import { connectToMessagingWS } from "./messaging-socket.js";
import { startStoryViewSection } from "./story-section.js";

// GLOABAL VALUES
let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken")) || "null";
let messageingToken = JSON.parse(localStorage.getItem("insightgramMessagingToken")) || "null";
let stompClient = null;

// OVERLAY SCREEN SETTINGS

let overlayScreen = document.querySelector("#overlay-screen");
function showOverlayScreen(innerHTML) {
    overlayScreen.style.display = "flex";
    overlayScreen.innerHTML = innerHTML;
}
function removeOverlayScreen() {
    overlayScreen.style.display = "none";
    overlayScreen.innerHTML = null;
}
function sendMessageToIframe(iframe, message) {
    iframe.contentWindow.postMessage(message, '*');
}
window.addEventListener('message', function (event) {
    let message = event.data[0];
    if (message == "removeCreationSection") {
        removeOverlayScreen();
    } else if (message == "showMyNewPostInNewsfeed") {
        let profileSecFrame = this.document.querySelector("#my-profile-sec");
        if (profileSecFrame != null) {
            sendMessageToIframe(profileSecFrame, ["showMyNewPostInProfileSec", event.data[1]]);
            removeOverlayScreen();
        } else {
            showMyNewPostInNewsfeed(event.data[1]);
        }
        showFooterAlert("Posted", false, "/Insightgram-Web_UI/Images/check-mark.png")
    } else if (message == "gotoProfileOf") {
        gotoProfileOf(event.data[1]);
    } else if (message == "removeOverlayScreen") {
        removeOverlayScreen();
    } else if (message == "changesInPost") {
        let data = event.data[1];
        updatePost(data);
    } else if (message == "deletePostCard") {
        let postId = event.data[1];
        removePostHtml(postId);
    } else if (message == "showDetailedPost") {
        let data = event.data[1];
        let post = data.post;
        let isLiked = data.isLiked;
        showDetailedPost(post, isLiked)
    } else if (message == "openMessengerForUser") {
        let userDetails = event.data[1];
        openMessengerForUser(userDetails);
    } else if (message == "showNewStoryInStorySec") {
        let storyDto = event.data[1];
        showNewStoryInStorySec(storyDto);
    } else if (message == "hideSearchSection") {
        hideSearchSection();
    } else {
        console.log("Illegal Argument")
    }
});

// IF LOGGED IN - OR - IF TOKEN VALID
{
    try {
        let isLoggedIn = await isTokenValid(jwtToken);
        if (!isLoggedIn) {
            showFooterAlert("Session expired, please log in again");

            window.location.href = "/Insightgram-Web_UI/index.html";
        }
    } catch (error) {
        if (error == "TypeError: Failed to fetch") {
            error = "Could not connect to server..."
        }

        showFooterAlert(error)
        window.location.href = "/Insightgram-Web_UI/index.html";
    }
}

// SOCKET CONNECTION
openSocketConnetion();
async function openSocketConnetion() {
    stompClient = await connectToMessagingWS(onSocketMessageReceived);
}

async function closeSocketConnetion(onDisconnected = () => { }) {
    if (stompClient) {
        stompClient.disconnect(onDisconnected);
    }
}

//LOAD CURRENT USER DETAILS
let currentUserDetails;
try {

    currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));

    async function loadCurrentUserDetails() {
        loadCurrentUserDp();
        loadCurrentUserNames();
    };
    async function loadCurrentUserDp() {
        let currentUserProfilePhotos = document.querySelectorAll(".current.user_profile_photo");

        let profilePhotoUrl;

        if (currentUserDetails.profilePhoto != null) {
            profilePhotoUrl = await getUserProfilePhoto(currentUserDetails.userId, jwtToken);
        } else {
            profilePhotoUrl = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";
        }

        currentUserProfilePhotos.forEach(p => {
            p.setAttribute("src", profilePhotoUrl);
            p.dataset.userid = currentUserDetails.userId;
            p.addEventListener("click", () => {
                gotoProfileOf(p.dataset.userid);
            });
        });
    }
    async function loadCurrentUserNames() {
        let currentUserUsernames = document.querySelectorAll(".current.username");

        currentUserUsernames.forEach(un => {
            un.innerText = currentUserDetails.username;
            un.dataset.userid = currentUserDetails.userId;
            un.addEventListener("click", () => {
                gotoProfileOf(un.dataset.userid);
            });
        })

        let currentUserUserFullNames = document.querySelectorAll(".current.fullname");

        currentUserUserFullNames.forEach(fn => {
            fn.innerText = (currentUserDetails.firstName + " " + currentUserDetails.lastName).trim();
            fn.dataset.userid = currentUserDetails.userId;
            fn.addEventListener("click", () => {
                gotoProfileOf(fn.dataset.userid);
            });
        });
    }

    loadCurrentUserDetails();
} catch (error) {
    showFooterAlert(error);
    localStorage.removeItem("insightgramUserDetails");

    setTimeout(() => {
        window.location.href = "/Insightgram-Web_UI/index.html";
    }, 3000);
}

// VIEW POSTS
let newsfeedContentSec = document.querySelector("#newsfeed_content_sec");
let contentSec = document.querySelector("#content_sec");
let postSec = document.querySelector("#posts_sec");

localStorage.setItem("newsfeedCurrentPageNo", JSON.stringify(1));
let pageSize = 10;
let pageNumber = JSON.parse(localStorage.getItem("newsfeedCurrentPageNo")) || 1;


isNewfeedReachedTheEnd();
// let defaultPostLayout = document.querySelector(".post");
// addPostCardLogic(defaultPostLayout)

async function isNewfeedReachedTheEnd() {
    newsfeedContentSec.addEventListener("scroll", isNewfeedReachedTheEnd);

    let contentSecReact = contentSec.getBoundingClientRect();
    if (contentSecReact.bottom <= 1100) {
        newsfeedContentSec.removeEventListener("scroll", isNewfeedReachedTheEnd);

        let postsPage = await getNewsfeedPosts(pageNumber, pageSize);

        if (postsPage.totalCurrentPageElements == 0) {
            let reachedEndOfPostsMessage =
                `<div id="posts_sec_end">
                    <div>
                        <img src="../Images/seen_all_posts_check.png" alt="">
                    </div>
                    <div>You're all caught up</div>
                    <div>
                        You've seen all new posts from the past 2 days.
                    </div>
                </div>`;

            contentSec.insertAdjacentHTML("beforeend", reachedEndOfPostsMessage);

        } else {
            pageNumber++;
            localStorage.setItem("newsfeedCurrentPageNo", JSON.stringify(pageNumber + 1));
            await processThePosts(postsPage);
            newsfeedContentSec.addEventListener("scroll", isNewfeedReachedTheEnd);
        }
    }

}

async function processThePosts(postsPage) {
    // if the posts.totalCurrentPageElements == 0 then "seen all oposts from past 2 days"

    if (postsPage.totalCurrentPageElements == 0) {
        return;
    }

    for (let post of postsPage.pageContent) {
        createPostCard(post);
    };
}

const parser = new DOMParser();
async function createPostCard(post, top_or_bottom = "", save = true) {
    let haveLiked = await haveUserLikedPostAlready(post.postId, jwtToken);

    let postHtml =
        `<div class="post"  data-postId="${post.postId}">
                ${await getPostHead(post)}
                <div class="post-carousel">

                    ${await getPostCarousel(post)}

                    ${post.content.length == 1 ? "" :
            `
                        <div class="slide-arrow  slide-left clickable">
                                <img src="/Insightgram-Web_UI/Images/arrow-right.png" alt="">
                            </div>
                        <div class="slide-arrow slide-right clickable">
                            <img src="/Insightgram-Web_UI/Images/arrow-right.png" alt="">
                        </div>
                        `
        }
                </div>
                <div class="post-action">
                    <div>
                        <span class="post-like-btn ${haveLiked ? "liked" : "unliked"}" data-postId=${post.postId}>
                            <svg aria-label="${haveLiked ? "Unlike" : "Like"}" class="x1lliihq x1n2onr6" 
                                height="24" role="img" viewBox="0 0 24 24" width="24">
                                <title>${haveLiked ? "Unlike" : "Like"}</title>
                                <path
                                    d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z">
                                </path>
                            </svg>
                        </span>
                        <span class="post-comment-btn" data-postId="${post.postId}">
                            <svg aria-label="Comment" class="x1lliihq x1n2onr6" color="rgb(0,0,0)"
                                fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24">
                                <title>Comment</title>
                                <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none"
                                    stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                        </span>
                        <span class="post-share-btn unimplemented" data-postId=${post.postId}>
                            <svg aria-label="Share Post" class="x1lliihq x1n2onr6" color="rgb(0,0,0)"
                                fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24">
                                <title>Share Post</title>
                                <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"
                                    x1="22" x2="9.218" y1="3" y2="10.083"></line>
                                <polygon fill="none"
                                    points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                                    stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                            </svg>
                        </span>
                    </div>
                    <div>
                        <span class="post-save-btn unimplemented">
                            <svg aria-label="Save" class="x1lliihq x1n2onr6" color="rgb(0,0,0)" fill="rgb(0,0,0)"
                                height="24" role="img" viewBox="0 0 24 24" width="24">
                                <title>Save</title>
                                <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                                    stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"></polygon>
                            </svg>
                        </span>
                    </div>
                </div>
                <div class="post-likecount clickable">${post.noOfLikes} ${post.noOfLikes == 1 ? "like" : "likes"}</div>

                <div class="post-caption">
                    <pre class="caption"><span class="username clickable"  data-userId="${post.postOwnerInfo.userId}">${post.postOwnerInfo.username}</span> ${post.caption}</pre>
                    <span class="caption-toggle-btn clickable">more</span>
                </div>
                <div class="post-comment">
                    <span class="post-comment-count clickable">View all <span>${post.noOfComments}</span> ${post.noOfComments == 1 ? "comments" : "comment"}</span>
                    <div class="post-commet-type-area">
                    <input class="post-comment-add" type="text" placeholder="Add a comment..."  data-postId="${post.postId}">
                    <span class="post-new-comment-btn">Post</span>
                    </div>
                </div>
            </div>`;

    if (!save) {
        const elem = parser.parseFromString(postHtml, 'text/html').querySelector(".post");
        return elem;
    }

    top_or_bottom = top_or_bottom.trim();
    if (top_or_bottom == null || (top_or_bottom != "bottom" && top_or_bottom != "top") || top_or_bottom == "bottom") {
        top_or_bottom = "beforeend";
    } else {
        top_or_bottom = "afterbegin";
    }
    postSec.insertAdjacentHTML(top_or_bottom, postHtml);

    let currentPost;
    if (top_or_bottom == "beforeend") {
        currentPost = postSec.lastChild;
    } else {
        currentPost = postSec.firstChild;
    }
    addPostCardLogic(currentPost, haveLiked, post);
}
async function getPostHead(post) {

    let postOwner = post.postOwnerInfo;

    let profilePhotoUrl = postOwner.profilePhoto ? await getUserProfilePhoto(postOwner.userId, jwtToken) :
        "/Insightgram-Web_UI/Images/no_profile_photo.jpg";
    let postTime = getPostTime(post.postDateTime);


    let postHead
        = `<div class="post-head">
            <div>
                <div>
                    <img class="user_profile_photo clickable" src="${profilePhotoUrl}" alt="" data-userId="${postOwner.userId}">
                </div>
                <div>
                    <span class="username clickable" data-userId="${postOwner.userId}">${postOwner.username}
                    </span>
                    <span class="dot">•</span>
                    <span class="gray">${postTime}</span>
                </div>
            </div>
            <div class="unimplemented">
                <svg aria-label="More options" class="_ab6-" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)"
                    height="24" role="img" viewBox="0 0 24 24" width="24">
                    <circle cx="12" cy="12" r="1.5"></circle>
                    <circle cx="6" cy="12" r="1.5"></circle>
                    <circle cx="18" cy="12" r="1.5"></circle>
                </svg>
            </div>
        </div>`;

    return postHead;
}
async function getPostCarousel(post) {
    let postContents = post.content;

    let postCarousel
        = `<div class="post-content-container">
            ${await getPostContentsHtml(postContents)}
        </div>`;

    return postCarousel;
}
async function getPostContentsHtml(postContents) {
    postContents.sort((a, b) => a.contentId - b.contentId)

    let contentHtml = "";

    for (let content of postContents) {
        if (content.contentType.split("/")[0] == "video") {
            let videoHtml = await getVideoPostHtml(content);
            contentHtml += (videoHtml);
        } else {
            let imgHtml = await getImagePostHtml(content);
            contentHtml += (imgHtml);
        }
    }
    return contentHtml;
}
async function getImagePostHtml(content) {
    let imagePostHtml =
        `<div class="post-content post-content-img" data-contentId="${content.contentId}">
        <img src="${await getPostContentUrl(content.contentId, jwtToken)}" alt="">
    </div>`;

    return imagePostHtml;
}
async function getVideoPostHtml(content) {
    let videoPostHtml =
        `<div class="post-content post-content-video" data-contentId="${content.contentId}">
        <video loop muted playsinline autoplay>
            <source
                src="${await getPostContentUrl(content.contentId, jwtToken)}"
                type="${content.contentType}">
            Your browser does not support the video tag.
        </video>
        <div class="video-volume-toggle">
            <img src="/Insightgram-Web_UI/Images/volume-mute.png" alt="">
        </div>
    </div>`;

    return videoPostHtml;
}
let muteAudio = true;
function addPostCardLogic(postElement, isLiked, post) {
    // GO TO USER PROFILE
    let usernames = postElement.querySelectorAll(".username");
    let dps = postElement.querySelectorAll(".user_profile_photo");
    usernames.forEach(un => {
        un.addEventListener("click", () => {
            gotoProfileOf(un.dataset.userid);
        });
    });

    dps.forEach(dp => {
        dp.addEventListener("click", () => {
            gotoProfileOf(dp.dataset.userid);
        });
    });

    // POST CAROUSEL
    let postCarouselLeftArrows = postElement.querySelectorAll(".post-carousel .slide-arrow.slide-left");
    let postCarouselRightArrows = postElement.querySelectorAll(".post-carousel .slide-arrow.slide-right");

    postCarouselLeftArrows.forEach(la => {
        la.addEventListener('click', () => {
            scrollPostCarouselLeft(la);
        });
    })

    postCarouselRightArrows.forEach(ra => {
        ra.addEventListener('click', () => {
            scrollPostCarouselRight(ra)
        });
    })

    // VIDEO POST
    const videoElements = postElement.querySelectorAll('.post-content-video>video');
    videoElements.forEach(v => playVideoIfOnScreen(v));


    // POST CAPTION
    const caption = postElement.querySelector('.caption');
    const captionToggleBtn = postElement.querySelector('.caption-toggle-btn');

    let more = 0;
    captionToggleBtn.addEventListener('click', function () {
        caption.classList.toggle('expand');
        if (!more) {
            captionToggleBtn.innerHTML = "less"
            more = 1;
        } else {
            captionToggleBtn.innerHTML = "more"
            more = 0;
        }

    });

    if (caption.scrollWidth > caption.clientWidth) {
        captionToggleBtn.style.display = 'block';
    }

    // LIKE AND UNLIKE
    let postId = postElement.dataset.postid;
    let postCarousel = postElement.querySelector(".post-carousel");
    let likeBtn = postElement.querySelector(".post-like-btn");

    if (!isLiked) {
        addLikeBtnLogic(likeBtn);
        addDoubleClickLikeLogic(postCarousel);
    }
    else addUnlikeBtnLogic(likeBtn);

    // COMMENT
    let newsfeedCommentInputField = postElement.querySelector(".post-comment-add");
    addNewsfeedCommentInputFieldLogic(newsfeedCommentInputField);

    // VIEW DETAILED POST
    let commentBtns = postElement.querySelectorAll(".post-comment-btn, .post-comment-count");
    commentBtns.forEach((cb) => {
        cb.addEventListener("click", () => {
            postElement.querySelectorAll("video").forEach(v => {
                if (!v.paused) {
                    v.pause();
                }
            })
            showDetailedPost(post, isLiked);
        })
    });

    function addDoubleClickLikeLogic(postCarousel) {
        postCarousel.addEventListener("dblclick", doubleClickLikeLogic);
    }
    function doubleClickLikeLogic(event) {
        let postCarousel = event.currentTarget;
        let likeBtn = postCarousel.parentElement.querySelector(".post-like-btn");
        likeThePost(likeBtn);
    }
    function addLikeBtnLogic(likeBtn) {
        likeBtn.addEventListener("click", likePostLogic);
    }
    function likePostLogic(event) {
        let likeBtn = event.currentTarget;
        likeThePost(likeBtn);
    }
    async function likeThePost(likeBtn) {
        let postId = likeBtn.dataset.postid;

        let liked = await likePost(postId, jwtToken);
        if (liked) {
            post.noOfLikes++;
            isLiked = true;
            let likeCountElem = likeBtn.parentElement.parentElement.parentElement.querySelector(".post-likecount");

            let likeCount = +likeCountElem.innerText.split(" ")[0];
            likeCountElem.innerText = likeCount + 1 + " " + (likeCount + 1 == 1 ? "like" : "likes");

            likeBtn.classList.remove("unliked");
            likeBtn.classList.add("liked");

            likeBtn.removeEventListener("click", likePostLogic);

            let postCarousel = likeBtn.parentElement.parentElement.parentElement.querySelector(".post-carousel");
            postCarousel.removeEventListener("dblclick", doubleClickLikeLogic);

            likeBtn.querySelector("svg").setAttribute("aria-label", "Unlike");
            likeBtn.querySelector("title").innerHTML = "Unlike";

            // let likeCountElem = likeBtn.querySelector(".post-likecount")

            addUnlikeBtnLogic(likeBtn);
        }
    }
    function addUnlikeBtnLogic(unlikeBtn) {
        unlikeBtn.addEventListener("click", unlikePostLogic)
    }
    async function unlikePostLogic(event) {

        let unlikeBtn = event.currentTarget;
        let postId = unlikeBtn.dataset.postid;

        let unliked = await unlikePost(postId, jwtToken);
        if (unliked) {
            post.noOfLikes--;
            isLiked = false;
            let likeCountElem = unlikeBtn.parentElement.parentElement.parentElement.querySelector(".post-likecount");
            let postCarousel = unlikeBtn.parentElement.parentElement.parentElement.querySelector(".post-carousel");;

            let likeCount = +likeCountElem.innerText.split(" ")[0];

            likeCountElem.innerText = likeCount - 1 + " " + (likeCount - 1 == 1 ? "like" : "likes");

            unlikeBtn.classList.remove("liked");
            unlikeBtn.removeEventListener("click", unlikePostLogic);

            unlikeBtn.classList.add("unliked");
            unlikeBtn.querySelector("svg").setAttribute("aria-label", "Like");
            unlikeBtn.querySelector("title").innerHTML = "Like";

            addDoubleClickLikeLogic(postCarousel);
            addLikeBtnLogic(unlikeBtn, postId);
        }
    }
    function addNewsfeedCommentInputFieldLogic(newsfeedCommentInputField) {

        let commentArea = newsfeedCommentInputField.parentElement.parentElement;
        let postCommentBtn = commentArea.querySelector(".post-new-comment-btn");

        postCommentBtn.addEventListener("click", postCommentProcess);
        newsfeedCommentInputField.addEventListener("keyup", ()=>{
            let comment = newsfeedCommentInputField.value.trim();
            if (comment != "") {
                postCommentBtn.style.display = "block";
            } else {
                postCommentBtn.style.display = "none";
            }
        });

        newsfeedCommentInputField.addEventListener("keydown", async (event) => {


            if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
                event.preventDefault();
            } else if (event.key === 'Enter') {
                await postCommentProcess();
            }
        });

        async function postCommentProcess() {
            let postId = newsfeedCommentInputField.dataset.postid;
            let comment = newsfeedCommentInputField.value.trim();

            if (comment.length == 0) {
                return;
            }
            else {

                let userComment = await commentOnPost(postId, comment, jwtToken);

                if (userComment != null) {
                    post.noOfComments++;
                    newsfeedCommentInputField.blur();
                    newsfeedCommentInputField.value = "";
                    postCommentBtn.style.display = "none";

                    let commentCounter = commentArea.querySelector(".post-comment-count");

                    let commentCount = +commentCounter.innerText.trim().split(" ")[2];

                    commentCounter.innerText = "View all " + (commentCount + 1) + " " + (commentCount + 1 == 1 ? "comment" : "comments");
                }
            }
        }
    }
}
function showDetailedPost(post, isLiked) {
    let detailedPostFrame = `<iframe class="detailed-post-sec" src="/Insightgram-Web_UI/Post-View-Section/post-view-section.html" frameborder="0"></iframe>`;
    showOverlayScreen(detailedPostFrame);
    let iframeElm = overlayScreen.querySelector("iframe");
    iframeElm.addEventListener("load", () => {
        sendMessageToIframe(iframeElm, ["showPost", {
            post,
            isLiked
        }]);
    })
}
function scrollPostCarouselRight(rightArrow) {
    rightArrow.previousElementSibling.previousElementSibling.scrollBy({
        top: 0,
        left: rightArrow.previousElementSibling.previousElementSibling.offsetWidth,
        behavior: "smooth"
    })
}
function scrollPostCarouselLeft(leftArrow) {
    leftArrow.previousElementSibling.scrollBy({
        top: 0,
        left: -leftArrow.previousElementSibling.offsetWidth,
        behavior: "smooth"
    })
}
function playVideoIfOnScreen(videoElement) {

    videoElement.addEventListener("click", () => {
        audioToggle(videoElement);
    });
    videoElement.nextSibling.nextSibling.addEventListener("click", () => {
        audioToggle(videoElement);
    });

    newsfeedContentSec.addEventListener('scroll', handleVisibility);

    newsfeedContentSec.addEventListener('resize', handleVisibility);

    videoElement.parentElement.parentElement.addEventListener('scroll', handleVisibility);

    document.addEventListener("visibilitychange", () => {
        if (document["hidden"]) {
            videoElement.pause()
        } else {
            if (isElementInViewport(videoElement)) {
                videoElement.play();
            }
        }
    });

    function handleVisibility() {
        if (isElementInViewport(videoElement)) {
            playVideo(videoElement);
        } else {
            videoElement.pause();
        }
    }
}
function playVideo(videoElement) {
    let audioIcons = videoElement.parentElement.parentElement.querySelectorAll(".video-volume-toggle img");
    if (muteAudio) {
        videoElement.muted = true;
        videoElement.play();
        audioIcons.forEach((videoIcon) => {
            videoIcon.setAttribute("src", "../Images/volume-mute.png");
        })
    } else {
        videoElement.muted = false;
        videoElement.play();
        audioIcons.forEach((videoIcon) => {
            videoIcon.setAttribute("src", "../Images/volume-up-interface-symbol.png");
        })
    }
}
function audioToggle(videoElement) {
    let audioIcons = videoElement.parentElement.parentElement.querySelectorAll(".video-volume-toggle img");
    if (muteAudio) {
        muteAudio = false;
        playVideo(videoElement);
        audioIcons.forEach((videoIcon) => {
            videoIcon.setAttribute("src", "../Images/volume-up-interface-symbol.png");
        })
    } else {
        muteAudio = true;
        playVideo(videoElement);
        audioIcons.forEach((videoIcon) => {
            videoIcon.setAttribute("src", "../Images/volume-mute.png");
        })
    }
}
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = element.parentElement.parentElement.getBoundingClientRect();

    return (
        rect.top >= -200 &&
        rect.left >= 0 &&
        rect.bottom <= 200 + (newsfeedContentSec.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (newsfeedContentSec.innerWidth || document.documentElement.clientWidth)
        &&
        rect.left >= containerRect.left - 200
        &&
        rect.right <= containerRect.right + 200
    );
}


function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
}

// UPDATE POST
async function updatePost(data) {
    let post = data.post;
    let isLiked = data.isLiked;

    let postElement = document.querySelector(`.post[data-postid="${post.postId}"]`);

    if (!postElement) return;

    let updatedPostElement = await createPostCard(post, "", false);

    postElement.querySelectorAll("video").forEach(v => {
        v.pause();
    })

    postElement.replaceWith(updatedPostElement);
    addPostCardLogic(updatedPostElement, isLiked, post);
}
function removePostHtml(postId) {
    let myProfileSecIFrame = document.querySelector("#my-profile-sec");
    if (myProfileSecIFrame) {
        sendMessageToIframe(myProfileSecIFrame, ["removePostCard", postId]);
    } else {
        let postElement = document.querySelector(`.post[data-postid="${postId}"]`);
        postElement.remove();
    }
}

// OPTIONS SEC LOGIC

let insightgramLogo = document.querySelector("#insightgram_logo_sec img");
let allNewsfeedOptionBtns = document.querySelectorAll("#newsfeed_options>div");
let insightgramHomeBtn = document.querySelector("#newsfeed-home-btn");
let newsfeedSearchSecBtn = document.querySelector("#newsfeed-search-sec-btn");
let myProfileSecBtn = document.querySelector("#my-profile-sec-btn");
let newsfeedOptionsSlideWindow = document.querySelector("#newsfeed_options-slide-window");
let contentScreen = document.querySelector("#content-screen");
let newsfeedMessengerBtn = document.querySelector("#newsfeed-messenger-btn");

function showBorderOnNewsfeedOptions(currentBtn) {
    if(currentBtn == newsfeedSearchSecBtn) return;
    if(isMobile()) {
        allNewsfeedOptionBtns.forEach((btn) => {
            btn.classList.remove("selected");
        })
        currentBtn.classList.add("selected");
    } else {
        allNewsfeedOptionBtns.forEach((btn) => {
            btn.style.border = "none";
        })
        currentBtn.style.border = "2px solid black";
    }
}
function showNewsfeedOptionsSlideWindow() {
    newsfeedOptionsSlideWindow.classList.remove("hide");
    newsfeedOptionsSlideWindow.classList.add("show");
}
function hideNewsfeedOptionsSlideWindow() {
    newsfeedOptionsSlideWindow.classList.remove("show");
    newsfeedOptionsSlideWindow.classList.add("hide");
}

// HOME BTN
insightgramLogo.addEventListener("click", refreshNewsfeed);
insightgramHomeBtn.addEventListener("click", refreshNewsfeed);

function refreshNewsfeed() {
    window.location.reload();
}

// SEARCH BTN
newsfeedSearchSecBtn.addEventListener("click", showSearchSection);

function showSearchSection() {
    showBorderOnNewsfeedOptions(newsfeedSearchSecBtn);
    showNewsfeedOptionsSlideWindow();

    newsfeedOptionsSlideWindow.innerHTML = "<iframe src='/Insightgram-Web_UI/Search-Section/search-section.html' width='100%' height='100%' frameborder='0'></iframe>";

    newsfeedSearchSecBtn.removeEventListener("click", showSearchSection);
    newsfeedSearchSecBtn.addEventListener("click", hideSearchSection);
}
function hideSearchSection() {
    newsfeedSearchSecBtn.style.border = "none";

    newsfeedOptionsSlideWindow.innerHTML = null;
    newsfeedSearchSecBtn.classList.remove("selected")
    hideNewsfeedOptionsSlideWindow();

    newsfeedSearchSecBtn.removeEventListener("click", hideSearchSection);
    newsfeedSearchSecBtn.addEventListener("click", showSearchSection);
}
function gotoProfileOf(userId) {
    hideSearchSection();
    showIFrameOfUserProfile(userId);
}
// POST CREATION OPTION

let createPostBtn = document.querySelector("#createNewPostBtn");
createPostBtn.addEventListener("click", newPostCreationSection);

function newPostCreationSection() {
    showOverlayScreen(`<iframe src="/Insightgram-Web_UI/Create-Post-Section/create-post-section.html" frameborder="0"></iframe>`);
}
function showMyNewPostInNewsfeed(postDto) {
    createPostCard(postDto, "top");
    removeOverlayScreen();
}

// MY PROFILE BTN
myProfileSecBtn.addEventListener("click", showUserProfileBtnLogic);

async function showUserProfileBtnLogic(event) {
    let userId = event.dataset ? event.dataset.userid : currentUserDetails.userId;

    if (!userId) {
        userId = JSON.parse(currentUserDetails.userId) || null;
        if (userId == null) {
            showFooterAlert("Unexpected error occured")
            return;
        }
    }
    showBorderOnNewsfeedOptions(event.currentTarget);
    showIFrameOfUserProfile(userId);
}

function showIFrameOfUserProfile(userId) {
    let iframeProfile = `<iframe id="my-profile-sec" src="/Insightgram-Web_UI/User-Profile-Section/user-profile-section.html" frameborder="0"></iframe>`
    showContentScreen(iframeProfile);
    let iframeElem = contentScreen.querySelector("iframe")

    iframeElem.addEventListener("load", () => {
        if (userId == currentUserDetails.userId) {
            sendMessageToIframe(iframeElem, ["showMyProfile"]);
        } else {
            sendMessageToIframe(iframeElem, ["showUserProfile", userId]);
        }
    })
}

function showContentScreen(innerHTML) {
    newsfeedContentSec.style.display = "none";
    contentScreen.style.display = "block";
    contentScreen.innerHTML = innerHTML;
}
function hideContentScreen() {
    contentScreen.style.display = "none";
    contentScreen.innerHTML = null;
    newsfeedContentSec.style.display = "grid";
}


// MORE OPTS

let moreOpts = document.querySelector("#more_opts");
let moreOptsList = document.querySelector("#more_opts .more-opts-list");
let logOutBtn = moreOpts.querySelector("#log-out-btn");

moreOpts.addEventListener("click", showMoreOpts);
function showMoreOpts() {
    moreOptsList.style.display = "flex";
    moreOpts.removeEventListener("click", showMoreOpts);
    moreOpts.addEventListener("click", removeMoreOpts);
    moreOpts.classList.add("pressed");
}
function removeMoreOpts(event) {
    // if (event && event.target == event.currentTarget) {
    moreOptsList.style.display = "none";
    moreOpts.addEventListener("click", showMoreOpts);
    moreOpts.removeEventListener("click", removeMoreOpts);
    moreOpts.classList.remove("pressed");
    // }
}
logOutBtn.addEventListener("click", logOutUserLogic);
async function logOutUserLogic() {
    let logOutMsg = await logOutUser(jwtToken, messageingToken);
    if (logOutMsg) {
        showFooterAlert(logOutMsg, false);
        localStorage.clear();
        removeMoreOpts();
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}



// MESSAGING SECTION
newsfeedMessengerBtn.addEventListener("click", sendShowConversationsListInMessenger)

function showMessengerSection() {
    if (newsfeedMessengerBtn.classList.contains("new-message")) {
        newsfeedMessengerBtn.classList.remove("new-message");
    }
    showBorderOnNewsfeedOptions(newsfeedMessengerBtn);

    let innerFrameHTML = `<iframe src="/Insightgram-Web_UI/Messaging-Section/messaging-section.html" width="100%" height="100%" frameborder="0"></iframe>`
    showContentScreen(innerFrameHTML);
    let iframe = contentScreen.querySelector("iframe");

    closeSocketConnetion();
    return iframe;
}

function sendShowConversationsListInMessenger() {
    let iframe = showMessengerSection();

    iframe.addEventListener("load", () => {
        sendMessageToIframe(iframe, ["showConversationsList"])
    })
}

function openMessengerForUser(userDetails) {
    let iframe = showMessengerSection();

    iframe.addEventListener("load", () => {
        sendMessageToIframe(iframe, ["openChatOfUser", userDetails]);
    });
}

function onSocketMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    let messageType = message.type;

    if (messageType == 'CHAT') {
        if (newsfeedMessengerBtn.classList.contains("new-message") == false) {
            newsfeedMessengerBtn.classList.add("new-message");
        }
    } else {
        console.log("Unknown Message Type")
    }
}

// NOTIFICATION MANAGEMENT



// .
// .
// .
// SHOW FOLLOWERS AND FOLLOWING FOR PROFILE SECTION
// VIEW LIKES
async function viewLikesLogic() {
    let innerHTML =
        `<div id="likes-container">
        <div class="head">
            <div>Likes</div>
            <div>
                <svg class="close_btn_svg clickable" viewBox="0 0 24 24">
                    <path xmlns="http://www.w3.org/2000/svg"
                        d="M17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41L17.59 5Z">
                    </path>
                </svg>
            </div>
        </div>
        <div class="body"></div>
    </div>`;
    showOverlayScreen(innerHTML);

    let likesContainerCloseBtn = document.querySelector("#likes-container>.head .close_btn_svg");
    likesContainerCloseBtn.addEventListener("click", () => {
        hideOverlayScreen();
    });

    await fetchLikeCards();
}
let likePageSize = 25;
let likePageNumber = 1;
async function fetchLikeCards() {

    let likesContainer = document.querySelector("#likes-container>.body");
    // likesContainer.innerHTML = null;
    likesContainer.removeEventListener("scroll", loadNewLikePage);

    let postId = post.postId;
    let likesPage = await getLikesPageOf(postId, likePageSize, likePageNumber, jwtToken);

    if (likesPage) {
        let likeDtos = likesPage.pageContent;

        // ON SCROLL LOAD LIKES
        if (likeDtos.length == 0 && likePageNumber == 1) {
            likesContainer.insertAdjacentHTML("beforeend", `<div class="noLikes">No Likes</div>`);
        } else if (likeDtos.length != 0) {
            likesContainer.addEventListener("scroll", loadNewLikePage);
        }

        likePageNumber++;
        for (let likeDto of likeDtos) {
            let isFollower = await isAFollowerOf(likeDto.likerInfo.userId, jwtToken);
            let likeCard = await getLikeCardHTML(likeDto) || "";
            likesContainer.insertAdjacentHTML("beforeend", likeCard);

            addLikeCardLogic(likesContainer.lastChild, isFollower);
        }
    } else {
        likesContainer.insertAdjacentHTML("beforeend", `<div class="error">:\\ Unexpected Error</div>`);
    }
}
async function loadNewLikePage(event) {
    let likesContainer = event.currentTarget;
    let firstLike = likesContainer.lastChild;

    let likesContainerRectBottom = likesContainer.getBoundingClientRect().bottom;
    let firstLikeRectBottom = firstLike ? firstLike.getBoundingClientRect().bottom : 0;

    if (Math.abs(likesContainerRectBottom - firstLikeRectBottom) <= 20) {
        fetchLikeCards();
    }
}
async function getLikeCardHTML(likeDto) {
    let liker = likeDto.likerInfo;
    let userId = liker.userId;
    let profilePhotoURL;

    if (userId == currentUserDetails.userId) {
        profilePhotoURL = currentUserProfilePhotoURL;
    } else {
        profilePhotoURL = !liker.profilePhoto ? "/Insightgram-Web_UI/Images/no_profile_photo.jpg" : await getUserProfilePhoto(userId, jwtToken);
    }

    let likeCardHtml =
        `<div class="liker-card" data-userid="${userId}">
        <div>
            <div>
                <img class="user_profile_photo clickable" src="${profilePhotoURL}" alt="Profile Photo" data-userid="${userId}">
            </div>
            <div>
                <div class="username clickable" data-userid="${userId}">${liker.username}</div>
                <div class="fullname">${liker.userFullName}</div>
            </div>
        </div>
        <div>
                <button class="follow clickable" style="display:none;">Follow</button>
                <button class="unfollow clickable" style="display:none;">Unfollow</button>
        </div>
    </div>`;
    return likeCardHtml;
}
function addLikeCardLogic(likeElement, isFollower) {
    let likerId = likeElement.dataset.userid;

    let profileRedirecterElems = likeElement.querySelectorAll(".username, .user_profile_photo");
    for (let e of profileRedirecterElems) {
        e.addEventListener("click", () => {
            gotoProfileOf(likerId);
        });
    }

    likeElement
    let followBtn = likeElement.querySelector(".follow");
    let unfollowBtn = likeElement.querySelector(".unfollow");

    if (isFollower) {
        unfollowBtn.style.display = "flex";
        unfollowBtn.addEventListener("click", unfollowUserLogic);
    } else if (likerId != currentUserDetails.userId) {
        followBtn.style.display = "flex";
        followBtn.addEventListener("click", followUserLogic);

    }
    async function followUserLogic() {
        followBtn.removeEventListener("click", followUserLogic);

        let ifFollowed = await followUser(likerId, jwtToken);
        if (ifFollowed) {
            followBtn.style.display = "none";
            unfollowBtn.style.display = "flex";
            unfollowBtn.addEventListener("click", unfollowUserLogic);
        } else {
            followBtn.addEventListener("click", followUserLogic);
        }
    }
    async function unfollowUserLogic() {
        unfollowBtn.removeEventListener("click", unfollowUserLogic);

        let ifFollowed = await unfollowUser(likerId, jwtToken);
        if (ifFollowed) {
            unfollowBtn.style.display = "none";
            followBtn.style.display = "flex";
            followBtn.addEventListener("click", followUserLogic);
        } else {
            unfollowBtn.addEventListener("click", unfollowUserLogic);
        }
    }
}



// STORIES SECTION

let storiesSec = document.querySelector("#stories_sec");
let storiesContainer = storiesSec.querySelector("#stories");
let storySecLeftArrow = storiesSec.querySelector("#stories_sec>.slide-arrow.slide-left");
let storySecRightArrow = storiesSec.querySelector("#stories_sec>.slide-arrow.slide-right");

storiesContainer.addEventListener("scroll", arrowsVisiblityLogic);
window.addEventListener("resize", arrowsVisiblityLogic);

showUsersWhoHaveStory()
let usersWhoHaveStory;
async function showUsersWhoHaveStory() {

    usersWhoHaveStory = await getUsersWhoHaveStory(jwtToken);
    let currentUserStories = await getStoriesOfUser(currentUserDetails.userId, jwtToken);
    if (currentUserStories.length != 0) {
        usersWhoHaveStory.unshift({
            username: currentUserDetails.username,
            profilePhoto: currentUserDetails.profilePhoto,
            userId: currentUserDetails.userId,
            userFullName: currentUserDetails.firstName + " " + currentUserDetails.lastName,
        });
    }

    let storyIndexingCount = 0;
    for (let userBasicInfo of usersWhoHaveStory) {
        let storyIconCardHTML = await createStoryIconCardHTML(userBasicInfo, storyIndexingCount);

        let newStoryIconCard = insertStoryIconCardHTMLToContainer(storyIconCardHTML);
        userBasicInfo.storyIndex = storyIndexingCount;
        newStoryIconCard.addEventListener("click", () => {
            startStoryViewSection(userBasicInfo, usersWhoHaveStory);
        });

        storyIndexingCount++;
    };

}

async function createStoryIconCardHTML(userBasicInfo, storyIndex) {
    let userId = userBasicInfo.userId;
    let username = userBasicInfo.username;
    let profilePhotoObj = userBasicInfo.profilePhoto;
    let profilePhotoURL = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";

    if (profilePhotoObj) {
        profilePhotoURL = await getUserProfilePhoto(userId, jwtToken);
    }
    userBasicInfo.profilePhotoURL = profilePhotoURL;

    let storyIconCardHTML =
        `<div class="story" data-userid="${userId}" data-index="${storyIndex}">
            <div class="dp_story">
                <img class="user_profile_photo" src="${profilePhotoURL}" alt="">
            </div>
            <div><span class="username_plain">${username}</span></div>
        </div>`;

    return storyIconCardHTML;
}

function insertStoryIconCardHTMLToContainer(storyIconCardHTML, startOrEnd = "beforeend") {
    storiesContainer.insertAdjacentHTML(startOrEnd, storyIconCardHTML);

    let newStoryIconCard;
    if (startOrEnd == "beforeend") {
        newStoryIconCard = storiesContainer.lastElementChild;
    } else {
        newStoryIconCard = storiesContainer.firstElementChild;
    }
    return newStoryIconCard;
}

arrowsVisiblityLogic();
function arrowsVisiblityLogic() {
    let lastStory = storiesContainer.lastElementChild;
    let firstStory = storiesContainer.firstElementChild;

    if (!lastStory || !firstStory) {
        storySecLeftArrow.style.display = "none";
        storySecRightArrow.style.display = "none";
        return;
    }

    let storiesContainerRect = storiesContainer.getBoundingClientRect();
    let lastStoryRect = lastStory.getBoundingClientRect();
    let firstStoryRect = firstStory.getBoundingClientRect();

    if (storiesContainerRect.right + 6 < lastStoryRect.right) {
        storySecRightArrow.style.display = "block";
    } else {
        storySecRightArrow.style.display = "none";
    }

    if (storiesContainerRect.left > firstStoryRect.left) {
        storySecLeftArrow.style.display = "block";
    } else {
        storySecLeftArrow.style.display = "none";
    }
}

storySecLeftArrow.addEventListener("click", () => {
    scrollStoriesCarouselLeft(storySecLeftArrow);
    setTimeout(() => {
        arrowsVisiblityLogic();
    }, 200);
})

storySecRightArrow.addEventListener("click", () => {
    scrollStoriesCarouselRight(storySecRightArrow);
    setTimeout(() => {
        arrowsVisiblityLogic();
    }, 200);
})

function scrollStoriesCarouselRight(rightArrow) {
    rightArrow.previousElementSibling.previousElementSibling.scrollBy({
        top: 0,
        left: rightArrow.previousElementSibling.previousElementSibling.offsetWidth / 2,
        behavior: "smooth"
    })
}
function scrollStoriesCarouselLeft(leftArrow) {
    leftArrow.previousElementSibling.scrollBy({
        top: 0,
        left: -leftArrow.previousElementSibling.offsetWidth / 2,
        behavior: "smooth"
    })
}



async function showNewStoryInStorySec(storyDto) {
    // showNewStoryInStorySecProcess(storyDto);
    showFooterAlert("New Story Added", false);
    removeOverlayScreen();
    currentUserDetails.noOfStories += 1;
    updateCurrentUserDetailsInLocalStorage();

    if (!storiesContainer.firstElementChild || storiesContainer.firstElementChild.dataset.userid != currentUserDetails.userId) {
        storiesContainer = storiesSec.querySelector("#stories");
        console.log("Creating new story user icon")
        let userBasicInfo = {
            username: currentUserDetails.username,
            profilePhoto: currentUserDetails.profilePhoto,
            userId: currentUserDetails.userId,
            userFullName: currentUserDetails.firstName + " " + currentUserDetails.lastName,
        }
        usersWhoHaveStory.unshift(userBasicInfo);

        let storyIconCardHTML = await createStoryIconCardHTML(userBasicInfo, 0);
        let newStoryIconCard = insertStoryIconCardHTMLToContainer(storyIconCardHTML, "afterbegin");

        newStoryIconCard.addEventListener("click", () => {
            startStoryViewSection(userBasicInfo, usersWhoHaveStory, true);
        });
    } else {

    }

}

function updateCurrentUserDetailsInLocalStorage() {
    localStorage.setItem("insightgramUserDetails", JSON.stringify(currentUserDetails));
}