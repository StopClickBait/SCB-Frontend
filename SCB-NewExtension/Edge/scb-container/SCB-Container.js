const DEBUG = true;
var clickBaitLink = "null";
if (document.location.href.indexOf('?') > -1) {
    clickBaitLink = document.location.href.split('?url=')[1];
    clickBaitLink = decodeURIComponent(clickBaitLink);
    clickBaitLink = clickBaitLink.split('?')[0];

	var strlen = clickBaitLink.length;
	var maxlen = 38;

	if(strlen > maxlen){
		var diff = strlen / maxlen;
		var newstr = [];
		var i = 0;
		var newLink = '';
		var start;

		// break up string into segments based on the `maxlen` variable and string legth
		for(i = 0; i < diff; i++){
			start = i * maxlen;
			newstr.push(clickBaitLink.substr(start, maxlen));
		}

		// stitches segments back together with a space between them so they will wrap
		for(i = 0; i < newstr.length; i++){
			newLink += newstr[i] +' ';
		}

		clickBaitLink = newLink;
	}
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

    jQuery('#topSC').on('click', function () {
        sortCommentsByVotes();
    });

    // Add event listener to sort by newest comment.
    jQuery('#dateSC').on('click', function () {
        sortCommentsByDate();
    });

    var submitCB = jQuery('#submitCB');

    submitCB.on('focusin', () => {
        submitCB.height(0);
        submitCB.css({
            paddingBottom: 20,
            height: submitCB[0].scrollHeight + 20
        });
        jQuery('#controlBar').css('display', 'block');
        jQuery('#charCounter').css('display', 'flex');
        jQuery('#commentArea').css('height', 305 - submitCB.offsetHeight);
    }).on('focusout', function () {
        if (submitCB.value.length === 0) {
            jQuery('#controlBar, #charCounter').hide();
            submitCB.css({
                height: 30,
                paddingBottom: 0
            });
            jQuery('#commentArea').css('height', 265);
        }
    }).on('input', () => {
        var submitCB = jQuery('#submitCB');
        if (submitCB.value.indexOf('\n') !== -1) {
            submitCB.value = submitCB.value.replace('\n', ' ');
        }
        var value = submitCB.value.length;
        jQuery('#charCounter').text(140 - value);
        submitCB.height(0);
        submitCB.height(submitCB.scrollHeight + 0);
        jQuery('#commentArea').css('height', 305 - submitArea.offsetHeight);
        if (submitCB.value.indexOf('\n') !== -1) {
            submitCB.value = submitCB.value.replace('\n', ' ');
        }
    });

    jQuery('.commentBox').each((i, elem) => {
        var t = jQuery(elem);
        if (!t.hasClass('ownComment')) {
            t.on('click', () => {
                var cb = jQuery(elem);
                cb.css('backgroundColor', '');
                cb.hasClass('clickedCommentBox') ? cb.removeClass('clickedCommentBox') : cb.addClass('clickedCommentBox');
            }).on('mousedown', () => {

            });
        }
    });

    jQuery('.deleteIcon').each((i, elem) => {
        if (jQuery(elem).parents('.commentBox').eq(0).hasClass('ownComment')) {
            jQuery(elem).on('click', () => {
                jQuery(elem).parents('.commentBox').children('.deleteButtons').css({
                    pointerEvents: 'none',
                    display: 'unset'
                }).addClass('blockedCommentBox').removeClass('clickedCommentBox');
            });
        } else {
            jQuery(elem).remove();
        }
    });

    jQuery('.cancelButton').each((i, elem) => {
        jQuery(elem).on('click', () => {
            var t = jQuery(elem);
            t.parents('.commentBox').css('pointerEvents', '').addClass('clickedCommentBox').removeClass('blockedCommentBox');
            t.parent().hide();
        });


    });

    jQuery('.deleteButton').each((i, elem) => {
        jQuery(elem).on('click', () => {
            var deleteButtons = jQuery(elem).parent();
            deleteButtons.css({
                display: 'flex',
                justifyContent: 'center',
                verticalAlign: 'middle',
                alignItems: 'center'
            }).html('<span style="color: #828282 !important; text-align: center">' + chrome.i18n.getMessage('postDeleted') + '</span>');
        });
    });

    jQuery('#btnClose').on('click', function () {
        var submitArea = jQuery('#submitCB');
        submitArea.val('');
        jQuery('#controlBar, #charCounter').hide();
        jQuery('#commentArea').css('height', 265);
        submitArea.css({
            height: 30,
            paddingBottom: 0
        });
    });

    jQuery('#pollButtonYes').on('click', (e) => {
        jQuery('#pollButtonArea').hide();
        jQuery('#pollAnswerYes').css('display', 'unset');
        jQuery('#pollAnswerNo').css('display', 'unset');
        jQuery('#pollAnswerBar').css('justifyContent', 'space-between');

        if (!DEBUG) {

            jQuery.ajax({
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

    jQuery('#pollButtonNo').on('click', function () {
        jQuery('#pollButtonArea').hide();
        jQuery('#pollAnswerYes').css('display', 'unset');
        jQuery('#pollAnswerNo').css('display', 'unset');
        jQuery('#pollAnswerBar').css('justifyContent', 'space-between');

        if (!DEBUG) {
            jQuery.ajax({
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

    jQuery('.reportLinkA').each((i, elem) => {
        jQuery(elem).on('click', (e) => {
            if (!DEBUG) {
                jQuery.ajax({
                    method: 'POST',
                    url: 'https://server.stopclickbait.com/report.php',
                    data: {
                        userid: userID,
                        reportID: jQuery(elem).parents('.commentBox')[0].id
                    },
                    success: (content) => {
                        processingVotingResults(content);
                    }
                });

            }
            jQuery(elem).html(chrome.i18n.getMessage("Thanks") + "!");
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
    jQuery('#pollAnswerNo').html(chrome.i18n.getMessage('notClickbait') + "\n" + results.no + "%");
    jQuery('#pollAnswerYes').html("CLICKBAIT\n" + results.yes + "%");
    jQuery('#pollBar').val(results.yes);

}

function createCommentBox(commentId, timestamp, content, userNameString, voteNumber, ownComment) {
    commentArea = jQuery('#commentArea');
    commentBox = jQuery('<div class="commentBox" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').appendTo(commentArea);
    commentLeft = jQuery('<div class="commentLeft"/>').appendTo(commentBox);
    commentText = jQuery('<div class="commentText"/>').appendTo(commentLeft);
    commentContent = jQuery('<p/>').text(content).appendTo(commentText);
    userArea = jQuery('<div class="userArea"/>').appendTo(commentLeft);
    userName = jQuery('<span class="userName"/>').text(userNameString).appendTo(userArea);
    voteArea = jQuery('<div class="voteArea">').appendTo(commentBox);
    deleteIcon = jQuery('<div class="deleteIcon">c</div>').appendTo(voteArea);
    upvoteStar = jQuery('<span class="upvoteStar">a</span>').appendTo(voteArea);
    upvotes = jQuery('<span class="upvotes"/>').text(voteNumber).appendTo(voteArea);
    deleteButtons = jQuery('<div class="deleteButtons">').on('click', function () { return false; }).on('mouseover', function () { return false; }).appendTo(commentBox);
    deleteButton = jQuery('<button class="deleteButton" data-localize="delete">delete</button>').appendTo(deleteButtons);
    cancelButton = jQuery('<button class="cancenButton" data-localize="cancel">cancel</button>').appendTo(deleteButtons);

    if (ownComment) {
        commentBox.addClass('ownComment');

    } else {
        separator = jQuery('<span class="separator">|</span>').appendTo(userArea);
        reportLink = jQuery('<span class="reportLink">').appendTo(userArea);
        reportLinkA = jQuery('<a href="#" class="reportLinkA" data-localize="report">report</a>').appendTo(reportLink);
    }
}

function sortCommentsByVotes() {
    jQuery('#topSC').css('fontWeight', 'bold');
    jQuery('#dateSC').css('fontWeight', 'normal');

    var commentCards = jQuery('#commentArea').children(),
    sortCards = Array.prototype.slice.call(commentCards.toArray(), 0);

    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            valA = parseInt(jQuery(a).find('.upvotes').eq(0).html());
            valB = parseInt(jQuery(b).find('.upvotes').eq(0).html());
            return valA - valB;
        });

        commentParent = jQuery('#commentArea').html('');
        for (i = sortCards.length - 1; i >= 0; --i) {
            commentParent.append(sortCards[i]);
        }
    } else {
        return;
    }
}

function sortCommentsByDate() {
    jQuery('#topSC').css('fontWeight', 'normal');
    jQuery('#dateSC').css('fontWeight', 'bold');

    var commentCards = jQuery('#commentArea').children(),
        sortCards = Array.prototype.slice.call(commentCards.toArray(), 0);
    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            valA = parseInt(a.dataset.timestamp);
            valB = parseInt(b.dataset.timestamp);
            return valA - valB;
        });

        var commentParent = jQuery('#commentArea').html('');
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