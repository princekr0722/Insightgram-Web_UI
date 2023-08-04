import {
    deleteStoryById,
    getDate,
    getStoriesOfUser, getTimePast, showFooterAlert, viewStoryById
} from "../src/util.js";

// // GLOBAL VALUES
let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));
let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));

let storiesSec;
let storiesContainer;
let userStoryIcons;

let storyViewSection = document.querySelector("#story-view-section");
// let storyScrollBag = storyViewSection.querySelector("#story-scroll-bag");
let storyCarouselsContainer = storyViewSection.querySelector("#story-carousels-container");
let storyCarouselsWrapper;
let storyCarousels;
let storyCarouselsContainerLeftArrow = document.querySelector("#story-view-section>.slide-arrow.slide-left");
let storyCarouselsContainerRightArrow = document.querySelector("#story-view-section>.slide-arrow.slide-right");

// // TODO: set this when the user clicks the story icon in newsfeed;
let previousStoryCarouselIndex = null;
let currentStoryCarouselIndex = 0;
let scrollPosition = 0;

let isStoryCarouselLoaded = false;
async function startStoryViewSection(storyBasicInfo, usersWhoHaveStory, forced = true) {
    storiesSec = document.querySelector("#stories_sec");
    storiesContainer = storiesSec.querySelector("#stories");
    userStoryIcons = storiesSec.querySelectorAll(".story");

    // console.log(storyBasicInfo)
    let seletedUserId = storyBasicInfo.userId;

    // currentStoryCarouselIndex = storyBasicInfo.storyIndex;
    for (let i = 0; i < userStoryIcons.length; i++) {
        let userStoryIcon = userStoryIcons[i];

        if (userStoryIcon.dataset.userid == seletedUserId) {
            currentStoryCarouselIndex = i;
            break;
        }
    }
    scrollPosition = -currentStoryCarouselIndex * 100;

    if (forced || isStoryCarouselLoaded == false) {
        console.log(usersWhoHaveStory)
        storyCarouselsContainer.innerHTML = null;
        await createAllStoryCarousels(usersWhoHaveStory);

        isStoryCarouselLoaded = true;
    }
    storyCarouselsWrapper = storyCarouselsContainer.querySelectorAll(".story-carousel-dimensions");
    storyCarousels = storyCarouselsContainer.querySelectorAll(".story-carousel-dimensions>.story-carousel");

    let currentCarousel = storyCarouselsWrapper[currentStoryCarouselIndex];

    alignStoryCarouselContainer();
    startCurrentStoryCarousel();
    closeStorySectionOnBackBtnClick();
    storyViewSection.style.display = "flex";
}
function hideStoryViewSection() {
    storyViewSection.style.display = "none";
    let previousCarousel = storyCarouselsWrapper[currentStoryCarouselIndex];
    if (previousCarousel) {
        previousCarousel.classList.remove("current");
        let resetCarsouselBtn = previousCarousel.querySelector("#reset-carsousel-btn");
        resetCarsouselBtn.click();
    }

}
export { startStoryViewSection, hideStoryViewSection };

async function createAllStoryCarousels(usersWhoHaveStory) {

    for (let userBasicInfo of usersWhoHaveStory) {
        let userId = userBasicInfo.userId;

        let storiesDtos = await getStoriesOfUser(userId, jwtToken);
        if (storiesDtos) {
            await createStoryCarousel(storiesDtos, userBasicInfo);
        }
    }
}

