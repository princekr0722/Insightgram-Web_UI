import {
    getUserProfilePhoto,
    createPost,
    createStory,

} from "/Insightgram-Web_UI/src/util.js";

let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));

const parentWindow = window.parent;
let body = document.body;
body.addEventListener("click", (event) => {
    if (event.target == body) {
        parentWindow.postMessage(["removeCreationSection"]);
    }
})


let mainHeadMessage = document.querySelector("#head-message");
let dragAreaMessage = document.querySelector("#drag-area-message");

let fileInput = document.querySelector("#file-input");
let selectFromComputerBtn = document.querySelector("#select-from-computer-btn");
let dragArea = document.querySelector("#drag-file-area");
let createPostBannerBody = document.querySelector("#create-post-banner-body");
let backBtn = document.querySelector('#back-btn');
let postBtn = document.querySelector("#post-btn");
let postTypeSelectionSec = document.querySelector("#post-type-selection");
let proceedForPostCreationBtn = postTypeSelectionSec.querySelector("#normal-post-type");
let proceedForStoryCreationBtn = postTypeSelectionSec.querySelector("#story-post-type");
let proceedForReelCreationBtn = postTypeSelectionSec.querySelector("#reel-post-type");
let validMediaTypes = ["image/*", "video/*"];

let isMultipostAllowed = true;
let allowedMediaTypes = validMediaTypes;
let isCaptionAllowed = true;
let newPostType = null;

proceedForPostCreationBtn.addEventListener("click", () => {
    postTypeSelectionSec.style.display = "none";
    dragArea.style.display = "flex";

    isMultipostAllowed = true;
    allowedMediaTypes = validMediaTypes;
    isCaptionAllowed = true;
    mainHeadMessage.innerText = "Create new post";
    dragAreaMessage.innerText = "Drag photos and videos here";
    newPostType = proceedForPostCreationBtn.dataset.posttype;

    start();
});

proceedForStoryCreationBtn.addEventListener("click", () => {
    postTypeSelectionSec.style.display = "none";
    dragArea.style.display = "flex";

    isMultipostAllowed = false;
    allowedMediaTypes = validMediaTypes;
    isCaptionAllowed = false;
    mainHeadMessage.innerText = "Create new story";
    dragAreaMessage.innerText = "Drag photo and video here";
    newPostType = proceedForStoryCreationBtn.dataset.posttype;

    start();
})

proceedForReelCreationBtn.addEventListener('click', () => {
    postTypeSelectionSec.style.display = "none";
    dragArea.style.display = "flex";

    isMultipostAllowed = false;
    allowedMediaTypes = ["video/*"];
    isCaptionAllowed = true;
    mainHeadMessage.innerText = "Create new reel";
    dragAreaMessage.innerText = "Drag video here";
    newPostType = proceedForReelCreationBtn.dataset.posttype;

    start();
})

function start() {
    fileInputFieldSettings();

}

function fileInputFieldSettings() {
    fileInput.accept = allowedMediaTypes;

    if (isMultipostAllowed) {
        fileInput.multiple = true;
    } else fileInput.multiple = false;
}

selectFromComputerBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    handleDroppedFiles(fileInput.files);
});

dragArea.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragArea.classList.add('dragover');
})

dragArea.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dragArea.addEventListener('dragleave', () => {
    dragArea.classList.remove('dragover');
});

dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    // Process dropped files
    handleDroppedFiles(files);
});

let fileErrorMessage = document.querySelector("#file-error-message");

let addedContent = false;
function handleDroppedFiles(files) {
    if (addedContent) return;

    fileErrorMessage.innerHTML = null;
    dragArea.classList.remove("fail-upload");

    let allFiles = [];
    for (let file of files) {

        let fileType = file.type.split("/")[0];
        if (fileType != "video" && fileType != "image") {
            fileErrorMessage.innerHTML = file.name + " is not supported file format.";
            dragArea.classList.add("fail-upload");
            return;
        } else {
            allFiles.push(file);
        }
    };

    addedContent = true;
    dragArea.style.display = "none";
    showFilesPreview(allFiles)
    if (isCaptionAllowed) showCaptionArea();
    showBackAndPostBtn(allFiles);
}

