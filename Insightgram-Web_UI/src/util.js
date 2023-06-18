import {
    baseUrl,
    viewUserProfilePhotoEP
} from "../src/api_endpoints.js";


function showFooterAlert(message="Something went wrong, Please try again", isError = true) {

    let image = "Images/check-mark.png";
    let border = "1px solid rgb(131, 131, 255)";
    let backgroundColor = "rgba(0, 0, 200, 0.050)";

    if (isError) {
        image = "Images/error.png"
        border = "1px solid rgb(255, 131, 131)";
        backgroundColor = "rgba(255, 0, 0, 0.050)";
    }
    let footerAlert = `
        <div id='footer_alert'>
            <div style='margin: 0px; padding: 0px;'>
                <img src='${image}' alt='' id='footer_alert_symbol'>
            </div>
                <div><span>${message}</span></div>
        </div>`

    document.body.insertAdjacentHTML('beforeend', footerAlert);

    let footerAlerts = document.querySelectorAll("#footer_alert");

    footerAlerts.forEach((n) => {
        n.style.border = border;
        n.style.backgroundColor = backgroundColor;
        n.style.bottom = "30px";
    });

    setTimeout(() => {
        footerAlerts.forEach((n) => {
            n.remove();
        });
    }, 3200);
}

async function getUserProfilePhoto(userId, jwtToken) {
    if(!userId) {
        console.log(userId)
        userId = -1;
    }
    let imageUrl;
    try {
        let endPoint = viewUserProfilePhotoEP.replace("?", userId);
        let response = await fetch(baseUrl+endPoint, {
            method : "GET",
            headers : {
                "Authorization" : "Bearer "+jwtToken
            }
        });

        if(!response.ok) {
            throw new Error("Couldn't find the profile photo")
        }

        let blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);

    } catch (error) {
        imageUrl = "../Images/no_profile_photo.jpg";
    }

    return imageUrl;
}

export { 
    showFooterAlert,
    getUserProfilePhoto,

};