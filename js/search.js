var keyboard_gr = [
{"name":"Α", "value":"Α"},
{"name":"Β", "value":"Β"},
{"name":"Γ", "value":"Γ"},
{"name":"Δ", "value":"Δ"},
{"name":"Ε", "value":"Ε"},
{"name":"Ζ", "value":"Ζ"},
{"name":"Η", "value":"Η"},
{"name":"Θ", "value":"Θ"},
{"name":"Ι", "value":"Ι"},
{"name":"Κ", "value":"Κ"},
{"name":"Λ", "value":"Λ"},
{"name":"Μ", "value":"Μ"},
{"name":"Ν", "value":"Ν"},
{"name":"Ξ", "value":"Ξ"},
{"name":"Ο","value":"Ο"},
{"name":"Π", "value":"Π"},
{"name":"Ρ", "value":"Ρ"},
{"name":"Σ", "value":"Σ"},
{"name":"Τ", "value":"Τ"},
{"name":"Υ", "value":"Υ"},
{"name":"Φ", "value":"Φ"},
{"name":"Χ", "value":"Χ"},
{"name":"Ψ", "value":"Ψ"},
{"name":"Ω", "value":"Ω"},
 {"name":".","value":"."},{"name":",", "value":","},{"name":";", "value":";"}, {"name":"!","value":"!"},{"name":"-","value":"-"},{"name":"'","value":"'"}, {"name":":","value":":"},{"name":"+","value":"+"},{"name":"/","value":"/"},
{"name": "1", "value":"1"},{"name": "2", "value":"2"},{"name": "3", "value":"3"},{"name": "4", "value":"4"},
{"name": "5", "value":"5"},{"name": "6", "value":"6"},{"name": "7", "value":"7"},{"name": "8", "value":"8"},{"name": "9", "value":"9"},{"name": "0", "value":"0"},
{"name":"space", "value":" "}
];

var keyboard_en = [{
        "name": "A",
        "value": "A"
    },
    {
        "name": "B",
        "value": "B"
    },
    {
        "name": "C",
        "value": "C"
    },
    {
        "name": "D",
        "value": "D"
    },
    {
        "name": "E",
        "value": "E"
    },
    {
        "name": "F",
        "value": "F"
    },
    {
        "name": "G",
        "value": "G"
    },
    {
        "name": "H",
        "value": "H"
    },
    {
        "name": "I",
        "value": "I"
    },
    {
        "name": "J",
        "value": "J"
    },
    {
        "name": "K",
        "value": "K"
    },
    {
        "name": "L",
        "value": "L"
    },
    {
        "name": "M",
        "value": "M"
    },
    {
        "name": "N",
        "value": "N"
    },
    {
        "name": "O",
        "value": "O"
    },
    {
        "name": "P",
        "value": "P"
    },
    {
        "name": "Q",
        "value": "Q"
    },
    {
        "name": "R",
        "value": "R"
    },
    {
        "name": "S",
        "value": "S"
    },
    {
        "name": "T",
        "value": "T"
    },
    {
        "name": "U",
        "value": "U"
    },
    {
        "name": "V",
        "value": "V"
    },
    {
        "name": "W",
        "value": "W"
    },
    {
        "name": "X",
        "value": "X"
    },
    {
        "name": "Y",
        "value": "Y"
    },
    {
        "name": "Z",
        "value": "Z"
    },
];
function Search(idnam) {
    this.idnam = idnam;
}
Search.prototype = new BaseObject();
Search.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(0, 15, "search");
    e.style.width = "1280px";
    e.style.height = "720px";
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();

	var l = createClassDiv("", "", "input-header");
	l.innerHTML = "Αναζήτηση";
	this.elem.appendChild(l);

    var e = new SearchInput("search-input", 0, 3);
    e.init(this.elem, 0, 0);

	var l = createClassDiv("", "", "results-header");
	l.innerHTML = "Αποτελέσματα Αναζήτησης";
	this.elem.appendChild(l);

    var e = new SearchKeyboard("search-keyboard", 0, 3);
    e.init(this.elem, 0, 0);
}



