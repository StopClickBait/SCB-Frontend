const DEBUG = true;

$.noConflict();

(($) => {
    var colors = ["#3b5999", "#00acee", "#c83b6f", "#1bbc9b", "#34495e", "#e84c3d", "#2dcc70", "#9b58b5"];
    var userToken;
    var yourPosts = $('#your-posts');
    var settings = $('#settings');
    var separator = $('#separator');
    var pLoggedOut = $('#profile-logged-out');
    var pLoggedIn = $('#profile-logged-in');
    var pName = $('#profile-name');
    var pImage = $('#profile-image');
    var hoverToOpen = $('#hover-to-open').on('click', () => {
        chrome.storage.local.set({ 'hoverToOpen': hoverToOpen[0].checked }, () => { console.log("HoverToOpen: " + hoverToOpen[0].checked); });
    });
    var showExplanation = $('#show-explanation').on('click', () => {
        chrome.storage.local.set({ 'showDefaultExplanation': showExplanation[0].checked }, () => { console.log("showExplanation: " + showExplanation[0].checked); });
    });
    var viewPosts = $('#view-posts').on('click', (e) => {
        // load users scb comments
        getUserPosts();
        containers.animate({left: -250}, 'fast');
        e.preventDefault();
    });
    var containers = $('#containers');
    var login = $('#login').on('click', (e) => {
        // log user into facebook through scb
        var win = window.open('https://www.facebook.com/v2.9/dialog/oauth?client_id=137575509998503&response_type=token&redirect_uri=https://www.facebook.com/connect/login_success.html');
        e.preventDefault();
    });
    var logout = $('#logout').on('click', (e) => {
        // remove access token from storage
        chrome.storage.local.remove('accessToken', function () {
            console.log('Removed Facebook access key from storage.');
        });

        // display logged out interface
        containers.animate({left: 0}, 'fast');
        yourPosts.add(settings).add(logout).add(pLoggedIn).hide();
        pLoggedOut.css('display', 'flex');
        e.preventDefault();
    });
    var back = $('#back').on('click', () => {
        // bring user back to main scb window
        containers.animate({left: 0}, 'fast');
    });
    var sorting = $('#sorting');
    var sortNew = $('#sort-new').on('click', function () {
        if(!$(this).hasClass('selected')){
            // sort comments by date
            sortComments('new');
        }
    });
    var sortVotes = $('#sort-votes').addClass('selected').on('click', function () {
        if(!$(this).hasClass('selected')){
            // sort comments by votes
            sortComments('votes');
        }
    });

    if($('.selected', sorting).length > 0){
        var sortBy = $('.selected', sorting).text() == 'new' ? 'new' : 'votes';
        sortComments(sortBy)
    }

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

    function sortComments(by){
        if(typeof by == 'undefined') return;

        if(by == 'new'){
            $('.selected', sorting).removeClass('selected');
            sortNew.addClass('selected');

            $('.comment-box', yourPosts).sort(function (a, b) {
                return parseInt($(b).attr('data-timestamp')) - parseInt($(a).attr('data-timestamp'));
            }).appendTo('.jspPane', yourPosts);

        }else if( by == 'votes'){
            $('.selected', sorting).removeClass('selected');
            sortVotes.addClass('selected');

            $('.comment-box', yourPosts).sort(function (a, b) {
                return parseInt($('.upvotes', b).text()) - parseInt($('.upvotes', a).text());
            }).appendTo('.jspPane', yourPosts);
        }
    }

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

        $.ajax({
            method: 'GET',
            url: 'https://graph.facebook.com/v2.9/me/picture?access_token=' + userToken + '&redirect=false&type=large&height=300&width=300',
            success: (content) => {
                if (!content.error) {
                    $('img', pImage).attr('src', content.data.url);
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
        // Add handler to changed color in storage:
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === "local" && changes["selectedColor"]) {
                setElementColors(changes["selectedColor"].newValue);
            }
        });
    }

    ////* POSTS FUNCTIONS *////
    function processUserPosts(content) {
        var commentInner = $('.inner', yourPosts).data('jsp', null).attr('style', '');
        // create and display user's comments
        if (typeof content.comments == 'object') if (content.comments.length) {
            for (var i in content.comments) if (content.comments.hasOwnProperty(i)) {
                var comment = content.comments[i];
                createCommentBox(comment.id, comment.timestamp, comment.commentText, comment.starCount);
            }
            sorting.show();
            commentInner.removeClass('no-posts').addClass('scroll-pane').jScrollPane();
            return;
        }

        // no user comments
        sorting.hide();
        commentInner.addClass('no-posts');
        $('<div id="no-posts"/>').html('<span>No Posts Yet</span>').appendTo(commentInner);
    }

    function getUserPosts() {
        $('.inner', yourPosts).html('');

        processUserPosts({
            "comments": [
                {
                    "id": 1,
                    "timestamp": 1090836201,
                    "commentText": "Stop defining flower pedals; sit and observe. No more giving labels to another life that it doesn't deserve",
                    "starCount": 67
                },
                {
                    "id": 2,
                    "timestamp": 1038405057,
                    "commentText": "Everything is worth fighting for; violence never got me anywhere; free thought doesn't cost that much; living is the only thing worth anything",
                    "starCount": 17
                },
                {
                    "id": 3,
                    "timestamp": 1010098458,
                    "commentText": "This is a comment which is the maximum length of 140 characters long. So the design of the longest comment a user can make can be seen. #SCB",
                    "starCount": 2
                },
                {
                    "id": 4,
                    "timestamp": 1490000000,
                    "commentText": "You don't know you're wearing a leash, if you sit by the peg all day",
                    "starCount": 10
                },
                {
                    "id": 5,
                    "timestamp": 1219450809,
                    "commentText": "Staring at a clock waiting for its time to pass; sudden time-lapse and space passes me by as I feel my body collapse.",
                    "starCount": 18
                }
            ]
        });
    }

    function createCommentBox(commentId, timestamp, content, voteNumber) {
        var
            commentBox = $('<div class="comment-box" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').appendTo($('.inner', yourPosts)),
            commentLeft = $('<div class="comment-left"/>').appendTo(commentBox),
            commentContent = $('<p/>').text(content).appendTo($('<div class="comment-text"/>').appendTo(commentLeft)),
            voteArea = $('<div class="vote-area"/>').appendTo(commentBox),
            deleteIcon = $('<div class="delete-icon"/>').text('c').appendTo(voteArea).on('click', function () {
                $(this).parents('.comment-box').children('.delete-buttons').css({
                    pointerEvents: 'none',
                }).fadeIn('fast');
                $(this).parents('.commentBox').addClass('blocked-comment-box');
            }),
            upvoteStar = $('<span class="upvote-star"/>').text('a').appendTo(voteArea),
            upvotes = $('<span class="upvotes"/>').text(voteNumber).appendTo(voteArea),
            deleteButtons = $('<div/>').addClass('delete-buttons').on('click', (e) => { e.stopPropagation(); return false; }).on('mouseover', (e) => { e.stopPropagation(); return false; }).appendTo(commentBox),
            deleteButton = $('<button/>').attr('data-localize', 'delete').text('Delete').addClass('delete-button buttons').on('click', function () {
                var t = $(this);

                // if this is last comment
                if ($('.comment-box').length < 2) {
                    $('.inner', yourPosts).attr('style', '').removeClass('scroll-pane').addClass('no-posts').html(
                        $('<div id="no-posts"/>').html('<span>No Posts Yet</span>')
                    ).data('jsp', null);
                    sorting.hide();
                    return;
                }

                $('.scroll-pane').each(function(){
                    var jsPane = $('.jspPane', this).attr('height', $(this).height());
                    var api = $(this).data('jsp');
                    var interval = setInterval(function(){
                        if(jsPane.height() != jsPane.attr('height')){
                            jsPane.attr('height', jsPane.height());
                            api.reinitialise();
                        }
                    }, 50);
                });

                t.parent().css({
                    overflow: 'hidden'
                }).html(
                    $('<div/>').css({
                        height: t.parent().height(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }).html(
                        $('<span>').css({
                            textAlign: 'center',
                            color: '#d0d0d0',
                            cursor: 'default'
                        }).text(chrome.i18n.getMessage('postDeleted'))
                    )
                ).parent().delay(1000).slideUp('fast', function(){
                    this.remove();

                    if(typeof interval != 'undefined') clearInterval(interval);
                });
            }).appendTo(deleteButtons),
            cancelButton = $('<button/>').attr('data-localize', 'cancel').text('Cancel').addClass('cancel-button buttons').on('click', function () {
                var t = $(this);
                var parent = t.parent();

                t.parents('.comment-box').css('pointerEvents', '').addClass('clicked-comment-box');
                parent.animate({left: '100%'}, 'fast', () => {
                    parent.hide().css({left: 0});
                });
            }).appendTo(deleteButtons)
        ;
    }

    ////* COLOR FUNCTIONS: *////
    function setupColors() {
        // Put the color divs out there
        for (var i = 0; i < colors.length; i++) {
            $('<div class="color-button">').attr('id', colors[i]).css('backgroundColor', colors[i]).on("click", function (e) {
                var caller = $(this);

                // Set the color to the same as the background color. 
                chrome.storage.local.set({ 'selectedColor': rgb2hex(caller.css('backgroundColor')) }, function () {
                    console.log(rgb2hex(caller.css('backgroundColor')) + " saved to default.");
                });

                changeSelectedStyleTo(caller[0]);
                e.preventDefault();
            }).appendTo('#colors');
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
        $('#colors div').removeClass('selected-color-button')
        // Add selection styling to selected div:
        $(element).addClass('selected-color-button');
    }

    function setElementColors(c) {
        var styleSheet = $('style#set-element-colors').length > 0 ? $('style#set-element-colors') : $('<style id="set-element-colors"/>');
        styleSheet.html('.buttons, #star-area, .comment-text p::selection { color: ' +c +'; } .buttons:hover, .comment-box, .jspDrag { background-color: ' +c +'; } .buttons, #profile-image { border-color: ' +c +'; background-color: transparent; } .buttons:hover { border-color: transparent; color: #ffffff; }').appendTo('body');
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