const DEBUG = true;
var clickBaitLink = "null";
var $ = jQuery;
if (document.location.href.indexOf('?') > -1) {
    clickBaitLink = document.location.href.split('?url=')[1];
    clickBaitLink = decodeURIComponent(clickBaitLink);
    clickBaitLink = clickBaitLink.split('?')[0];
	if(clickBaitLink.indexOf('&') !== -1) clickBaitLink = clickBaitLink.substr(0, clickBaitLink.indexOf('&'));
}
//var userID = chrome.storage.local.get("userID");

// Get the current color from Chrome storage and set the custom colors in the document.
chrome.storage.local.get('selectedColor', function (items) {
    setElementColors(items.selectedColor);
});

sortComments('votes');

if (DEBUG) {
    processingCommentList({
        "comments": [
            {
                "id": 2,
                "timestamp": 14900000050,
                "commentText": clickBaitLink,
                "userName": "SCB Admin",
                "starCount": '17k',
                "ownComment": true
            },
            {
                "id": 3,
                "timestamp": 14900000051,
                "commentText": "Ever since that boy became a man, he made a promise to himself to be honest and always pursue the knowledge that can free the mind and he...",
                "userName": "DISL Automatic",
                "starCount": 670,
                "ownComment": false
            },
            {
                "id": 1,
                "timestamp": 1490000001,
                "commentText": "She's held down by the transcripts my hands grip; tried to tie her wings back on before they're once again clipped",
                "userName": "Sage Francis",
                "starCount": 256,
                "ownComment": false
            },
            {
                "commentText": "we could learn a thing or two to dispossess exist between things that suck life from us and give life to us and telling us who we are...",
                "id": 4,
                "ownComment": false,
                "userName": "SoleOneDotOrg",
                "starCount": 128,
                "timestamp": 1490000002
            },
            {
                "id": 5,
                "timestamp": 1490000000,
                "commentText": "Everything I feel they've tought, since little, has faught with me and my struggle's to find larger self, larger meaning",
                "userName": "nolly-d",
                "starCount": 99,
                "ownComment": false
            },
            {
                "id": 67,
                "timestamp": 1490000000,
                "commentText": "Matter is what you don't to me, he don't to she, we don't to we but hopefully we can gather together and figure out what life's about",
                "userName": "Eyedea",
                "starCount": 67,
                "ownComment": false
            },
            {
                "id": 24,
                "timestamp": 1490000000,
                "commentText": "We set sail without an anchor, we count upon that never stop; [because] an anchor's just a coffin nail, waiting for that hammer drop",
                "userName": "Astronautalis",
                "starCount": 33,
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
        sortComments('votes');
    });

    // Add event listener to sort by newest comment.
    $('#dateSC').on('click', function () {
        sortComments('date');
    });

    var submitCB = $('#submitCB');
    var submitHeight = submitCB.height();
    var commentArea = $('#commentArea');

    submitCB.on('focusin', () => {
        submitCB.attr('style', '').css({
            paddingBottom: 20,
            height: submitCB[0].scrollHeight + 50
        });
        $('#controlBar, #controlBarButtons').css('display', 'block');
        $('#charCounter').css('display', 'flex');
        commentArea.css('height', 305 - submitCB[0].offsetHeight);
    }).on('focusout', () => {
		if (submitCB.val().length > 0) return;

		$('#controlBar, #charCounter, #controlBarButtons').hide();
		submitCB.css({
			height: submitHeight,
			paddingBottom: 0
		});
		commentArea.css('height', 265);
    }).on('input', () => {
        var submitCB = $('#submitCB');
        if (submitCB.val().indexOf('\n') !== -1) {
            submitCB.val(submitCB.val().replace('\n', ' '));
        }
        var value = submitCB.val().length;
        $('#charCounter').text(140 - value);
        commentArea.css('height', 305 - submitArea.offsetHeight);
        if (submitCB.val().indexOf('\n') !== -1) {
            submitCB.val(submitCB.val().replace('\n', ' '));
        }
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
        $('#pollAnswers').show();
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
        $('#pollAnswers').show();
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

    $('#commentArea').wrapInner($('<div id="commentInner">'));
}

function processingVotingResults(results) {
    $('#pollAnswerNo').html(chrome.i18n.getMessage('notClickbait') + "\n" + results.no + "%");
    $('#pollAnswerYes').html("CLICKBAIT\n" + results.yes + "%");
    $('#pollBar').val(results.yes);

}

function linkify(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, '<a href="$1">$1</a>'); 
}

function createCommentBox(commentId, timestamp, content, userNameString, voteNumber, ownComment) {
    commentArea = $('#commentArea');
    commentBox = $('<div class="commentBox" id="comment-' + commentId + '" data-timestamp="' + timestamp + '"/>').on('click', function () {
        if (ownComment) return;
        $('.clickedCommentBox').removeClass('clickedCommentBox')
        $(this).css('backgroundColor', '').addClass('clickedCommentBox');
    }).on('mousedown', function () {
        if (ownComment) return;
        $(this).css('filter', 'brightness(80%)');
    }).on('mouseup', function () {
        if (ownComment) return;
        $(this).css('filter', '');
    }).appendTo(commentArea);
    commentLeft = $('<div class="commentLeft"/>').appendTo(commentBox);
    commentText = $('<div class="commentText"/>').appendTo(commentLeft);
    
	
	commentContent = $('<p/>').html(linkify(content)).appendTo(commentText);
    userArea = $('<div class="userArea"/>').appendTo(commentLeft);
    userName = $('<span class="userName"/>').text(userNameString).appendTo(userArea);
    voteArea = $('<div class="voteArea">').prependTo(commentLeft);
    deleteIcon = $('<div class="deleteIcon">c</div>').on('click', function () {
        $(this).parents('.commentBox').addClass('blockedCommentBox').children('.deleteButtons').css('pointerEvents', 'none').fadeIn('fast');
    }).appendTo(commentBox);
    upvoteStar = $('<span class="upvoteStar">a</span>').appendTo(voteArea);
    upvotes = $('<span class="upvotes"/>').text(voteNumber).appendTo(voteArea);
    deleteButtons = $('<div class="deleteButtons"/>').appendTo(commentBox);
    deleteButton = $('<button class="deleteButton" data-localize="delete">delete</button>').on('click', function () {
        $(this).parent().css({
            display: 'flex',
            justifyContent: 'center',
            verticalAlign: 'middle',
            alignItems: 'center'
        }).html('<span style="color: #828282 !important; text-align: center">' + chrome.i18n.getMessage('postDeleted') + '</span>').parents('.commentBox').delay(1000).slideUp('fast', function () {
            this.remove();
        });
    }).appendTo(deleteButtons);
    cancelButton = $('<button class="cancelButton" data-localize="cancel">cancel</button>').on('click', function () {
        var t = $(this);
        t.parent().animate({left: '100%'}, 'fast', function(){
            t.parents('.commentBox').css('pointerEvents', '').removeClass('blockedCommentBox');
            t.parent().hide().css('left', 0);
        });
    }).on('mousedown', function () {
        $(this).css('filter', 'brightness(80%)');
    }).on('mouseup', function () {
        $(this).css('filter', '');
    }).appendTo(deleteButtons);

    if (ownComment) {
        commentBox.addClass('ownComment');
    } else {
        separator = $('<span class="separator">|</span>').appendTo(userArea);
        reportLink = $('<span class="reportLink">').appendTo(userArea);
        reportLinkA = $('<a href="#" class="reportLinkA" data-localize="report">report</a>').appendTo(reportLink);
        deleteIcon.remove();
    }
}

function sortComments(by){
    if(typeof by == 'undefined') return;

    var top = $('#topSC').css('fontWeight', 'normal');
    var date = $('#dateSC').css('fontWeight', 'normal');
    var commentInner = $('#commentInner');

    if(by == 'votes'){
        top.css('fontWeight', 'bold');

        commentInner.children().sort(function (a, b) {
            return parseInt($('.upvotes', b).text()) - parseInt($('.upvotes', a).text());
        }).appendTo(commentInner);
    } else if (by == 'date') {
        date.css('fontWeight', 'bold');

        commentInner.children().sort(function (a, b) {
            return parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp);
        }).appendTo(commentInner);
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

$(document).ready(function(){
    setTimeout(function(){
        $('#card').fadeIn();
    }, 500);
});