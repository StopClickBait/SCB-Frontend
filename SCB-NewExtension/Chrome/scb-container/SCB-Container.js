const DEBUG = true;
if (document.location.href.indexOf('?') == -1) { } else {
    var clickBaitLink = document.location.href.split('?url=')[1];
    decodeURIComponent(clickBaitLink);
    clickBaitLink = clickBaitLink.split('?')[0];
}
//var userID = chrome.storage.local.get("userID");

// Get the current color from Chrome storage and set the custom colors in the document.
chrome.storage.local.get('selectedColor', function (items) {
    setElementColors(items.selectedColor);
})

sortCommentsByVotes();

if (DEBUG) {
    processingCommentList({
        "comments": [
            {
                "id": 2,
                "timestamp": 14900000050,
                "commentText": "Hello!",
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
    var xhr = new XMLHttpRequest();
    var content = "";
    xhr.open('POST', 'https://server.stopclickbait.com/getComments.php');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            content = xhr.responseText;
            processingCommentList(content);
            addEventHandlers();
        }
    }
    xhr.send("url=" + encodeURIComponent(clickBaitLink) + "&userid=" + userID);
}

// Add event handlers

function addEventHandlers() {
    // Add event listener to find selected color in settings:
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace === "local" && changes["selectedColor"]) {
            setElementColors(changes["selectedColor"].newValue);
        }
    });

    // Add event listener to sort by top-voted comment.
    var topBttn = document.getElementById("topSC");
    topBttn.addEventListener("click", function (e) {
        sortCommentsByVotes();
    });
    
    // Add event listener to sort by newest comment.
    var newBttn = document.getElementById("dateSC");
    newBttn.addEventListener("click", function (e) {
        sortCommentsByDate();
    });

    var submitCB = document.getElementById("submitCB");
    submitCB.addEventListener("focus", function () {
        var submitCB = document.getElementById("submitCB");
        document.getElementById("controlBar").style.display = "block";
        document.getElementById("charCounter").style.display = "flex";
        submitCB.style.height = 0;
        submitCB.style.paddingBottom = "20px";
        submitCB.style.height = (submitCB.scrollHeight + 20) + "px";
        document.getElementById("commentArea").style.height = (305 - submitCB.offsetHeight) + "px";
    });
    submitCB.addEventListener("focusout", function () {
        var submitCB = document.getElementById("submitCB");
        if (submitCB.value.length == 0) {
            document.getElementById("controlBar").style.display = "none";
            document.getElementById("charCounter").style.display = "none";
            submitCB.style.height = "30px";
            submitCB.style.paddingBottom = "0px";
            document.getElementById("commentArea").style.height = "265px";
        }
    });
    submitCB.oninput = () => {
        var submitCB = document.getElementById("submitCB");
        if (submitCB.value.indexOf('\n') != -1) {
            submitCB.value = submitCB.value.replace('\n', ' ');
        }
        var value = submitCB.value.length;
        document.getElementById('charCounter').innerText = (140 - value).toString();
        submitCB.style.height = 0;
        submitCB.style.height = (submitCB.scrollHeight + 0) + "px";
        document.getElementById("commentArea").style.height = (305 - submitArea.offsetHeight) + "px";
        if (submitCB.value.indexOf('\n') != -1) {
            submitCB.value = submitCB.value.replace('\n', ' ');
        }
    };

    var commentArray = document.getElementsByClassName('commentBox');
    for (var i = 0; i < commentArray.length; i++) {
        if (!commentArray[i].classList.contains('ownComment')) {
            // Set the style for the selected cards.
            commentArray[i].addEventListener("click", function (e) {
                var targ;
                if (!e) e = window.event;
                if (e.target) targ = e.target;
                else if (e.srcElement) targ = e.srcElement;
                if (targ.nodeType == 3) // defeat Safari bug
                    targ = targ.parentNode;
                if (targ.classList.contains("deleteIcon"))
                    return;
                while (!targ.classList.contains('commentBox')) {
                    targ = targ.parentNode;
                }
                targ.style.backgroundColor = "";
                if (targ.classList.contains("clickedCommentBox")) {
                    targ.classList.remove("clickedCommentBox");
                } else {
                    targ.classList.add("clickedCommentBox");
                }
            });

            // Set the style for when the card is clicked
            commentArray[i].addEventListener("mousedown", function (e) {
                var targ;
                if (!e) e = window.event;
                if (e.target) targ = e.target;
                else if (e.srcElement) targ = e.srcElement;
                if (targ.nodeType == 3) // defeat Safari bug
                    targ = targ.parentNode;
                if (targ.classList.contains("deleteIcon"))
                    return;

                while (!targ.classList.contains('commentBox')) {
                    targ = targ.parentNode;
                }
                // Potentially darken the shade of the color here...
            });
        }
    }

    // Set the event listener and actions for the delete buttons.
    var deleteIcons = document.getElementsByClassName("deleteIcon");
    for (i = 0; i < deleteIcons.length; i++) {
        if (deleteIcons[i].parentNode.parentNode.classList.contains('ownComment')) {
            deleteIcons[i].onclick = function (e) {
                var targ;
                if (!e) e = window.event;
                if (e.target) targ = e.target;
                else if (e.srcElement) targ = e.srcElement;
                if (targ.nodeType == 3) // defeat Safari bug
                    targ = targ.parentNode;
                console.log(targ);
                var deleteButtons = document.getElementsByClassName('deleteButtons')
                for (i = 0; i < deleteButtons.length; i++) {
                    if (deleteButtons[i].parentNode == targ.parentNode.parentNode) {
                        targ.parentNode.parentNode.style.pointerEvents = "none";
                        targ.parentNode.parentNode.classList.remove("clickedCommentBox");
                        targ.parentNode.parentNode.classList.add("blockedCommentBox");
                        deleteButtons[i].style.display = "unset";
                    }
                }
            };
        } else {
            deleteIcons[i].style.display = "none";
        }
    }

    var cancelDeleteButtons = document.getElementsByClassName("cancelButton");
    for (i = 0; i < cancelDeleteButtons.length; i++) {
        cancelDeleteButtons[i].onclick = function (e) {
            var targ;
            if (!e) e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3) // defeat Safari bug
                targ = targ.parentNode;
            console.log(targ);
            var deleteButtons = targ.parentNode;
            targ.parentNode.parentNode.style.pointerEvents = "";
            targ.parentNode.parentNode.classList.add("clickedCommentBox");
            targ.parentNode.parentNode.classList.remove("blockedCommentBox");
            deleteButtons.style.display = "none";
        };
    }

    var cancelDeleteButtons = document.getElementsByClassName("deleteButton");
    for (i = 0; i < cancelDeleteButtons.length; i++) {
        cancelDeleteButtons[i].onclick = function (e) {
            var targ;
            if (!e) e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3) // defeat Safari bug
                targ = targ.parentNode;
            console.log(targ);
            var deleteButtons = targ.parentNode;
            deleteButtons.style.display = "flex";
            deleteButtons.style.justifyContent = "center";
            deleteButtons.style.verticalAlign = "middle";
            deleteButtons.style.alignItems = "center";
            deleteButtons.innerHTML = '<span style="color: #828282 !important; text-align: center">' + chrome.i18n.getMessage('postDeleted') + '</span>';
        };
    }

    var cancelPostButton = document.getElementById('btnClose');
    cancelPostButton.addEventListener("click", function () {
        var submitArea = document.getElementById("submitCB");
        submitArea.value = "";
        document.getElementById("controlBar").style.display = "none";
        document.getElementById("charCounter").style.display = "none";
        document.getElementById("commentArea").style.height = "265px";
        submitArea.style.height = "30px";
        submitArea.style.paddingBottom = "0px";
    });

    var pollButtonYes = document.getElementById("pollButtonYes")
    var pollButtonNo = document.getElementById("pollButtonNo")
    pollButtonYes.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("pollButtonArea").style.display = "none";
        document.getElementById("pollAnswerYes").style.display = "unset";
        document.getElementById("pollAnswerNo").style.display = "unset";
        document.getElementById("pollAnswerBar").style.justifyContent = "space-between";
        if (!DEBUG) {
            var xhr = new XMLHttpRequest();
            var content = "";
            xhr.open('POST', 'https://server.stopclickbait.com/voting.php');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    content = xhr.responseText;
                    processingVotingResults(content);
                }
            }
            xhr.send("url=" + encodeURIComponent(clickBaitLink) + "&userid=" + userID + "&vote=yes");
        } else {
            processingVotingResults(JSON.parse('{ "no": "5", "yes": "95" }'));
        }
    });
    pollButtonNo.addEventListener("click", function () {
        document.getElementById("pollButtonArea").style.display = "none";
        document.getElementById("pollAnswerYes").style.display = "unset";
        document.getElementById("pollAnswerNo").style.display = "unset";
        document.getElementById("pollAnswerBar").style.justifyContent = "space-between";
        if (!DEBUG) {
            var xhr = new XMLHttpRequest();
            var content = "";
            xhr.open('POST', 'https://server.stopclickbait.com/voting.php');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    content = xhr.responseText;
                    processingVotingResults(content);
                }
            }
            xhr.send("url=" + encodeURIComponent(clickBaitLink) + "&userid=" + userID + "&vote=no");
        } else {
            processingVotingResults(JSON.parse('{ "no": "95", "yes": "5" }'));
        }
    });


    var reportLinks = document.getElementsByClassName('reportLinkA');
    for (var i in reportLinks) if (reportLinks.hasOwnProperty(i)) {
        reportLinks[i].addEventListener('click', (e) => {
            var targ;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3) // defeat Safari bug
                targ = targ.parentNode;
            if (!DEBUG) {
                var xhr = new XMLHttpRequest();
                var content = "";
                xhr.open('POST', 'https://server.stopclickbait.com/report.php');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send('userID=' + userID + "&reportID=" + targ.parentNode.parentNode.parentNode.parentNode.parentNode.id);
            } else {
            }
            targ.style.color = "green";
            targ.innerHTML = chrome.i18n.getMessage("Thanks") + "!";
            e.stopPropagation();
        });


    }

}