async function createStoryCarousel(userStories, userBasicInfo) {
    let userId = userBasicInfo.userId;
    let username = userBasicInfo.username;
    let profilePhotoURL = userBasicInfo.profilePhotoURL;
    let lastStoryTimePast = getTimePast(userStories[userStories.length - 1].storyDateTime);

    let storyCarouselHTML =
        `<div class="story-carousel-dimensions" data-userid="${userId}">
        <div id="start-carsousel-btn"></div>
        <div id="reset-carsousel-btn"></div>
        <div class="story-carousel">
            <div class="story-cover">
                <div class="story-of-user">
                    <div class="gradiant-ring on">
                        <img class="user_profile_photo" src="${profilePhotoURL}" alt="" data-userid="${userId}">
                    </div>
                    <div data-userid="${userId}" class="username">${username}</div>
                    <div class="time">${lastStoryTimePast}</div>
                </div>
            </div>
            <div class="story-carousel-header">

                <div class="story-bars">
                    ${getStoryBarsHTML()}
                </div>

                <div class="user-info-n-control">

                    <div class="user-info">
                        <div class="user-dp">
                            <img class="user_profile_photo" src="${profilePhotoURL}" alt="" data-userid="${userId}">
                        </div>
                        <div class="username" data-userid="${userId}">${username}</div>
                        <div class="time">TT</div>
                    </div>

                    <div class="story-control">
                        <!-- <div class="story-play-pause">
                            <svg style="display: block;" aria-label="Play" class="x1lliihq x1n2onr6" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Play</title><path d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"></path></svg>
                            <svg style="display: none;" aria-label="Pause" class="x1lliihq x1n2onr6" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 48 48" width="16"><title>Pause</title><path d="M15 1c-3.3 0-6 1.3-6 3v40c0 1.7 2.7 3 6 3s6-1.3 6-3V4c0-1.7-2.7-3-6-3zm18 0c-3.3 0-6 1.3-6 3v40c0 1.7 2.7 3 6 3s6-1.3 6-3V4c0-1.7-2.7-3-6-3z"></path></svg>
                        </div> -->
                        <div class="story-mute-unmute clickable">
                            <svg style="display: none;" class="unmuted-icon" aria-label="Audio is playing" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"> <title>Audio is playing</title><path d="M16.636 7.028a1.5 1.5 0 1 0-2.395 1.807 5.365 5.365 0 0 1 1.103 3.17 5.378 5.378 0 0 1-1.105 3.176 1.5 1.5 0 1 0 2.395 1.806 8.396 8.396 0 0 0 1.71-4.981 8.39 8.39 0 0 0-1.708-4.978Zm3.73-2.332A1.5 1.5 0 1 0 18.04 6.59 8.823 8.823 0 0 1 20 12.007a8.798 8.798 0 0 1-1.96 5.415 1.5 1.5 0 0 0 2.326 1.894 11.672 11.672 0 0 0 2.635-7.31 11.682 11.682 0 0 0-2.635-7.31Zm-8.963-3.613a1.001 1.001 0 0 0-1.082.187L5.265 6H2a1 1 0 0 0-1 1v10.003a1 1 0 0 0 1 1h3.265l5.01 4.682.02.021a1 1 0 0 0 1.704-.814L12.005 2a1 1 0 0 0-.602-.917Z"></path></svg>
                            <svg style="display: none;" class="muted-icon" aria-label="Audo is muted." color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 48 48" width="16"><title>Audo is muted.</title><path clip-rule="evenodd" d="M1.5 13.3c-.8 0-1.5.7-1.5 1.5v18.4c0 .8.7 1.5 1.5 1.5h8.7l12.9 12.9c.9.9 2.5.3 2.5-1v-9.8c0-.4-.2-.8-.4-1.1l-22-22c-.3-.3-.7-.4-1.1-.4h-.6zm46.8 31.4-5.5-5.5C44.9 36.6 48 31.4 48 24c0-11.4-7.2-17.4-7.2-17.4-.6-.6-1.6-.6-2.2 0L37.2 8c-.6.6-.6 1.6 0 2.2 0 0 5.7 5 5.7 13.8 0 5.4-2.1 9.3-3.8 11.6L35.5 32c1.1-1.7 2.3-4.4 2.3-8 0-6.8-4.1-10.3-4.1-10.3-.6-.6-1.6-.6-2.2 0l-1.4 1.4c-.6.6-.6 1.6 0 2.2 0 0 2.6 2 2.6 6.7 0 1.8-.4 3.2-.9 4.3L25.5 22V1.4c0-1.3-1.6-1.9-2.5-1L13.5 10 3.3-.3c-.6-.6-1.5-.6-2.1 0L-.2 1.1c-.6.6-.6 1.5 0 2.1L4 7.6l26.8 26.8 13.9 13.9c.6.6 1.5.6 2.1 0l1.4-1.4c.7-.6.7-1.6.1-2.2z" fill-rule="evenodd"></path></svg>
                        </div>
                        ${userId == currentUserDetails.userId ?
            `<div class="story-more-opts clickable">
                            <svg aria-label="Menu" class="x1lliihq x1n2onr6" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="24" role="img" viewBox="0 0 24 24" width="24"> <title>Menu</title> <circle cx="12" cy="12" r="2.75"></circle><circle cx="19.5" cy="12" r="2.75"></circle><circle cx="4.5" cy="12" r="2.75"></circle></svg>
                            <div class=delete-story-btn>Delete</div>
                        </div>` : ""}
                        <div class="close-story-section clickable">
                            <svg class="close_btn_svg" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="25" width="25" role="img"  ><path xmlns="http://www.w3.org/2000/svg" d="M17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41L17.59 5Z"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="loading-story">
                <img src="/Insightgram-Web_UI/Images/loading_animation.gif" alt="">
            </div>

            <div class="story-container">
                
            </div>

            <div class="slide-arrow slide-left clickable" style="display: none;">
                <img src="../Images/arrow-right.png" alt="">
            </div>
            <div class="slide-arrow slide-right clickable" style="display: none;">
                <img src="../Images/arrow-right.png" alt="">
            </div>
        </div>
        </div>`;
    function getStoryBarsHTML() {
        let storyBarsHTML = "";
        userStories.forEach(s => {
            storyBarsHTML +=
                `<div class="story-bar" data-storyid="${s.storyId}">
                <div class="progress-bar"></div>
            </div>`;
        });
        return storyBarsHTML;
    }

    let newStoryCarousel = await insertStoryCarouselInContainer(storyCarouselHTML);
    // console.log(userStories, userBasicInfo)
    putStoryContentsInStoryCarouselHTML();
    logicOfStoryCarousel(newStoryCarousel);

    function putStoryContentsInStoryCarouselHTML() {
        let newStoryCarouselContentContainer = newStoryCarousel.querySelector(".story-container");
        userStories.sort((a, b) => {
            let dateA = getDate(a.storyDateTime);
            let dateB = getDate(b.storyDateTime);

            if (dateA < dateB) return 1
            else return -1;
        })

        userStories.forEach(s => {
            let storyId = s.storyId;
            if (s.contentType.split("/")[0] == "video") {
                let videoStoryHTML =
                    `<div class="story-content" data-storyid="${storyId}" data-storytime="${getTimePast(s.storyDateTime)}">
                        <video muted ></video>
                    </div>`;
                newStoryCarouselContentContainer.insertAdjacentHTML("beforeend", videoStoryHTML);
            } else {
                let imgStoryHTML =
                    `<div class="story-content" data-storyid="${storyId}" data-storytime="${getTimePast(s.storyDateTime)}">
                        <img alt="">
                    </div>`;
                newStoryCarouselContentContainer.insertAdjacentHTML("beforeend", imgStoryHTML);
            }
        });
    }
}

