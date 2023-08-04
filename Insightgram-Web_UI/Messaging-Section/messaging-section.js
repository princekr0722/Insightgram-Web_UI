import {
    connectToMessagingWS,


} from "../Newsfeed/messaging-socket.js";
import {
    getChatMessagesPage,
    getConverations, getTimePast, getUserBasicInfoByUsername, getUserProfilePhoto, isMobile, showFooterAlert,


} from "../src/util.js";

// GLOBAL VALUES
let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));
let currentUserProfilePhotoURL = JSON.parse(localStorage.getItem("currentUserProfilePhotoURL"));

let jwtToken = JSON.parse(localStorage.getItem("insightgramAuthenticationToken"));
let messageAccessToken = JSON.parse(localStorage.getItem("insightgramMessagingToken"));
let stompClient = null;

// PARENT WINDOW COMMUNICATION
const parentWindow = window.parent;
window.addEventListener('message', async function (event) {
    let message = event.data[0];
    let data = event.data[1];

    if (message == "showConversationsList") {
        showConversationsList();
    } else if (message == "openChatOfUser") {
        openChatOfUser(data);
    } else {
        console.log("Illegal Argument")
    }
});

messagingSocketSetup();
async function messagingSocketSetup() {
    stompClient = await connectToMessagingWS(onMessage);
}

// Show Conversations List
let peopleListContainer = document.querySelector("#people-list");
let emptyChatSec = document.querySelector("#empty-chat-sec");
let chatMessagesDiv = document.querySelector("#chat-messages-div");
let chatSec = document.querySelector("#chat-sec");
let chatTopProfileSec = chatSec.querySelector(".chat-top-profile");
let chatTopProfilePhotoElem = chatTopProfileSec.querySelector("#chat-messages .chat-top-profile .user_profile_photo");
let chatTopFullNameElem = chatTopProfileSec.querySelector("#chat-messages .chat-top-profile .fullname");
let chatTopUsername = chatTopProfileSec.querySelector("#chat-messages .chat-top-profile .username");
let chatHeadProfilePhotoContainer = chatSec.querySelector("#chat-head-dp-conatiner");
let chatHeadFullName = chatSec.querySelector(".head .fullname");
let messagesArea = chatSec.querySelector(".messages-area");
let currentMessagingDate = null;
let messageInputField = chatSec.querySelector("#message-input");
let loadOlderMessageBtn = chatSec.querySelector("#load-older-message-btn");
let sendMessageBtn = chatSec.querySelector("#send-message-btn");
let messagesOptionsList = chatSec.querySelector("#messages-options-list");
let sendHeartBtn = chatSec.querySelector("#send-heart-btn");

