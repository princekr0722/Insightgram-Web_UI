import {
    baseUrl,
    logInEP,
    signUpEP,
    mobileNumberAvailiblity,
    userNameAvailiblity,

} from "./src/api_endpoints.js";

import {
    showFooterAlert
} from "./src/util.js"

let today = new Date();
let InsightgramLoadingLogo = document.querySelector("#Insightgram_loading_logo");
let loginFormSec = document.querySelector("#login_form_sec");
let signUpFormSec = document.querySelector("#signup_form_sec");
let personalDetailsFormSec = document.querySelector("#personal_details_form_sec");
let signupForm = document.querySelector("#signup_form");
let dobFormSec = document.querySelector("#dob_form_sec");
let accountPrivacyFormSec = document.querySelector("#account_privacy_form_sec");

let red = "rgb(237, 90, 90)";
let normal = "rgb(219, 219, 219)";

setTimeout(() => {
    InsightgramLoadingLogo.style.width = "200px";
}, 50);
setTimeout(() => {
    let isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;

    if (isLoggedIn) {
        gotoNewsFeed();
    } else {
        showLoginForm();
        // showSignupForm();
        // showDobForm();
        // showPerfonalDetailsForm();
        // showAccountPrivacyForm();
    }

}, 1200);

function gotoNewsFeed() {
    window.location.href = "Newsfeed/newsfeed.html";
}

function showLoginForm() {
    InsightgramLoadingLogo.style.display = "none";
    signUpFormSec.style.display = "none";
    dobFormSec.style.display = "none";
    personalDetailsFormSec.style.display = "none";
    accountPrivacyFormSec.style.display = "none";

    loginFormSec.style.display = "block";
}

function showSignupForm() {
    InsightgramLoadingLogo.style.display = "none";
    loginFormSec.style.display = "none";
    dobFormSec.style.display = "none";
    personalDetailsFormSec.style.display = "none";
    accountPrivacyFormSec.style.display = "none";

    signUpFormSec.style.display = "block";
}

function showDobForm() {
    InsightgramLoadingLogo.style.display = "none";
    signUpFormSec.style.display = "none";
    loginFormSec.style.display = "none";
    personalDetailsFormSec.style.display = "none";
    accountPrivacyFormSec.style.display = "none";

    dobFormSec.style.display = "block";

}

function showPerfonalDetailsForm() {
    InsightgramLoadingLogo.style.display = "none";
    signUpFormSec.style.display = "none";
    loginFormSec.style.display = "none";
    dobFormSec.style.display = "none";
    accountPrivacyFormSec.style.display = "none";

    personalDetailsFormSec.style.display = "block";
}

function showAccountPrivacyForm() {
    InsightgramLoadingLogo.style.display = "none";
    signUpFormSec.style.display = "none";
    loginFormSec.style.display = "none";
    dobFormSec.style.display = "none";
    personalDetailsFormSec.style.display = "none";

    accountPrivacyFormSec.style.display = "block";
}


// LOG-IN PROCESS
let loginForm = document.querySelector("#login_form");
let usernameOrPhone = document.querySelector("#username_or_phone");
let loginPassword = document.querySelector("#login_password");

let gotoLogInBtns = document.querySelectorAll(".gotoLogInBtn");

gotoLogInBtns.forEach(n => {
    n.addEventListener("click", showLoginForm);
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let usernameAndPassword = {
        username: usernameOrPhone.value,
        password: loginPassword.value
    }

    logIn(usernameAndPassword)
});

async function logIn(usernameAndPassword) {

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(usernameAndPassword.username + ':' + usernameAndPassword.password));

    try {
        let response = await fetch(baseUrl + logInEP, {
            method : "GET",
            headers : headers
        });
        
        if(response.status>=200 && response.status<=299) {
            let insightgramAuthenticationToken = response.headers.get('Authorization');
            localStorage.setItem("insightgramAuthenticationToken", JSON.stringify(insightgramAuthenticationToken));
           
            let insightgramUserDetails = await response.json(); 
            localStorage.setItem("insightgramUserDetails", JSON.stringify(insightgramUserDetails));
    
            localStorage.setItem("isLoggedIn", JSON.stringify(true));
    
            gotoNewsFeed();
        } else if(response.status==401) {
            showFooterAlert("Wrong Credentials!")
        }
    } catch(error) {
        if(error=="TypeError: Failed to fetch") {
            showFooterAlert("Could not connect to server, Please try again later")
        } else {
            alert(error); 
        }
    }
}


// SIGN-UP PROCESS
let mobileNumberInp = document.querySelector("#mobile_number");
let firstNameInp = document.querySelector("#firstname");
let lastNameInp = document.querySelector("#lastname");
let userNameInp = document.querySelector("#username");
let passwordInp = document.querySelector("#signup_password");
let gotoSignUpBtns = document.querySelectorAll(".gotoSignUpBtn");

