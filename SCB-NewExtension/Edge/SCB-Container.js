const DEBUG = true;
if (document.location.href.indexOf('?') == -1) { } else {
    var clickBaitLink = document.location.href.split('?url=')[1];
    decodeURIComponent(clickBaitLink);
    clickBaitLink = clickBaitLink.split('?')[0];
}
//var userID = chrome.storage.local.get("userID");

if (DEBUG) {
    createCommentBox(1, "Hello!", "testUser", 23, false);
    createCommentBox(2, "Hello!", "myUserName", 17, true);
    createCommentBox(3, "This is a comment which is the maximum length of 140 characters long. So the design of the longest comment a user can make can be seen. #SCB", "testUser3", 12, false);
    createCommentBox(4, "Hello!", "testUser4", 10, false);
    createCommentBox(5, "Hello!", "testUser5", 8, false);
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
    var submitArea = document.getElementById("submitCB");
    submitArea.addEventListener("focus", function () {
        var submitArea = document.getElementById("submitCB");
        document.getElementById("controlBar").style.display = "flex";
        document.getElementById("commentArea").style.display = "none";
        document.getElementById("sortingArea").style.display = "none";
        document.getElementById("pollBar").style.display = "none";
        document.getElementById("pollAnswerBar").style.display = "none";
        submitArea.style.height = "340px";
        submitArea.removeAttribute("rows");
    });
    submitArea.addEventListener("focusout", function () {
        var submitArea = document.getElementById("submitCB");
        if (submitArea.value.length == 0) {
            document.getElementById("controlBar").style.display = "none";
            document.getElementById("commentArea").style.display = "";
            document.getElementById("sortingArea").style.display = "";
            document.getElementById("pollBar").style.display = "";
            document.getElementById("pollAnswerBar").style.display = "";
            submitArea.style.height = "30px";
            submitArea.setAttribute("rows", "1");
        }
    });

    var commentArray = document.getElementsByClassName('commentBox');
    for (var i = 0; i < commentArray.length; i++) {
        if (!commentArray[i].classList.contains('ownComment')) {
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
                targ.style.backgroundColor = "#2a4887";

            });
        }
    }

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
            deleteButtons.innerHTML = '<span style="top: 35%; left: 35%; position: absolute;">Post deleted.</span>';
        };
    }

    var cancelPostButton = document.getElementById('btnClose');
    cancelPostButton.addEventListener("click", function () {
        var submitArea = document.getElementById("submitCB");
        submitArea.value = "";
        document.getElementById("controlBar").style.display = "none";
        document.getElementById("commentArea").style.display = "";
        document.getElementById("sortingArea").style.display = "";
        document.getElementById("pollBar").style.display = "";
        document.getElementById("pollAnswerBar").style.display = "";
        submitArea.style.height = "30px";
        submitArea.setAttribute("rows", "1");
    });

    var pollButtonYes = document.getElementById("pollButtonYes")
    var pollButtonNo = document.getElementById("pollButtonNo")
    pollButtonYes.addEventListener("click", function () {
        document.getElementById("pollButtonArea").style.display = "none";
        document.getElementById("pollQuestion").style.display = "none";
        document.getElementById("pollAnswerYes").style.display = "unset";
        document.getElementById("pollAnswerNo").style.display = "unset";

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
            //JSON.parse('{ "no": "10", "yes": "90" }', (key, value) => processingVotingResults(key, value));
           processingVotingResults(JSON.parse('{ "no": "5", "yes": "95" }'));
        }
    });
    pollButtonNo.addEventListener("click", function () {
        document.getElementById("pollButtonArea").style.display = "none";
        document.getElementById("pollQuestion").style.display = "none";
        document.getElementById("pollAnswerYes").style.display = "unset";
        document.getElementById("pollAnswerNo").style.display = "unset";
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
}

function processingCommentList(content) {

}

function processingVotingResults(results) {
    var pollAnswerNo = document.getElementById('pollAnswerNo');
    var pollAnswerYes = document.getElementById('pollAnswerYes');
    var pollBar = document.getElementById('pollBar');
    pollBar.value = results.yes;
    pollAnswerNo.innerText = "No:  " + results.no + "%";
    pollAnswerYes.innerText = "Yes:  " + results.yes + "%";
}

function createCommentBox(commentId, content, userNameString, voteNumber, ownComment) {
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
    var deleteIcon = voteArea.appendChild(document.createElement('button'));
    var upvoteStar = voteArea.appendChild(document.createElement('span'));
    var upvotes = voteArea.appendChild(document.createElement('span'));
    var deleteButtons = commentBox.appendChild(document.createElement('div'));
    var deleteButton = deleteButtons.appendChild(document.createElement('button'));
    var cancelButton = deleteButtons.appendChild(document.createElement('button'));

    commentBox.classList.add('commentBox');
    commentBox.id = 'comment-' + commentId;

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
    deleteButton.innerText = 'Delete';

    cancelButton.classList.add('cancelButton');
    cancelButton.innerText = 'Cancel';

}