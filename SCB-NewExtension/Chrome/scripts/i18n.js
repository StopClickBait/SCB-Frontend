function localizeHtmlPage() {
    var data = document.querySelectorAll('[data-localize]');

    for (var i in data) if (data.hasOwnProperty(i)) {
        var obj = data[i];
        var tag = obj.getAttribute('data-localize').toString();
        var m2 = chrome.i18n.getMessage(tag);
        if (m2 != tag) obj.innerHTML = m2;
    }

    var data2 = document.querySelectorAll('[data-localize-placeholder]');
    for (var i in data2) if (data2.hasOwnProperty(i)) {
    var obj2 = data2[i];
    var tag2 = obj2.getAttribute('data-localize-placeholder').toString();
    var msg2 = chrome.i18n.getMessage(tag2);
    obj2.setAttribute('placeholder', msg2);
    }

}

localizeHtmlPage();