gotoSignUpBtns.forEach(n => {
    n.addEventListener("click", showSignupForm);
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    let mobileNumber = mobileNumberInp.value;
    let firstName = firstNameInp.value;
    let lastName = lastNameInp.value;
    let username = userNameInp.value;
    let password = passwordInp.value;

    let pendingForm = {
        mobileNumber,
        firstName,
        lastName,
        username,
        password
    }

    if (await isSignupFormDetailsValid(pendingForm)) {
        localStorage.setItem("userCreationForm", JSON.stringify(pendingForm));
        showDobForm();
    }
});

async function isSignupFormDetailsValid(fields) {
    let check = 0;

    if (fields.mobileNumber.trim().length != 10 || +fields.mobileNumber + "" == "NaN") {
        mobileNumberInp.style.border = "1px solid " + red;
        mobileNumberInp.setAttribute("title", "Mobile number only should contain 10 digits.");
        check++;
    } else if (! await isNumberAvailable(fields.mobileNumber)) {
        mobileNumberInp.style.border = "1px solid " + red;
        mobileNumberInp.setAttribute("title", "Mobile number is already registered with another account.");
        check++;
    } else {
        mobileNumberInp.style.border = "1px solid " + normal;
        mobileNumberInp.removeAttribute("title");
    }


    if (fields.username.trim() == "") {
        userNameInp.style.border = "1px solid " + red;
        userNameInp.setAttribute("title", "Username must not be blank.");
        check++;
    } else if (! await isUsernameAvailable(fields.username)) {
        userNameInp.style.border = "1px solid " + red;
        userNameInp.setAttribute("title", "Entered username is not available.");
        check++;
    } else {
        userNameInp.style.border = "1px solid " + normal;
        userNameInp.removeAttribute("title");
    }


    if (fields.password.trim() == "") {
        passwordInp.style.border = "1px solid " + red;
        passwordInp.setAttribute("title", "Password must not be blank.");
        check++;
    } else {
        passwordInp.style.border = "1px solid " + normal;
        passwordInp.removeAttribute("title");
    }

    if (check == 0) return true;
    else return false;
}

async function isNumberAvailable(mob) {
    let promise;
    try {
        promise = await fetch(baseUrl + mobileNumberAvailiblity + mob);
        // let isAvailable = JSON.parse(promise.json());
        let isAvailable = await promise.json();

        if (promise.status > 299) {
            console.log("some error occurred");
            return false;
        } else {
            return isAvailable;
        }

    } catch (error) {
        showFooterAlert("Something went wrong, please try again")
        return false;
    }
}

async function isUsernameAvailable(username) {
    let promise;
    try {
        promise = await fetch(baseUrl + userNameAvailiblity + username);
        // let isAvailable = JSON.parse(promise.json());
        let isAvailable = await promise.json();
        if (promise.status > 299) {

            console.log("some error occurred");
        } else {
            return isAvailable;
        }
    } catch (error) {
        showFooterAlert("Something went wrong, please try again")
        return false;
    }
}


// DOB PART

let dobForm = document.querySelector("#dob_form");
let dob = document.getElementById('dob');
let gotoDobBtns = document.querySelectorAll(".gotoDobBtn");

gotoDobBtns.forEach(n => {
    n.addEventListener("click", showDobForm);
})

dobForm.addEventListener("submit", (event) => {
    event.preventDefault();


    if (!isDobValid(dob.value)) {
        showErrorInDob();
    } else {
        removeErrorInDob();
        addDobToUserCreationForm(dob.value);
        showPerfonalDetailsForm();
    }
});

function isDobValid(dob) {
    let inputDate;
    try {
        inputDate = new Date(dob);
    } catch (error) {
        return false;
    }

    if (inputDate < today) {
        return true;
    } else {
        return false;
    }
}

function showErrorInDob() {
    dob.style.border = "1px solid " + red;
    dob.setAttribute("title", "Birthday date is not valid.");
}
function removeErrorInDob() {
    dob.style.border = "1px solid " + normal;
    dob.removeAttribute("title");
}
function addDobToUserCreationForm(dob) {
    let userCreationForm = JSON.parse(localStorage.getItem("userCreationForm"));

    userCreationForm.dob = dob;

    localStorage.setItem("userCreationForm", JSON.stringify(userCreationForm));
}


// PERSONAL DETAILS 

let personalDetailsForm = document.querySelector("#personal_details_form");
let gotoPersonalDetails = document.querySelectorAll(".gotoPersonalDetailsBtn");

gotoPersonalDetails.forEach(n => {
    n.addEventListener("click", showPerfonalDetailsForm)
})

let gender = document.querySelector("#gender");
let country = document.querySelector("#country");
let stateOrProvince = document.querySelector("#state_or_province");
let city = document.querySelector("#city");
let zipCode = document.querySelector("#zip_code");

personalDetailsForm.addEventListener("submit", (event) => {
    event.preventDefault()
    let formDetails = {
        gender: gender.value.trim(),
        address: {
            country: country.value.trim(),
            stateOrProvince: stateOrProvince.value.trim(),
            city: city.value.trim(),
            zipCode: zipCode.value.trim()
        }
    }

    if (!isPersonalDetailsFormValid(formDetails)) {
        showErrorsInPersonalDetailsForm(formDetails);
    } else {
        removeErrorsInPersonalDetailsForm(formDetails);
        addPersonalDetailsToUserCreationForm(formDetails);
        showAccountPrivacyForm();
    }
})

