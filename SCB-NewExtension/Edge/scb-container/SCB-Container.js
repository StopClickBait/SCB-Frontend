﻿const DEBUG = true;
var clickBaitLink = "null";
var $ = jQuery;
if (document.location.href.indexOf('?') > -1) {
    clickBaitLink = document.location.href.split('?url=')[1];
    clickBaitLink = decodeURIComponent(clickBaitLink);
    clickBaitLink = clickBaitLink.split('?')[0];
}
//var userID = chrome.storage.local.get("userID");

// Get the current color from Chrome storage and set the custom colors in the document.
chrome.storage.local.get('selectedColor', function (items) {
    setElementColors(items.selectedColor);
});

sortCommentsByVotes();

if (DEBUG) {
    processingCommentList({
        "comments": [
            {
                "id": 2,
                "timestamp": 14900000050,
                "commentText": clickBaitLink,
                "userName": "myUserName",
                "starCount": 17,
                "ownComment": true
            },
            {
                "id": 3,
                "timestamp": 14900000051,
                "commentText": "This is a comment which is the maximum length of 140 characters long. So the design of the longest comment a user can make can be seen. #SCB",
                "userName": "testUser3",
                "starCount": 12,
                "ownComment": false
            },
            {
                "id": 1,
                "timestamp": 1490000001,
                "commentText": "Hello!",
                "userName": "testUser",
                "starCount": 23,
                "ownComment": false
            },
            {
                "commentText": "Hello!",
                "id": 4,
                "ownComment": false,
                "userName": "testUser4",
                "starCount": 10,
                "timestamp": 1490000002
            },
            {
                "id": 5,
                "timestamp": 1490000000,
                "commentText": "Hello!",
                "userName": "testUser5",
                "starCount": 8,
                "ownComment": false
            }
        ]
    });
    addEventHandlers();

} else {
    jQuery.ajax({
        method: 'POST',
        url: 'https://server.stopclickbait.com/getComments.php',
        data: { url: encodeURIComponent(clickBaitLink), userid: userID },
        success: (content) => {
            processingCommentList(content);
            addEventHandlers();
        }

    });
}