function processingCommentList(content) {
    for (var i in content.comments) if (content.comments.hasOwnProperty(i)) {
        var comment = content.comments[i];
        createCommentBox(comment.id, comment.timestamp, comment.commentText, comment.userName, comment.starCount, comment.ownComment);
    }
}


function processingVotingResults(results) {
    var pollAnswerNo = document.getElementById('pollAnswerNo');
    var pollAnswerYes = document.getElementById('pollAnswerYes');
    var pollBar = document.getElementById('pollBar');
    pollBar.value = results.yes;
    pollAnswerNo.innerText = chrome.i18n.getMessage("notClickbait") + "\n" + results.no + "%";
    pollAnswerYes.innerText = "CLICKBAIT\n" + results.yes + "%";
}

function createCommentBox(commentId, timestamp, content, userNameString, voteNumber, ownComment) {
    var commentArea = document.getElementById("commentArea");
    var commentBox = commentArea.appendChild(document.createElement('div'));
    var commentLeft = commentBox.appendChild(document.createElement('div'));
    var commentText = commentLeft.appendChild(document.createElement('div'));
    var commentContent = commentText.appendChild(document.createElement('p'));
    var userArea = commentLeft.appendChild(document.createElement('div'));
    var userName = userArea.appendChild(document.createElement('span'));
    var separator = userArea.appendChild(document.createElement('span'));
    var reportLink = userArea.appendChild(document.createElement('span'));
    var reportLinkA = reportLink.appendChild(document.createElement('a'));
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

    if (ownComment)
        commentBox.classList.add('ownComment');

    commentLeft.classList.add('commentLeft');

    commentText.classList.add('commentText');

    commentContent.innerText = content;

    userArea.classList.add('userArea');

    userName.classList.add('userName');
    userName.innerText = userNameString;

    separator.classList.add('separator');
    separator.innerText = '|';

    reportLink.classList.add('reportLink');

    reportLinkA.href = "#";
    reportLinkA.setAttribute('data-localize', 'report');
    reportLinkA.classList.add('reportLinkA');
    reportLinkA.innerText = "report";

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


function sortCommentsByVotes() {
    document.getElementById("topSC").style.fontWeight = "bold";
    document.getElementById("dateSC").style.fontWeight = "normal";

    var newBttn = document.getElementById("dateSC"); 
    var commentCards = document.getElementById("commentArea").children;
    var sortCards = Array.prototype.slice.call(commentCards, 0);
    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            // Get the vote number for each comment:
            var valA = parseInt(a.children[1].children[2].innerHTML);
            var valB = parseInt(b.children[1].children[2].innerHTML);
            return (valA - valB);
        });
        // Append the cards back in the correct order:
        var commentParent = document.getElementById("commentArea");
        commentParent.innerHTML = "";
        for (var i = (sortCards.length - 1); i => 0; i--) {
            commentParent.appendChild(sortCards[i]);
        } 
    }
    else return;
}

function sortCommentsByDate() {
    document.getElementById("topSC").style.fontWeight = "normal";
    document.getElementById("dateSC").style.fontWeight = "bold";

    var commentCards = document.getElementById("commentArea").children;
    var sortCards = Array.prototype.slice.call(commentCards, 0);
    if (sortCards.length > 1) {
        sortCards.sort(function (a, b) {
            // Get the timestamp:
            var valA = parseInt(a.dataset.timestamp);
            var valB = parseInt(b.dataset.timestamp);
            return (valA - valB);
        });
        // Append the cards back in the correct order:
        var commentParent = document.getElementById("commentArea");
        commentParent.innerHTML = "";
        for (var i = (sortCards.length - 1); i => 0; i--) {
            commentParent.appendChild(sortCards[i]);
        }
    }
    else return;
}

function setElementColors(color) {
    var a = document.styleSheets;
    for (var i in a) if (a.hasOwnProperty(i)) {
        var b;
        (a[i].cssRules) ? b = a[i].cssRules : b = a[i].rules;
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
