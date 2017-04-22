'use strict';
const DEBUG = true;
var myID = chrome.runtime.id

function prepare() {
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `.__clickbait_text {
display: inline-block;
margin-left: 1em;
}

._42nr > span::before {
content: "" !important;
}

._4x9_, ._a7s ._524d a, ._a7s ._50u4, ._1ysv {
padding: 0px !important;
}

.__clickbait_btn {
margin-right: 5px;
}

._zw3 {
    padding: 8px 4px 4px 0 !important;
}

._3m9g {
    padding-left: 0 !important;
}


.st0 {
        fill: #AFB4BD;
        }

.SCBcards {
            width: 500px;
            height: 420px;
            position: absolute;
    z-index: 5;
    background-color: white;
            border: 1px solid #cfcfcf;
    box-shadow: 2px 2px 0px 0px rgba(255, 255, 255, 0.5), 0px 0px 2px 2px rgba(255, 255, 255, 0.5);
            overflow: hidden;
    }

    svg {
        transform: translate(0, 2px);
    }

    .__clickbait_reveal_line {
        padding: 2px;
    margin-top: 11px;
    margin-left: 1px;
    box-shadow: 2px 2px 2px 2px rgba(0,0,0,0.4);
    }

`;
    document.head.appendChild(css);
}

// counter that increments to generate a new ID
var uniqueIds = 1;

function loop() {
    var allLinks = document.querySelectorAll('a._52c6');
    var qualifyingLinks = [];

    for (var i = 0; i < allLinks.length; i++) {
        var node = allLinks.item(i);
        if (!node.classList.contains("__clickbait_link")) {
            node.classList.add("__clickbait_link");
            var realUrl = decodeURIComponent(node.href);
            if (realUrl.indexOf('l.php?u=') != -1) {
                realUrl = realUrl.substring(realUrl.indexOf('l.php?u=') + 'l.php?u='.length);
                realUrl = realUrl.substring(0, realUrl.indexOf('&h='));
            }

            var spanContainer2 = node;
            while (!spanContainer2.classList.contains('fbUserContent')) {
                spanContainer2 = spanContainer2.parentNode;
            }
            var RevealLine = spanContainer2.childNodes[0].childNodes[2].childNodes[3];
            var actionBar = spanContainer2.childNodes[1].childNodes[0].childNodes[3];
            for (var j = 0; j < actionBar.childNodes.length; j++) {
                if (actionBar.childNodes[j].classList.contains('_37uu')) {
                    actionBar = actionBar.childNodes[j];
                }
            }

             actionBar = actionBar.childNodes[0].childNodes[0];
            for (var j = 0; j < actionBar.childNodes.length; j++) {
                if (actionBar.childNodes[j].classList.contains('clearfix')) {
                    actionBar = actionBar.childNodes[j];
                }
            }
            for (j = 0; j < actionBar.childNodes.length; j++) {
                if (actionBar.childNodes[j].classList.contains('_524d')) {
                    actionBar = actionBar.childNodes[j];
                }
            }

            revealLine(RevealLine, realUrl, uniqueIds);

            actionBar = actionBar.childNodes[0];
            var CBButtonSpan = document.createElement('span');
            CBButtonSpan.appendChild(document.createElement('a'));
            var CBButtonLink = CBButtonSpan.childNodes[0];

            CBButtonLink.classList.add('__clickbait_btn');
            CBButtonLink.href = '#';
            CBButtonLink.setAttribute('data-url', realUrl);
            CBButtonLink.innerHTML = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="5px" width="16px" height="16px" viewBox="0 0 72 72" style="enable-background:new 0 0 72 72;" xml:space="preserve"><g id="loading"><g><path class="st0" d="M20.5,4c-1.1,0.1-1.9,1-1.8,2.1l0.5,7.6c0.1,1.1,1,1.9,2.1,1.8c1.1-0.1,1.9-1,1.8-2.1l-0.5-7.6C22.5,4.7,21.6,3.9,20.5,4z"/><path class="st0" d="M11.6,8.9c-0.7-0.8-2-1-2.8-0.2s-0.9,2-0.2,2.8l4.9,5.8c0.4,0.5,1.1,0.7,1.7,0.7c0.4,0,0.8-0.2,1.1-0.5c0.8-0.7,1-2,0.2-2.8L11.6,8.9z"/><path class="st0" d="M3.6,21.7l7.4,1.8c0.2,0.1,0.4,0.1,0.6,0.1c0.8-0.1,1.6-0.6,1.8-1.5c0.3-1.1-0.4-2.1-1.4-2.4l-7.4-1.8c-1.1-0.3-2.1,0.4-2.4,1.5C1.9,20.4,2.6,21.5,3.6,21.7z"/><path class="st0" d="M13.8,27.5c-0.4-1-1.6-1.5-2.6-1.1l-7.1,2.9c-1,0.4-1.5,1.6-1.1,2.6c0.3,0.8,1.2,1.3,2,1.2c0.2,0,0.4-0.1,0.6-0.1l7.1-2.9C13.7,29.7,14.2,28.5,13.8,27.5z"/><path class="st0" d="M26.5,16.8c0.4,0.2,0.8,0.3,1.2,0.3c0.6,0,1.2-0.4,1.6-0.9l4-6.5c0.6-0.9,0.3-2.2-0.6-2.8c-0.9-0.6-2.2-0.3-2.8,0.6l-4,6.5C25.3,15,25.6,16.3,26.5,16.8z"/></g></g><g id="arrow_cursor"><g id="_x35_0-arrrow-cursor.png"><g><path class="st0" d="M50.3,40.5L65,31.6c0,0,0.3-0.2,0.4-0.3c0.9-0.9,0.9-2.3,0-3.1c-0.3-0.3-0.7-0.5-1.1-0.6l0,0c-4.2-1-43.7-8.2-43.7-8.2l0,0c-0.7-0.2-1.5,0.1-2,0.6c-0.6,0.6-0.8,1.3-0.6,2l0,0L24.6,53l3.1,12.1c0.1,0.4,0.3,0.9,0.6,1.2c0.9,0.9,2.3,0.9,3.1,0c0.1-0.2,0.4-0.5,0.4-0.5c0,0,9.2-15.9,9.2-15.9L60.1,69l9.4-9.4L50.3,40.5z"/></g></g></g></svg><span style="margin-left: 6px;">#SCB</span>';

            CBButtonLink.id = `__clickbait_btn_${(uniqueIds)}`;
            CBButtonLink.addEventListener('click', function (e) { displaySCBContainer(e); })
            //CBButtonLink.style.float = "right";
            actionBar.appendChild(CBButtonSpan);
            uniqueIds++;


            var FBPageLink = spanContainer2.childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].href;
        }
    }
}