// Add event handlers
function addEventHandlers() {
    // Add event listener to find selected color in settings:
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace === "local" && changes["selectedColor"]) {
            setElementColors(changes["selectedColor"].newValue);
        }
    });

    $('#topSC').on('click', function () {
        sortCommentsByVotes();
    });

    // Add event listener to sort by newest comment.
    $('#dateSC').on('click', function () {
        sortCommentsByDate();
    });

    var submitCB = $('#submitCB');

    submitCB.on('focusin', () => {
        submitCB.height(0);
        submitCB.css({
            paddingBottom: 20,
            height: submitCB[0].scrollHeight + 20
        });
        $('#controlBar').css('display', 'block');
        $('#charCounter').css('display', 'flex');
        $('#commentArea').css('height', 305 - submitCB[0].offsetHeight);
    }).on('focusout', function () {
        if (submitCB.val().length === 0) {
            $('#controlBar, #charCounter').hide();
            submitCB.css({
                height: 30,
                paddingBottom: 0
            });
            $('#commentArea').css('height', 265);
        }
    }).on('input', () => {
        var submitCB = $('#submitCB');
        if (submitCB.val().indexOf('\n') !== -1) {
            submitCB.val(submitCB.val().replace('\n', ' '));
        }
        var value = submitCB.val().length;
        $('#charCounter').text(140 - value);
        submitCB.height(0);
        submitCB.height(submitCB.scrollHeight + 0);
        $('#commentArea').css('height', 305 - submitArea.offsetHeight);
        if (submitCB.val().indexOf('\n') !== -1) {
            submitCB.val(submitCB.val().replace('\n', ' '));
        }
    });

    $('.commentBox').each((i, elem) => {
        var t = $(elem);
        if (!t.hasClass('ownComment')) {
            t.on('click', () => {
                var cb = $(elem);
                cb.css('backgroundColor', '');
                cb.hasClass('clickedCommentBox') ? cb.removeClass('clickedCommentBox') : cb.addClass('clickedCommentBox');
            }).on('mousedown', () => {

            });
        }
    });

    $('.deleteIcon').each((i, elem) => {
        if ($(elem).parents('.commentBox').eq(0).hasClass('ownComment')) {
            $(elem).on('click', () => {
                $(elem).parents('.commentBox').children('.deleteButtons').css({
                    pointerEvents: 'none',
                    display: 'unset'
                }).addClass('blockedCommentBox').removeClass('clickedCommentBox');
            });
        } else {
            $(elem).remove();
        }
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

    $('#btnClose').on('click', function () {
        var submitArea = $('#submitCB');
        submitArea.val('');
        $('#controlBar, #charCounter').hide();
        $('#commentArea').css('height', 265);
        submitArea.css({
            height: 30,
            paddingBottom: 0
        });
    });

    $('#pollButtonYes').on('click', (e) => {
        $('#pollButtonArea').hide();
        $('#pollAnswerYes').css('display', 'unset');
        $('#pollAnswerNo').css('display', 'unset');
        $('#pollAnswerBar').css('justifyContent', 'space-between');

        if (!DEBUG) {

            $.ajax({
                method: 'POST',
                url: 'https://server.stopclickbait.com/voting.php',
                data: {
                    url: encodeURIComponent(clickBaitLink),
                    userid: userID,
                    vote: 'yes'
                },
                success: (content) => {
                    processingVotingResults(content);
                }
            });
        } else {
            processingVotingResults(JSON.parse('{ "no": "5", "yes": "95" }'));
        }
        e.preventDefault();
    });

    $('#pollButtonNo').on('click', function () {
        $('#pollButtonArea').hide();
        $('#pollAnswerYes').css('display', 'unset');
        $('#pollAnswerNo').css('display', 'unset');
        $('#pollAnswerBar').css('justifyContent', 'space-between');

        if (!DEBUG) {
            $.ajax({
                method: 'POST',
                url: 'https://server.stopclickbait.com/voting.php',
                data: {
                    url: encodeURIComponent(clickBaitLink),
                    userid: userID,
                    vote: 'no'
                },
                success: (content) => {
                    processingVotingResults(content);
                }
            });
        } else {
            processingVotingResults(JSON.parse('{ "no": "95", "yes": "5" }'));
        }
    });

    $('.reportLinkA').each((i, elem) => {
        $(elem).on('click', (e) => {
            if (!DEBUG) {
                $.ajax({
                    method: 'POST',
                    url: 'https://server.stopclickbait.com/report.php',
                    data: {
                        userid: userID,
                        reportID: $(elem).parents('.commentBox')[0].id
                    },
                    success: (content) => {
                        processingVotingResults(content);
                    }
                });

            }
            $(elem).html(chrome.i18n.getMessage("Thanks") + "!");
            e.stopPropagation();
        });
    });
}

function processingCommentList(content) {
    for (var i in content.comments) if (content.comments.hasOwnProperty(i)) {
        var comment = content.comments[i];
        createCommentBox(comment.id, comment.timestamp, comment.commentText, comment.userName, comment.starCount, comment.ownComment);
    }
}

function processingVotingResults(results) {
    $('#pollAnswerNo').html(chrome.i18n.getMessage('notClickbait') + "\n" + results.no + "%");
    $('#pollAnswerYes').html("CLICKBAIT\n" + results.yes + "%");
    $('#pollBar').val(results.yes);

}

function createCommentBox(commentId, timestamp, content, userNameString, voteNumber, ownComment) {
    commentArea = $('#commentArea');
    commentBox = $('<div class="commentBox" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').appendTo(commentArea);
    commentLeft = $('<div class="commentLeft"/>').appendTo(commentBox);
    commentText = $('<div class="commentText"/>').appendTo(commentLeft);
    commentContent = $('<p/>').text(content).appendTo(commentText);
    userArea = $('<div class="userArea"/>').appendTo(commentLeft);
    userName = $('<span class="userName"/>').text(userNameString).appendTo(userArea);
    voteArea = $('<div class="voteArea">').appendTo(commentBox);
    deleteIcon = $('<div class="deleteIcon">c</div>').appendTo(voteArea);
    upvoteStar = $('<span class="upvoteStar">a</span>').appendTo(voteArea);
    upvotes = $('<span class="upvotes"/>').text(voteNumber).appendTo(voteArea);
    deleteButtons = $('<div class="deleteButtons">').on('click', function () { return false; }).on('mouseover', function () { return false; }).appendTo(commentBox);
    deleteButton = $('<button class="deleteButton" data-localize="delete">delete</button>').appendTo(deleteButtons);
    cancelButton = $('<button class="cancenButton" data-localize="cancel">cancel</button>').appendTo(deleteButtons);

    if (ownComment) {
        commentBox.addClass('ownComment');

    } else {
        separator = $('<span class="separator">|</span>').appendTo(userArea);
        reportLink = $('<span class="reportLink">').appendTo(userArea);
        reportLinkA = $('<a href="#" class="reportLinkA" data-localize="report">report</a>').appendTo(reportLink);
    }
}

function sortCommentsByVotes() {
    $('#topSC').css('fontWeight', 'bold');
    $('#dateSC').css('fontWeight', 'normal');

    var commentCards = $('#commentArea').children(),
    sortCards = Array.prototype.slice.call(commentCards.toArray(), 0);

    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            valA = parseInt($(a).find('.upvotes').eq(0).html());
            valB = parseInt($(b).find('.upvotes').eq(0).html());
            return valA - valB;
        });

        commentParent = $('#commentArea').html('');
        for (i = sortCards.length - 1; i >= 0; --i) {
            commentParent.append(sortCards[i]);
        }
    } else {
        return;
    }
}

