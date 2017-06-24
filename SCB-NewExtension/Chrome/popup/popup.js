const DEBUG = true;

$.noConflict();

(($) => {

    var colors = ["#3b5999", "#00acee", "#c83b6f", "#1bbc9b", "#34495e", "#e84c3d", "#2dcc70", "#9b58b5"];
    var userToken;
    var yourPosts = $('#your-posts');
    var settings = $('#settings');
    var separator = $('.separator');
    var pLoggedOut = $('#profile-logged-out');
    var pLoggedIn = $('#profile-logged-in');
    var pName = $('#profile-name');
    var pImage = $('#profile-image');
    var hoverToOpen = $('#hover-to-open');
    var showExplanation = $('#show-explanation');
    var viewPosts = $('#view-posts');
    var containers = $('#containers');
    var login = $('#login');
    var logout = $('#logout');

    // yourPosts.add(settings).add(logout).add(separator).add(pLoggedIn).hide()
    // $('#profile-logged-out').css('display', 'flex');

    $('<div class="back"/>').html($('<span title="Go Back">&lt; Back</span>').css('fontSize', '90%').on('click', function () {
        containers.animate({left: 0}, 'fast');
    })).prependTo(yourPosts);

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

        pLoggedOut.hide();
        pLoggedIn.add(settings).add(yourPosts).show();
        pName.text(username);
        logout.add(separator).css('display', 'inline-block');

        showExplanation.on('click', () => {
            chrome.storage.local.set({ 'showDefaultExplanation': $('#' +showExplanation.attr('id'))[0].checked }, () => { console.log("showExplanation: " + $('#' +showExplanation.attr('id'))[0].checked); });
        });

        hoverToOpen.on('click', () => {
            chrome.storage.local.set({ 'hoverToOpen': $('#' +hoverToOpen.attr('id'))[0].checked }, () => { console.log("HoverToOpen: " + $('#' +hoverToOpen.attr('id'))[0].checked); });
        });

        $.ajax({
            method: 'GET',
            url: 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=large&height=300&width=300',
            success: (content) => {
                if (!content.error) {
                    pImage.attr('src', content.data.url);
                }
            }
        });

        chrome.storage.local.get('showDefaultExplanation', (items) => {
            $('#' +showExplanation.attr('id'))[0].checked = items.showDefaultExplanation;
        });
        chrome.storage.local.get('hoverToOpen', (items) => {
            $('#' +hoverToOpen.attr('id'))[0].checked = items.hoverToOpen;
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
        viewPosts.on("click", (e) => {
            e.preventDefault();
            containers.animate({left: -250}, "fast");
            getUserPosts();
        });

        // Add handler to changed color in storage:
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === "local" && changes["selectedColor"]) {
                setElementColors(changes["selectedColor"].newValue);
            }
        });

        // Add handler to login button:
        login.on("click", (e) => {
            e.preventDefault();
            var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
        });

        // Add handler to logout button:
        logout.on("click", (e) => {
            e.preventDefault();
            // Remove access token from storage
            chrome.storage.local.remove("accessToken", function () {
                console.log("Removed Facebook access key from storage.");
            });
            // Display logged out interface
            containers.animate({left: 0}, 'fast');
            $('#your-posts, #settings, #logout, .separator, #profile-logged-in').hide();
            $('#profile-logged-out').css('display', 'flex');
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
            commentBox = $('<div class="comment-box" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').appendTo($('.inner', yourPosts)),
            commentLeft = $('<div class="comment-left"/>').appendTo(commentBox),
            commentContent = $('<p/>').text(content).appendTo($('<div class="comment-text"/>').appendTo(commentLeft)),
            voteArea = $('<div class="vote-area"/>').appendTo(commentBox),
            deleteIcon = $('<div class="delete-icon"/>').text('c').appendTo(voteArea),
            upvoteStar = $('<span class="upvote-star"/>').text('a').appendTo(voteArea),
            upvotes = $('<span class="upvotes"/>').text(voteNumber).appendTo(voteArea),
            deleteButtons = $('<div/>').addClass('delete-buttons').on('click', (e) => { e.stopPropagation(); return false; }).on('mouseover', (e) => { e.stopPropagation(); return false; }).appendTo(commentBox),
            deleteButton = $('<button/>').attr('data-localize', 'delete').text('Delete').addClass('delete-button buttons').appendTo(deleteButtons),
            cancelButton = $('<button/>').attr('data-localize', 'cancel').text('Cancel').addClass('cancel-button buttons').appendTo(deleteButtons);
    }

    function addUserPostsEvents() {
        $('.delete-icon').each((i, elem) => {
            $(elem).on('click', () => {
                $(elem).parents('.comment-box').children('.delete-buttons').css({
                    pointerEvents: 'none',
                    display: 'unset'
                });
                $(elem).parents('.commentBox').addClass('blocked-comment-box');
            });
        });

        $('.cancel-button').each((i, elem) => {
            $(elem).on('click', () => {
                var t = $(elem);
                t.parents('.comment-box').css('pointerEvents', '').addClass('clicked-comment-box');
                t.parent().hide();
            });
        });

        $('.delete-button').each((i, elem) => {
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
            colorDiv.className = "color-button";
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
            if (colors[i].classList.contains("selected-color-button"))
                colors[i].classList.remove("selected-color-button");
        }
        // Add selection styling to selected div:
        element.className += " selected-color-button";
    }

    function setElementColors(c) {
        var a = document.styleSheets;
        for (var i in a) if (a.hasOwnProperty(i)) {
            var b;
            a[i].cssRules ? b = a[i].cssRules : b = a[i].rules;
            for (var j in b) if (b.hasOwnProperty(j)) {
                if (b[j].selectorText === ".buttons") {
                    setButtonNormalColor(b[j], c);
                }
                if (b[j].selectorText === ".buttons:hover") {
                    setButtonHoverColor(b[j], c);
                }
                if (b[j].selectorText === ".comment-box") {
                    setBackgroundColor(b[j], c);
                }
                if (b[j].selectorText === "#star-area") {
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