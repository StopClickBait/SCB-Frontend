function statusChangeCallback(response) {
    console.log("statusChangeCallback");
    console.log(response);
}

var loggedIn = true;

document.getElementById("YourPosts").style.display = "none";

if(loggedIn)
{
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    addEventHandlers();
    
} else {
    document.getElementById("Profile_Logged_In").style.display = "none";
    document.getElementById("Profile_Logged_Out").style.display = "block";
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