function sortCommentsByDate() {
    $('#topSC').css('fontWeight', 'normal');
    $('#dateSC').css('fontWeight', 'bold');

    var commentCards = $('#commentArea').children(),
        sortCards = Array.prototype.slice.call(commentCards.toArray(), 0);
    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            valA = parseInt(a.dataset.timestamp);
            valB = parseInt(b.dataset.timestamp);
            return valA - valB;
        });

        var commentParent = $('#commentArea').html('');
        for (i = sortCards.length - 1; i >= 0; --i) {
            commentParent.append(sortCards[i]);
        }
    } else {
        return;
    }
}

function setElementColors(color) {
    var a = document.styleSheets;
    for (var i in a) if (a.hasOwnProperty(i)) {
        var b;
        a[i].cssRules ? b = a[i].cssRules : b = a[i].rules;
        for (var j in b) if (b.hasOwnProperty(j)) {
            // Change color:
            if (b[j].selectorText === ".commentBox:hover" ||
                b[j].selectorText === ".clickedCommentBox, .ownComment") {
                b[j].style.backgroundColor = color;
            }

            // Change Pollbar color:
            if (b[j].selectorText === "#pollBar:not([value])" ||
                b[j].selectorText === "#pollBar:not([value])::-webkit-progress-bar" ||
                b[j].selectorText === "#pollBar:not([value])::-moz-progress-bar" ||
                b[j].selectorText === ":not([value])#pollBar") {
                b[j].style.backgroundColor = "#fff";
                b[j].style.border = "1px solid";
                b[j].style.borderColor = color;
                b[j].style.borderRadius = "3px";
            }

            // Change color for button:
            if (b[j].selectorText === "button") {
                b[j].style.backgroundColor = "#fff";
                b[j].style.border = "1px solid";
                b[j].style.borderColor = color;
                b[j].style.color = color;
                b[j].style.borderRadius = "3px";
            }

            // Change hover style for button:
            if (b[j].selectorText === "button:hover") {
                b[j].style.backgroundColor = color;
                b[j].style.color = "#fff";
            }

            // Change text color for these areas:
            if (b[j].selectorText === "#pollBttns button" ||
                b[j].selectorText === "#pollButtonArea") {
                b[j].style.color = color;
            }

            // Change the outline color of the textbox:
            if (b[j].selectorText === "#submitCB:focus") {
                b[j].style.outlineColor = color;
            }
        }
    }
}