function init() {
    prepare();
    document.onscroll = loop;
    loop();
}

function moveTopComment(e) {
    var targ;
    if (!e) e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;
    var TopComment = targ.parentNode.parentNode.parentNode.parentNode.parentNode;
    window.setTimeout(function () {
        if (TopComment.childNodes[0].classList.contains('_3m9g')) {
            TopComment = TopComment.childNodes[0];
            var temp = TopComment.parentNode;
            temp.removeChild(TopComment);
            temp.appendChild(TopComment);
        }
    }, 1000);
}

function displaySCBContainer(e) {
    var targ;
    if (!e) e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;
    while (!targ.classList.contains('__clickbait_btn')) {
        targ = targ.parentNode;
    }
    if (document.getElementById("SCBinterface")) {
        for (var i = 0; i < targ.parentNode.childNodes.length; i++) {
            if (targ.parentNode.childNodes[i].id == "SCBinterface") {
                targ.parentNode.removeChild(targ.parentNode.childNodes[i]);
                return;
            }
        }
        document.getElementById("SCBinterface").parentNode.removeChild(document.getElementById("SCBinterface"));
    }
    var link = targ.getAttribute('data-url');
    var cardDiv = document.createElement('div');
    cardDiv.classList.add('SCBcards');
    cardDiv.style.top = "38.1px";
    cardDiv.style.left = "0px";
    cardDiv.id = "SCBinterface";
    cardDiv.style.backgroundColor = "#99ccff";
    var card = document.createElement('iframe');
    card.style.top = "0px";
    card.classList.add("SCBcards");
    card.style.left = "0px";
    card.id = "SCBinterfaceIFRAME"
    card.setAttribute('scrolling', 'no');
    card.src = chrome.runtime.getURL('SCB-Container.html') + '?url=' + encodeURIComponent(link);
    targ.parentNode.appendChild(cardDiv);
    cardDiv.appendChild(card);
    //window.setTimeout(function () { cardDiv.style.height = card.clientHeight; }, 2000);
}

function getURLParameter(name) {
    var value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}

function revealLine(element, realURL, id) {
    //var userID = chrome.storage.local.get("userID");
    realURL = realURL.substring(0, realURL.indexOf('?'));
    element.classList.add('_5pbx');
    element.classList.add('__clickbait_reveal_line');
    element.id = '__clickbait_reveal_line_' + id;
    if (!DEBUG) {
        var xhr = new XMLHttpRequest();
        var content = "";
        xhr.open('POST', 'https://server.stopclickbait.com/getTopComment.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                content = xhr.responseText;
                element.innerText = content;
            }
        }
        xhr.send("url=" + encodeURIComponent(realURL) + "&userid=" + userID);
    } else {
        element.innerText = "This is a StopClickBait test.";
    }
}

init();