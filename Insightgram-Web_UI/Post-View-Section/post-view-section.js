import {
    getPostContentUrl,
    getUserProfilePhoto,
    likePost,
    unlikePost,
    getPostTime,
    commentOnPost,
    getOtherCommentsOfPost,
    haveUserLikedPostAlready,
    deleteComment,
    getLikesPageOf,
    isAFollowerOf,
    followUser,
    unfollowUser,
    deleteUserPost,
    editPostCaption,


} from "../src/util.js";

// GLOBAL VALUES
let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));
let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));
let currentUserProfilePhotoURL = JSON.parse(localStorage.getItem("currentUserProfilePhotoURL")) || "../Images/no_profile_photo.jpg";
let post;
let isLiked;
let postContentsURL = [];
let overlayScreen = document.querySelector("#overlay-screen");


// PARENT WINDOW COMMUNICATION
const parentWindow = window.parent;
window.addEventListener('message', async function (event) {
    let message = event.data[0];
    let data = event.data[1];

    if (message == "showPost") {
        post = data.post;
        isLiked = data.isLiked || await haveUserLikedPostAlready(post.postId, jwtToken);
        showPost();
    } else {
        console.log("Illegal Argument")
    }
});

// CLOSE WINDOW LOGIC

let body = document.body;
let closeWindowBtn = document.querySelector("#close-window");
let changedSomething = false;

function addClosingLogic() {
    body.addEventListener("click", closeWindow);
    closeWindowBtn.addEventListener("click", closeWindow);
}
function closeWindow(event) {
    if (!event || event.currentTarget == closeWindowBtn || event.currentTarget == event.target) {
        if (changedSomething) updateChangesToNewsFeed(post, isLiked);
        document.querySelectorAll("video").forEach(v => {
            v.pause();
        })
        parentWindow.postMessage(["removeOverlayScreen"]);
    }
}

// SHOW POST
let postCarousel = document.querySelector(".post-carousel");
let postContentContainer = document.querySelector(".post-content-container");
let commentsContainer = document.querySelector("#public-comments-container");
let postCaptionSec = document.querySelector(".post-caption");
let caption = document.querySelector(".caption");
let viewLikesBtn = document.querySelector(".likes");
let likeCount = document.querySelector(".likes>span:first-child");
let likeOrLikes = document.querySelector(".likes>span:last-child");
let likeBtn = document.querySelector(".post-like-btn");
let commentBtn = document.querySelector(".post-comment-btn");
let shareBtn = document.querySelector(".post-share-btn");
let saveBtn = document.querySelector(".post-save-btn");
let commentField = document.querySelector(".post-comment-input");
let commentPostBtn = document.querySelector(".comment-post-btn");