function isPersonalDetailsFormValid(personalDetails) {

    if (personalDetails.gender == "") {
        return false;
    } else if (
        !(
            (personalDetails.address.country == "" && personalDetails.address.stateOrProvince == "" && personalDetails.address.city == "" && personalDetails.address.zipCode == "")

            ||

            (personalDetails.address.country != "" && personalDetails.address.stateOrProvince != "" && personalDetails.address.city != "" && (personalDetails.address.zipCode != "" && personalDetails.address.zipCode.length == 6 && (+personalDetails.address.zipCode + "") != "NaN"))
        )) {
        return false;
    } else {
        return true;
    }
}
function showErrorsInPersonalDetailsForm(personalDetails) {
    if (personalDetails.gender == "") {
        gender.style.border = "1px solid " + red;
        gender.setAttribute("title", "Select valid gender detail");
    } else {
        gender.style.border = "1px solid " + normal;
        gender.removeAttribute("title");
    }

    if (
        !(
            (personalDetails.address.country == "" && personalDetails.address.stateOrProvince == "" && personalDetails.address.city == "" && personalDetails.address.zipCode == "")

            ||

            (personalDetails.address.country != "" && personalDetails.address.stateOrProvince != "" && personalDetails.address.city != "" && (personalDetails.address.zipCode != "" && personalDetails.address.zipCode.length == 6 && (+personalDetails.address.zipCode + "") != "NaN"))
        )
    ) {
        if (personalDetails.address.country == "") {
            country.style.border = "1px solid " + red;
            country.setAttribute("title", "Partial address! Please provide your contry name");
        } else {
            country.style.border = "1px solid " + normal;
            country.removeAttribute("title");
        }

        if (personalDetails.address.stateOrProvince == "") {
            stateOrProvince.style.border = "1px solid " + red;
            stateOrProvince.setAttribute("title", "Partial address! Please provide your state or province name");
        } else {
            stateOrProvince.style.border = "1px solid " + normal;
            stateOrProvince.removeAttribute("title");
        }

        if (personalDetails.address.city == "") {
            city.style.border = "1px solid " + red;
            city.setAttribute("title", "Partial address! Please provide your city name");
        } else {
            city.style.border = "1px solid " + normal;
            city.removeAttribute("title");
        }

        if (personalDetails.address.zipCode == "" || personalDetails.address.zipCode.length != 6 || (+personalDetails.address.zipCode + "") == "NaN") {
            zipCode.style.border = "1px solid " + red;
            zipCode.setAttribute("title", "Partial address! Please provide your correct zipcode");
        } else {
            zipCode.style.border = "1px solid " + normal;
            zipCode.removeAttribute("title");
        }
    } else {
        country.style.border = "1px solid " + normal;
        country.removeAttribute("title");

        stateOrProvince.style.border = "1px solid " + normal;
        stateOrProvince.removeAttribute("title");

        city.style.border = "1px solid " + normal;
        city.removeAttribute("title");

        zipCode.style.border = "1px solid " + normal;
        zipCode.removeAttribute("title");
    }
}
function removeErrorsInPersonalDetailsForm() {
    gender.style.border = "1px solid " + normal;
    gender.removeAttribute("title");

    country.style.border = "1px solid " + normal;
    country.removeAttribute("title");

    stateOrProvince.style.border = "1px solid " + normal;
    stateOrProvince.removeAttribute("title");

    city.style.border = "1px solid " + normal;
    city.removeAttribute("title");

    zipCode.style.border = "1px solid " + normal;
    zipCode.removeAttribute("title");
}
function addPersonalDetailsToUserCreationForm(personalDetails) {
    let userCreationForm = JSON.parse(localStorage.getItem("userCreationForm"));

    userCreationForm.gender = personalDetails.gender;
    userCreationForm.address = personalDetails.address;

    localStorage.setItem("userCreationForm", JSON.stringify(userCreationForm));
}




//ACCOUNT-TYPE

let accountPrivacyForm = document.querySelector("#account_privacy_form");
let accountPrivacy = document.querySelector("#account_privacy");

accountPrivacyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let accountType = accountPrivacy.value;

    let userCreationForm = JSON.parse(localStorage.getItem("userCreationForm"));

    userCreationForm.accountType = accountType;

    createNewUser(userCreationForm);
})

// USER CREATION

async function createNewUser(userCreationForm) {

    let promise = await fetch(baseUrl + signUpEP, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCreationForm)
    })

    if (!(promise.status >= 200 && promise.status <= 299)) {
        showFooterAlert("Something went wrong, please try again")
        showLoginForm();
    } else {
        let response = await promise.text();
        showFooterAlert(response, false);
        localStorage.removeItem("userCreationForm");
        showLoginForm();
    }

}

//DEFAULTS