function SearchInput(idnam) {
    this.idnam = idnam;
    this.inputText = "";
    this.letterUpperLimit = 2;
    this.firstTime = true;
}
SearchInput.prototype = new BaseObject();
SearchInput.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(68, 0, "input-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    this.inputDiv = createClassDiv(10, 0, "input-div");
    this.inputDiv.appendChild(document.createElement("span"));
    this.elem.appendChild(this.inputDiv);
    this.setText(this.inputText);
}

SearchInput.prototype.setFocused = function (otherobj, focus) {
    llog("[SearchInput.prototype.setFocused]");
    if (focus) this.inputDiv.addClass("focused");
    else this.inputDiv.removeClass("focused");
}

SearchInput.prototype.setText = function (text) {
    llog("[SearchInput.prototype.setText] text: ", text);
    this.elem.getElementsByClassName("input-div")[0].getElementsByTagName("span")[0].innerHTML = text;
    this.inputText = text;
   if (this.inputText.length > this.letterUpperLimit) this.search();
}

SearchInput.prototype.appendText = function (character) {
    if (this.firstTime == true) {
        this.inputText = "";
        this.firstTime = false;
        this.setText(this.inputText);
    }

    this.inputText += character;
    this.setText(this.inputText);
}
SearchInput.prototype.deleteChar = function () {
    this.inputText = this.inputText.substring(0, this.inputText.length - 1);
    this.setText(this.inputText);
  //  this.getSuggestions();
}

SearchInput.prototype.deleteAll = function () {
    this.inputText = this.inputText.substring(0, 0);
    this.setText(this.inputText);
    /*if(GLOBALS.focusmgr.getObject("search-results")){
        var e = GLOBALS.focusmgr.getObject("search-results");
        e.parent.removeChild(e.elem);
    }*/

    if (GLOBALS.focusmgr.getObject("search-results-list")) {
        var obj = GLOBALS.focusmgr.getObject("search-results-list");
        obj.elem.style.visibility = "hidden";
        obj.hideFocus();
    }

    //this.getSuggestions();
}

SearchInput.prototype.getSuggestions = function () {
    if (GLOBALS.focusmgr.getObject("search-suggestions")) {
        var obj = GLOBALS.focusmgr.getObject("search-suggestions");
        obj.close();
    }
    if (this.inputText.length < this.letterUpperLimit) return;
    var me = this,
        url = "/pub/smarttv/ert/dyn/feed_search.php?keyword=" + this.inputText + "&rows=10&type=full";
    if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/dyn/feed_search.php?keyword=" + this.inputText + "&rows=10&type=full";
    llog("[SearchInput.prototype.getSuggestions] url: ", url);
    this.req = createHttpRequest(url, function (ret) {
        me.req = null;

        var d = JSON.parse(ret);
        if (d.length == 0) {
            if (GLOBALS.focusmgr.getObject("search-results")) {
                var e = GLOBALS.focusmgr.getObject("search-results");
                e.elem.style.visibility = "hidden";
            }
            return;
        }

        if (d) {
            data = {
                "data": d
            };
        }

        if (!GLOBALS.focusmgr.getObject("search-suggestions")) {
            var e = new SearchSuggestions("search-suggestions");
            e.init(me.parent, 0, 0);
        } else var e = GLOBALS.focusmgr.getObject("search-suggestions");
        e.load(JSON.stringify(data));
        e.elem.style.visibility = "visible";

        if (!GLOBALS.focusmgr.getObject("search-results")) var e = new SearchResults("search-results");
        else {
            var e = GLOBALS.focusmgr.getObject("search-results");
            e.parent.removeChild(e.elem);
        }
        e.init(me.parent, 0, 0);
        llog("[SearchInput.prototype.getSuggestions] data: ", data);
        e.load(JSON.stringify(data));
    });
}