let mute = 1;
async function showPost() {
    addClosingLogic();

    let slideArrows = postCarousel.querySelectorAll(".slide-arrow");
    if (post.content.length == 1) {
        slideArrows.forEach(sa => sa.style.display = "none");
    } else {
        slideArrows.forEach(sa => {
            sa.style.display = "block";
            if (sa.classList.contains("slide-left")) {
                sa.addEventListener("click", () => scrollPostCarouselLeft(sa));
            } else {
                sa.addEventListener("click", () => scrollPostCarouselRight(sa));
            }
        });

    }
    postContentContainer.innerHTML = null;
    let postsHtml = "";
    for (let c of post.content) {
        if (c.contentType.split("/")[0] == "video") {
            postsHtml += await getVideoPost(c.contentId);
        } else {
            postsHtml += await getImagePost(c.contentId);
        }
    }
    postContentContainer.innerHTML = postsHtml;

    // Add Video Logic
    let videoElements = postContentContainer.querySelectorAll("video");
    for (let ve of videoElements) {
        playVideoIfOnScreen(ve);
    }

    // POST INFO
    loadPostOwnerInfo(post.postOwnerInfo);
    loadAboutPost();
    loadNewPage();
    loadPostOpts();
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
function loadAboutPost() {
    // Captions
    post.caption = post.caption.trim();
    if (!post.caption) postCaptionSec.remove();
    else {
        caption.innerHTML = post.caption.trim();
    }
    caption.style.height = "auto";
    caption.style.height = `${caption.scrollHeight}px`;

    // Liking
    likeCount.innerHTML = post.noOfLikes;
    if (post.noOfLikes == 1) likeOrLikes.innerHTML = "like";
    else likeOrLikes.innerHTML = "likes";

    if (isLiked) {
        likeBtn.classList.remove("unliked");
        likeBtn.classList.add("liked");
        likeBtn.addEventListener("click", unlikePostLogic)
    } else {
        likeBtn.classList.add("unliked");
        likeBtn.classList.remove("liked");
        likeBtn.addEventListener("click", likePostLogic)
    }
    async function likePostLogic() {
        let liked = await likePost(post.postId, jwtToken);
        if (liked) {
            likeCount.innerHTML = ++post.noOfLikes;
            isLiked = true;
            changedSomething = true;
            likeBtn.classList.remove("unliked");
            likeBtn.classList.add("liked");
            likeBtn.removeEventListener("click", likePostLogic)
            likeBtn.addEventListener("click", unlikePostLogic)
        }
    }
    async function unlikePostLogic() {
        let unliked = await unlikePost(post.postId, jwtToken);
        if (unliked) {
            likeCount.innerHTML = --post.noOfLikes;
            isLiked = false;
            changedSomething = true;
            likeBtn.classList.add("unliked");
            likeBtn.classList.remove("liked");
            likeBtn.removeEventListener("click", unlikePostLogic);
            likeBtn.addEventListener("click", likePostLogic);
        }
    }
    viewLikesBtn.addEventListener("click", viewLikesLogic);

    // Commenting
    commentBtn.addEventListener("click", () => {
        commentField.focus();
    })
    addCommentInputFieldLogic();
    function addCommentInputFieldLogic() {
        commentPostBtn.addEventListener("click", async ()=>{
            commentPostBtn.style.display = "none";
            await postCommentProcess();
        });
        commentField.addEventListener("keyup", () => {
            let comment = commentField.value.trim();
            if (comment) {
                commentPostBtn.style.display = "block";
            } else {
                commentPostBtn.style.display = "none";
            }
        })
        commentField.addEventListener("keydown", async (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
                event.preventDefault();
            } else if (event.key === 'Enter') {
                await postCommentProcess();
            }
        });

        async function postCommentProcess() {
            let postId = post.postId;
            let comment = commentField.value.trim();

            if (comment.length == 0) {
                return;
            }
            else {
                let userComment = await commentOnPost(postId, comment, jwtToken);
                if (userComment != null) {
                    post.noOfComments++;
                    changedSomething = true;
                    // commentField.blur();
                    commentField.focus()
                    commentField.value = "";

                    let commentCardHTML = await createCommentCardHTML(currentUserDetails, userComment);
                    insertCommentCartToContainer(commentCardHTML, true);
                }
            }
        }
    }
}
async function createCommentCardHTML(basicUserInfo, userComment) {
    let userId = basicUserInfo.userId;
    let postId = userComment.postId;
    let profilePhotoURL = "../Images/no_profile_photo.jpg";
    if (currentUserDetails.userId == userId) {
        profilePhotoURL = currentUserProfilePhotoURL;
    } else {
        profilePhotoURL = basicUserInfo.profilePhoto == null ? "../Images/no_profile_photo.jpg" : await getUserProfilePhoto(userId, jwtToken);
    }
    let username = basicUserInfo.username;
    let commentId = userComment.commentId;
    let comment = userComment.comment;
    let timeAgo = getPostTime(userComment.commentDateTime);

    let commentCardHTML = `<div class="post-comment" data-commentid="${commentId}" data-userid="${userId}" data-postid="${postId}">
        <div>
            <img class="user_profile_photo clickable" data-userid="${userId}" src="${profilePhotoURL}"
                alt="">
        </div>
        <div class="comment-head">
            <span class="username clickable" data-userid="${userId}">${username}</span>
            <span class="comment-time">${timeAgo}</span>
            ${userId == currentUserDetails.userId || currentUserDetails.userId == post.postOwnerInfo.userId ?
            `<div class="comment-opts">
                <svg aria-label="Comment Options" class="x1lliihq x1n2onr6" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment Options</title><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
            </div>`: ""}
        </div>
        <div class="comment-part">
            <pre class="comment">${comment}</pre>
            <span class="comment-toggle-btn clickable">more</span>
        </div>
    </div>`;
    return commentCardHTML;
}
function insertCommentCartToContainer(commentCardHTML, topOrBottom = false) {
    let newCommentElement;
    if (topOrBottom) {
        commentsContainer.insertAdjacentHTML("afterbegin", commentCardHTML);
        newCommentElement = commentsContainer.firstChild;
    } else {
        commentsContainer.insertAdjacentHTML("beforeend", commentCardHTML);
        newCommentElement = commentsContainer.lastChild;
    }
    addCommentCardLogic(newCommentElement);
}
async function loadPostOwnerInfo(postOwnerInfo) {
    let userId = postOwnerInfo.userId;
    let username = postOwnerInfo.username;

    let usernames = document.querySelectorAll(".username");
    usernames.forEach(un => {
        un.innerHTML = username;
        un.dataset.userId = userId;
        un.addEventListener("click", event => {
            gotoProfileOf(userId);
        });
    })
    let dps = document.querySelectorAll(".user_profile_photo");
    for (let dp of dps) {
        let dpURL = post.postId == currentUserDetails.userId ? currentUserProfilePhotoURL : await getUserProfilePhoto(userId, jwtToken);
        if (dpURL) {
            dp.src = dpURL;
        }
        dp.addEventListener("click", event => {
            gotoProfileOf(userId);
        });
    }

}
function playVideoIfOnScreen(videoElement) {
    videoElement.addEventListener("click", () => {
        audioToggle(videoElement);
    });
    videoElement.nextSibling.nextSibling.addEventListener("click", () => {
        audioToggle(videoElement);
    });

    videoElement.parentElement.parentElement.addEventListener('scroll', handleVisibility);

    document.addEventListener("visibilitychange", () => {
        if (document["hidden"]) {
            videoElement.pause();
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
    function isElementInViewport() {
        let videoReact = videoElement.parentElement.getBoundingClientRect();
        let containerRect = postContentContainer.getBoundingClientRect();

        if (
            videoReact.left >= containerRect.left - 40 &&
            videoReact.right <= containerRect.right + 40
        ) {
            return true;
        } else return false;
    }
    function audioToggle() {
        let audioIcons = videoElement.parentElement.parentElement.querySelectorAll(".video-volume-toggle img");
        if (mute) {
            videoElement.muted = false;
            mute = 0;
            audioIcons.forEach((audioIcon) => {
                audioIcon.src = "../Images/volume-up-interface-symbol.png";
            })
        } else {
            videoElement.muted = true;
            mute = 1;
            audioIcons.forEach((audioIcon) => {
                audioIcon.src = "../Images/volume-mute.png";
            })
        }
    }
    function playVideo(videoElement) {
        if (mute) {
            videoElement.muted = true;
            videoElement.play();
        } else {
            videoElement.muted = false;
            videoElement.play();
        }
    }
}
async function getImagePost(contentId) {
    let url = await getPostContentUrl(contentId, jwtToken);
    postContentsURL.push(url);
    let imgContent =
        `<div class="post-content post-content-img">
        <img src="${url}" alt="">
    </div>`;

    return imgContent;
}
async function getVideoPost(contentId) {
    let url = await getPostContentUrl(contentId, jwtToken);
    postContentsURL.push(url);
    let videoContent =
        `<div class="post-content post-content-video">
        <video loop muted playsinline autoplay>
            <source
                src="${url}"
                type="video/mp4">
            <source src="movie.ogg" type="video/ogg">
            Your browser does not support the video tag.
        </video>
        <div class="video-volume-toggle">
            <img src="../Images/volume-mute.png" alt="">
        </div>
    </div>`;

    return videoContent;
}

// Load Comments
let pageSize = 20;
let pageNumber = 1;
let sortBy = "DESC";
let viewedAllComments = false;
let commentsSec = document.querySelector(".comments");

async function loadComments() {
    if (viewedAllComments) return;

    let otherComments = await getOtherCommentsOfPost(post.postId, pageSize, pageNumber, sortBy, jwtToken);
    if (otherComments) {
        pageNumber++;
        let commentsList = otherComments.pageContent;
        if (commentsList.length == 0) {
            viewedAllComments = true;
        } else {
            for (let userComment of commentsList) {
                let commentCard = await createCommentCardHTML(userComment.commentOwner, userComment);
                insertCommentCartToContainer(commentCard, false);
            }
            commentsSec.addEventListener("scroll", loadNewPage);
        }
    }
}
async function loadNewPage() {
    let commentsContainerRect = commentsContainer.getBoundingClientRect();
    let commentSecRect = commentsSec.getBoundingClientRect();
    let distanceToBottom = commentSecRect.bottom - commentsContainerRect.bottom;

    if (distanceToBottom >= 5 || pageNumber == 1) {
        commentsSec.removeEventListener("scroll", loadNewPage);
        await loadComments();
    }
}
function addCommentCardLogic(commentElement) {
    let postId = commentElement.dataset.postid;
    let commentId = commentElement.dataset.commentid;
    let commentOwnerId = commentElement.dataset.userid;
    if (commentOwnerId == currentUserDetails.userId || currentUserDetails.userId == post.postOwnerInfo.userId) {
        //logic of my comments
        let optsBtn = commentElement.querySelector(".comment-opts");
        optsBtn.addEventListener("click", showCommentOptsBtnLogic)

        function showCommentOptsBtnLogic() {
            optsBtn.insertAdjacentHTML("beforeend",
                `<div class="comment-opts-list">
                    <div class="comment-dlt-btn">Delete</div>
                </div>`);
            let optsList = optsBtn.querySelector(".comment-opts-list");
            addOptsFunctionality();
            optsList.style.display = "block";
            optsBtn.classList.add("pressed");
            optsBtn.removeEventListener("click", showCommentOptsBtnLogic)
            optsBtn.addEventListener("click", hideCommentOptsBtnLogic)
        }
        function hideCommentOptsBtnLogic() {
            let optsList = optsBtn.querySelector(".comment-opts-list");
            optsList.remove();
            optsBtn.classList.remove("pressed");
            optsList.style.display = "none";
            optsBtn.removeEventListener("click", hideCommentOptsBtnLogic)
            optsBtn.addEventListener("click", showCommentOptsBtnLogic)
        }
        function addOptsFunctionality() {
            let commentDltBtn = optsBtn.querySelector(".comment-dlt-btn");
            commentDltBtn.addEventListener("click", deletePostComment);
        }
        async function deletePostComment() {
            commentElement.style.display = "none";
            let isCommentDeleted = await deleteComment(postId, commentId, jwtToken);

            if (isCommentDeleted) {
                post.noOfComments--;
                changedSomething = true;
                commentElement.style.backgroundColor = "#fff0f1";
                commentElement.style.height = "0px";
                setTimeout(() => {
                    commentElement.remove();
                }, 10000)
            } else {
                commentElement.style.display = "flex";
            }
        }
    } else {
        //logic of others' comments
    }
    let comment = commentElement.querySelector(".comment");
    let commentToggleBtn = commentElement.querySelector(".comment-toggle-btn");

    let more = 0;
    commentToggleBtn.addEventListener('click', function () {
        comment.classList.toggle('expand');
        if (!more) {
            commentToggleBtn.innerHTML = "less"
            more = 1;
        } else {
            commentToggleBtn.innerHTML = "more"
            more = 0;
        }

    });
    if (comment.scrollWidth > comment.clientWidth) {
        commentToggleBtn.style.display = 'block';
    }

    //Adding Go To Profile Logic
    let profileRedirecterElem = commentElement.querySelectorAll(".username, .user_profile_photo");
    profileRedirecterElem.forEach(e => {
        e.addEventListener("click", () => {
            let userId = e.dataset.userid;
            gotoProfileOf(userId);
        })
    })
}
commentsSec.addEventListener("scroll", () => {
    let commentsContainerRect = commentsContainer.getBoundingClientRect();
    let commentSecRect = commentsSec.getBoundingClientRect();
})

// Updating to Newsfeed
function updateChangesToNewsFeed(post, isLiked) {
    parentWindow.postMessage(["changesInPost", {
        post,
        isLiked
    }])
}

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
        profilePhotoURL = !liker.profilePhoto ? "../Images/no_profile_photo.jpg" : await getUserProfilePhoto(userId, jwtToken);
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

// GOTO PROFILE
function gotoProfileOf(userId) {
    parentWindow.postMessage(["gotoProfileOf", userId]);
    closeWindow();
}

// POST OPTS
let infoSec = document.querySelector(".info-sec");
infoSec.classList.add("for-mobile");

function loadPostOpts() {
    if (post.postOwnerInfo.userId == currentUserDetails.userId) {
        let logicSetted = false;

        let postMoreOptsBtn = infoSec.querySelector(".info-sec .head .more-opts-btn");
        let postMoreOptsBtnOpenBtn = postMoreOptsBtn.querySelector(".open");
        let postMoreOptsCloseBtn = postMoreOptsBtn.querySelector(".close_btn_svg");
        let postMoreOptsList = infoSec.querySelector("#more-opts-list");
        
        postMoreOptsBtn.addEventListener("click", showMoreOpts);
        if (!logicSetted) {
            let editPostBtn = postMoreOptsList.querySelector("#edit-post-btn")
            let dltPostBtn = postMoreOptsList.querySelector("#dlt-post-btn");
            let cancleEditBtn = document.querySelector("#cancle-caption-edit-btn");
            let saveCaptionChangesBtn = document.querySelector("#save-new-caption-btn");
            let captionEditControls = infoSec.querySelector("#caption-edit");

            editPostBtn.addEventListener("click", openPostEditSec);
            dltPostBtn.addEventListener("click", deletePost);
            cancleEditBtn.addEventListener("click", () => {
                let ogCaption = post.caption;
                caption.innerHTML = ogCaption;
                closePostEditSec();
            });
            saveCaptionChangesBtn.addEventListener("click", editCaption);

            logicSetted = false;

            function openPostEditSec() {
                hideMoreOpts();
                caption.contentEditable = true;
                caption.focus();

                captionEditControls.style.display = "flex";
            }
            function closePostEditSec() {
                hideMoreOpts();
                caption.blur();
                caption.contentEditable = false;
                captionEditControls.style.display = "none";
            }
            async function editCaption() {
                saveCaptionChangesBtn.removeEventListener("click", editCaption);
                saveCaptionChangesBtn.innerHTML = "Saving...";
                let newCaption = caption.innerHTML.trim();
                let isCaptionChanged = await editPostCaption(post.postId, newCaption, jwtToken);

                if (isCaptionChanged) {
                    closePostEditSec();
                    saveCaptionChangesBtn.innerHTML = "Save";
                    saveCaptionChangesBtn.addEventListener("click", editCaption);
                    post.caption = newCaption;
                    changedSomething = true;
                }
            }
            async function deletePost() {
                dltPostBtn.removeEventListener("click", deletePost);
                dltPostBtn.classList.add("deleting");
                dltPostBtn.innerHTML = "Deleting..."

                let isPostDeleted = await deleteUserPost(post.postId, jwtToken);
                if (isPostDeleted) {
                    removePost();
                } else {
                    dltPostBtn.classList.remove("deleting");
                    dltPostBtn.innerHTML = "Delete"
                    dltPostBtn.addEventListener("click", deletePost);
                }
            }
        }
        postMoreOptsBtn.style.display = "block";

        function showMoreOpts() {
            postMoreOptsList.style.display = "flex";
            postMoreOptsBtnOpenBtn.style.display = "none";
            postMoreOptsCloseBtn.style.display = "block";
            postMoreOptsBtn.removeEventListener("click", showMoreOpts);
            postMoreOptsBtn.addEventListener("click", hideMoreOpts);
        }
        function hideMoreOpts(event) {
            if (!event || event.target != postMoreOptsBtn) {
                postMoreOptsList.style.display = "none";
                postMoreOptsBtnOpenBtn.style.display = "block";
                postMoreOptsCloseBtn.style.display = "none";
                postMoreOptsBtn.removeEventListener("click", hideMoreOpts);
                postMoreOptsBtn.addEventListener("click", showMoreOpts);
            }
        }
    }
}

function removePost() {
    changedSomething = false;
    parentWindow.postMessage(["deletePostCard", post.postId])
    closeWindow();
}

// OVERLAY SCREEN CONTROLLER
function showOverlayScreen(innerHTML) {
    overlayScreen.addEventListener("click", hideOverlayScreen)
    overlayScreen.innerHTML = innerHTML;
    overlayScreen.style.display = "flex";
}
function hideOverlayScreen(event) {
    if (!event || event.target == event.currentTarget) {
        overlayScreen.removeEventListener("click", hideOverlayScreen)
        likePageNumber = 1;
        overlayScreen.style.display = "none";
        overlayScreen.innerHTML = null;
    }
}