// function statusChangeCallback(response) {
//     console.log("statusChangeCallback");
//     console.log(response);
// }

var loggedIn = false;

document.getElementById("YourPosts").style.display = "none";

if(loggedIn)
{
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    addEventHandlers();
    
} else {
    document.getElementById("Profile_Logged_In").style.display = "none";
    document.getElementById("Profile_Logged_Out").style.display = "block";

    var loginButton = document.getElementById("LoginButton");
    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        var win = window.open("https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&redirect_uri=https://www.facebook.com/connect/login_success.html",
            "fbconnect", "width=600,height=500");
    })
}

function addEventHandlers() {
    var postsBttn = document.getElementById("postsBttn");
    postsBttn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "block";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
    })
}

