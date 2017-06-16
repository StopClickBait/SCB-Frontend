const DEBUG = true;

$.noConflict();

(($) => {

    var colors = ["#3b5999", "#00acee", "#c83b6f", "#1bbc9b", "#34495e", "#e84c3d", "#2dcc70", "#9b58b5"];

    //var content = null;
    var userToken;

    $('#YourPosts, #settings, #logout, #separator, #back, #Profile_Logged_In').hide();
    $('#Profile_Logged_Out').css('display', 'flex');

    setupColors();

    addEventHandlers();

    // Setup access token for facebook:
    chrome.storage.local.get('accessToken', (accessToken) => {
        userToken = accessToken.accessToken;
        $.ajax({
            method: 'GET',
            url: 'https://graph.facebook.com/v2.9/me?access_token=' + accessToken.accessToken + '&fields=id',
            success: (content) => {
                if (content.error) {
                    // Not logged in.
                } else {
                    chrome.storage.local.set({ 'user_id': content.id });
                    processLogIn(content);
                }
            }
        });
    });

    ////* LOGIN FUNCTIONS: *////
    function processLogIn(content) {
        var username = '';
        if (!DEBUG) {
            $.ajax({
                method: 'POST',
                url: 'https://server.stopclickbait.com/getUserData.php',
                data: { fbid: chrome.storage.local.get('user_id') },
                success: (content2) => {
                    if (content2.username !== '') {
                        username = content2.username;
                    } else {
                        username = registerUser();
                    }
                }
            });
        } else {
            username = "BetaUser";
        }

        $('#Profile_Logged_Out').hide();
        $('#Profile_Logged_In, #settings').css('display', 'block');
        $('#profile_name').text(username);
        $('#logout, #separator').css('display', 'inline-block');

        $('#showExplanation').on('click', () => {
            chrome.storage.local.set({ 'showDefaultExplanation': document.getElementById('showExplanation').checked }, () => { console.log("showExplanation: " + document.getElementById('showExplanation').checked); });
        });
        $('#hoverToOpen').on('click', () => {
            chrome.storage.local.set({ 'hoverToOpen': document.getElementById('hoverToOpen').checked }, () => { console.log("HoverToOpen: " + document.getElementById('HoverToOpen').checked); });
        });

        $.ajax({
            method: 'GET',
            url: 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=large&height=300&width=300',
            success: (content) => {
                if (!content.error) {
                    $('#profile_image').attr('src', content.data.url);
                }
            }
        });

        chrome.storage.local.get('showDefaultExplanation', (items) => {
            document.getElementById('showExplanation').checked = items.showDefaultExplanation;
        });
        chrome.storage.local.get('hoverToOpen', (items) => {
            document.getElementById('hoverToOpen').checked = items.hoverToOpen;
        });
    }

    function registerUser() {
        var fbid = chrome.storage.local.get('user_id');

        if (!DEBUG) {
            $.ajax({
                method: 'POST',
                url: 'https://server.stopclickbait.com/registerUser.php',
                data: { fbid: chrome.storage.local.get('user_id') },
                success: (content2) => {
                    if (content2.username !== '') {
                        return content2.username;
                    } else if (content.error) {
                        // TODO: Error handling
                    }
                }
            });
        } else {
            return "BetaUser";
        }
    }


    ////* SETUP FUNCTION: *////
    function addEventHandlers() {
        // Add handler to posts button:
        $("#postsBttn").on("click", (e) => {
            e.preventDefault();
            $('#YourPosts').css('display', '');
            $("#Profile_Logged_In, #settings").hide();
            $('#back').css('display', 'block');
            getUserPosts();
        });

        // Add handler to changed color in storage:
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === "local" && changes["selectedColor"]) {
                setElementColors(changes["selectedColor"].newValue);
            }
        });

        // Add handler to login button:
        $("#login").on("click", (e) => {
            e.preventDefault();
            var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
        });

        var backButton = document.getElementById("back");
        $('#back').on("click", (e) => {
            e.preventDefault();

            $('#YourPosts, #back').hide();
            $('#Profile_Logged_In, #settings').css('display', 'block');
        });

        // Add handler to logout button:
        var logoutButton = document.getElementById("logout");
        $('#logout').on("click", (e) => {
            e.preventDefault();
            // Remove access token from storage
            chrome.storage.local.remove("accessToken", function () {
                console.log("Removed Facebook access key from storage.");
            });
            // Display logged out interface
            $('#YourPosts, #settings, #logout, #separator, #back, #Profile_Logged_In').hide();
            $('#Profile_Logged_Out').css('display', 'flex');
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
        addUserPostsEvents();
    }

    function createCommentBox(commentId, timestamp, content, voteNumber) {
        var
            commentBox = $('<div class="commentBox" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').appendTo($('#YourPosts')),
            commentLeft = $('<div/>').addClass('commentLeft').appendTo(commentBox),
            commentContent = $('<p/>').text(content).appendTo($('<div/>').addClass('commentText').appendTo(commentLeft)),
            voteArea = $('<div/>').addClass('voteArea').appendTo(commentBox),
            deleteIcon = $('<div/>').addClass('deleteIcon').text('c').appendTo(voteArea),
            upvoteStar = $('<span/>').addClass('upvoteStar').text('a').appendTo(voteArea),
            upvotes = $('<span/>').addClass('upvotes').text(voteNumber).appendTo(voteArea),
            deleteButtons = $('<div/>').addClass('deleteButtons').on('click', (e) => { e.stopPropagation(); return false; }).on('mouseover', (e) => { e.stopPropagation(); return false; }).appendTo(commentBox),
            deleteButton = $('<button/>').attr('data-localize', 'delete').text('Delete').addClass('deleteButton').appendTo(deleteButtons),
            cancelButton = $('<button/>').attr('data-localize', 'cancel').text('Cancel').addClass('cancelButton').appendTo(deleteButtons);
    }

    function addUserPostsEvents() {
        $('.deleteIcon').each((i, elem) => {
            $(elem).on('click', () => {
                $(elem).parents('.commentBox').children('.deleteButtons').css({
                    pointerEvents: 'none',
                    display: 'unset'
                });
                $(elem).parents('.commentBox').addClass('blockedCommentBox').removeClass('clickedCommentBox');
            });
        });

        $('.cancelButton').each((i, elem) => {
            $(elem).on('click', () => {
                var t = $(elem);
                t.parents('.commentBox').css('pointerEvents', '').addClass('clickedCommentBox').removeClass('blockedCommentBox');
                t.parent().hide();
            });
        });

        $('.deleteButton').each((i, elem) => {
            $(elem).on('click', () => {
                var deleteButtons = $(elem).parent();
                deleteButtons.css({
                    display: 'flex',
                    justifyContent: 'center',
                    verticalAlign: 'middle',
                    alignItems: 'center'
                }).html('<span style="color: #828282 !important; text-align: center">' + chrome.i18n.getMessage('postDeleted') + '</span>');
            });
        });

    }


    ////* COLOR FUNCTIONS: *////
    function setupColors() {
        // Put the color divs out there
        for (i = 0; i < colors.length; i++) {
            var colorDiv = document.createElement("div");
            colorDiv.className = "colorButton";
            colorDiv.id = colors[i];
            colorDiv.style.backgroundColor = colors[i];
            colorDiv.addEventListener("click", function (e) {
                e.preventDefault();
                var caller = e.target || e.srcElement;

                // Set the color to the same as the background color. 
                chrome.storage.local.set({ 'selectedColor': rgb2hex(caller.style.backgroundColor) }, function () {
                    console.log(rgb2hex(caller.style.backgroundColor) + " saved to default.");
                });
                changeSelectedStyleTo(caller);
            });
            document.getElementById("colors").appendChild(colorDiv);
        }

        // Get (or set) the color div based on the currently stored setting.
        chrome.storage.local.get('selectedColor', function (items) {
            for (var prop in items) {
                if (items.hasOwnProperty(prop)) {
                    // Move the "selected" style to the saved color
                    changeSelectedStyleTo(document.getElementById(items.selectedColor));
                    // Update the local colors
                    setElementColors(items.selectedColor);
                    return;
                }
            }
            // If there is no setting for selectedColor - i.e. the first time popup.html is opened:
            chrome.storage.local.set({ 'selectedColor': colors[0] }, function () {
                console.log(colors[0] + " saved to default.");
            });
            changeSelectedStyleTo(document.getElementById(colors[0]));
            setElementColors(colors[0]);
        });
    }

    function changeSelectedStyleTo(element) {
        // Remove selection styling:
        var colors = document.getElementById("colors").getElementsByTagName("div");
        for (i = 0; i < colors.length; i++) {
            if (colors[i].classList.contains("selectedColorButton"))
                colors[i].classList.remove("selectedColorButton");
        }
        // Add selection styling to selected div:
        element.className += " selectedColorButton";
    }

    function setElementColors(c) {
        var a = document.styleSheets;
        for (var i in a) if (a.hasOwnProperty(i)) {
            var b;
            a[i].cssRules ? b = a[i].cssRules : b = a[i].rules;
            for (var j in b) if (b.hasOwnProperty(j)) {
                if (b[j].selectorText === ".buttons" || b[j].selectorText === ".deleteButton" || b[j].selectorText === ".cancelButton") {
                    setButtonNormalColor(b[j], c);
                }
                if (b[j].selectorText === ".buttons:hover") {
                    setButtonHoverColor(b[j], c);
                }
                if (b[j].selectorText === ".commentBox") {
                    setBackgroundColor(b[j], c);
                }
                if (b[j].selectorText === "#star_area") {
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
})(jQuery);