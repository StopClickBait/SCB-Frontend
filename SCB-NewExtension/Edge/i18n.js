function replace_i18n(obj, tag) {
    var msg = tag.replace(/__MSG_(\w+)__/g, function (match, v1) {
        console.log(chrome.i18n.getMessage(v1));
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if (msg != tag) obj.innerHTML = msg;
}

function localizeHtmlPage() {
    // Localize using __MSG_***__ data tags
    var data = document.querySelectorAll('[data-localize]');

    for (var i in data) if (data.hasOwnProperty(i)) {
        var obj = data[i];
        var tag = obj.getAttribute('data-localize').toString();

        replace_i18n(obj, tag);
    }

    var data2 = document.querySelectorAll('[data-localize-placeholder]');
    var obj2 = data2[0];
    var tag2 = obj2.getAttribute('data-localize-placeholder').toString();
    var msg2 = tag2.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
    obj2.setAttribute('placeholder', msg2);

    // Localize everything else by replacing all __MSG_***__ tags
    var page = document.getElementsByTagName('body');

    for (var j = 0; j < page.length; j++) {
        var obj = page[j];
        var tag = obj.innerHTML.toString();

        replace_i18n(obj, tag);
    }
}

localizeHtmlPage();