import {
    baseUrl
} from "../src/api_endpoints.js";

import {
    showFooterAlert,
    getUserProfilePhoto
} from "../src/util.js"


let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));
let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));


async function loadCurrentUserDetails() {
    loadCurrentUserDp();
    loadCurrentUserNames();
};
async function loadCurrentUserDp() {
    let currentUserProfilePhotos = document.querySelectorAll(".current.user_profile_photo");

    let profilePhotoUrl = await getUserProfilePhoto(currentUserDetails.userId, jwtToken);

    currentUserProfilePhotos.forEach(p => {
        p.setAttribute("src", profilePhotoUrl);
    });
}
async function loadCurrentUserNames() {
    let currentUserUsernames = document.querySelectorAll(".current.username");

    currentUserUsernames.forEach(un => {
        un.innerText = currentUserDetails.username;
    })

    let currentUserUserFullNames = document.querySelectorAll(".current.fullname");

    currentUserUserFullNames.forEach(fn => {
        fn.innerText = (currentUserDetails.firstName + " " + currentUserDetails.lastName).trim();
    });
}

loadCurrentUserDetails();








// VIDEO POST
let newsfeedContentSec = document.querySelector("#newsfeed_content_sec");
const videoElements = document.querySelectorAll('.post-content-video>video');
let muteAudio = false;

videoElements.forEach((videoElement) => {

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
});
function playVideo(videoElement) {
    if (muteAudio) {
        videoElement.muted = true;
        videoElement.play();
    } else {
        videoElement.muted = false;
        videoElement.play();
    }
}

function audioToggle(videoElement) {
    if (muteAudio) {
        videoElement.nextSibling.nextSibling.childNodes[1].setAttribute("src", "../Images/volume-up-interface-symbol.png");
        muteAudio = false;
        playVideo(videoElement);
    } else {
        videoElement.nextSibling.nextSibling.childNodes[1].setAttribute("src", "../Images/volume-mute.png");
        muteAudio = true;
        playVideo(videoElement);
    }
}
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = element.parentElement.parentElement.getBoundingClientRect();

    if(rect.left >= containerRect.left-200 &&
        rect.right <= containerRect.right+200){
        console.log(rect.left >= containerRect.left-200 &&
            rect.right <= containerRect.right+200)
    
        console.log(rect.left, containerRect.left-200)
        console.log(rect.right, containerRect.right+200)
        console.log(" ")
    }

    return (
        rect.top >= -200 &&
        rect.left >= 0 &&
        rect.bottom <= 200 + (newsfeedContentSec.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (newsfeedContentSec.innerWidth || document.documentElement.clientWidth)
        &&
        rect.left >= containerRect.left-200
        &&
        rect.right <= containerRect.right+200
    );
}


// POST CAPTION

const caption = document.querySelector('.caption');
const captionToggleBtn = document.querySelector('.caption-toggle-btn');

captionToggleBtn.addEventListener('click', function () {
    caption.classList.toggle('expand');
    captionToggleBtn.innerHTML = "less"
});

if (caption.scrollWidth > caption.clientWidth) {
    captionToggleBtn.style.display = 'block';
}