SearchInput.prototype.search = function () {
    var me = this,
      url = "search.php?keyword=" + encodeURIComponent(this.inputText);
    this.req = createHttpRequest(url, function (ret) {
        me.req = null;
        if (!GLOBALS.focusmgr.getObject("search-results")) var e = new SearchResults("search-results");
        else {
            var e = GLOBALS.focusmgr.getObject("search-results");
            e.parent.removeChild(e.elem);
        }
        e.init(me.parent, 0, 0);
        e.load(ret);
        
        return true;
        
    });
}


SearchInput.prototype.handleKeyPress = function (keyCode) {
    if (keyCode === VK_RED) {
        this.onRed();
    }
    if (keyCode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keyCode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keyCode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    llog("[SearchInput.prototype.handleKeyPress]");
    switch (keyCode) {
        case VK_BACK:
            GLOBALS.scenemgr.goBack();
            break;
        case VK_RIGHT:
            llog("[SearchInput.prototype.handleKeyPress] VK_RIGHT");
            var obj = GLOBALS.focusmgr.getObject("search-keyboard");
            GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
            break;
        case VK_DOWN:
            if (GLOBALS.focusmgr.getObject("search-suggestions")) GLOBALS.focusmgr.focusObject("search-suggestions", true);
            else if (GLOBALS.focusmgr.getObject("search-results")) GLOBALS.focusmgr.focusObject("search-results-list", true);
            else {
                var obj = GLOBALS.focusmgr.getObject("search-keyboard");
                GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
            }
            break;
        case VK_ENTER:
            this.search();
            break;
        default:
            break;
    }
}

function SearchResults(idnam) {
    this.idnam = idnam;
}
SearchResults.prototype = new BaseObject();
SearchResults.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(70, /*186*/ 236, "results-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    var e = createDiv(530, 10, 315, 368, "middle-item");
    e.addClass("item");
    e.style.visibility = "hidden";
    this.elem.appendChild(e);
}
SearchResults.prototype.load = function (data) {
    var d = JSON.parse(data);

	var elems = d.elems, items = [];
	for (var i = 0; i < elems.length; i++){
		var episodes = elems[i].episodes;
		if(!episodes) continue;
		items = items.concat(episodes);
	}
    var results = new SearchResultList("search-results-list", 0,0, items);
    results.inSearch = true;
   	results.initSearchResults(this.elem, 0, 0 , elems, items);
}

function SearchResultList(idnam, id) {
    this.idnam = idnam;
    this.id = id;
    this.xpos = 0;
    this.ypos = 0;
    this.focusedId = 0;
    this.atstart = true;
    this.atend = false;
    this.current = 0;
    this.itemmargin = 300;
    this.focusleft = 0;
    this.focustop = 0;
    this.parent = null;
    this.width = 0;
    this.strecke = 0;
    this.position = 0;
    this.animtimer = false;
    this.pixeltomove = 100;
}
SearchResultList.prototype = new BaseObject();
SearchResultList.prototype.init = function (parent, xpos, ypos, episodes, title) {
    var e = createClassDiv("", "", "episodes-list");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.parent = parent;

    this.episodes = episodes;

    var epslabel = createClassDiv("", "", "episodes-list-label");
    epslabel.innerHTML = title;
    this.parent.appendChild(epslabel);
    var w = this.itemmargin;
    if (this.episodes.length > 0) {
        for (var i = 0; i < this.episodes.length; i++) {
            var inner = createClassDiv("", "", "episode");
            w += this.itemmargin;

            var im = document.createElement('img');
            im.src = this.episodes[i].img;
            var titl = createClassDiv("", "", "episode-title");
            titl.innerHTML = this.episodes[i].title;

            inner.appendChild(im);
            inner.appendChild(titl);
            this.elem.appendChild(inner);
            this.buttons.push(inner);
        }
        if (this.buttons.length > 0)
            this.elem.style.width = w + "px";
    }
    if (this.buttons.length == 0) {
        var epslabel = createClassDiv("", "", "noeps");
        epslabel.innerHTML = "Δεν Υπάρχουν Επεισόδια !";
        this.elem.appendChild(epslabel);
    }
}
SearchResultList.prototype.setFocused = function (otherobj, focus) {

    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
            } else {
                if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
            }
        } else {
            if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
        }
    }

}
SearchResultList.prototype.animScrollerLeft = function () {
    if (this.strecke >= this.itemmargin) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;
        this.setFocused(this.idnam, true);

    } else {
        this.position = this.position + this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;
        this.elem.style.left = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerLeft();
        }, 40);
    }

}
SearchResultList.prototype.animScrollerRight = function () {

    if (this.strecke >= this.itemmargin) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;

        this.setFocused(this.idnam, true);

    } else {

        this.position = this.position - this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;

        this.elem.style.left = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerRight();
        }, 40);
    }

}
SearchResultList.prototype.handleKeyPress = function (keyCode) {

    if (keyCode === VK_RED) {
        this.onRed();
    }
    if (keyCode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keyCode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keyCode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keyCode) {
        case VK_RIGHT:
            if (this.animtimer) break;
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;
                break;
            }
            this.animScrollerRight();
            break;
        case VK_LEFT:
            if (this.animtimer) break;
            this.focusedId--;
            if (this.focusedId < 0) {
                this.focusedId = 0;
                break;
            }
            this.animScrollerLeft();
            break;
        case VK_UP:
		    if (GLOBALS.focusmgr.getObject("search")) {
			    GLOBALS.focusmgr.focusObject("keyboard_gr");
			    break;
		    }
            GLOBALS.focusmgr.focusObject(activelist);
            var c = document.getElementById("scene0");
            var o = GLOBALS.focusmgr.getObject("show-detail");
            o.unregister();
            o.buttons = [];
            c.removeChild(o.elem);
            break;
            break;
        case VK_ENTER:
            var o = GLOBALS.focusmgr.getObject("list-cont");
            o.stopTeaser();
            GLOBALS.scenemgr.openVideoPlayer();
            if (!GLOBALS.focusmgr.getObject("videoplayer")) {

                GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
                GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
            }

            GLOBALS.videoplayer.setSource(this.episodes[this.focusedId].mp4);
            GLOBALS.videoplayer.start();
            break;
        case VK_BACK:
            GLOBALS.focusmgr.focusObject(activelist);
            var c = document.getElementById("scene0");
            var o = GLOBALS.focusmgr.getObject("show-detail");
            o.unregister();
            o.buttons = [];
            c.removeChild(o.elem);
            break;
        default:
            break;
    }
}
SearchResultList.prototype.initSearchResults = function (parent, xpos, ypos, elems, episodes){
	
	this.itemmargin = 280;
    this.position = 0;
    if (GLOBALS.menu == "sidebar") this.position = 27;
    this.pixeltomove = 70;
	this.episodes = episodes;

    var e = createClassDiv("", "", "search-results horizontal");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.parent = parent;

    var w = 0;

    this.outer = createClassDiv("", "", "event-list");
    this.elem.appendChild(this.outer);
    
    for (var i = 0; i < elems.length; i++){
          		var episodes = elems[i].episodes;
           		if(!episodes) continue;
                for (var j = 0; j < episodes.length; j++) {
                    var inner = createClassDiv("", "", "episode");
                    inner.id = episodes[j].key;
                    w += this.itemmargin;

                    var im = document.createElement('img');
                    im.src = episodes[j].img;
                    var titl = createClassDiv("", "", "event-titl");
                    titl.innerHTML = "<strong>" + episodes[j].title + "</strong>";

                    inner.appendChild(im);
                    inner.appendChild(titl);
                    this.outer.appendChild(inner);
                    this.buttons.push(inner);
                }
    }//for 
    this.elem.style.width = w + "px";
	if(this.buttons.length > 0) GLOBALS.focusmgr.focusObject("search-results-list", true);
}

