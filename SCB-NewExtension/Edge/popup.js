var loggedIn = true;
var colors = ["#3b5999", "#00acee","#c83b6f","#1bbc9b","#34495e","#e84c3d","#2dcc70","#9b58b5"];
var selectedColor;

var idsOfCustomBackgroundColor = ["postsBttn", "login" ];
var idsOfCustomTextColor = ["star_icon"];

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

chrome.storage.sync.get('selectedColor', function (items) {
    for(var prop in items) {
        if(items.hasOwnProperty(prop))
        {
            // If the setting exists, update the local stuff:
            selectedColor = items.selectedColor;
            changeSelectedStyleTo(document.getElementById(selectedColor));
            return;
        }
    }
    // If there is no setting for selectedColor - i.e. the first time popup.html is opened:
    chrome.storage.sync.set({'selectedColor': colors[0]}, function() {
        console.log(colors[0] + " saved to default.");
    });
    selectedColor = colors[0];
})

function processLogIn() {
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    document.getElementById('profile_name').innerText = content.name;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=square');
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
    setupColors();
}

function addEventHandlers() {
    var postsBttn = document.getElementById("postsBttn");
    postsBttn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "block";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
    })

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(namespace === "sync" && changes["selectedColor"]) {
            setTextColors(changes["selectedColor"].newValue);
            setBackgroundColors(changes["selectedColor"].newValue);
        }
      });
}

function setupColors() {
    for(i = 0; i < colors.length; i++) {
        var colorDiv = document.createElement("div");
        colorDiv.className = "colorButton";
        colorDiv.id = colors[i];
        colorDiv.style.backgroundColor = colors[i];
        colorDiv.addEventListener("click", function(e) {
            e.preventDefault();
            var caller = e.target || e.srcElement;

            // Set the selected color to the same as the background color. 
            selectedColor = rgb2hex(caller.style.backgroundColor);
            chrome.storage.sync.set({'selectedColor': selectedColor}, function() {
                console.log(selectedColor + " saved to default.");
            });
            changeSelectedStyleTo(caller);    
        })
        if(i == 0) {
            selectedColor = colors[i];
            colorDiv.className += " selectedColorButton";
        }
        document.getElementById("colors").appendChild(colorDiv);
    }
}

function changeSelectedStyleTo(element) {
        // Remove selection styling:
        var colors = document.getElementById("colors").getElementsByTagName("div");
        for (i = 0; i < colors.length; i++)
        {
            if(colors[i].classList.contains("selectedColorButton"))
                colors[i].classList.remove("selectedColorButton");
        }
        // Add selection styling to selected div:
        element.className += " selectedColorButton";
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

function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

// Set the text colors of all the specified objects to the specified color.
function setTextColors(c) {
    for(i = 0; i < idsOfCustomTextColor.length; i ++) {
        var currentTextObject = document.getElementById(idsOfCustomTextColor[i]);
        currentTextObject.style.color = c;
    }
}

// Set the background colors of all the specified objects to the specified color.
function setBackgroundColors(c) {
    for(i = 0; i < idsOfCustomBackgroundColor.length; i ++) {
        var currentObject = document.getElementById(idsOfCustomBackgroundColor[i]);
        currentObject.style.backgroundColor = c;
    }
}