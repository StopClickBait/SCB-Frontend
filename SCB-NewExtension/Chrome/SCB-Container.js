var submitArea = document.getElementById("submitCB");
submitArea.addEventListener("focus", function (e) {
    document.getElementById("controlBar").style.display = "flex";
    document.getElementById("commentArea").style.display = "none";
    e.target.style.height = "300px";
    e.target.removeAttribute("rows");
});
submitArea.addEventListener("blur", function (e) {
    document.getElementById("controlBar").style.display = "none";
    document.getElementById("commentArea").style.display = "unset";
    e.target.style.height = "30px";
    e.target.setAttribute("rows", "1");
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
        
        targ.classList.add("clickedCommentBox");
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