function SearchSuggestions(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.limit = 3;
    this.pointer = 0;
    this.top = 0;
}
SearchSuggestions.prototype = new BaseObject();
SearchSuggestions.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(68, 50, "suggestions-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    this.inner = createClassDiv(13, this.top, "inner");
    this.elem.appendChild(this.inner);
}
SearchSuggestions.prototype.load = function (ret) {
    llog("[SearchSuggestions.prototype.load] : " + this.inner.innerHTML);
    this.inner.innerHTML = "";
    this.buttons = [];
    try {
        var d = JSON.parse(ret);
    } catch (e) {}
    var elems = d.data;
    llog("[SearchSuggestions.prototype.load] length : " + elems.length);
    for (j = 0; j <= elems.length - 1; j++) {

        llog("[SearchSuggestions.prototype.load] elem : ", elems[j]);
        var outer = createClassDiv(0, 0, "outer");
        var titleSpan = document.createElement("span");
        titleSpan.innerHTML = elems[j].title;
        outer.appendChild(titleSpan);
        this.inner.appendChild(outer);
        this.buttons[j] = outer;
    }
}
SearchSuggestions.prototype.setFocused = function (otherobj, focus) {
    llog("[SearchSuggestions.prototype.setFocused]");
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
            } else {
                this.buttons[i].removeClass("focused");
            }
        } else {
            this.buttons[i].removeClass("focused");
        }
    }
}
SearchSuggestions.prototype.close = function () {
    /*obj.inner.innerHTML = "";
    obj.buttons = [];
    obj.elem.style.visibility = "hidden";
    */
    GLOBALS.focusmgr.unregisterObject(this);
    this.parent.removeChild(this.elem);
}
SearchSuggestions.prototype.scrollUp = function () {
    this.top += 34;
    this.inner.style.top = this.top + "px";
}
SearchSuggestions.prototype.scrollDown = function () {
    this.top -= 34;
    this.inner.style.top = this.top + "px";
}
SearchSuggestions.prototype.handleKeyPress = function (keyCode) {
    if (keyCode === VK_RED) {
        this.onRed();
    }
    if (keyCode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keyCode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keyCode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keyCode) {
        case VK_BACK:
            GLOBALS.scenemgr.goBack();
            break;
        case VK_DOWN:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;

                if (GLOBALS.focusmgr.getObject("search-results")) GLOBALS.focusmgr.focusObject("search-results-list");
                break;
            }
            if (this.focusedId - this.pointer >= this.limit) {
                this.pointer += 1;
                this.scrollDown();
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_UP:
            this.focusedId--;
            if (this.focusedId < 0) {
                this.focusedId = 0;
                //this.close();
                GLOBALS.focusmgr.focusObject("search-input", true);
                break;
            }
            if (this.pointer - this.focusedId < 0) {
                llog("[SearchSuggestions.prototype.handleKeyPress] pointer: " + this.pointer + ", focusedId: " + this.focusedId);
                if (this.pointer > 0) {
                    this.pointer -= 1;
                    this.scrollUp();
                }
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_RIGHT:
            var obj = GLOBALS.focusmgr.getObject("search-keyboard");
            GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
            break;
        case VK_ENTER:
            this.close();
            var title = this.buttons[this.focusedId].getElementsByTagName("span")[0].innerHTML;
            var obj = GLOBALS.focusmgr.getObject("search-input");
            obj.setText(title);
            obj.search();
            if (GLOBALS.focusmgr.getObject("search-results-list")) GLOBALS.focusmgr.focusObject("search-results-list");
        default:
            break;
    }
}

function KeyboardTab(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.perline = 11;
    this.numLines = 0;
    this.currentLine = 1;
}
KeyboardTab.prototype = new BaseObject();
KeyboardTab.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(0, 0, "keyboard-tab-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    this.setKeyboard();
    var lettersDiv = createClassDiv(15, 0, "letters-div");

    for (var i = 0; i < this.keyboard.length; i++) {
        var outer = createClassDiv(0, 0, "outer");
        
        if(this.keyboard[i].name == "space"){
        	var spaceimg = document.createElement("img");
        	spaceimg.src = "img/space.png";
        	spaceimg.style.width = "57px";
        	spaceimg.style.height = "auto";
        	outer.appendChild(spaceimg);
        }else{
        	var letter = document.createElement("span");
        	letter.innerHTML = this.keyboard[i].name;
        	outer.appendChild(letter);
        }
        
        lettersDiv.appendChild(outer);
        this.buttons[i] = outer;
    }

    this.numLines = Math.ceil(this.buttons.length / this.perline);

    this.elem.appendChild(lettersDiv);
}
KeyboardTab.prototype.setKeyboard = function () {
    switch (this.idnam) {
    	case "keyboard_gr":
            this.keyboard = keyboard_gr;
            break;
        case "keyboard_en":
            this.keyboard = keyboard_en;
            break;
        default:
            break;
    }
}

KeyboardTab.prototype.setFocused = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) this.buttons[i].addClass("focused");
            else this.buttons[i].removeClass("focused");
        } else this.buttons[i].removeClass("focused");
    }
}