async function insertStoryCarouselInContainer(storyCarouselHTML) {
    let positionAt = "beforeend";
    storyCarouselsContainer.insertAdjacentHTML(positionAt, storyCarouselHTML);
    let newStoryCarousel;
    if (positionAt == "beforeend") {
        newStoryCarousel = storyCarouselsContainer.lastElementChild;
    } else {
        newStoryCarousel = storyCarouselsContainer.firstElementChild;
    }
    return newStoryCarousel;
}

// Story Carousel Container Scroll Logic
storyCarouselsContainerLeftArrow.addEventListener("click", () => {
    scrollStoryCarouselContainerLeft();
});

storyCarouselsContainerRightArrow.addEventListener("click", () => {
    scrollStoryCarouselContainerRight();
});

function alignStoryCarouselContainer() {
    storyCarouselsWrapper.forEach(e => {
        e.style.transform = `translateX(${scrollPosition}%)`;
    });
}
function startCurrentStoryCarousel() {
    // return;
    let previousCarousel = storyCarouselsWrapper[previousStoryCarouselIndex];
    let currentCarousel = storyCarouselsWrapper[currentStoryCarouselIndex];

    if (previousCarousel) {
        let resetCarsouselBtn = previousCarousel.querySelector("#reset-carsousel-btn");
        resetCarsouselBtn.click();
    }
    currentCarousel.classList.add("current");

    let startCarsouselBtn = currentCarousel.querySelector("#start-carsousel-btn");
    startCarsouselBtn.click();
}
function scrollStoryCarouselContainerLeft() {
    if (scrollPosition == 0) {
        return;
    }

    scrollPosition += 100;
    alignStoryCarouselContainer();

    previousStoryCarouselIndex = currentStoryCarouselIndex;
    currentStoryCarouselIndex--;
    startCurrentStoryCarousel();
    // console.log((storyCarouselsWrapper.length-1) * 100, scrollPosition)
}
function scrollStoryCarouselContainerRight() {
    if (currentStoryCarouselIndex >= storyCarouselsWrapper.length - 1) {
        hideStoryViewSection();
        return;
    }
    // if ((storyCarouselsWrapper.length - 1) * 100 == Math.abs(scrollPosition)) {
    //     hideStoryViewSection();
    //     return;
    // }

    scrollPosition -= 100;
    alignStoryCarouselContainer();

    previousStoryCarouselIndex = currentStoryCarouselIndex;
    currentStoryCarouselIndex++;
    startCurrentStoryCarousel();
    // console.log((storyCarouselsWrapper.length-1) * 100, scrollPosition)
}
function storyCarouselContainerArrowsVisiblityLogic() {
    let lastStory = storyContainer.lastElementChild;
    let firstStory = storyContainer.firstElementChild;

    if (!lastStory || !firstStory) {
        storySlideArrowLeft.style.display = "none";
        storySlideArrowRight.style.display = "none";
        return;
    }

    let storiesContainerRect = storyContainer.getBoundingClientRect();
    let lastStoryRect = lastStory.getBoundingClientRect();
    let firstStoryRect = firstStory.getBoundingClientRect();

    if (storiesContainerRect.right + 6 < lastStoryRect.right) {
        storySlideArrowRight.style.display = "block";
    } else {
        storySlideArrowRight.style.display = "none";
    }

    if (storiesContainerRect.left > firstStoryRect.left) {
        storySlideArrowLeft.style.display = "block";
    } else {
        storySlideArrowLeft.style.display = "none";
    }
}

