var loggedIn = false;
var content = null;
var userToken;
document.getElementById("YourPosts").style.display = "none";

document.getElementById("Profile_Logged_In").style.display = "none";
document.getElementById("Profile_Logged_Out").style.display = "block";

var loginButton = document.getElementById("LoginButton");
loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
});

function processLogIn() {
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    document.getElementById('profile_name').innerText = content.name;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=normal');
    xhr.send(null);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == xhr.DONE) {
            var content2 = JSON.parse(xhr.responseText);
            if (content2.error) {

            } else {
                document.getElementById('profile_image').src = content2.data.url;
            }
        }
    }
    addEventHandlers();
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

chrome.storage.local.get('accessToken', (accessToken) => {
    var Profile_Logged_In = document.getElementById("YourPosts");
    userToken = accessToken.accessToken;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://graph.facebook.com/v2.9/me?access_token=' + accessToken.accessToken + '&fields=id%2Cname');
    xhr.send(null);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == xhr.DONE) {
            content = JSON.parse(xhr.responseText);
            if (content.error) {

            } else {
                loggedIn = true;
                chrome.storage.local.set({ 'user_id': content.id });
                processLogIn();
            }
        }
    };
});

// function getParameterByName(name, url) {
//     if (!url) url = window.location.href;
//     name = name.replace(/[\[\]]/g, "\\$&");
//     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, " "));
// }

/* FLOW FOR FACEBOOK LOGIN 
1) Check if user is logged in
    -> If not, 2
    -> If they are, 3
2) Show login page
3) On button click, open facebook login
4) Capture login token
    -> Browser session token?
    -> Database store, along with user_id
    -> store login status.


*/