KeyboardTab.prototype.show = function () {
    this.elem.style.visibility = "visible";
}

KeyboardTab.prototype.hide = function () {
    this.elem.style.visibility = "hidden";
}

KeyboardTab.prototype.handleKeyPress = function (keyCode) {
    if (keyCode === VK_RED) {
        this.onRed();
    }
    if (keyCode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keyCode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keyCode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keyCode) {
        case VK_BACK:
            var obj = GLOBALS.focusmgr.getObject("search-input");
            obj.deleteChar();
            //GLOBALS.scenemgr.goBack();
            break;
        case VK_LEFT:
            /*if (this.focusedId % this.perline == 0) {
                GLOBALS.focusmgr.focusObject("search-input", true);
                break;
            }*/
            this.focusedId--;
		    if (this.focusedId < 0) {
			    this.focusedId = 0;
			    var sm = GLOBALS.focusmgr.getObject("side-menu");
			    sm.elem.classList.toggle("open");
			    returnfocus = "search-input";
			    GLOBALS.focusmgr.focusObject("side-menu");
		    }
            this.setFocused(this.idnam, true);
            break;
        case VK_RIGHT:

            if (this.focusedId == 10 || this.focusedId == 21 || this.focusedId == 32 || this.focusedId == 43 || this.focusedId == this.buttons.length - 1) {
                var o = GLOBALS.focusmgr.getObject("keyboard-buttons");
                o.focusedId = 0;
                GLOBALS.focusmgr.focusObject("keyboard-buttons", true);
            } else {
                this.focusedId++;
                if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
                this.setFocused(this.idnam, true);
            }
            break;
        case VK_UP:
            this.currentLine--;
            if (this.focusedId - this.perline < 0) {
		    GLOBALS.focusmgr.focusObject("side-menu");
		    var sm = GLOBALS.focusmgr.getObject("side-menu");
		    sm.elem.classList.toggle("open");
		    returnfocus = "search-input";
            } else {
                this.focusedId -= this.perline;
                this.setFocused(this.idnam, true);
            }
            break;
        case VK_DOWN:
            this.focusedId += this.perline;
            if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
            this.currentLine++;
            if (this.currentLine > this.numLines) {
                //if((this.focusedId + this.perline) > (this.buttons.length-1)){
                if (GLOBALS.focusmgr.getObject("search-results")) {
                    GLOBALS.focusmgr.focusObject("search-results-list");
                    break;
                } else break;
            }

            this.setFocused(this.idnam, true);
            break;
        case VK_ENTER:
            var obj = GLOBALS.focusmgr.getObject("search-input");
            obj.appendText(this.keyboard[this.focusedId].value);
         //   obj.getSuggestions();
            break;
        default:
            break;
    }
}