// FOR ONE CAROUSEL

let isStoryMuted = true;
let storyLoadingInterval = null;
let autoSlideProcess = null;

function logicOfStoryCarousel(storyCarousel) {
    // let storyCarousel = storyViewSection.querySelector(".story-carousel");
    let startCarsouselBtn = storyCarousel.querySelector("#start-carsousel-btn");
    let resetCarsouselBtn = storyCarousel.querySelector("#reset-carsousel-btn")

    let storyCarouselHeader = storyCarousel.querySelector(".story-carousel-header");
    let storyBars = storyCarouselHeader.querySelectorAll(".story-bar");
    let storyTime = storyCarousel.querySelector(".user-info .time");

    let storyControlers = storyCarousel.querySelector(".story-control")
    let closeStorySectionBtn = storyControlers.querySelector(".close-story-section");
    let storyMuteUnmuteBtn = storyControlers.querySelector(".story-mute-unmute");
    let storyMoreOpts = storyControlers.querySelector(".story-more-opts");
    let deleteStoryBtn = storyControlers.querySelector(".delete-story-btn");

    let loadingStoryAnimation = storyCarousel.querySelector(".loading-story");
    let storyContainer = storyCarousel.querySelector(".story-container");


    let storySlideArrowLeft = storyCarousel.querySelector(".slide-arrow.slide-left");
    let storySlideArrowRight = storyCarousel.querySelector(".slide-arrow.slide-right");

    let storyContents = storyContainer.querySelectorAll(".story-content");
    let currentStoryIndex = 0;
    let previousStoryIndex = null;

    storySlideArrowLeft.addEventListener('click', storySlideArrowLeftLogic);
    storySlideArrowRight.addEventListener('click', storySlideArrowRightLogic);

    startCarsouselBtn.addEventListener("click", start);
    resetCarsouselBtn.addEventListener("click", resetStoryCarousel);
    async function start() {
        setTimeout(async () => {
            currentStoryIndex = 0;
            previousStoryIndex = null;

            setTimeout(() => {
                arrowsVisiblityLogic();
            }, 300);

            if (storyLoadingInterval) clearInterval(storyLoadingInterval);
            if (autoSlideProcess) clearTimeout(autoSlideProcess);

            storyContainer.scroll(0, storyContainer.scrollHeight);

            await playCurrentStory();
        }, 100);
    }
    function resetStoryCarousel() {
        storyCarousel.classList.remove("current");

        if (storyLoadingInterval) clearInterval(storyLoadingInterval);
        if (autoSlideProcess) clearTimeout(autoSlideProcess);

        let lastStoryIndex = currentStoryIndex;
        let lastStoryContent = storyContents[lastStoryIndex].firstElementChild;
        let contentType = lastStoryContent.nodeName.toLowerCase();
        if (contentType == "video") {
            lastStoryContent.currentTime = 0;
            lastStoryContent.pause();
        }

        previousStoryIndex = null;
        currentStoryIndex = 0;

        alignStoryCarouselContainer();
        storyContainer.scroll(0, storyContainer.scrollHeight);
        setTimeout(() => {
            arrowsVisiblityLogic();
        }, 400);
    }

    async function storySlideArrowLeftLogic() {
        storySlideArrowLeft.removeEventListener('click', storySlideArrowLeftLogic);
        scrollStoriesCarouselLeft(storySlideArrowLeft);
        if (currentStoryIndex >= 1) {
            previousStoryIndex = currentStoryIndex;
            currentStoryIndex--;
        } else {
            storyContainer.scroll(0, storyContainer.scrollHeight);
        }
        setTimeout(() => {
            storySlideArrowLeft.addEventListener('click', storySlideArrowLeftLogic);
            arrowsVisiblityLogic();
        }, 400);

        await playCurrentStory();
    }
    async function storySlideArrowRightLogic() {
        storySlideArrowRight.removeEventListener('click', storySlideArrowRightLogic);

        scrollStoriesCarouselRight(storySlideArrowRight);
        if (currentStoryIndex < storyContents.length - 1) {
            previousStoryIndex = currentStoryIndex;
            currentStoryIndex++;
            console.log(currentStoryIndex)
        } else {
            storyContainer.scroll(storyContainer.scrollHeight, storyContainer.scrollHeight);
        }
        setTimeout(() => {
            storySlideArrowRight.addEventListener('click', storySlideArrowRightLogic);
            arrowsVisiblityLogic();
        }, 400);

        await playCurrentStory();
    }

    async function playCurrentStory() {
        toggleStoryAudioIcon();
        if (previousStoryIndex != null) {
            let storyContent = storyContents[previousStoryIndex];
            let contentElement = storyContent.firstElementChild;
            let contentType = contentElement.nodeName.toLowerCase();

            if (contentType == "video") {
                contentElement.currentTime = 0;
                contentElement.pause();
            }
        }

        storyTime.innerText = storyContents[currentStoryIndex].dataset.storytime;

        let storyContent = storyContents[currentStoryIndex];
        let contentElement = storyContent.firstElementChild;
        let contentType = contentElement.nodeName.toLowerCase();

        if (contentElement.src == "") {
            storyCarousel.classList.add("loading");
            let storyId = storyContent.dataset.storyid;

            let storyContentUrl = await viewStoryById(storyId, jwtToken);
            contentElement.src = storyContentUrl;
        }

        if (contentType == "video") {
            contentElement.muted = isStoryMuted;

            setTimeout(() => {
                contentElement.play();
                activateProgressBar();
            }, 100);
            // contentElement.addEventListener('loadeddata', () => {
            // });
        } else {
            activateProgressBar();
        }
        storyCarousel.dataset.lastStoryIndex = currentStoryIndex;
    }

    storyMuteUnmuteBtn.addEventListener("click", () => {
        if (isStoryMuted) isStoryMuted = false;
        else isStoryMuted = true;
        toggleStoryAudioIcon();
    });
    function toggleStoryAudioIcon() {
        let mutedIcon = storyMuteUnmuteBtn.querySelector(".muted-icon");
        let unmutedIcon = storyMuteUnmuteBtn.querySelector(".unmuted-icon");

        if (isStoryMuted) {
            unmutedIcon.style.display = "none";
            mutedIcon.style.display = "block";
        } else {
            mutedIcon.style.display = "none";
            unmutedIcon.style.display = "block";
        }

        let currentStoryContent = storyContents[currentStoryIndex];
        let content = currentStoryContent.firstElementChild;
        let contentType = content.nodeName.toLowerCase();

        if (contentType == "video") {
            content.muted = isStoryMuted;
        }
    }

    function activateProgressBar() {

        if (storyLoadingInterval) clearInterval(storyLoadingInterval);
        if (autoSlideProcess) clearTimeout(autoSlideProcess);

        for (let i = 0; i < storyContents.length; i++) {
            let storyBar = storyBars[i];

            let progressBar = storyBar.firstElementChild;

            progressBar.style.transition = `width 0s`;
            progressBar.style.width = "0px";
            if (i == currentStoryIndex) {
                startProgressBar(storyBar, progressBar);
            }
        }

        function startProgressBar(storyBar, progressBar) {

            let currentStoryContent = storyContents[currentStoryIndex];
            let contentType = currentStoryContent.firstElementChild.nodeName.toLowerCase();

            let progressDuration = 15;
            if (contentType == "video") {
                let videoElement = currentStoryContent.firstElementChild;
                progressDuration = videoElement.duration;

                if (progressDuration + "" == "NaN")
                    progressDuration = 15;
            }
            let loadingBarWidth = storyBar.offsetWidth;
            const increment = loadingBarWidth / (progressDuration * 100);
            let currentWidth = 0;

            progressBar.style.transition = `width ${progressDuration}s`;
            progressBar.style.width = "100%";

            setTimeout(() => {
                progressBar.style.transition = `width 0s`;
                progressBar.style.width = "0px";
            }, progressDuration * 1000)
            if (currentStoryIndex < storyContents.length - 1) autoSlideToNextStoryLogic(progressDuration);
            else {
                // NEXT PERSON'S STORY
                autoSlideProcess = setTimeout(() => {
                    storyCarouselsContainerRightArrow.click();
                }, progressDuration * 1000);
            }
        }

        function autoSlideToNextStoryLogic(slideDelay) {
            slideDelay *= 1000;
            let slideProcess = setTimeout(() => {
                if (storySlideArrowRight) {
                    storySlideArrowRight.click();
                }
            }, slideDelay);
            autoSlideProcess = slideProcess;
        }
    }

    function scrollStoriesCarouselRight(rightArrow) {
        rightArrow.previousElementSibling.previousElementSibling.scrollBy({
            top: 0,
            left: 0.5 + rightArrow.previousElementSibling.previousElementSibling.offsetWidth,
            behavior: "smooth"
        })
    }
    function scrollStoriesCarouselLeft(leftArrow) {
        leftArrow.previousElementSibling.scrollBy({
            top: 0,
            left: -leftArrow.previousElementSibling.offsetWidth,
            behavior: "smooth"
        })
    }
    function arrowsVisiblityLogic() {
        let lastStory = storyContainer.lastElementChild;
        let firstStory = storyContainer.firstElementChild;

        if (!lastStory || !firstStory) {
            storySlideArrowLeft.style.display = "none";
            storySlideArrowRight.style.display = "none";
            return;
        }

        let storiesContainerRect = storyContainer.getBoundingClientRect();
        let lastStoryRect = lastStory.getBoundingClientRect();
        let firstStoryRect = firstStory.getBoundingClientRect();

        if ((storiesContainerRect.right + 20) < lastStoryRect.right) {
            storySlideArrowRight.style.display = "block";
        } else {
            storySlideArrowRight.style.display = "none";
        }

        if (storiesContainerRect.left > firstStoryRect.left + 50) {
            storySlideArrowLeft.style.display = "block";
        } else {
            storySlideArrowLeft.style.display = "none";
        }
    }

    if (storyCarousel.dataset.userid == currentUserDetails.userId) {
        storyMoreOpts.addEventListener("click", showDeleteStoryBtn);
        deleteStoryBtn.addEventListener("click", deleteCurrentStoryProcess);
    }

    function showDeleteStoryBtn() {
        storyMoreOpts.removeEventListener("click", showDeleteStoryBtn);
        deleteStoryBtn.style.display = "block";
        storyMoreOpts.addEventListener("click", hideDeleteStoryBtn);
    }
    function hideDeleteStoryBtn() {
        storyMoreOpts.removeEventListener("click", hideDeleteStoryBtn);
        deleteStoryBtn.style.display = "none";
        storyMoreOpts.addEventListener("click", showDeleteStoryBtn);
    }
    async function deleteCurrentStoryProcess() {
        deleteStoryBtn.removeEventListener("click", deleteCurrentStoryProcess);

        let currentStoryContent = storyContents[currentStoryIndex];
        let storyId = currentStoryContent.dataset.storyid;

        if (storyContents.length == 1) {
            userStoryIcons[0].remove();
            storyCarousel.remove();

            scrollPosition += 100;
            storyCarouselsContainerRightArrow.click();
        } else {
            let currentProgressBar = storyBars[currentStoryIndex];
            currentStoryContent.remove();
            currentProgressBar.remove();

            storyBars = storyCarouselHeader.querySelectorAll(".story-bar");
            storyContainer = storyCarousel.querySelector(".story-container");
            storyContents = storyContainer.querySelectorAll(".story-content");
            
            // storySlideArrowRight.click();
            // currentStoryIndex;
            arrowsVisiblityLogic();
            await playCurrentStory();
            deleteStoryBtn.addEventListener("click", deleteCurrentStoryProcess);
        }
        let storyDeletedMsg = await deleteStoryById(storyId,jwtToken)
        if(storyDeletedMsg) {
            showFooterAlert("Story Deleted", false);
        }
    }

    // Function to be called when the window resize stops
    let resizeTimer;
    function handleResizeStop() {
        // Your code to handle the window resize stop goes here
        storyContainer.scroll(0, storyContainer.scrollHeight);
        storyContainer.scroll(storyContainer.offsetWidth * currentStoryIndex, storyContainer.scrollHeight);

    }
    window.addEventListener('resize', () => {
        if (storyCarouselsWrapper[currentStoryCarouselIndex] != storyCarousel) {
            return;
        }
        // Clear the previous timer
        clearTimeout(resizeTimer);
        // Set a new timer to call the function after a delay (e.g., 300 milliseconds)
        resizeTimer = setTimeout(handleResizeStop, 500);
    });
    document.addEventListener('visibilitychange', () => {
        if (storyCarousel.classList.contains("current")) {
            if (document.hidden == false) {
                arrowsVisiblityLogic();
                // console.log("Not Hidden")
            } else {

            }
        }
    });

    closeStorySectionBtn.addEventListener("click", hideStoryViewSection);
}


const swipeElement = storyViewSection;
let initialX = null;

swipeElement.addEventListener('touchstart', (event) => {
    initialX = event.touches[0].clientX;
});

swipeElement.addEventListener('touchmove', touchMoveDiretionDetector);
function touchMoveDiretionDetector(event) {
    if (initialX === null) return; // Touchstart event not triggered
}

swipeElement.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0]; // Get the first touch that ended
    const currentX = touch.clientX; // X coordinate where the touch ended
    const diffX = initialX - currentX; // Calculate the difference in X coordinate

    if (diffX > 0) {
        storyCarouselsContainerRightArrow.click();
    } else if (diffX < 0) {
        storyCarouselsContainerLeftArrow.click();
    }

    initialX = null;
});

function closeStorySectionOnBackBtnClick() {

    let newState = { action: 'storySectionOpen' };

    window.history.pushState(newState, '', '');

    window.addEventListener("popstate", (event) => {
        // Check if the state contains the information about the recent action
        // console.log(event)
        if (event.state && event.state.action === 'storySectionOpen') {
            // Undo the recent action here
            // For example, revert the changes made during the recent action
            // Or show a message to the user that they can undo the action
            hideStoryViewSection();
            // history.back();
        }
    });
}