function showFilesPreview(allFiles) {
    let contentHtml = "";
    allFiles.forEach(file => {
        let contentCard;
        if (file.type.split("/")[0] == "video") {
            contentCard = getVideoPostHtml(file);
        } else {
            contentCard = getImagePostHtml(file);
        }
        contentHtml += contentCard;
    })
    let previewPostCarousel =
        `<div id="file-preview-sec">
        <div class="preview-content-carousel">
            ${contentHtml}
        </div>
        ${allFiles.length == 1 ? "" :
            `<div class="slide-arrow  slide-left clickable">
        <img src="../Images/arrow-right.png" alt="">
        </div>
        <div class="slide-arrow slide-right clickable">
            <img src="../Images/arrow-right.png" alt="">
        </div>`
        }
    </div>
    `;

    dragArea.style.display = "none";
    createPostBannerBody.insertAdjacentHTML("beforeend", previewPostCarousel);
    addScrollArrowsLogic();
}
function addScrollArrowsLogic() {
    let leftArrow = document.querySelector(".slide-left");
    let rightArrow = document.querySelector(".slide-right");

    if (!leftArrow || !rightArrow) return;

    leftArrow.addEventListener("click", () => {
        scrollPostCarouselLeft(leftArrow);
    });

    rightArrow.addEventListener("click", () => {
        scrollPostCarouselRight(rightArrow);
    });
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
function hideFilesPreview() {
    document.querySelector("#file-preview-sec").remove();
}
async function showCaptionArea() {
    let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));

    let profilePhotoUrl;
    if (currentUserDetails == null || currentUserDetails.profilePhoto == null) {
        profilePhotoUrl = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";
    } else {
        profilePhotoUrl = await getUserProfilePhoto(currentUserDetails.userId, jwtToken);
    }

    let maxCaptionLength = 2000;

    let captionAreaHtml =
        `<div id="caption-area">
        <div id="caption-area-user-details">
            <img class="user_profile_photo" src="${profilePhotoUrl}" alt="">
            <span class="username">${currentUserDetails.username || "username"}</span>
        </div>
        <div id="add-caption">
            <textarea maxlength="${maxCaptionLength}" contenteditable id="caption-field" placeholder="Write a caption..."
                name="caption"></textarea>
            <div id="text-limit">
                <span>0</span><span>/${maxCaptionLength}</span>
            </div>
        </div>
    </div>
    `;
    createPostBannerBody.insertAdjacentHTML("beforeend", captionAreaHtml);
    addTextAreaLogic();
}
function getImagePostHtml(content) {
    let imagePostHtml =
        `<div class="post-content post-content-img">
    <img src="${URL.createObjectURL(content)}">
    </div>`;

    return imagePostHtml;
}
function getVideoPostHtml(content) {
    let videoPostHtml =
        `<div class="post-content post-content-video">
    <video loop playsinline controls>
    <source
    src="${URL.createObjectURL(content)}">
    <source src="movie.ogg" type="video/ogg">
    Your browser does not support the video tag.
    </video>
    </div>`;

    return videoPostHtml;
}
function addTextAreaLogic() {
    let captionField = document.querySelector("#caption-field");
    captionField.addEventListener("input", countCaptionLength);
}
function countCaptionLength(event) {
    let captionField = document.querySelector("#caption-field");

    let counter = captionField.parentElement.querySelector("#text-limit>span:first-child");
    counter.innerHTML = null;
    counter.innerHTML = captionField.value.length;
}
function hideCaptionArea() {
    let captionArea = document.querySelector("#caption-area")
    if (captionArea) captionArea.remove();
}

let addPostBtnLogic;
function showBackAndPostBtn(allFiles) {
    backBtn.style.display = "block";
    postBtn.style.display = "block";

    backBtn.addEventListener("click", addBackBtnLogic);
    if (newPostType == "PHOTO_OR_VIDEO" || newPostType == "REEL") {
        addPostBtnLogic = async () => {
            let postType = newPostType;
            let caption = document.querySelector("#caption-field").value;

            let postDto = await createPost(allFiles, postType, caption, jwtToken);

            if (postDto != null) {
                // Send a message to the parent
                parentWindow.postMessage(["showMyNewPostInNewsfeed", postDto]);
            }
        }
    } else {
        addPostBtnLogic = async () => {
            let storyDto = await createStory(allFiles[0], jwtToken);
            if (storyDto) {
                parentWindow.postMessage(["showNewStoryInStorySec", storyDto]);
            }
        }
    }
    postBtn.addEventListener("click", addPostBtnLogic);
}
function addBackBtnLogic() {
    hideCaptionArea();
    hideBackAndPostBtn();
    hideFilesPreview();
    fileInput.value = "";
    addedContent = false;
    dragArea.style.display = "flex";
}
function hideBackAndPostBtn() {
    backBtn.removeEventListener("click", addBackBtnLogic);
    postBtn.removeEventListener("click", addPostBtnLogic);
    backBtn.style.display = "none";
    postBtn.style.display = "none";
}