function SearchKeyboard(idnam) {
    this.idnam = idnam;
    this.focusedId = 0
    this.ktab_idnam = 'keyboard_gr'; //keyboard tab idnam
}
SearchKeyboard.prototype = new BaseObject();
SearchKeyboard.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(49, 53, "keyboard-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

	var obj = new KeyboardTab("keyboard_gr");
    obj.init(this.elem, 15, 0);
    obj.show();
    this.buttons[0] = obj;

    var obj = new KeyboardTab("keyboard_en");
    obj.init(this.elem, 15, 0);
    obj.hide();
    this.buttons[1] = obj;


    var e = new KeyboardButtons("keyboard-buttons");
    e.init(this.elem, 0, 0);
}
SearchKeyboard.prototype.switchKeyboard = function (keyboardIdnam) {
    llog("[SearchKeyboard.prototype.switchKeyboard] parameter idnam : ", keyboardIdnam);
    for (var i = 0; i < this.buttons.length; i++) {
        llog("[SearchKeyboard.prototype.switchKeyboard] this idnam : ", this.buttons[i].idnam);
        var obj = GLOBALS.focusmgr.getObject(this.buttons[i].idnam);
        if (this.buttons[i].idnam == keyboardIdnam) obj.show();
        else obj.hide();
    }
}

