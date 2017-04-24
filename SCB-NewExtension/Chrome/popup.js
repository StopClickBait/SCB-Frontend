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
        var win = window.open("http://www.facebook.com/login.php?api_key=137575509998503&connect;_display=popup&v;=1.0&next;=http://www.facebook.com/connect/login_success.html&cancel;_url=http://www.facebook.com/connect/login_failure.html&fbconnect;=true&return;_session=true&session;_key_only=true",
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

