import {
    searchUsers,
    getUserProfilePhoto,

} from "/Insightgram-Web_UI/src/util.js";

let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));

// Parent Window Contact
const parentWindow = window.parent;

let searchContainer = document.querySelector("#search-container");
let searchField = document.querySelector("#search-bar input");
let searchResultsContainer = document.querySelector("#search-result-container");
// let noSearchHistoryMsg = document.querySelector("#no-search-history");
let noSearchResultMsg = document.querySelector("#no-search-results");
let closeSearchSecBtn = document.querySelector("#close-search-sec-btn");

let pageNumber = 1;
let pageSize = 20;
searchField.addEventListener("keydown", async (event) => {
    if (event.key == "Enter") {
        let searchText = searchField.value;
        let searchedUsersPage = await searchUsers(searchText, jwtToken, pageSize, pageNumber);

        searchResultsContainer.innerHTML = null;
        if (searchedUsersPage != null && searchedUsersPage.totalCurrentPageElements != 0) {
            processSearchedUserPage(searchedUsersPage);
        } else {
            noSearchResultMsg.style.display = "block";
        }
    }
});
async function processSearchedUserPage(searchedUsersPage) {

    if (searchedUsersPage.totalCurrentPageElements == 0) {
        return false;
    } else {
        noSearchResultMsg.style.display = "none";

        for (let userBasicInfo of searchedUsersPage.pageContent) {
            let userBasicInfoCard = await getSearchedUserCard(userBasicInfo);

            searchResultsContainer.insertAdjacentHTML("beforeend", userBasicInfoCard);

            gotoProfileOf(searchResultsContainer.lastChild);
        }

        if (pageNumber * 10 < searchedUsersPage.totalElements) {
            addAutoLoadTheSearchResultsOnScrollLogic();
        } else {
            window.removeEventListener("scroll", loadNextPageOfSearchResults);
        }
    }
}
async function getSearchedUserCard(userBasicInfo) {
    let userId = userBasicInfo.userId;
    let username = userBasicInfo.username;
    let userFullName = userBasicInfo.userFullName;
    let profilePhotoUrl = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";
    if (userBasicInfo.profilePhoto != null) {
        profilePhotoUrl = await getUserProfilePhoto(userId, jwtToken);
    }

    let userBasicInfoCard =
        `<div class="searched_user clickable" data-userId="${userId}">
        <div class="dp_and_names">
            <div>
                <img class="user_profile_photo" src="${profilePhotoUrl}" alt="">
            </div>
            <div class="naming">
                <span class="username">${username}</span><br>
                <span class="fullname">${userFullName}</span>
            </div>
        </div>
    </div>`;
    return userBasicInfoCard;
}

function addAutoLoadTheSearchResultsOnScrollLogic() {
    window.addEventListener("scroll", loadNextPageOfSearchResults);
}

async function loadNextPageOfSearchResults() {
    let distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

    if (distanceToBottom <= 10) {
        window.removeEventListener("scroll", loadNextPageOfSearchResults);

        let searchText = searchField.value;
        let searchedUsersPage = await searchUsers(searchText, jwtToken, 10, pageNumber);
        pageNumber++; //MOVED IT DOWN BY 2 LINES
        
        if (searchedUsersPage != null && searchedUsersPage.totalCurrentPageElements != 0) {
            await processSearchedUserPage(searchedUsersPage);
            window.addEventListener("scroll", loadNextPageOfSearchResults);
        }
    }

}

function gotoProfileOf(basicUserInfoElement) {
    basicUserInfoElement.addEventListener("click", () => {
        let userId = basicUserInfoElement.dataset.userid;
        parentWindow.postMessage(["gotoProfileOf", userId]);
    });
}

closeSearchSecBtn.addEventListener("click", ()=>{
    parentWindow.postMessage(["hideSearchSection"])
})