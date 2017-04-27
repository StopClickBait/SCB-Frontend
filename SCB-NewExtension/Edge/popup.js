var colors = ["#3b5999", "#00acee","#c83b6f","#1bbc9b","#34495e","#e84c3d","#2dcc70","#9b58b5"];

var content = null;
var userToken;

document.getElementById("YourPosts").style.display = "none";
document.getElementById("Profile_Logged_In").style.display = "none";
document.getElementById("Profile_Logged_Out").style.display = "block";
document.getElementById("settings").style.display = "none";

setupColors();

addEventHandlers();

// Setup access token for facebook:
chrome.storage.local.get('accessToken', (accessToken) => {
    userToken = accessToken.accessToken;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://graph.facebook.com/v2.9/me?access_token=' + accessToken.accessToken + '&fields=id%2Cname');
    xhr.send(null);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == xhr.DONE) {
            content = JSON.parse(xhr.responseText);
            if (content.error) {
                // Not logged in.
            } else {
                chrome.storage.local.set({ 'user_id': content.id });
                processLogIn();
            }
        }
    };
});

////* LOGIN FUNCTIONS: *////
function processLogIn() {
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    document.getElementById("settings").style.display = "block";
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
    
}

////* SETUP FUNCTION: *////
function addEventHandlers() {
    // Add handler to posts button:
    var postsBttn = document.getElementById("postsBttn");
    postsBttn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "block";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
    })

    // Add handler to changed color in storage:
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(namespace === "local" && changes["selectedColor"]) {
            setElementColors(changes["selectedColor"].newValue);
        }
    });

    // Add handler to login button:
    var loginButton = document.getElementById("LoginButton");
    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
    });

    var logoutButton = document.getElementById("login");
    logoutButton.addEventListener("click", function(e) {
        e.preventDefault();
        document.getElementById("Profile_Logged_Out").style.display = "block";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";

        // Need to do more stuff for logout, including resize window.
    });
}

////* POSTS FUNCTIONS *////
function processUserPosts(content) {

}

function getUserPosts() {

    processUserPosts({
        "comments": [
            {
                "id": 1,
                "timestamp": 1490000000,
                "commentText": "Hello!",
                "starCount": 23
            },
            {
                "id": 2,
                "timestamp": 1490000000,
                "commentText": "Hello!",
                "starCount": 17
            },
            {
                "id": 3,
                "timestamp": 1490000000,
                "commentText": "This is a comment which is the maximum length of 140 characters long. So the design of the longest comment a user can make can be seen. #SCB",
                "starCount": 12
            },
            {
                "commentText": "Hello!",
                "id": 4,
                "starCount": 10,
                "timestamp": 1490000000
            },
            {
                "id": 5,
                "timestamp": 1490000000,
                "commentText": "Hello!",
                "starCount": 8
            }
        ]
    });

}

////* COLOR FUNCTIONS: *////
function setupColors() {
    // Put the color divs out there
    for(i = 0; i < colors.length; i++) {
        var colorDiv = document.createElement("div");
        colorDiv.className = "colorButton";
        colorDiv.id = colors[i];
        colorDiv.style.backgroundColor = colors[i];
        colorDiv.addEventListener("click", function(e) {
            e.preventDefault();
            var caller = e.target || e.srcElement;

            // Set the color to the same as the background color. 
            chrome.storage.local.set({'selectedColor': rgb2hex(caller.style.backgroundColor)}, function() {
                console.log(rgb2hex(caller.style.backgroundColor) + " saved to default.");
            });
            changeSelectedStyleTo(caller);    
        })
        document.getElementById("colors").appendChild(colorDiv);
    }

    // Get (or set) the color div based on the currently stored setting.
    chrome.storage.local.get('selectedColor', function (items) {
        for(var prop in items) {
            if(items.hasOwnProperty(prop))
            {
                // Move the "selected" style to the saved color
                changeSelectedStyleTo(document.getElementById(items.selectedColor));
                // Update the local colors
                setElementColors(items.selectedColor);
                return;
            }
        }
        // If there is no setting for selectedColor - i.e. the first time popup.html is opened:
        chrome.storage.local.set({'selectedColor': colors[0]}, function() {
            console.log(colors[0] + " saved to default.");
        });
        changeSelectedStyleTo(document.getElementById(colors[0]));
        setElementColors(colors[0]);
    })
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

function setElementColors(c) {
    var a = document.styleSheets;
    for (var i in a) if (a.hasOwnProperty(i)) {
        var b;
        (a[i].cssRules) ? b = a[i].cssRules : b = a[i].rules;
        for (var j in b) if (b.hasOwnProperty(j)) {
            if(b[j].selectorText === ".buttons") {
                setButtonNormalColor(b[j], c);
            }
            if (b[j].selectorText === ".buttons:hover") {
                setButtonHoverColor(b[j], c);
            }
            if(b[j].selectorText === "#YourPosts") {
               setBackgroundColor(b[j], c);
            }
            if(b[j].selectorText === "#star_icon") {
                setTextColor(b[j], c);
            }
        }
    }
}

function setButtonNormalColor(bttn, c) {
    bttn.style.borderColor = c;
    bttn.style.backgroundColor = "transparent";
    bttn.style.color = c;
}

function setButtonHoverColor(bttn, c) {
    bttn.style.backgroundColor = c;
    bttn.style.borderColor = "transparent";
    bttn.style.color = "white";
}

function setTextColor(textElm, c) {
    textElm.style.color = c;
}

function setBackgroundColor(elm, c) {
    elm.style.backgroundColor = c;
}

function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