var keyboard_buttons = [{
        "image_on": "img/searchicon.png",
        "image_off": "img/searchicon.png",
        "class_name": "search-btn"
    },
    {
        "image_on": "img/delete.png",
        "image_off": "img/delete.png",
        "class_name": "delete-all-btn"
    },
    {
        "image_on": "img/backspace.png",
        "image_off": "img/backspace.png",
        "class_name": "delete-char-btn"
    },
    {
        "image_on": "img/globe.png",
        "image_off": "img/globe.png",
        "class_name": "switch-keyboard-btn"
    }
];

function KeyboardButtons(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
}

KeyboardButtons.prototype = new BaseObject();
KeyboardButtons.prototype.init = function (parent, xpos, ypos) {
    this.parent = parent;
    var e = createClassDiv(718, 0, "keyboard-btn-container");
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    for (var i = 0; i < keyboard_buttons.length; i++) {
        var outer = createClassDiv(0, 0, keyboard_buttons[i].class_name);
        if (i == 5) {
            var inner = document.createElement("span");
            inner.innerHTML = "SPACE";
            outer.appendChild(inner);
            this.elem.appendChild(outer);
            this.buttons[i] = outer;
            continue;
        }
        var inner = document.createElement("img");
        inner.src = keyboard_buttons[i].image_off;
        outer.appendChild(inner);
        this.elem.appendChild(outer);
        this.buttons[i] = outer;
    }

}

KeyboardButtons.prototype.setFocused = function (otherobj, focus) {

    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) this.buttons[i].addClass("focused");
            else this.buttons[i].removeClass("focused");
        } else {
            this.buttons[i].removeClass("focused");
        }
    }
}

KeyboardButtons.prototype.handleKeyPress = function (keyCode) {
    if (keyCode === VK_RED) {
        this.onRed();
    }
    if (keyCode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keyCode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keyCode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keyCode) {
        case VK_RIGHT:

            break;
        case VK_LEFT:

            var obj = GLOBALS.focusmgr.getObject("search-keyboard");
            GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
            break;
        case VK_DOWN:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;
                if (GLOBALS.focusmgr.getObject("search-results")) GLOBALS.focusmgr.focusObject("search-results-list");
            }
            this.setFocused(this.idnam, true);

            break;
        case VK_UP:
            this.focusedId--;
            if (this.focusedId < 0) {
            	break;
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_ENTER:
            var obj = GLOBALS.focusmgr.getObject("search-input");
            if (this.focusedId == 0) {
                obj.search();
            } else if (this.focusedId == 1) {
                obj.deleteAll();
            } else if (this.focusedId == 2) {
                obj.deleteChar();
            } else if (this.focusedId == 3) {
                var obj = GLOBALS.focusmgr.getObject("search-keyboard");
                if (obj.ktab_idnam == "keyboard_gr") newtab = "keyboard_en";
                else newtab = "keyboard_gr";
                obj.ktab_idnam = newtab;
                obj.switchKeyboard(newtab);
            } 
            break;
        default:
            break;
    }
}
