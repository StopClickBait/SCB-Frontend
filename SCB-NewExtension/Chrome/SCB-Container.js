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

var deleteIcons = document.getElementsByClassName("deleteIcon");
for (i = 0; i < deleteIcons.length; i++) {
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
    document.getElementById("pollBar").value = 10;
});

pollButtonNo.addEventListener("click", function () {
    document.getElementById("pollButtonArea").style.display = "none";
    document.getElementById("pollQuestion").style.display = "none";
    document.getElementById("pollAnswerYes").style.display = "unset";
    document.getElementById("pollAnswerNo").style.display = "unset";
    document.getElementById("pollBar").value = 10;
});