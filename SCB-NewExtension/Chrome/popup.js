var loggedIn = true;
var colors = ["#000080", "#0000ff","#800020","#008080","#000000","#ffa500","#00ff00","#551a8b"];
var selectedColor;

var idsOfCustomBackgroundColor = ["postsBttn", "login" ];
var idsOfCustomTextColor = ["star_icon"];
document.getElementById("YourPosts").style.display = "none";

if(loggedIn)
{
    document.getElementById("Profile_Logged_Out").style.display = "none";
    document.getElementById("Profile_Logged_In").style.display = "block";
    addEventHandlers();
    setupColors();
} else {
    document.getElementById("Profile_Logged_In").style.display = "none";
    document.getElementById("Profile_Logged_Out").style.display = "block";
}

chrome.storage.sync.get('selectedColor', function (items) {
    if(!items) {
    chrome.storage.sync.set({'selectedColor': colors[0]}, function() {
        console.log(colors[0] + " saved to default.");
    });
    selectedColor = colors[0];
    }
    else {
        selectedColor = items.selectedColor;
        changeSelectedStyleTo(document.getElementById(selectedColor));
        console.log(items.selectedColor);
        return true;
    }
})

function setupColors() {
    for(i = 0; i < colors.length; i++) {
        var colorDiv = document.createElement("div");
        colorDiv.className = "colorButton";
        colorDiv.id = colors[i];
        colorDiv.style.backgroundColor = colors[i];
        colorDiv.addEventListener("click", function(e) {
            e.preventDefault();
            var caller = e.target || e.srcElement;

            // Set the selected color to the same as the background color. 
            selectedColor = rgb2hex(caller.style.backgroundColor);
            chrome.storage.sync.set({'selectedColor': selectedColor}, function() {
                console.log(selectedColor + " saved to default.");
            });
            changeSelectedStyleTo(caller);    
        })

        if(i == 0) {
            selectedColor = colors[i];
            colorDiv.className += " selectedColorButton";
        }
        document.getElementById("colors").appendChild(colorDiv);
    }
}
function addEventHandlers() {
    var postsBttn = document.getElementById("postsBttn");
    postsBttn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("YourPosts").style.display = "block";
        document.getElementById("Profile_Logged_In").style.display = "none";
        document.getElementById("settings").style.display = "none";
    })

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if(namespace === "sync" && changes["selectedColor"]) {
            setTextColors(changes["selectedColor"].newValue);
            setBackgroundColors(changes["selectedColor"].newValue);
        }
      });
}

function changeSelectedStyleTo(element) {
        // Remove selection styling:
        var colors = document.getElementById("colors").getElementsByTagName("div");
        for (i = 0; i < colors.length; i++)
        {
            if(colors[i].classList.contains("selectedColorButton"))
                colors[i].classList.remove("selectedColorButton");
        }
        // Add selection styling to selected div:
        element.className += " selectedColorButton";
}

function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

// Set the text colors of all the specified objects to the specified color.
function setTextColors(c) {
    for(i = 0; i < idsOfCustomTextColor.length; i ++) {
        var currentTextObject = document.getElementById(idsOfCustomTextColor[i]);
        currentTextObject.style.color = c;
    }
}

// Set the background colors of all the specified objects to the specified color.
function setBackgroundColors(c) {
    for(i = 0; i < idsOfCustomBackgroundColor.length; i ++) {
        var currentObject = document.getElementById(idsOfCustomBackgroundColor[i]);
        currentObject.style.backgroundColor = c;
    }
}