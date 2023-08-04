import {
    connectToMessaging,
    getConverations,
    showFooterAlert,


} from "../src/util.js"

// GLOBAL VALUES
let messageAccessToken = JSON.parse(localStorage.getItem("insightgramMessagingToken"));
let currentUserDetails = JSON.parse(localStorage.getItem("insightgramUserDetails"));

// MESSAGING CONNECTION
async function connectToMessagingWS(onMessage = (payload) => { }) {
    try {
        let stompClient = await connectToMessaging(currentUserDetails.username, messageAccessToken, onMessage);

        return stompClient;
    } catch (error) {
        showFooterAlert(error);
        console.log(error)
    }
}

function onMessage(payload) {
    console.log(payload)
    var message = JSON.parse(payload.body);

    console.log(message);
}

export {
    connectToMessagingWS,


};