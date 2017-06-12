var colors = ["#3b5999", "#00acee","#c83b6f","#1bbc9b","#34495e","#e84c3d","#2dcc70","#9b58b5"];

var content = null;
var userToken;

document.getElementById("YourPosts").style.display = "none";
document.getElementById("Profile_Logged_In").style.display = "none";
document.getElementById("Profile_Logged_Out").style.display = "flex";
document.getElementById("settings").style.display = "none";
document.getElementById("logout").style.display = "none";
document.getElementById("seperator").style.display = "none";
document.getElementById("back").style.display = "none";

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
    document.getElementById("logout").style.display = "inline-block";
    document.getElementById("seperator").style.display = "inline-block";

    document.getElementById('showExplanation').onclick = () => {
        chrome.storage.local.set({ 'showDefaultExplanation': document.getElementById('showExplanation').checked }, () => { console.log("showExplanation: " + document.getElementById('showExplanation').checked); });
    }
    document.getElementById('hoverToOpen').onclick = () => {
        chrome.storage.local.set({ 'hoverToOpen': document.getElementById('hoverToOpen').checked }, () => { console.log("HoverToOpen: " + document.getElementById('HoverToOpen').checked); });
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=large&height=300&width=300');
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
    chrome.storage.local.get('showDefaultExplanation', (items) => {
            document.getElementById('showExplanation').checked = items.showDefaultExplanation;
    });
    chrome.storage.local.get('hoverToOpen', (items) => {
            document.getElementById('hoverToOpen').checked = items.hoverToOpen;
    });
}

////* SETUP FUNCTION: *////
function addEventHandlers() {
    // Add handler to posts button:
    var postsBttn = document.getElementById("postsBttn");
    postsBttn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
        document.getElementById("back").style.display = "block";
        getUserPosts();
    })

    // Add handler to changed color in storage:
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(namespace === "local" && changes["selectedColor"]) {
            setElementColors(changes["selectedColor"].newValue);
        }
    });

    // Add handler to login button:
    var loginButton = document.getElementById("login");
    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
    });

    var backButton = document.getElementById("back");
    backButton.addEventListener("click", function(e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "none";
        document.getElementById("Profile_Logged_In").style.display = "block";
        document.getElementById("settings").style.display = "block";
        document.getElementById("back").style.display = "none";
    });

    // Add handler to logout button:
    var logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", function(e) {
        e.preventDefault();
        // Remove access token from storage
        chrome.storage.local.remove("accessToken", function() {
            console.log("Removed Facebook access key from storage.");
        });
        // Display logged out interface
        document.getElementById("Profile_Logged_Out").style.display = "flex";
        document.getElementById("YourPosts").style.display = "none";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
        document.getElementById("logout").style.display = "none";
        document.getElementById("seperator").style.display = "none";
    });

}

////* POSTS FUNCTIONS *////
function processUserPosts(content) {
    for (var i in content.comments) if (content.comments.hasOwnProperty(i)) {
        var comment = content.comments[i];
        createCommentBox(comment.id, comment.timestamp, comment.commentText, comment.starCount);
    }
}

function getUserPosts() {
    var commentArea = document.getElementById("YourPosts");
    commentArea.innerHTML = "";
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

function createCommentBox(commentId, timestamp, content, voteNumber) {
    var commentArea = document.getElementById("YourPosts");
    var commentBox = commentArea.appendChild(document.createElement('div'));
    var commentLeft = commentBox.appendChild(document.createElement('div'));
    var commentText = commentLeft.appendChild(document.createElement('div'));
    var commentContent = commentText.appendChild(document.createElement('p'));
    var voteArea = commentBox.appendChild(document.createElement('div'));
    var deleteIcon = voteArea.appendChild(document.createElement('div'));
    var upvoteStar = voteArea.appendChild(document.createElement('span'));
    var upvotes = voteArea.appendChild(document.createElement('span'));
    var deleteButtons = commentBox.appendChild(document.createElement('div'));
    var deleteButton = deleteButtons.appendChild(document.createElement('button'));
    var cancelButton = deleteButtons.appendChild(document.createElement('button'));

    commentBox.classList.add('commentBox');
    commentBox.id = 'comment-' + commentId;
    commentBox.setAttribute('data-timestamp', timestamp);

    commentLeft.classList.add('commentLeft');

    commentText.classList.add('commentText');

    commentContent.innerText = content;

    voteArea.classList.add('voteArea');

    deleteIcon.classList.add('deleteIcon');
    deleteIcon.innerText = "c";

    upvoteStar.classList.add('upvoteStar');
    upvoteStar.innerText = "a";

    upvotes.classList.add('upvotes');
    upvotes.innerText = voteNumber;

    deleteButtons.classList.add('deleteButtons');
    deleteButtons.onclick = function () { return false; };
    deleteButtons.onmouseover = function () { return false; };

    deleteButton.classList.add('deleteButton');
    deleteButton.setAttribute('data-localize', 'delete');
    deleteButton.innerText = 'Delete';

    cancelButton.classList.add('cancelButton');
    cancelButton.setAttribute('data-localize', 'cancel');
    cancelButton.innerText = 'Cancel';
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
            if(b[j].selectorText === ".commentBox") {
               setBackgroundColor(b[j], c);
            }
            if(b[j].selectorText === "#star_area") {
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