// showConversationsList();
async function showConversationsList() {
    let conversations = await getConverations(currentUserDetails.username, messageAccessToken);
    if (conversations) {
        peopleListContainer.innerHTML = null;

        conversations.sort((a, b) => {
            let date1 = getDate(a.time);
            let date2 = getDate(b.time);

            if (date1 < date2) return 1
            else return -1;
        });
        for (let convo of conversations) {
            let username = convo.conversationWith;
            let userBasicInfo = await getUserBasicInfoByUsername(username, jwtToken);
            await createConversationCard(convo, userBasicInfo);
        }
    }

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

let myUsernames = document.querySelectorAll(".my.username");
myUsernames.forEach(e => {
    e.innerHTML = currentUserDetails.username;
})

let selectedConverationElem = null;
let currentChatUsername = null;
let currentChatUserDP = null;
let currentChatUserFullname = null;
let currentChatUserId = null;

async function createConversationCard(conversation, userBasicInfo) {
    let userId = userBasicInfo.userId;
    let profilePhoto = userBasicInfo.profilePhoto;
    let userFullName = userBasicInfo.userFullName;
    let username = userBasicInfo.username;
    let profilePhotoUrl = "/Insightgram-Web_UI/Images/no_profile_photo.jpg";

    let lastMessageTime = conversation.time;
    let lastMessage = conversation.message;

    let timePast = lastMessageTime ? getTimePast(lastMessageTime) : "";

    if (profilePhoto) {
        profilePhotoUrl = await getUserProfilePhoto(userId, jwtToken);
    }

    let peopleCardHtml =
        `<div class="people-card" data-userid="${userId}", data-username="${username}">
            <div>
                <img class="user_profile_photo clickable"
                    src="${profilePhotoUrl}" alt="Profile Photo">
            </div>
            <div>
                <div class="fullname">${userFullName}</div>
                <div class="last-message">
                    <span class="if-you">${conversation.sender == currentUserDetails.username ? "You: " : ""}</span>
                    <span class="last-message-text"></span>
                    <span> · </span>
                    <span>${timePast}</span>
                </div>
            </div>
        </div>`;
    peopleListContainer.insertAdjacentHTML("beforeend", peopleCardHtml);
    peopleListContainer.lastChild.querySelector(".last-message-text").innerText = lastMessage ? lastMessage : "";
    let conversationCardElem = peopleListContainer.lastChild;

    addConversationCardLogic();
    function addConversationCardLogic() {
        conversationCardElem.addEventListener("click", selectConversation)
    }

    function selectConversation() {
        peopleListContainer.childNodes.forEach(e => {
            e.classList.remove("selected");
        });
        selectedConverationElem = conversationCardElem;

        conversationCardElem.classList.add("selected");
        showChatsOf(username, profilePhotoUrl, userFullName, userId);
    }

}
let chatBackBtn = document.querySelector("#chat-back-btn");
chatBackBtn.addEventListener("click", () => {
    if(!isMobile()) {
        emptyChatSec.style.display = "flex";
    }
    chatSec.style.display = "none";
})

async function showChatsOf(username, profilePhotoUrl, userFullName, userId) {
    currentChatUsername = username;
    currentChatUserDP = profilePhotoUrl;
    currentChatUserFullname = userFullName;
    currentChatUserId = userId;

    selectedConverationElem.querySelector(".last-message-text").classList.remove("new-message");

    emptyChatSec.style.display = "none";
    chatMessagesDiv.scroll(0, chatMessagesDiv.scrollHeight);
    chatSec.style.display = "flex";

    chatTopProfilePhotoElem.src = profilePhotoUrl;
    chatTopFullNameElem.innerText = userFullName;
    chatTopUsername.innerText = username;

    let viewProfileBtn = chatTopProfileSec.querySelector(".view-profile-btn");
    if (viewProfileBtn) viewProfileBtn.remove();

    let viewProfileBtnHTML = `<div class="view-profile-btn clickable" data-userid="${userId}">View profile</div>`
    chatTopProfileSec.insertAdjacentHTML("beforeend", viewProfileBtnHTML);

    viewProfileBtn = chatTopProfileSec.lastChild;
    viewProfileBtn.addEventListener("click", () => gotoProfileOf(userId));

    let dpHTML = `<img class="user_profile_photo clickable" src="${profilePhotoUrl}"
    alt="Profile Photo">`;
    chatHeadProfilePhotoContainer.innerHTML = dpHTML;
    chatHeadProfilePhotoContainer.lastChild.addEventListener("click", () => gotoProfileOf(userId))

    messageInputField.innerText = "";
    chatHeadFullName.innerText = userFullName;

    let pageSize = 20, pageNumber = 1;
    messagesArea.innerHTML = null;
    await loadMessages(username, profilePhotoUrl);

    let newLoadOlderMessageBtn = loadOlderMessageBtn.cloneNode(true);
    loadOlderMessageBtn.replaceWith(newLoadOlderMessageBtn);
    loadOlderMessageBtn = newLoadOlderMessageBtn;

    loadOlderMessageBtn.addEventListener("click", loadOlderMessageBtnLogic);
    async function loadOlderMessageBtnLogic() {
        loadOlderMessageBtn.removeEventListener("click", loadOlderMessageBtnLogic);
        loadOlderMessageBtn.firstElementChild.innerText = "Loading...";
        loadOlderMessageBtn.lastElementChild.style.display = "none";

        await loadMessages(username, profilePhotoUrl);
        loadOlderMessageBtn.firstElementChild.innerText = "Load older messages";
        loadOlderMessageBtn.lastElementChild.style.display = "block";
        loadOlderMessageBtn.addEventListener("click", loadOlderMessageBtnLogic);
    }

    async function loadMessages(username, profilePhotoUrl) {
        let pageOfMessages = await getChatMessagesPage(username, messageAccessToken, pageSize, pageNumber);
        if (pageOfMessages) {
            pageNumber++;

            currentMessagingDate = null;
            let messagePageDetails = {
                pageNumber: pageOfMessages.currentPageNumber,
                pageSize: pageOfMessages.pageSize,
                noOfMessageInPage: pageOfMessages.totalCurrentPageElements,
                totalNoOfMessage: pageOfMessages.totalElements,
            }
            insertMessageInMessageArea(pageOfMessages.pageContent, profilePhotoUrl, "afterbegin", messagePageDetails)

            return pageOfMessages;
        } else {
            return 0;
        }
    }

    sendMessageBtn.style.display = "none";
    messagesOptionsList.style.display = "flex";
}

function insertMessageInMessageArea(listOfMessages, profilePhotoUrl, insertAdjacentHTML = "beforeend", messagePageDetails = null) {
    listOfMessages.forEach(messageObj => {
        let sender = messageObj.sender;

        let messageTime = getDate(messageObj.time);
        let hh = messageTime.getHours() + "";
        let mm = messageTime.getMinutes() + "";

        if (hh.length == 1) hh = "0" + hh;
        if (mm.length == 1) mm = "0" + mm;

        let hhmm = hh + ":" + mm;

        if (sender == currentUserDetails.username) {

            let sentMessageHTML =
                `<div class="sent-msg-div">
                    <span class="message-time">${hhmm}</span>
                    <p class="sent-msg"></p>
                </div>`;

            messagesArea.insertAdjacentHTML(insertAdjacentHTML, sentMessageHTML);
            if (insertAdjacentHTML == "afterbegin") {
                messagesArea.firstChild.querySelector(".sent-msg").innerText = messageObj.message;
            } else {
                messagesArea.lastChild.querySelector(".sent-msg").innerText = messageObj.message;
            }
        } else {

            let receivedMessageHTMl =
                `<div class="received-msg-div">
                <div>
                    <img class="user_profile_photo clickable"
                    src="${profilePhotoUrl}" alt="Profile Photo" data-userid="">
                </div>
                <div>
                    <p class="received-msg"></p>
                    <span class="message-time">${hhmm}</span>
                </div>
            </div>`;

            messagesArea.insertAdjacentHTML(insertAdjacentHTML, receivedMessageHTMl);
            if (insertAdjacentHTML == "afterbegin") {
                messagesArea.firstChild.querySelector(".received-msg").innerText = messageObj.message;
            } else {
                messagesArea.lastChild.querySelector(".received-msg").innerText = messageObj.message;
            }
        }

        if (insertAdjacentHTML == "beforeend") {
            chatMessagesDiv.scroll(0, chatMessagesDiv.scrollHeight);
        }
    })

    if (messagePageDetails) {
        let noOfMessagesLoadedTillNow = (((messagePageDetails.pageNumber - 1) * messagePageDetails.pageSize) + messagePageDetails.noOfMessageInPage);
        if (noOfMessagesLoadedTillNow < messagePageDetails.totalNoOfMessage) {
            loadOlderMessageBtn.style.display = "flex";
        } else {
            loadOlderMessageBtn.style.display = "none";
        }
    }
}

async function openChatOfUser(userDetails) {
    await showConversationsList();

    let userCard = null;
    for (let peopleCard of peopleListContainer.childNodes) {
        if (peopleCard.dataset.userid == userDetails.userId) {
            userCard = peopleCard;
            break;
        }
    }

    if (userCard == null) {
        await createConversationCard({}, userDetails);
        userCard = peopleListContainer.lastElementChild;

        peopleListContainer.insertBefore(userCard, peopleListContainer.firstElementChild);
    }

    userCard.click();
}

addMessageInputFieldLogic()
function addMessageInputFieldLogic() {
    messageInputField.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    sendMessageBtn.addEventListener("click", async () => {
        await messageSendingProcess();
        sendMessageBtn.style.display = "none";
        messagesOptionsList.style.display = "flex";
    });

    messageInputField.addEventListener("keyup", () => {
        let message = messageInputField.innerText.trim();

        if (message) {
            messagesOptionsList.style.display = "none";
            sendMessageBtn.style.display = "block";
        } else {
            sendMessageBtn.style.display = "none";
            messagesOptionsList.style.display = "flex";
        }
    })

    let previousKeyPress = null;
    messageInputField.addEventListener("keydown", async (event) => {
        if (event.shiftKey && event.key === 'Enter') {

        } else if (previousKeyPress === 'Control' && event.key === 'Enter') {
            event.preventDefault();
            await messageSendingProcess();
        }
        previousKeyPress = event.key;
    });

    async function messageSendingProcess() {
        let message = messageInputField.innerText.trim();

        if (message.length == 0) {
            return;
        }
        else {
            await sendMessageProcess(message);
        }
    }
}

// MESSAGES OPTIONS LIST
sendHeartBtn.addEventListener("click", () => {
    sendMessageProcess("❤️");
})

async function sendMessageProcess(message, receiver = currentChatUsername) {
    try {
        await sendMessage(message, currentChatUsername);
        messageInputField.innerText = "";
        let messageObj = {
            sender: currentUserDetails.username,
            receiver,
            message,
            time: dateToLocalString(new Date()),
        }

        selectedConverationElem.querySelector(".if-you").innerText = "You: ";
        let lastMessage = selectedConverationElem.querySelector(".last-message>span:nth-child(2)");
        lastMessage.innerText = message;
        let lastMessageTime = selectedConverationElem.querySelector(".last-message>span:last-child");
        lastMessageTime.innerText = getTimePast(messageObj.time);

        insertMessageInMessageArea([messageObj], currentChatUserDP);

        peopleListContainer.insertBefore(selectedConverationElem, peopleListContainer.firstChild);
    } catch (error) {
        showFooterAlert(error);
    }

}
async function onMessage(payload) {
    var message = JSON.parse(payload.body);

    let peopleCards = peopleListContainer.querySelectorAll(".people-card");
    let flag = false;
    let senderCard = null;
    for (let card of peopleCards) {
        if (card.dataset.username == message.sender) {
            flag = true;
            senderCard = card;
        }
    }

    if (senderCard) {
        senderCard.querySelector(".if-you").innerText = "";
    } else {
        let senderBasicInfo = await getUserBasicInfoByUsername(message.sender, jwtToken);
        await createConversationCard({}, senderBasicInfo);
        senderCard = peopleListContainer.lastElementChild;

    }

    let lastMessage = senderCard.querySelector(".last-message>span:nth-child(2)");
    lastMessage.innerText = message.message;
    let lastMessageTime = senderCard.querySelector(".last-message>span:last-child");
    lastMessageTime.innerText = getTimePast(message.time);

    if (message.sender == currentChatUsername) {
        insertMessageInMessageArea([message], currentChatUserDP);
    } else if (!(lastMessage.classList.contains("new-message"))) {
        lastMessage.classList.add("new-message");
    }
    peopleListContainer.insertBefore(senderCard, peopleListContainer.firstChild);
}
async function sendMessage(message, receiver) {
    let destination = '/queue/' + receiver;

    await stompClient.send(destination, {
        Authorization: "Bearer " + messageAccessToken,
    }, JSON.stringify({ message }));

}


function dateToLocalString(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
    const year = date.getFullYear();

    const formattedDate = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;

    return formattedDate;
}

function gotoProfileOf(userId) {
    parentWindow.postMessage(["gotoProfileOf", userId]);
}


let messageType = document.querySelector("#message-type");
function calculateAddressBarHeight() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        messageType.style.bottom = 0;
        chatSec.style.paddingBottom = "20px";
    } else {
    }
}


window.addEventListener('load', calculateAddressBarHeight);
window.addEventListener('resize', calculateAddressBarHeight);
