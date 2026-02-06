var activelist = activeCont = returnfocus = infotop = 0;
var focusType = slideshowOpen = true;
var CretetvData = categories = [];

var ADCATS = ["MasterChef","Starland"], NOAD = [];
function Cretetv(idnam) {
	this.idnam = idnam;
	this.focusedId = 0;
}

Cretetv.prototype = new BaseObject();
Cretetv.prototype.init = function (parent, xpos, ypos) {
	debug("INIT");
	if(VIDEO_PREVIEW) document.getElementById("appscreen").classList.add("videopreview");
	var cont = createClassDiv("", "", "movies-list");
	this.parent = parent;
	this.parent.appendChild(cont);
	this.cont = cont; 
	this.baseInit(cont);
	this.register();
	this.buttons = [];
	if (0) {
		var div = createClassDiv("", "", "issue-div");
		var msg = createClassDiv("", "", "issue-msg");
		msg.innerHTML = '<p>Μας συγχωρείτε για την βλάβη. Προσπαθούμε να το λύσουμε το συντομότερο.</p>';
		msg.innerHTML += '<p>Παρακαλούμε προσπαθήστε αργότερα.</p>';
		msg.innerHTML += '<p>Σας ευχόμαστε Καλό Πάσχα!</p>';
		div.appendChild(msg);
		this.elem.appendChild(div);
		setTimeout(function(){
		GLOBALS.focusmgr.focusObject("cretetv");
		}, 500);
		return;
	}

	var me = this;
	var url = "http://smarttv.anixa.tv/movies-new/json/moviesFull.json";
	if(location.host == "127.0.0.1") url = "./getShowsJson.php";
	

	this.req = createHttpRequest(url, function (ret) {
		debug("Got JSON response");
		me.req = null;
		me.parseJSON(ret);
	});
	 if (!VIDEO_PREVIEW) {
		GLOBALS.scenemgr.setRF();
	}
	else{
		GLOBALS.videopreview = new VideoPreview("videopreview");
		GLOBALS.videopreview.init(document.getElementById("appscreen"), 0, 0);
	}
	activeCont = this;

	debug('smid '+ GLOBALS.smid +' u: '+ navigator.userAgent);
}
var addToObject = function (obj, key, value, index) {
	var temp = {};
	var i = 0;
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			if (i === index && key && value) {
				temp[key] = value;
			}
			temp[prop] = obj[prop];
			i++;
		}
	}
	if (!index && key && value) {
		temp[key] = value;
	}
	return temp;
};

Cretetv.prototype.parseJSON = function (response) {
	var CretetvData = JSON.parse(response);
	debug("Parsed response");
	//JSONData = JSONData.HBBTV.show;
	debug("Got JSON Data:"+CretetvData);
	debug(CretetvData.genres);

	if(document.getElementsByClassName("scene-container")[0].getElementsByClassName("show-img").length == 0){
		var bg = createClassDiv("", "", "show-img");
		bg.addClass("bg1");
		document.getElementById("appscreen").appendChild(bg);
	}
	if(document.getElementsByClassName("scene-container")[0].getElementsByClassName("info-cont").length == 0){
		var info = createClassDiv("", "", "info-cont");
		var infotitl = createClassDiv("", "", "info-title");
		infotitl.innerHTML = "";
		info.appendChild(infotitl);
		var infosubtitl = createClassDiv("", "", "info-subtitle");
		info.appendChild(infosubtitl);
		var infodata = createClassDiv("", "", "info-data");
		var infodatatxt = createClassDiv("", "", "info-data-txt");
		infodatatxt.id = "infotext";
		infodatatxt.innerHTML = "";
		infodata.appendChild(infodatatxt);
		info.appendChild(infodata);
		document.getElementsByClassName("scene-container")[0].appendChild(info);
	}

	categories = Object.keys(CretetvData);

	var lc = new ListCont("list-cont", CretetvData.genres);
	lc.isInner = true;
	lc.init(this.elem, "", "");

}

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
};
Cretetv.prototype.handleKeyPress = function (keyCode) {

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
		case VK_UP:
			var s = GLOBALS.focusmgr.getObject("slideshow");
			s.elem.classList.toggle("hide");
			GLOBALS.focusmgr.focusObject("slideshow");
			break;
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				break;
			}
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_ENTER:
			break;
		default:
			break;
	}
}

function SlideShow(idnam) {
	this.idnam = idnam;
	this.focusedId = 0;
}
SlideShow.prototype = new BaseObject();
SlideShow.prototype.init = function (parent, xpos, ypos, data) {
	var e = createClassDiv("", "", "slideshow-container");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.data = data.items;

	this.slides = this.createSlides();

	this.dots = [];

	var dots = createClassDiv("", "", "dots");
	this.elem.appendChild(dots);



	for (i = 0; i < this.slides.length; i++) {
		var item = createClassDiv("", "", "slide");
		item.id = this.slides[i].key;
		var bgover = createClassDiv("", "", "bg-over");
		bgover.style.backgroundImage = "url(" + this.slides[i].image + ")";
		item.appendChild(bgover);
		var slidecont = createClassDiv("", "", "slide-container");
		var info = createClassDiv("", "", "slide-info");
		var labl = createClassDiv("", "", "slide-title");
		labl.innerHTML = this.slides[i].title;
		info.appendChild(labl);
		var infodata = createClassDiv("", "", "slide-data");
		infodata.innerHTML = this.slides[i].info['Έτος:'] + " | " + this.slides[i].info['Διάρκεια:'];
		info.appendChild(infodata);
		slidecont.appendChild(info);
		item.appendChild(slidecont);
		this.buttons.push(item);
		this.elem.appendChild(item);

		var dot = createClassDiv("", "", "slide-dot");
		this.dots.push(dot);
		dots.appendChild(dot);
	}

	this.setFocused(this.buttons[this.focusedId], true);
}
SlideShow.prototype.createSlides = function () {
	var arr = [];
	for (var i = 0; i < this.data.length; i++) {
		switch (this.data[i].key) {
			case "1c31ba7f0df7eac04ca374f674ece0a0":
				arr.push(this.data[i]);
				break;
			case "866b3f51cd2906576fd5449719e7579c":
				arr.push(this.data[i]);
				break;
			case "5cbc462faff58635ff2c94d8bfa2a401":
				arr.push(this.data[i]);
				break;
			case "f110ed13499afdf84e86d7ff141ff00c":
				arr.push(this.data[i]);
				break;
			case "c4d4656a88aaf486749c9040dfd53105":
				arr.push(this.data[i]);
				break;
			default:
				break;
		}
	}
	return arr;
}
SlideShow.prototype.setFocused = function (otherobj, focus) {

	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) {
				this.buttons[i].addClass("focused");
				this.dots[this.focusedId].addClass("active");
			} else {
				if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
				if (this.dots[i].hasClass("active")) this.dots[i].removeClass("active");
			}

		}
	}

}
SlideShow.prototype.handleKeyPress = function (keyCode) {

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
		case VK_DOWN:
			if (this.buttons[this.focusedId].hasClass("focused")) this.buttons[this.focusedId].removeClass("focused");
			if (this.dots[this.focusedId].hasClass("active")) this.dots[this.focusedId].removeClass("active");

			this.elem.style.display = "none";

			var lc = GLOBALS.focusmgr.getObject("list-cont");
			lc.elem.classList.toggle("moveTop")
			GLOBALS.focusmgr.focusObject(lc.ref + "cat-list-0");
			slideshowOpen = false;
			break;
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				returnfocus = this.idnam;
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				break;
			}
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_ENTER:
			var e = new MovieDetail("show-detail", this.slides[this.focusedId]);
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = e;
			break;
		default:
			break;
	}
}

function TopInfo(idnam) {
	this.idnam = idnam;
}
TopInfo.prototype = new BaseObject();
TopInfo.prototype.init = function (parent, xpos, ypos, data) {
	var e = createClassDiv("", "", "hidden-info");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();

	this.parseJSON();
}
TopInfo.prototype.parseJSON = function (response) {
	if (GLOBALS.focusmgr.getObject("slideshow")) {
		var sl = GLOBALS.focusmgr.getObject("slideshow")
		var bgover = createClassDiv("", "", "overlay");
		this.elem.appendChild(bgover);
		var hiddenImg = document.createElement("img");
		hiddenImg.src = sl.slides[sl.focusedId].image;
		this.elem.appendChild(hiddenImg);
		var hiddentitle = createClassDiv("", "", "title");
		hiddentitle.innerHTML = sl.slides[sl.focusedId].title;
		this.elem.appendChild(hiddentitle);
	}
}

var sideicons = [/*{
	"on": "img/home_foc.png",
	"off": "img/1. Home.svg",
	"label": "",
	"id":"home",
	"catId": 0
},*/{
	"on": "img/home_foc.png",
	"off": "img/1. Home.svg",
	"label": "Action",
	"id":"action",
	"catId": 0
}, {
	"on": "img/news_foc.png",
	"off": "img/3. News.svg",
	"label": "Adventure",
	"id":"adventure",
	"catId": 1
}, {
	"on": "img/set_foc.png",
	"off": "img/4. Psuxagogia.svg",
	"label": "Biography",
	"id":"biography",
	"catId": 2
}, {
	"on": "img/series_foc.png",
	"off": "img/5. Ntokumanter.svg",
	"label": "Comedy",
	"id":"comedy",
	"catId": 3
}, {
	"on": "img/kids_foc.png",
	"off": "img/6. Perifereia.svg",
	"label": "Crime",
	"id":"crime",
	"catId": 4
}, {
	"on": "img/epg.png",
	"off": "img/7. Programma.svg",
	"label": "Drama",
	"id":"drama",
	"catId": 5
},
{
	"on": "img/home_foc.png",
	"off": "img/1. Home.svg",
	"label": "Family",
	"id":"family",
	"catId": 6
}, {
	"on": "img/news_foc.png",
	"off": "img/3. News.svg",
	"label": "Fantasy",
	"id":"fantasy",
	"catId": 7
}, {
	"on": "img/set_foc.png",
	"off": "img/4. Psuxagogia.svg",
	"label": "Film-Noir",
	"id":"film-noir",
	"catId": 8
}, {
	"on": "img/series_foc.png",
	"off": "img/5. Ntokumanter.svg",
	"label": "History",
	"id":"history",
	"catId": 9
}, {
	"on": "img/kids_foc.png",
	"off": "img/6. Perifereia.svg",
	"label": "Horror",
	"id":"horror",
	"catId": 10
}, {
	"on": "img/epg.png",
	"off": "img/7. Programma.svg",
	"label": "Mystery",
	"id":"mystery",
	"catId": 11
},
{
	"on": "img/home_foc.png",
	"off": "img/1. Home.svg",
	"label": "Romance",
	"id":"romance",
	"catId": 12
}, {
	"on": "img/news_foc.png",
	"off": "img/3. News.svg",
	"label": "Sci-Fi",
	"id":"sci-fi",
	"catId": 13
}, {
	"on": "img/set_foc.png",
	"off": "img/4. Psuxagogia.svg",
	"label": "Sport",
	"id":"sport",
	"catId": 14
}, {
	"on": "img/series_foc.png",
	"off": "img/5. Ntokumanter.svg",
	"label": "Thriller",
	"id":"thriller",
	"catId": 15
}, {
	"on": "img/kids_foc.png",
	"off": "img/6. Perifereia.svg",
	"label": "War",
	"id":"war",
	"catId": 16
}, {
	"on": "img/epg.png",
	"off": "img/7. Programma.svg",
	"label": "Western",
	"id":"western",
	"catId": 17
}
];

function SideMenu(idnam) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.isOpen = false;
}
SideMenu.prototype = new BaseObject();
SideMenu.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "side-menu");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	var logo = createClassDiv("", "", "logo");
	logo.style.display = 'none';
	var limg = document.createElement('img');
	limg.id = "logoicon";
	limg.src = "img/cretetv_orange.svg";
	limg.style.width = "100%";
	logo.appendChild(limg);
	e.appendChild(logo);

	var iconsContainer = createClassDiv("", "", "outer-cont");
	var innerIconsCont = createClassDiv("", "", "inner-cont");

	this.innerCont = innerIconsCont;
	this.innerContTop = 0;



	var image = document.createElement("img");
	image.style.width = '35px';
	image.style.position = 'relative';
	image.style.left = '60px';
	var icon = createClassDiv("", "", "side-icon");
	image.src = sideicons[0].off;
	icon.appendChild(image);
	this.elem.appendChild(image);

	for (var i = 0; i < sideicons.length; i++) {
		var icon = createClassDiv("", "", "side-icon");
		//icon.id = i;
		icon.id = sideicons[i].catId;
		/*if(i == 0){
			var image = document.createElement("img");
			image.src = sideicons[i].off;
			icon.appendChild(image);
		}*/

		var labl = createClassDiv("", "", "side-icon-label");
		labl.innerHTML = sideicons[i].label;
		icon.appendChild(labl);

		this.buttons.push(icon);
		innerIconsCont.appendChild(icon);
	}
	iconsContainer.appendChild(innerIconsCont);
	e.appendChild(iconsContainer);
}
SideMenu.prototype.setFocused = function (otherobj, focus) {
	if(focus) this.isOpen = true;
	else this.isOpen = false;
	var map = [0,0,1, 2, 3, 4];
	var index = map[this.focusedId];
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus){
			if (i == this.focusedId) {
				this.buttons[i].addClass("focused");
				
				if(sideicons[this.focusedId].id != 'programma') {
				if(VIDEO_PREVIEW &&  returnfocus!="epg-dayselect" && sideicons[this.focusedId].id != 'programma'){
					var me = this;
					if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
					GLOBALS.previewTimer = null;
					GLOBALS.previewTimer = setTimeout(function(){
						var o = GLOBALS.focusmgr.getObject("list-cont");
						if(o){
							var item = o.buttons[index].createdItems[0];
							if(item.mp4)
								GLOBALS.videopreview.setSourceWithHardReset(item.mp4);
							else if(item.video)
								GLOBALS.videopreview.setSourceWithHardReset(item.video);
							else
								GLOBALS.videopreview.setSourceWithHardReset(item.media_item_link);
						GLOBALS.previewTimer = null;
					 
							GLOBALS.videopreview.setBgImg("http://smarttv.anixa.tv/"+item.img);
					}
					}, 500);
			}
		}
			} else {
				if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
			}
		} else {
			if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
		}
	}

}
SideMenu.prototype.openSearch = function () {
	var e = new Search("search");
	GLOBALS.scenemgr.addScene(e);
	GLOBALS.scenemgr.showCurrentScene("");
	activeCont = e;
	e.elem.style.background = "#2c2c2c";
	e.elem.style.left = "110px";
	GLOBALS.focusmgr.focusObject("keyboard_gr", true);
}


SideMenu.prototype.scrollOneMore = function(direction){

	this.innerContTop = this.innerContTop + (direction*90);
	this.innerCont.style.top = this.innerContTop + 'px';
}

SideMenu.prototype.handleKeyPress = function (keyCode) {
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
		case VK_0:
			var streamUrl='http://cdn5.smart-tv-data.com/creteTVevent/CreteEvent/mpeg.2ts';
			var item = {id:1, title: 'Ημιμαραθώνιος Live HD', show: 'Ημιμαραθώνιος Live HD', title: 'Ημιμαραθώνιος Live HD', url: streamUrl, episode: '-'};
			GLOBALS.item = item;
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'Ημιμαραθώνιος LIVE', null, true);
			break;
		case VK_1:
			location.href = 'http://smarttv.anixa.tv/movies-new/';
			break;
		case VK_2:
			if (GLOBALS.dev)
				location.href = '/cretetv/dai-home/';
			break;
		case VK_3:
			if (GLOBALS.dev)
				//location.href = 'http://attica.hbbtx.gr';
				//location.href = 'http://smarttv.anixa.tv/enatv/home/';
				location.href = 'http://smarttv.anixa.tv/cretetv/DEV/index.php?sd=cretetv&s=cretetv';
			break;
		case VK_4:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/centertv/';	
				//location.href = 'http://smarttv.anixa.tv/kontra/';
				//location.href = 'http://big.anixa.tv/welt/';
			break;
		/*
		case VK_3:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/cretetv/DEV/home/index.php?sd=cretetv&s=cretetv';
			GLOBALS.dev = 1;
			document.getElementById("debug").style.display = "block";
			break;

		case VK_4:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/HbbTV-Testsuite/index.php';
			break;
		*/
		case VK_5:
			if (GLOBALS.dev) location.href = 'http://iptvweb.anixe.tv/chris/index8.php';
			break;
		case VK_6:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/creta/';
			break;
		case VK_7:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/ionian/';
			break;
		case VK_8:
			if (GLOBALS.dev)
				location.href = './weather3';
			break;
		case VK_9:
			if (GLOBALS.dev)
				location.href = 'http://smarttv.anixa.tv/refapp_LATEST/src/catalogue/';
						//location.href = './appsample';
			break;
		case VK_DOWN:

			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				
			}else {if(this.focusedId > 4) this.scrollOneMore(-1);}
			
			var bg = document.getElementsByClassName("show-img bg1")[0];

			if(VIDEO_PREVIEW && sideicons[this.focusedId].id != "programma"){
				bg.style.display = "none";
				var o = GLOBALS.focusmgr.getObject("list-cont");
				o.focusedId = o.focusedId = sideicons[this.focusedId].catId;
				
				var o2 = GLOBALS.focusmgr.getObject("cat-list-" + o.focusedId);
				var l = GLOBALS.focusmgr.getObject('list-cont');
				l.scrollToFocused(1);
				
			}else if (VIDEO_PREVIEW && sideicons[this.focusedId].id == "programma"){
				this.setFocused(this.idnam, true);
				return;
					GLOBALS.videopreview.pause();
					//this.handleKeyPress(VK_ENTER);
					bg.style.display = "block";
					if(!GLOBALS.focusmgr.getObject('epg')){
						var e = new EPG("epg");

						 if  (!VIDEO_PREVIEW) {
							stopRF();
							//GLOBALS.videopreview.pause();
							}else{
								GLOBALS.videopreview.setBgImg("");
							 	GLOBALS.videopreview.pause();
							}
						//stopRF()
						activeCont = e;
						GLOBALS.scenemgr.addScene(e);
						//this.elem.classList.toggle("open");
						GLOBALS.scenemgr.showCurrentScene("");
						var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
						info.style.display = "none";
						
						this.setFocused(this.idnam, true);
					}
					break;
			}
			if(VIDEO_PREVIEW && GLOBALS.scenemgr.sceneStack.length > 1) {
				GLOBALS.scenemgr.removeLastScene();
				document.getElementById("scene0").style.display = 'block';
			}
			this.setFocused(this.buttons[this.focusedId], true);
			
			break;
		case VK_UP:

			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				
			}else {if(this.focusedId >= 4) this.scrollOneMore(1);}
			
			var bg = document.getElementsByClassName("show-img bg1")[0];
			if(VIDEO_PREVIEW && sideicons[this.focusedId].id != "programma"){
				if(GLOBALS.scenemgr.sceneStack.length > 1){
						GLOBALS.scenemgr.goBack();
					}
				bg.style.display = "none";
				var o = GLOBALS.focusmgr.getObject("list-cont");
				o.focusedId = o.focusedId = sideicons[this.focusedId].catId;
				
				var o2 = GLOBALS.focusmgr.getObject("cat-list-" + o.focusedId);
				var l = GLOBALS.focusmgr.getObject('list-cont');
				l.scrollToFocused(-1);
				
			}else if (VIDEO_PREVIEW && sideicons[this.focusedId].id == "programma"){
				this.setFocused(this.idnam, true);
				break;
					GLOBALS.videopreview.pause();
					//this.handleKeyPress(VK_ENTER);
					bg.style.display = "block";
					
					if(!GLOBALS.focusmgr.getObject('epg')){
						var e = new EPG("epg");

						 if  (!VIDEO_PREVIEW) {
							stopRF();
							//GLOBALS.videopreview.pause();
							}else{
								GLOBALS.videopreview.setBgImg("");
							 	GLOBALS.videopreview.pause();
							}
						//stopRF()
						activeCont = e;
						GLOBALS.scenemgr.addScene(e);
						//this.elem.classList.toggle("open");
						GLOBALS.scenemgr.showCurrentScene("");
						var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
						info.style.display = "none";
						
						this.setFocused(this.idnam, true);
					}
					break;
			}else if(VIDEO_PREVIEW){
						
						bg.style.display = "none";
					}

			if(VIDEO_PREVIEW && GLOBALS.scenemgr.sceneStack.length > 1) {
				GLOBALS.scenemgr.removeLastScene();
				document.getElementById("scene0").style.display = 'block';
			}


			this.setFocused(this.buttons[this.focusedId], true);
			
			break;
		case VK_RIGHT:
			this.elem.classList.toggle("open");
			if(sideicons[this.focusedId].id != "programma" && !GLOBALS.focusmgr.getObject('show-detail')){
				var o = GLOBALS.focusmgr.getObject("list-cont");
				o.focusedId = o.focusedId = sideicons[this.focusedId].catId;
				GLOBALS.focusmgr.focusObject("cat-list-" + o.focusedId);
			}else if(sideicons[this.focusedId].id == 'programma'){
				if(GLOBALS.focusmgr.getObject('epg-list')) GLOBALS.focusmgr.focusObject("epg-list", true);
			}else GLOBALS.focusmgr.focusObject(returnfocus);
			break;
		case VK_ENTER:
			this.lastFocus = this.activeId;
			this.activeId = this.focusedId;
			var label = '', sceneName = sideicons[this.focusedId].id;

			var o = GLOBALS.focusmgr.getObject("list-cont");
			this.elem.classList.toggle("open");
			// var map = [0,0,0,1,2,3,0,4,5,6,0];
			var map = [0,0,1, 2, 3, 4, 5];
			var l = GLOBALS.focusmgr.getObject('list-cont');
			var ind = this.focusedId;
			l.sidemenu = 1;
			if(sideicons[ind].id == "livehd"){
				if(GLOBALS.useRef){
					GLOBALS.item = {id:1, category: 'Live HD',title: 'CreteTV', show: 'Live HD', title: 'Live HD', episode: '-'};
					GLOBALS.scenemgr.initVPlayerSession('Crete Live HD', streamUrl, 'LIVE', null, true, GLOBALS.item);
					break;
				}
			}
			var bg = document.getElementsByClassName("show-img bg1")[0];
			var foc = l.focusedId;
			l.focusedId = map[ind];
			if(GLOBALS.scenemgr.sceneStack.length > 1){
				GLOBALS.scenemgr.goBack();
			}
			if(sideicons[ind].id == "programma"){
				var e = new EPG("epg");

				 if  (!VIDEO_PREVIEW) {
					stopRF();
					//GLOBALS.videopreview.pause();
					}else{
						GLOBALS.videopreview.setBgImg("");
					 	GLOBALS.videopreview.pause();
					}
				//stopRF()
				activeCont = e;
				GLOBALS.scenemgr.addScene(e);
				GLOBALS.scenemgr.showCurrentScene("");
				var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
				info.style.display = "none";

				bg.style.display = "block";
				
				break;
				
			}else {
				if(VIDEO_PREVIEW)
					bg.style.display = "none";
			}
			GLOBALS.focusmgr.focusObject("cat-list-"+map[ind]);
			if(sceneName == "home"){
				for(var i = 0; i < l.buttons.length; i++){
					var h = GLOBALS.focusmgr.getObject("cat-list-"+i);
					h.focusedId = 0;
					h.animScrollerReset(l.focusedId==i?true:false);
				}
			}else{
				var h = GLOBALS.focusmgr.getObject("cat-list-"+l.focusedId);
				h.focusedId = 0;
				h.animScrollerReset(true);
				GLOBALS.focusmgr.focusObject("cat-list-"+l.focusedId);
			}
			if(foc < ind) {
				l.scrollToFocused(1);
			}else{
				l.scrollToFocused(-1);
			}

			if(returnfocus == "epg-container" || returnfocus != "epg-list" || returnfocus != "epg-dayselect" && (ind != 6) && !VIDEO_PREVIEW){
				startRF2();
			}
			

			break;
		default:
			break;
	}
}
function getVersion() {
	var version = "",
		useragent = navigator.userAgent.toLowerCase();
	if (navigator.userAgent.indexOf('AppleWebKit/535.20') != -1) return ("1.2.1");
	var arr = useragent.split("hbbtv/");
	if (arr.length > 1) {
		version = arr[1].substr(0, 5);
	}
	return version;
}


function Feature(idnam , feature){
	this.idnam = idnam;
	this.feature = feature;
	this.focusedId = 0;
}
Feature.prototype = new BaseObject();
Feature.prototype.init = function (parent, xpos , ypos){
	var e = createClassDiv("", "", "feature-container");
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	var play = createClassDiv('', '', 'btn');
	play.innerHTML = 'Play';
	var info = createClassDiv('', '', 'btn');
	info.innerHTML = 'More Info';


	this.elem.appendChild(play);
	this.elem.appendChild(info);

	this.buttons[0] = play;
	this.buttons[1] = info;


}
Feature.prototype.setInfoData = function (){
	var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
	info.getElementsByClassName("info-title")[0].innerHTML = this.feature.title;
			info.getElementsByClassName("info-subtitle")[0].innerHTML = this.feature.originalTitle;
			var genresArray = this.feature.genres; // ["Action","Crime","Drama"]
			var onGenres = ""; 
			for (var i = 0; i < genresArray.length; i++) {
			    if (i > 0) {
			        onGenres += ", ";
			    }
			    onGenres += '<label class="genres">' + genresArray[i] + '</label>';
			}

			var castArray = this.feature.cast;
			var castStr = "";
			for (var i = 0; i < castArray.length; i++) {
			    if (i > 0) {
			        castStr += ", ";
			    }
			    castStr += castArray[i];
			}

			info.getElementsByClassName("info-data")[0].innerHTML = '<label class="l-year">' +this.feature.year + " "+ this.feature.country + "</label><br/>" + onGenres+ "</br></br><b>Director: </b>" + this.feature.director+ "</br>Cast: " + castStr;
			
}
Feature.prototype.setFocused = function (otherobj, focus){
	for(var i= 0; i< this.buttons.length; i++){
		if(focus){
			this.elem.style.display = 'block';
			if(i == this.focusedId) {
				
				this.buttons[i].addClass('focused');
				this.setInfoData();

				if(VIDEO_PREVIEW){
					if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
					GLOBALS.previewTimer = null;
					var me = this;
					var item = this.feature;
					GLOBALS.previewTimer = setTimeout(function(){
						
						if(item.mp4)
							GLOBALS.videopreview.setSourceWithHardReset("http://smarttv.anixa.tv/movies-new/" + item.mp4);
						GLOBALS.previewTimer = null;
					}, 500);
					var imgToShow = me.feature.img;
					if(window.location.hostname == "127.0.0.1"){
						imgToShow = item.poster;
						GLOBALS.videopreview.setBgImg(imgToShow);

					}

					GLOBALS.videopreview.setBgImg('http://smarttv.anixa.tv/movies-new/'+item.trailerThumb);
				}

			}
			else {
				this.buttons[i].removeClass('focused');
				
			}
		}else{
			this.buttons[i].removeClass('focused');
			this.elem.style.display = 'none';
		}
	}

}
Feature.prototype.handleKeyPress = function(keycode){
	switch(keycode){
		case VK_DOWN:
			document.getElementsByClassName('episodes-category')[0].style.top = '0px';

			GLOBALS.focusmgr.focusObject('cat-list-0', true);
			break;
		
		case VK_RIGHT:
			this.focusedId++;
			if(this.focusedId > this.buttons.length-1) this.focusedId = this.buttons.length-1;
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if(this.focusedId < 0 ){
				this.focusedId = 0;
				returnfocus = this.idnam;
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				cleardebug();
				break;
			}
			this.setFocused(this.idnam, true);
			break;
		case VK_ENTER:
			if(this.focusedId == 0){
				if(VIDEO_PREVIEW){
				GLOBALS.videopreview.pause();
				}
				var item = this.feature;
				if(1 || GLOBALS.useRef) {
					var o = GLOBALS.focusmgr.getObject("show-detail");
					var cat = "";
					if(o){
						cat = o.category;
					}else{
						cat = this.categoryTitle;
					}
					
					GLOBALS.scenemgr.initVPlayerSession(item.title, item.mp4, cat, (item.subs && item.subs.length ? item.subs : null), false, item);
					return;
				}
			}
				break;
		default:
			break;
	}
}



function ListCont(idnam, data) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.data = data;
	this.listHeight = 340; // list height plus 40
	this.portraitHeight = 300;
	this.ref = "";
	//this.ref = "list-";
}

ListCont.prototype = new BaseObject();
ListCont.prototype.init = function (parent, xpos, ypos) {
	var cont = createClassDiv("", "", "list-container");
	parent.appendChild(cont);
	this.baseInit(cont);
	this.register();
	this.buttons = [];
	if(this.isInner){
		debug('list cont is inner list');
debug(this.data);

/*		for (var i = 0; i < this.data.length; i++) {
			debug(this.data[i]);
			var list = new HorizontalList("inner-list-" + i, i);
			list.parentObj = this;
			list.initEpisodesList(this.elem, "", "", this.data[i].episodes, this.data[i].title);
			this.buttons.push(list);
			this.top += this.listHeight;
		}*/

		var genres = [];
		for (var key in this.data) {
		    if (this.data.hasOwnProperty(key) && Object.prototype.toString.call(this.data[key]) === '[object Array]') {
		        genres.push(key);
		    }
		}

		

		var feature = new Feature('feature', this.data[genres[0]][6]);
		feature.init(this.elem, "", "");




		for (var i = 0; i < genres.length; i++) {
		    var genre = genres[i];          // e.g., "Action"
		    var movies = this.data[genre];  // array of movies
		    debug(movies);




		    // create HorizontalList for this genre
		    //var list = new HorizontalList("inner-list-" + i, i);
		    var list = new HorizontalList("cat-list-" + i, i);
		    list.parentObj = this;

		    // initialize with movies and genre title
		    list.initEpisodesList(this.elem, "", "", movies, genre);

		    this.buttons.push(list);
		    this.top += this.listHeight;
		}

		debug('genres');
		debug(genres);


		/*if(GLOBALS.focusmgr.getObject("inner-list-0")){
			GLOBALS.focusmgr.focusObject("inner-list-0");
		}*/
		/*if(GLOBALS.focusmgr.getObject("cat-list-0")){
			GLOBALS.focusmgr.focusObject("cat-list-0");
		}*/
		GLOBALS.focusmgr.focusObject("feature", true);
	}else{
		for (var i = 0; i < categories.length; i++) {

			var list = new HorizontalList(this.ref + "cat-list-" + i, i);
			list.parentObj = this;

			list.initList(this.elem, "", "", this.data[i]);

			this.buttons.push(list);
			this.top += this.listHeight;
		}
		if(GLOBALS.focusmgr.getObject(this.ref + "cat-list-0")){
			GLOBALS.focusmgr.focusObject(this.ref +"cat-list-0");
		}
	}
}
ListCont.prototype.scrollToFocused = function (factor) {

	var result = 0;
	this.innertop = (this.focusedId * this.listHeight);
	this.listContainerTop = 350; 
	result = parseInt(this.listContainerTop) - parseInt(this.innertop);
	this.elem.style.top = result + "px";
	for(var i = 0; i < this.buttons.length; i++){

		if(i < this.focusedId){
			this.buttons[i].elem.style.opacity = 0;
		}else{

			this.buttons[i].elem.style.opacity = 1;
		}
	}
}
ListCont.prototype.stopTeaser = function () {
	if (this.teaserTimer3) {
		var v = document.getElementById('video-teaser');
		clearTimeout(this.teaserTimer3);
		clearTimeout(this.teaserTimer2);
		clearTimeout(this.teaserTimer);

		GLOBALS.brtyp ? v.stop() : v.pause();
		if (GLOBALS.brtyp) GLOBALS.focusmgr.getObject("cretetv").teaser.style.display = 'none';
		v.setAttribute('src', '');
	}
}

function HorizontalList(idnam, id) {
	this.idnam = idnam;
	this.id = id;
	this.xpos = 0;
	this.ypos = 0;
	this.focusedId = 0;
	this.atstart = true;
	this.atend = false;
	this.current = 0;
	this.itemmargin = 202; // plus 20 from tile width
	this.focusleft = 0;
	this.focustop = 0;
	this.parent = null;
	this.width = 0;
	this.strecke = 0;
	this.position = 150;
	this.animtimer = false;
	this.pixeltomove = 80;
	this.listHeight = 330; // plus 10 from list height
	this.height = 240;
	this.items = null;
	this.show = null;
	this.subcat = null;
	this.createdItems = [];
	this.scrollHorizontal = true;
	this.portrait = false;
}

HorizontalList.prototype = new BaseObject();
HorizontalList.prototype.initList = function (parent, xpos, ypos, items) {
	this.items = items.shows;
	this.categoryTitle = items.title;
	var e = createClassDiv("", "", "movies-category");
	e.id = this.idnam;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	var category = createClassDiv("", "", "category");
	category.innerHTML = this.categoryTitle;
	this.elem.appendChild(category);
	var w = 0;
	this.outer = createClassDiv("", "", "event-list");
	this.elem.appendChild(this.outer);
	var itemsToStart = 6;
	if(this.items[0].episodes && this.items[0].episodes.length > 0){
		this.items = this.items[0].episodes;
	}
	if(this.items[0].url){
		this.items = filterObjectsByField(this.items, "mp4");
	}

	var cnt = this.items.length > itemsToStart ? itemsToStart : this.items.length
	for (var i = 0; i < cnt; i++) {
		this.createListItem(this.items[i]);
		w += this.itemmargin + 10 /*border*/ + 10 /*margin*/;
	}
	w = this.itemmargin * (this.items.length + 1);
	this.elem.style.width = w + "px";
	this.width = w;
	this.outer.style.width = w + "px";
}

function filterObjectsByField(arr, fieldName) {
	var result = [];

	for (var i = 0; i < arr.length; i++) {
		if (arr[i].hasOwnProperty(fieldName)) {
			result.push(arr[i]);
		}
	}

	return result;
}
HorizontalList.prototype.initMoviesList = function (parent, xpos, ypos, items, category) {
	this.items = items;
	this.category = category;
	parent.addClass("movies");
	var e = createClassDiv("", "", "movies-category");
	e.id = "movies-category-" + this.id;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;

	var category = createClassDiv("", "", "category");
	if(this.category != "Τελευταία" && this.category != "Δημοφιλέστερα" /*&& this.category != "Ταινίες"*/){
		e.classList.add("portrait");
		this.portrait = true;
		this.listHeight = 210;
		this.itemmargin = 185;
	}
	category.innerHTML = this.category;
	this.elem.appendChild(category);

	var w = 0;

	this.outer = createClassDiv("", "", "event-list");
	this.elem.appendChild(this.outer);
	var itemsToStart = this.portrait?6:6;
	var cnt = this.items.length > itemsToStart ? itemsToStart : this.items.length
	for (var i = 0; this.createdItems.length < cnt; i++) {
		this.createListItem(this.items[i]);
		w += this.itemmargin + 10 /*border*/ + 10 /*margin*/;
	}
	w = this.itemmargin * (this.items.length + 1);
	this.elem.style.width = w + "px";
	this.width = w;
	this.outer.style.width = w + "px";
}
HorizontalList.prototype.initPortraitList = function (parent, xpos, ypos, items, category) {
	this.scrollHorizontal = false;
	this.listHeight = 210;
	this.items = items;
	this.itemmargin = 185;
	this.category = category;
	var e = createClassDiv("", "", "portrait-category");
	e.id = "portrait-category-" + this.id;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	this.portrait = true;

	var w = 0;

	this.outer = createClassDiv("", "", "event-list");
	this.elem.appendChild(this.outer);
	for (var i = 0; this.createdItems.length < this.items.length; i++) {
		this.createListItem(this.items[i]);
		w += this.itemmargin + 10 /*border*/ + 10 /*margin*/;
	}
	w = this.itemmargin * (this.items.length + 1);
	this.elem.style.width = w + "px";
	this.width = w;
	this.outer.style.width = w + "px";
}
HorizontalList.prototype.initEpisodesList = function (parent, xpos, ypos, items, category) {
	this.items = items;
	this.category = category;
	var e = createClassDiv("", "", "episodes-category");
	e.id = "episodes-category-" + this.id;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;

	// var category = createClassDiv("", "", "category");
	// if (this.show && this.subcat)	
	// 	category.innerHTML = this.subcat;
	// else
	// 	category.innerHTML = this.category;
	// this.elem.appendChild(category);

	var w = 0;
	var catTitle = createClassDiv("", "", "category");
	catTitle.innerHTML = this.category;
	this.elem.appendChild(catTitle);


	this.outer = createClassDiv("", "", "event-list");
	this.elem.appendChild(this.outer);
	var cnt = this.items.length > 6 ? 6 : this.items.length;


	for (var i = 0; this.createdItems.length < cnt; i++) {
		//if(this.items[i] && this.items[i].mp4) {
			this.createListItem(this.items[i]);
			w += this.itemmargin + 10 /*border*/ + 10 /*margin*/;
		//}
	}
	w = this.itemmargin * (this.items.length + 1);
	this.elem.style.width = w + "px";
	this.width = w;
	this.outer.style.width = w + "px";

}
HorizontalList.prototype.createListItem = function (item) {
	if (this.createdItems.indexOf(item) != -1 || !item /*|| !item.mp4*/)
		return;
	this.createdItems.push(item);
	var inner = createClassDiv("", "", "event");
	//inner.id = item.key;
	var im = document.createElement('div');

	im.style.backgroundImage = "url('http://smarttv.anixa.tv/movies-new/"+ item.poster +"')";

	im.classList.add('image');
	if (item.mp4){
		var playCircle = document.createElement("span");
		var playIcon = document.createElement("img");

		playCircle.classList = "playCircle";
		im.appendChild(playCircle);

		playIcon.src = "img/play-solid.svg";

		playCircle.appendChild(playIcon);
	}
	var titl = createClassDiv("", "", "event-titl");
	var titlePart = item.title.split(/\r?\n/)[0];
	titl.innerHTML = titlePart.length > 70?titlePart.substring(0,65)+"...":titlePart;
	if(item.mp4 && item.mp4 != ""){
		var mp4 = createClassDiv("", "", "mp4");
		mp4.innerHTML = item.cdn;
		mp4.style.display = "none";
		inner.appendChild(mp4);
	}
	inner.appendChild(im);
	inner.appendChild(titl);
	this.outer.appendChild(inner);
	this.buttons.push(inner);
	
}
HorizontalList.prototype.setFocused = function (otherobj, focus) {
debug('Horizotallist setfocused ' + focus);
	var l = GLOBALS.focusmgr.getObject('list-cont');
	var m = GLOBALS.focusmgr.getObject('side-menu');
	
	for(j=0; j< sideicons.length ; j++){
		if(sideicons[j].catId == l.focusedId && sideicons[j].id != 'home'){
			m.focusedId = l.focusedId;
		}
	}


	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) {
				if (focusType) this.buttons[i].addClass("focused2");
				else this.buttons[i].addClass("focused");
				if(VIDEO_PREVIEW){
					if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
					GLOBALS.previewTimer = null;
					var me = this;
					var item = this.createdItems[i];
					GLOBALS.previewTimer = setTimeout(function(){
						
						if(item.mp4)
							GLOBALS.videopreview.setSourceWithHardReset("http://smarttv.anixa.tv/movies-new/" + item.mp4);
						GLOBALS.previewTimer = null;
					}, 500);
					var imgToShow = this.createdItems[i].img;
					if(window.location.hostname == "127.0.0.1"){
						imgToShow = item.poster;
						GLOBALS.videopreview.setBgImg(imgToShow);

					}

					GLOBALS.videopreview.setBgImg('http://smarttv.anixa.tv/movies-new/'+item.trailerThumb);

					//if(GLOBALS.videopreview.bg) 
					//	GLOBALS.videopreview.setBgImg(imgToShow);

				//  if(window.location.hostname == "127.0.0.1"){
				//  GLOBALS.videopreview.setBgImg(imgToShow);
				//  console.log(imgToShow);
				//  }

				} 
			} else {
				if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
				if (this.buttons[i].hasClass("focused2")) this.buttons[i].removeClass("focused2");
			}
		} else {
			if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
			if (this.buttons[i].hasClass("focused2")) this.buttons[i].removeClass("focused2");
		}
	}
	var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
	if(this.parentObj && this.idnam == "episodes-list-0"){

		info.style.top = (VIDEO_PREVIEW?"170px":"270px");
		info.getElementsByClassName("info-subtitle")[0].innerHTML = this.createdItems[this.focusedId]?this.createdItems[this.focusedId].title.replace(" - ", ""):"";
		info.getElementsByClassName("info-data-txt")[0].innerHTML = "";
	}else{
		info.style.top = "100px";

		var sub = info.getElementsByClassName("info-subtitle")[0];
		if(sub){
			if(this.createdItems[this.focusedId] && this.createdItems[this.focusedId].short)
				sub.innerHTML = this.createdItems[this.focusedId].short;
			else
				sub.innerHTML = "";

			// if(this.category == "Ταινίες")
			//     sub.style.display = "block";
			// else
			//     sub.style.display = "none";
		}
		/*if(this.createdItems[this.focusedId] && this.createdItems[this.focusedId].descr){
			var descr = this.createdItems[this.focusedId].descr;
			info.getElementsByClassName("info-data-txt")[0].innerHTML = descr.length > (VIDEO_PREVIEW?185:250)?descr.substring(0,(VIDEO_PREVIEW?180:245))+"...":descr;
		}
		else
			info.getElementsByClassName("info-data-txt")[0].innerHTML = "";*/
		if(this.idnam != "episodes-list-0"){
			info.getElementsByClassName("info-title")[0].innerHTML = this.createdItems[this.focusedId]?this.createdItems[this.focusedId].title:"";
			info.getElementsByClassName("info-subtitle")[0].innerHTML = this.createdItems[this.focusedId].originalTitle;
			var genresArray = this.createdItems[this.focusedId].genres; // ["Action","Crime","Drama"]
			var onGenres = ""; 
			for (var i = 0; i < genresArray.length; i++) {
			    if (i > 0) {
			        onGenres += ", ";
			    }
			    onGenres += '<label class="genres">' + genresArray[i] + '</label>';
			}

			var castArray = this.createdItems[this.focusedId].cast;
			var castStr = "";
			for (var i = 0; i < castArray.length; i++) {
			    if (i > 0) {
			        castStr += ", ";
			    }
			    castStr += castArray[i];
			}

			info.getElementsByClassName("info-data")[0].innerHTML = '<label class="l-year">' +this.createdItems[this.focusedId].year + " "+ this.createdItems[this.focusedId].country + "</label><br/>" + onGenres+ "</br></br><b>Director: </b>" + this.createdItems[this.focusedId].director+ "</br>Cast: " + castStr;
			
			// var bg = document.getElementsByClassName("show-img")[document.getElementsByClassName("show-img").length-1];
			// if(bg){

			//         bg.style.backgroundImage = "url('http://smarttv.anixa.tv"+(this.createdItems[this.focusedId]?this.createdItems[this.focusedId].orimg:"")+"')";

			// }
		}else{
			info.getElementsByClassName("info-subtitle")[0].innerHTML = this.createdItems[this.focusedId]?this.createdItems[this.focusedId].title:"";
		}
	}

}
HorizontalList.prototype.animScrollerLeft = function () {
	if(!this.scrollHorizontal) {
		this.setFocused(this.idnam, true);
		return;
	}
	this.setFocused(this.idnam, true);
	this.position = this.position + this.itemmargin;
	this.outer.style.left = this.position + 'px';

}
HorizontalList.prototype.animScrollerReset = function (focus) {

	this.position = 150;
	this.outer.style.left = this.position + 'px';
	if(focus) this.setFocused(this.idnam, true);
}
HorizontalList.prototype.animScrollerRight = function () {
	if(!this.scrollHorizontal) {
		this.setFocused(this.idnam, true);
		return;
	}
	this.setFocused(this.idnam, true);
	this.position = 150 - this.itemmargin * this.focusedId;
	this.outer.style.left = this.position + 'px';

}

HorizontalList.prototype.handleKeyPress = function (keyCode) {
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

		case VK_1:
			document.documentElement.style.setProperty('--focuscolor', 'var(--orange)');
			document.getElementById("logoicon").src = "img/cretetv_orange.svg";

			if(document.getElementsByClassName("show-img")[0].hasClass("bg2")){
				document.getElementsByClassName("show-img")[0].removeClass("bg2");
			}
			document.getElementsByClassName("show-img")[0].addClass("bg1");
			break;
		case VK_2:
			document.documentElement.style.setProperty('--focuscolor', 'var(--white)');

			document.getElementById("logoicon").src = "img/cretetv_white.png";


			if(document.getElementsByClassName("show-img")[0].hasClass("bg1")){
				document.getElementsByClassName("show-img")[0].removeClass("bg1");
			}
			document.getElementsByClassName("show-img")[0].addClass("bg2");

			break;
		case VK_0:
			focusType = !focusType;
			if (focusType) {
				this.buttons[this.focusedId].classList.toggle("focused")
				this.buttons[this.focusedId].classList.toggle("focused2")
			} else {
				this.buttons[this.focusedId].classList.toggle("focused2")
				this.buttons[this.focusedId].classList.toggle("focused")
			}
			break;
		case VK_DOWN:

			var s = GLOBALS.focusmgr.getObject('side-menu');
			if(s){
				if(s.focusedId > 4) s.scrollOneMore(-1);
			}

			var o = this.parentObj;
			if (!o)
				return;
			if(o && o.idnam == "episodes-list-cont"){
				break;
				if (GLOBALS.focusmgr.getObject("inner-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject("inner-list-" + o.focusedId);
					//li.elem.style.visibility = "hidden";
				}
			}else if (o && o.idnam == "cat-cont"){
				if (GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId);
					//li.elem.style.visibility = "hidden";
				}
			}else if (o.idnam != 'show-detail') {

				if (GLOBALS.focusmgr.getObject(o.ref + "cat-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject(o.ref +"cat-list-" + o.focusedId);
					//li.elem.style.visibility = "hidden";
				}
			}
			o.focusedId++;
			if (o.focusedId > o.buttons.length - 1) {
				o.focusedId = o.buttons.length - 1;
				if(li)
					li.elem.style.visibility = "visible";
			}
			if (o.idnam != 'show-detail')
				o.scrollToFocused(-1);


			if(GLOBALS.focusmgr.currentFocus.idnam  != 'side-menu'){


				if(o.idnam == "episodes-list-cont")
					GLOBALS.focusmgr.focusObject("inner-list-" + o.focusedId);
				else if(o.idnam == "cat-cont"){
					var nextList = GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId);
					nextList.focusedId = this.focusedId;
					if(nextList.focusedId > nextList.buttons.length - 1) nextList.focusedId = nextList.buttons.length - 1;
					GLOBALS.focusmgr.focusObject(o.cat+"-list-" + o.focusedId);
					llog("focus on "+o.cat+"-list-" + o.focusedId);
				}
				else if (o.idnam != 'show-detail') {
					GLOBALS.focusmgr.focusObject(o.ref + "cat-list-" + o.focusedId);
					llog("focus on cat-list-" + o.focusedId);
				}
			}

			break;
		case VK_UP:
			var s = GLOBALS.focusmgr.getObject('side-menu');
			if(s) {
				if(s.focusedId >= 4)s.scrollOneMore(1);
			}

			if(GLOBALS.focusmgr.getObject("movies-inner")){
				GLOBALS.focusmgr.focusObject("movies-inner", true);
				break;
			}

			if(GLOBALS.focusmgr.getObject("show-detail")){
				break;
				GLOBALS.focusmgr.focusObject("show-detail");
				return;
			}
			var o = this.parentObj;
			if(o) o.focusedId--;
			if(o && o.focusedId<0){
				o.focusedId = 0;
				document.getElementsByClassName('episodes-category')[0].style.top = '225px';
				var f = GLOBALS.focusmgr.getObject('feature');
				f.elem.style.display = 'block';
				GLOBALS.focusmgr.focusObject('feature', true);
				break;
				/*if(o.idnam == "episodes-list-cont"){
					GLOBALS.focusmgr.focusObject("show-detail");
					return;
				}*/
			}
			if(o && o.idnam == "episodes-list-cont"){
				if (GLOBALS.focusmgr.getObject("inner-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject("inner-list-" + o.focusedId);
					li.elem.style.visibility = "visible";
				}
			}else if (o && o.idnam == "cat-cont"){
				if (GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId);
					li.elem.style.visibility = "visible";
				}
			}
			else {
				if (o && GLOBALS.focusmgr.getObject(o.ref + "cat-list-" + o.focusedId)) {
					var li = GLOBALS.focusmgr.getObject(o.ref +"cat-list-" + o.focusedId);
					if(li)
						li.elem.style.visibility = "visible";
				}
			}
			if (o.focusedId < 0) {

				o.focusedId = 0;
				var lc = GLOBALS.focusmgr.getObject("list-cont");
				lc.elem.classList.toggle("moveTop")
				lc.elem.removeAttribute("style");
				slideshowOpen = true;
				GLOBALS.focusmgr.focusObject("slideshow");
				break;
			}
			if (o.idnam != 'show-detail')
				o.scrollToFocused(1);
			if(GLOBALS.focusmgr.currentFocus.idnam  != 'side-menu'){
			if(o.idnam == "episodes-list-cont")
				GLOBALS.focusmgr.focusObject("inner-list-" + o.focusedId);
			else if(o.idnam == "cat-cont"){
				GLOBALS.focusmgr.getObject(o.cat+"-list-" + o.focusedId).focusedId = this.focusedId;
				GLOBALS.focusmgr.focusObject(o.cat+"-list-" + o.focusedId);
			}
			else
				GLOBALS.focusmgr.focusObject(o.ref +"cat-list-" + o.focusedId);
		}
			break;
		case VK_RIGHT:
			if (this.animtimer) break;
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}
			var nextLimit = this.portrait?5:6;
			if (this.focusedId + nextLimit < this.items.length) {
				this.createListItem(this.items[this.focusedId + nextLimit]);
			}
			this.animScrollerRight();
			if (activeCont.idnam != "cretetv") 
				var lc = GLOBALS.focusmgr.getObject(activeCont.idnam);
			break;
		case VK_LEFT:
			if (this.animtimer) break;
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				var o = GLOBALS.focusmgr.getObject("list-cont");
				returnfocus = o.ref +"cat-list-" + o.focusedId;
				returnfocus = this.idnam;
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				cleardebug();
				break;
			}
			this.animScrollerLeft();
			if (activeCont.idnam != "cretetv") {
				var lc = GLOBALS.focusmgr.getObject(activeCont.idnam);
			}
			break;
		case VK_ENTER:
			var item = this.createdItems[this.focusedId];
			if (this.category)
				item.category = this.category;
			if (this.show)
				item.show = this.show;
			GLOBALS.item = item;
			if(this.category == "Ταινίες") {
				var e = new MoviesInner("movies-inner");
				e.data = item;
				if(e.data)
					e.descr = e.data["descr"];
				GLOBALS.scenemgr.addScene(e);
				GLOBALS.scenemgr.showCurrentScene("");
				return;
			}
			if(this.buttons[this.focusedId] && this.buttons[this.focusedId].getElementsByClassName("mp4")[0] ){
				if(VIDEO_PREVIEW){
				GLOBALS.videopreview.pause();
				}
				if(1 || GLOBALS.useRef) {
					var o = GLOBALS.focusmgr.getObject("show-detail");
					var cat = "";
					if(o){
						cat = o.category;
					}else{
						cat = this.categoryTitle;
					}
					if(item.key == "6dd7aaf4424f29906a8a25e3f6c689e7"){
						item.subs = [{"l":"el", "f":"subs/6dd7aaf4424f29906a8a25e3f6c689e7.srt"}];
					}
					if(item.key == "1c24b3218a231794e7c49b941b67a59f"){
						item.subs = [{"l":"el", "f":"subs/1c24b3218a231794e7c49b941b67a59f.srt"}];
					}
					if(item.key == "41c2a3569daf237fb1dce4870cea8bc1"){
						item.subs = [{"l":"el", "f":"subs/41c2a3569daf237fb1dce4870cea8bc1.srt"}];
					}
					var movespath = this.category+"/"+ (this.show ? this.show+'/':'') +(this.subcat ? this.subcat+'/':'') +item.title.replace('/', '-');
					moves(movespath);
					GLOBALS.scenemgr.initVPlayerSession(item.title, item.mp4, cat, (item.subs && item.subs.length ? item.subs : null), false, item);
					return;
				}
				GLOBALS.scenemgr.openVideoPlayer();
				if (!GLOBALS.focusmgr.getObject("videoplayer")) {

					GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
					GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
				}
				var movespath = this.category+"/"+ (this.show ? this.show+'/':'') +(this.subcat ? this.subcat+'/':'') +item.title.replace('/', '-');
				moves(movespath);
				GLOBALS.lastMoves = movespath;
				GLOBALS.videoplayer.oncase = ON_VOD;
				GLOBALS.videoplayer.setTitle(item.title);

				if (ADCATS.indexOf(item.show) != -1 || ADCATS.indexOf(item.category) != -1 || NOAD.indexOf(item.category) == -1) {
					GLOBALS.videoplayer.todo = item;
					GLOBALS.videoplayer.ad = true;
					if(typeof prerollVideo !== "undefined") {
						if (ADCATS.indexOf(item.category) != -1)
							prerollVideo(item.category);
						else
							prerollVideo(item.show);
					}
				} else {
					GLOBALS.videoplayer.setSource(item);
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}

				break;
			}
			activelist = this.idnam;
			if (typeof this.createdItems[this.focusedId].descr != 'undefined') {
				var e = new MovieDetail("show-detail", this.createdItems[this.focusedId]);
				e.category = this.categoryTitle;
				GLOBALS.scenemgr.addScene(e);
				GLOBALS.scenemgr.showCurrentScene("");
				activeCont = e;
				GLOBALS.focusmgr.focusObject("show-detail");
			}
			break;

		case VK_BACK:
		if (GLOBALS.scenemgr.sceneStack.length <= 1)
				break;
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

function CatCont(idnam, data) {
	this.idnam = idnam;
	this.data = data;
	this.focusedId = 0;
	this.scrollAllow = false;
	this.isMovie = false;
	this.listHeight = 260;
}
CatCont.prototype = new BaseObject();
CatCont.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "category-cont");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = []; 


	var sm = GLOBALS.focusmgr.getObject("side-menu");
	var chunkSize = 6;
	if(this.isMovie) chunkSize = this.data.length;
	var items = [];
	for (var i = 0; i < this.data.length; i += chunkSize) {
		const chunk = this.data.slice(i, i + chunkSize);
		var list = new HorizontalList(this.cat + "-list-"+this.buttons.length, 0);
		list.parentObj = this;

		if(!this.isMovie)
			list.initPortraitList(this.elem, "", "", chunk, starmenu[parseInt(sm.buttons[sm.focusedId].id) + 1]);
		else
			list.initMoviesList(this.elem, "", "", chunk, starmenu[parseInt(sm.buttons[sm.focusedId].id) + 1]);
		list.elem.style.top = "325px";
		this.buttons.push(list);
	}
	this.elem.style.height = 325 + this.buttons.length * this.listHeight + "px";
	//GLOBALS.focusmgr.focusObject(this.cat + "-list-0");
}
CatCont.prototype.setBgImg = function () {
	var li = GLOBALS.focusmgr.getObject(this.idnam + "-list");
	this.img.style.backgroundImage = "url(" + this.data.items[li.focusedId].image + ")";
	this.titl.innerHTML = this.data.items[li.focusedId].title;
}
CatCont.prototype.scrollToFocused = function (factor) {
	this.innertop = (this.focusedId * this.listHeight);
	var result = 0-parseInt(this.innertop);
	this.elem.style.top = result + "px";
}

function MovieDetail(idnam, data) {
	this.idnam = idnam;
	this.data = data;
	this.focusedId = 0;
	this.scrollAllow = false;
	this.isMovie = false;
	this.movedPixels = 150; 
}
MovieDetail.prototype = new BaseObject();
MovieDetail.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "show-detail");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	if (0 && this.data.info['Κατηγορία:'] == "Ταινίες") {
		this.createMovie();
		this.isMovie = true;
	} else {
		var me = this;
		if(!this.data) return;
		var url = '/cretetv/json/shows/' + this.data.key + '.json?v'+ Math.random();
		if(location.host == "127.0.0.1") var url = './getShowsJson.php?key='+ this.data.key;
		this.req = createHttpRequest(url, function (ret) {
			me.req = null;
			var dat = JSON.parse(ret);
			me.descrData = dat.descr;
			me.createShow(dat);
			// var bg = document.getElementsByClassName("show-img")[document.getElementsByClassName("show-img").length-1];
			// if(bg){
			//     bg.style.backgroundImage = "url('http://smarttv.anixa.tv"+dat.orimg+"')";
			// }
			var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
			info.getElementsByClassName("info-title")[0].innerHTML = dat.title;
		});
	}
}


MovieDetail.prototype.setFocused = function (otherobj, focus) {
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
MovieDetail.prototype.createMovie = function () {

	var choices = createClassDiv("", "", "show-choices");

	this.scrollAllow = true;
	var descrlabel = createClassDiv("", "", "show-label");
	descrlabel.innerHTML = "Πληροφορίες";
	this.buttons.push(descrlabel);
	choices.appendChild(descrlabel);
	this.elem.appendChild(choices);

	this.descrCont = createClassDiv("", "", "show-descr-container");
	this.descr = createClassDiv("", "", "show-descr");
	this.descr.style.display = "block";

	this.descr.innerHTML = decodeHtml(this.descrData);
	this.descrCont.appendChild(this.descr);
	this.elem.appendChild(this.descrCont);
}
MovieDetail.prototype.createShow = function (lists) {
	var episodes = lists.episodes;
	/*var choices = createClassDiv("", "", "show-choices");

    var playlabel = createClassDiv("", "", "show-label");
    playlabel.innerHTML = "Προβολή";
    var descrlabel = createClassDiv("", "", "show-label");
    descrlabel.innerHTML = "Πληροφορίες";
    choices.appendChild(playlabel);
    this.buttons.push(playlabel);
    choices.appendChild(descrlabel);
    this.elem.appendChild(choices);
    var choicesMargin = 31;
    var choicesWidth = descrlabel.offsetWidth + choicesMargin;

	// for(var i=0;i<lists.length;i++){
	//     var choice = createClassDiv("","","show-label");
	//     var title = lists[i].title.replace(this.data.title+"-", "").replace(this.data.title+" - ", "").replace(this.data.title, "")
	//     choice.innerHTML = title;
	//     this.buttons.push(choice);
	//     choices.appendChild(choice);
	//     choicesWidth += choice.offsetWidth + choicesMargin;

	// }


    this.buttons.push(descrlabel);
    choices.appendChild(descrlabel);
    choicesWidth += descrlabel.offsetWidth + choicesMargin;
    choices.style.width = choicesWidth+"px";
    this.choices = choices;*/
	this.descrCont = createClassDiv("", "", "show-descr-container");
	this.descr = createClassDiv("", "", "show-descr");

	var str = this.descrData?this.descrData:"";
	str = replaceAll(str, "&nbsp;", " ");
	str = replaceAll(str, "<br>", "");
	if(str==""){
		this.descr.style.width = "100%";
		this.descr.style.height = "190px";
		var epslabel = createClassDiv("", "", "noeps");
		epslabel.innerHTML = "Δεν Υπάρχουν Πληροφορίες !";
		this.descr.appendChild(epslabel);
	}else{
		this.descr.innerHTML = str;
	}

	this.descrCont.appendChild(this.descr);

	this.elem.appendChild(this.descrCont);
	var list = new HorizontalList("episodes-list-0");
	list.parentObj = this;
	list.id = 0;
	var title = lists.title.replace(this.data.title+"-", "").replace(this.data.title+" - ", "").replace(this.data.title, "")
	list.show = this.data.title;
	list.subcat = title;
	list.initEpisodesList(this.elem, "", "", lists.episodes, this.category);

	if (list.empty) {
		this.focusedId = 0;
		this.setFocused(this.focusedId, true);
		var li = GLOBALS.focusmgr.getObject("episodes-list-0");
		li.elem.style.display = "none";
		this.descr.style.display = "block";
		this.scrollAllow = true;
		GLOBALS.focusmgr.focusObject(this.idnam);
	} else
		GLOBALS.focusmgr.focusObject("episodes-list-0");
	this.list = list;
	this.lists = lists;
	return;
}
MovieDetail.prototype.handleKeyPress = function (keycode) {
	switch (keycode) {
		case VK_UP:
			break;
			if (this.scrollAllow) {
				if (infotop == 0) {
					break;
				}
				infotop += 30;
				this.descr.style.top = infotop + "px";
			}
			break;
		case VK_DOWN:
			break;
			if (this.scrollAllow) {
				if (Math.abs(infotop) >= this.descr.scrollHeight - 190)
					break;
				infotop -= 30;
				this.descr.style.top = infotop + "px";
				break;
			}
			var li = GLOBALS.focusmgr.getObject("episodes-list-0");
			if (li && !li.empty) GLOBALS.focusmgr.focusObject("episodes-list-0");
			break;
		case VK_RIGHT:
			if(this.descrCont && this.descrCont.hasClass("open")) return;
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}

			if(this.buttons[this.focusedId + 1]){
				while(this.buttons[this.focusedId + 1].offsetLeft + this.buttons[this.focusedId + 1].offsetWidth > (1240 - this.movedPixels)){
					this.movedPixels = this.movedPixels - (this.buttons[this.focusedId + 1].offsetWidth + 31);
					// this.choices.style.left = this.movedPixels+"px";
				}
			}else{
				if(this.buttons[this.focusedId].offsetLeft + this.buttons[this.focusedId].offsetWidth + 31 > (1240-this.movedPixels)){
					this.movedPixels = this.movedPixels - (this.buttons[this.focusedId].offsetWidth + 31);
					// this.choices.style.left = this.movedPixels+"px";
				}
			}
			this.setFocused(this.focusedId, true);
			break;
		case VK_LEFT:

			if(this.descrCont && this.descrCont.hasClass("open")) return;
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				returnfocus = "show-detail";
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				break;
			}

			if(this.movedPixels < 150) {
				if(this.buttons[this.focusedId].offsetLeft + this.buttons[this.focusedId].offsetWidth < 1240 + this.movedPixels){
					this.movedPixels = this.movedPixels + this.buttons[this.focusedId].offsetWidth + 38
					// this.choices.style.left = this.movedPixels+"px";
				}
				while(this.movedPixels + this.buttons[this.focusedId].offsetLeft < 150){
					this.movedPixels = this.movedPixels + this.buttons[this.focusedId].offsetWidth + 38
					// this.choices.style.left = this.movedPixels+"px";
				}
			}
			if(this.movedPixels + this.buttons[this.focusedId].offsetWidth + 38 > 150){
				this.movedPixels = 150;
				// this.choices.style.left = this.movedPixels+"px";
			}
			this.setFocused(this.focusedId, true);
			break;
		case VK_ENTER:
			if (this.isMovie)
				break;
			if(this.descrCont && this.descrCont.hasClass("open")) {
				 if (!VIDEO_PREVIEW) {
				startRF2();
				}
			}

			if (this.lists && this.focusedId < this.lists.length || (this.descrCont &&  this.descrCont.hasClass("open")) ) {
				var li = GLOBALS.focusmgr.getObject("episodes-list-0");
				if(li)li.elem.style.display = "block";
				this.descrCont.removeClass("open");
				this.descr.style.display = "none";
				// this.choices.style.visibility = "visible";
				this.scrollAllow = false;

				GLOBALS.focusmgr.focusObject("episodes-list-0");

				if(this.focusedId >= 0){
					if(this.list && typeof this.list.unregister == 'function')
						this.list.unregister();
					if(this.list && this.list.elem) this.list.elem.remove();
					var list = new HorizontalList("episodes-list-0");
					list.id = 0;
					/*if (this.focusedId >= this.lists.length)
			    this.focusedId--;*/
					if(!this.lists[this.focusedId]){
						GLOBALS.focusmgr.focusObject(this.idnam);
						break;
					}
					var title = this.lists[this.focusedId].title.replace(this.data.title+"-", "").replace(this.data.title+" - ", "").replace(this.data.title, "")
					list.show = this.data.title;
					list.subcat = title;
					list.initEpisodesList(this.elem, "", "", this.lists[this.focusedId].items, this.category);
					list.parentObj = this;
					if (list.empty) {
						this.focusedId = 0;
						this.setFocused(this.focusedId, true);
						var li = GLOBALS.focusmgr.getObject("episodes-list-0");
						li.elem.style.display = "none";
						this.descr.style.display = "block";
						this.scrollAllow = true;
						GLOBALS.focusmgr.focusObject(this.idnam);
					} else
						GLOBALS.focusmgr.focusObject("episodes-list-0");

					this.list = list;
				}
			} else if (this.lists && this.focusedId == this.lists.length) {
				var li = GLOBALS.focusmgr.getObject("episodes-list-0");
				if(li) li.elem.style.display = "none";
				this.descrCont.addClass("open");
				this.descr.style.display = "block";
				// this.choices.style.visibility = "hidden";
				this.scrollAllow = true;
				stopRF();
			}
			break;
		case VK_BACK:
			if(this.descrCont && this.descrCont.hasClass("open")) {
				this.handleKeyPress(VK_ENTER);
				break;
			}
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

function PrivacyInfo(idnam) {
	this.idnam = idnam;
}
PrivacyInfo.prototype = new BaseObject();
PrivacyInfo.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "privacy-detail");
	this.parent = parent;
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	var privacyTitle = createClassDiv("", "", "privacy-title-label");
	privacyTitle.innerHTML = "ΟΡΟΙ ΧΡΗΣΗΣ";
	this.elem.appendChild(privacyTitle);
	var privacycont = createClassDiv("", "", "privacy-cont");
	var privacy = createClassDiv("", "", "privacy-data");
	privacy.id = "privacyData";
	privacy.innerHTML = "<p>Το σύνολο του περιεχομένου και των υπηρεσιών του δικτυακού τόπου www.skai.gr διατίθεται στους επισκέπτες / χρήστες αυστηρά για προσωπική χρήση και απαγορεύεται η χρήση ή η αναδημοσίευση, μέρους ή του συνόλου του, με οποιοδήποτε τρόπο, χωρίς την έγγραφη άδεια της εταιρείας <strong>ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ </strong>Νόμος 2121/1993 και κανόνες Διεθνούς Δικαίου πού ισχύουν στην Ελλάδα. Για πληροφορίες: webmaster@skai.gr</p> <p>Η χρήση του δικτυακού τόπου www.skai.gr (εφεξής καλούμενου χάριν συντομίας ως «δικτυακού τόπου») υπόκεινται στους όρους και προϋποθέσεις που παρατίθενται στη συνέχεια. Η χρήση του δικτυακού τόπου, συνιστά τεκμήριο ότι ο επισκέπτης / χρήστης έχει αναγνώσει και αποδέχεται ανεπιφύλακτα τους όρους χρήσης. Σε περίπτωση μη αποδοχής οποιοδήποτε όρου της παρούσας, απαγορεύεται ρητώς η χρήση του δικτυακού τόπου.</p> <p><strong>Πνευματικά Δικαιώματα</strong></p> <p>Το σύνολο του περιεχομένου του δικτυακού τόπου, συμπεριλαμβανομένων, ενδεικτικά και όχι περιοριστικά, κειμένων, ειδήσεων, γραφικών, φωτογραφιών, σχεδιαγραμμάτων, απεικονίσεων, παρεχόμενων υπηρεσιών, αποτελεί αντικείμενο πνευματικής ιδιοκτησίας της εταιρείας <strong>ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ</strong> (εφεξής καλούμενου χάριν συντομίας ως η «Εταιρεία») και διέπεται από τις εθνικές και διεθνείς διατάξεις περί Πνευματικής Ιδιοκτησίας, με εξαίρεση τα ρητώς αναγνωρισμένα δικαιώματα τρίτων.&nbsp;<br> Τα λογότυπα, επωνυμίες, εμπορικά σήματα και γνωρίσματα που περιλαμβάνονται στο δικτυακό τόπο ανήκουν στην εταιρεία <strong>ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ</strong> ή/και στα πρόσωπα που μνημονεύονται ως κύριοι των σχετικών δικαιωμάτων στο δικτυακό τόπο, και προστατεύονται σύμφωνα με την κείμενη νομοθεσία για την βιομηχανική ιδιοκτησία.</p> <p><strong>Άδεια Χρήσης</strong></p> <p>Απαγορεύεται ρητά η οποιαδήποτε χρήση, αναπαραγωγή, αναδημοσίευση, αντιγραφή, αποθήκευση, πώληση, μετάδοση, διανομή, έκδοση, εκτέλεση, φόρτωση (download), μετάφραση, τροποποίηση με οποιονδήποτε τρόπο, τμηματικά ή περιληπτικά, του περιεχομένου του δικτυακού τόπου και των υπηρεσιών που προσφέρονται σε αυτό, χωρίς την προηγούμενη έγγραφη άδειά της Εταιρείας. Κατ’ εξαίρεση, επιτρέπεται η μεμονωμένη αποθήκευση και αντιγραφή τμημάτων του περιεχομένου σε απλό προσωπικό υπολογιστή για αυστηρά προσωπική χρήση, χωρίς πρόθεση εμπορικής ή άλλης εκμετάλλευσης και πάντα υπό την προϋπόθεση της αναγραφής της πηγής προέλευσής του, χωρίς αυτό να σημαίνει καθ’ οιονδήποτε τρόπο παραχώρηση δικαιωμάτων πνευματικής ιδιοκτησίας.</p> <p><strong>Δηλώσεις Αποποίησης και Περιορισμοί ευθύνης Διαδικτύου</strong></p> <p>H Εταιρεία καταβάλλει κάθε προσπάθεια, ώστε το σύνολο του Περιεχομένου και οι πληροφορίες που εμφανίζονται στον δικτυακό της τόπο να χαρακτηρίζονται από ακρίβεια, σαφήνεια, ορθότητα, πληρότητα, επικαιρότητα και διαθεσιμότητα. Σε καμία όμως περίπτωση η Εταιρεία δεν εγγυάται και δεν ευθύνεται κατά συνέπεια (ούτε καν από αμέλεια) για οιαδήποτε ζημία τυχόν προκληθεί στον επισκέπτη / χρήστη, από την χρήση του δικτυακού της τόπου. Το Περιεχόμενο και οι Υπηρεσίες παρέχονται από την Εταιρεία «ως έχουν», χωρίς καμία εγγύηση ρητή ή έμμεση, διατυπωμένη ή υποτιθέμενη, εξυπακουόμενων των εγγυήσεων ικανοποιητικής ποιότητας, καταλληλότητας, απαραβίαστου συμβατότητας, ασφάλειας και ακρίβειας, τις οποίες όλες ρητά αρνείται η Εταιρεία. Σε καμία περίπτωση η Εταιρεία δεν ευθύνεται για οιαδήποτε τυχόν ζημία (θετική ή αποθετική, η οποία ενδεικτικά και όχι περιοριστικά, συνίσταται σε απώλεια κερδών, δεδομένων, διαφυγόντα κέρδη, χρηματική ικανοποίηση κλπ.) από χρήστες/επισκέπτες του δικτυακού της τόπου, ή τρίτους, από αιτία που έχει σχέση με τη λειτουργία ή μη, τη χρήση του δικτυακού τόπου, τυχόν αδυναμία παροχής υπηρεσιών / πληροφοριών που διατίθενται από αυτόν ή από τυχόν μη επιτρεπόμενες παρεμβάσεις τρίτων σε προϊόντα / υπηρεσίες / πληροφορίες που διατίθενται μέσω αυτού. Η Εταιρεία καταβάλλει κάθε δυνατή προσπάθεια για την καλή λειτουργία του Δικτύου της, σε καμία όμως περίπτωση δεν εγγυάται ότι οι λειτουργίες του δικτυακού της τόπου ή των servers της θα είναι αδιάκοπες ή χωρίς κανενός είδους σφάλμα, απαλλαγμένες από ιούς και παρόμοια στοιχεία, είτε πρόκειται για τον Δικτυακό της τόπο, είτε για κάποιο άλλο site ή server μέσω των οποίων μεταδίδεται το περιεχόμενο της.</p> <p><strong>Αποκλεισμός Προτροπών – Συμβουλών</strong></p> <p>Κανένα μέρος του παρεχομένου στους χρήστες / επισκέπτες Περιεχομένου του δικτυακού τόπου δεν αποτελεί και δεν μπορεί να θεωρηθεί σε καμία περίπτωση, ευθέως ή εμμέσως, παρότρυνση, συμβουλή ή προτροπή για οποιαδήποτε πράξη ή παράληψη, αλλά αντιθέτως εναπόκειται στη διακριτική ευχέρεια των χρηστών / επισκεπτών κατόπιν αξιολόγησης να ενεργήσουν με βάση την δική τους βούληση, αποκλειομένης οιασδήποτε ευθύνης της Εταιρείας.</p> <p><strong>Προσωπικά Δεδομένα</strong></p> <p>Η Εταιρεία δεσμεύεται ότι θα χρησιμοποιεί τυχόν προσωπικά δεδομένα που οικειοθελώς οι χρήστες/επισκέπτες θα χορηγούν στο δικτυακό τόπο, κατά τρόπο σύννομο με την ελληνική και κοινοτική νομοθεσία και με σκοπό τη βελτίωση των υπηρεσιών που παρέχει στους χρήστες/επισκέπτες ή προκειμένου να διαπιστώσει τις ανάγκες, επιθυμίες και προσδοκίες αυτών.</p> <p><strong>Σύνδεσμοι προς δικτυακούς τόπους (links)</strong></p> <p>Η Εταιρεία δεν ελέγχει τη διαθεσιμότητα, το περιεχόμενο, την πολιτική προστασίας των προσωπικών δεδομένων, την ποιότητα και πληρότητα των υπηρεσιών άλλων δικτυακών τόπων και σελίδων στα οποία παραπέμπει μέσω δεσμών, hyperlinks ή διαφημιστικών banners (εφεξής καλουμένων χάριν συντομίας ως «σύνδεσμοι»). Οι ανωτέρω σύνδεσμοι έχουν τοποθετηθεί αποκλειστικά για τη διευκόλυνση των επισκεπτών/χρηστών του δικτυακού τόπου, ενώ οι δικτυακοί τόποι στους οποίους παραπέμπουν υπόκεινται στους αντίστοιχους, των δικτυακών αυτών τόπων, όρων χρήσης. Η τοποθέτηση των συνδέσμων δεν αποτελεί ένδειξη έγκρισης ή αποδοχής του περιεχομένου των αντίστοιχων δικτυακών τόπων από τη Εταιρεία, η οποία δεν φέρει καμία ευθύνη για το περιεχόμενο τους, καθώς και για οποιαδήποτε ζημία προκύψει από τη χρήση τους, καθώς ο επισκέπτης έχει πρόσβαση σε αυτές με δική του ευθύνη.</p> <p><strong>Περιεχόμενο που υποβάλλεται από τους χρήστες</strong></p> <p>H Εταιρεία δίνει στους χρήστες την επιλογή να δημοσιεύουν στο δικτυακό τόπο δικό τους περιεχόμενο, ή να παραπέμπουν σε δικό τους περιεχόμενο δημοσιευμένο σε άλλους δικτυακούς τόπους.</p> <ol> <li>Η Εταιρεία δεν έχει την υποχρέωση να ελέγχει το περιεχόμενο αυτό και να δεν αναλαμβάνει καμία ευθύνη για λάθη, παραλείψεις, προσβλητικές εικόνες, χυδαία γλώσσα ή εικόνες, πορνογραφικό, απειλητικό ή δυσφημιστικό προς οποιονδήποτε υλικό στο περιεχόμενο που υποβάλλεται από τους χρήστες.</li> <li>Απαγορεύεται στους χρήστες να δημοσιεύουν στο δικτυακό τόπο υλικό παράνομο, απειλητικό, δυσφημιστικό, προσβλητικό, άσεμνο, σκανδαλώδες, εμπρηστικό, πορνογραφικό, προσβλητικό προς το θρησκευτικό συναίσθημα ή ο,τιδήποτε άλλο θα μπορούσε να θεωρηθεί εκτός νόμου, να εγείρει νομική υπευθυνότητα ή με άλλο τρόπο παραβιάζει το νόμο. Σε περίπτωση που περιεχόμενο όπως το παραπάνω υποπέσει στην αντίληψη της Εταιρείας, η Εταιρεία θα το αφαιρέσει από το δυκτυακό τόπο, χωρίς ειδοποίηση.</li> <li>Οι χρήστες αναγνωρίζουν στην Εταιρεία το δικαίωμα να ελέγχει και να εγκρίνει το υλικό που υποβάλλουν πριν τη δημοσίευσή του στο δικτυακό τόπο. Η εταιρεία και οι συνεργαζόμενες με αυτήν επιχειρήσεις για το δικτυακό τόπο έχουν το δικαίωμα (αλλά όχι την υποχρέωση) να ελέγχουν, εγκρίνουν, απορρίπτουν ή διαγράφουν περιεχόμενο που υποβάλλουν οι χρήστες στο δικτυακό τόπο. Τα παραπάνω είναι στη διακριτική ευχέρεια του ορισμένου από την Εταιρεία αρμόδιου προσωπικού και οι αποφάσεις του δεν επιδέχονται αμφισβήτησης. Η Εταιρεία και οι συνεργαζόμενες επιχειρήσεις διατηρούν το δικαίωμα να αρνηθούν να δημοσιεύσουν περιεχόμενο που παραβιάζει τους παρόντες όρους. </li> <li>Η Εταιρεία διατηρεί το δικαίωμα να διαγράψει ή να αρνηθεί τη δημοσίευση περιεχομένου που παραβιάζει δικαιώματα χρήσης, εμπορικά σήματα, εμπορικά συμβόλαια ή οποιοδήποτε άλλο πνευματικό δικαίωμα προσώπων ή νομικών προσώπων, καθώς επίσης και υλικό που παραβιάζει προσωπικά δεδομένα προσώπων. Για παράδειγμα, το Περιεχόμενο δε μπορεί να περιλαμβάνει: εμπορικά σήματα που ανήκουν σε τρίτες εταιρείες, υλικό που προστατεύεται από δικαιώματα πνευματικής ιδιοκτησίας, ονόματα, μιμήσεις, φωνές ή άλλα χαρακτηριστικά που παραπέμπουν σε δημόσια πρόσωπα, καθώς και περιεχόμενο που προωθεί οποιοδήποτε προϊόν ή υπηρεσία εκτός των προϊόντων της Εταιρείας.</li> <li>Κάθε χρήστης που δημοσιεύει περιεχόμενο αποδέχεται και δηλώνει πως: <ul> <li>Έχει το δικαίωμα να υποβάλει και να δημοσιεύσει το περιεχόμενο στο site.</li> <li>Το περιεχόμενο δεν περιλαμβάνει ή παραβιάζει κατατεθειμένα εμπορικά σήματα, λογότυπα ή υλικό προστατευμένο από πνευματικά δικαιώματα οποιουδήποτε φυσικού ή νομικού προσώπου.</li> <li>Απαλλάσσει την Εταιρεία από οποιοδήποτε κόστος δικαιώματος εκμετάλλευσης, αμοιβή και οποιαδήποτε άλλο χρέος προς οποιοδήποτε φυσικό ή νομικό πρόσωπο εξαιτίας της δημοσίευσης στο δικτυακό τόπο του περιεχομένου που έχει υποβάλει.</li> <li>Κάθε πρόσωπο που απεικονίζεται στο περιεχόμενο έχει συναινέσει στην απεικόνισή του.</li> <li>Έχει όλες την άδεια για τη χρήση στο περιεχόμενο που υποβάλλει όλων των αντικειμένων / σκηνικών/ κοστουμιών που παρουσιάζονται στο περιεχόμενο.</li> </ul> </li> <li>Οι χρήστες και όχι η Εταιρεία είναι αποκλειστικά υπεύθυνοι για το περιεχόμενο που υποβάλουν ή διανέμουν μέσω του δικτυακού τόπου καθ’ οιονδήποτε τρόπο. Σε καμία περίπτωση η Εταιρεία ή οι συνεργάτες και οι σχετιζόμενες με αυτήν εταιρείες, οι εργαζόμενοι σε αυτήν, οι διευθυντές, μέτοχοι ή εκπρόσωποί της δε μπορούν να θεωρηθούν υπεύθυνοι για ζημίες ή απώλειες οποιουδήποτε είδους (για παράδειγμα, μεταξύ άλλων: άμεση έμμεση, τυχαία, παρεπόμενη, αστική ή ποινική) που προκύπτουν από ενέργειες των χρηστών του δικτυακού τόπου.</li> <li>Εάν κάποιος χρήστης επιθυμεί να αποσύρει περιεχόμενο που έχει υποβάλει, οφείλει να ενημερώσει την Εταιρεία χρησιμοποιώντας το email επικοινωνίας που υπάρχει στο δικτυακό τόπο. Το περιεχόμενο θα αποσυρθεί εντός 1-2 εργάσιμων ημερών.</li> </ol> <p><strong>Δικαιώματα Xρήσης του Περιεχομένου</strong></p> <p>Το περιεχόμενο που υποβάλλουν και δημοσιεύουν οι χρήστες παραμένει ιδιοκτησία τους. Παρόλα αυτά, για οποιοδήποτε περιεχόμενο υποβάλλουν οι χρήστες στο δικτυακό τόπο για δημοσίευση , αυτόματα παραχωρούν στην Εταιρεία την απεριόριστη, χωρίς αντίτιμο, άδεια για χρήση, διανομή, αναπαραγωγή, τροποποίηση, προσαρμογή, δημόσια προβολή και εκμετάλλευση του περιεχομένου οποτεδήποτε και με οποιοδήποτε τρόπο ηλεκτρονικό ή έντυπο.</p> <p><strong>Μεταβατικές Διατάξεις</strong></p> <p>Η Εταιρεία διατηρεί το δικαίωμα να τροποποιεί το περιεχόμενο ή τις υπηρεσίες του δικτυακού τόπου, καθώς και τους όρους χρήσης, οποτεδήποτε το κρίνει αναγκαίο και χωρίς προηγούμενη προειδοποίηση, με την ανακοίνωσή τους μέσω του δικτυακού τόπου. Οι παρόντες όροι διέπονται και ερμηνεύονται από το ελληνικό δίκαιο, αρμόδια δε για την επίλυση κάθε διαφοράς θα είναι τα καθ' ύλην ελληνικά δικαστήρια. Η Εταιρεία διατηρεί το δικαίωμα να παραιτηθεί από την παρούσα διάταξη και να εφαρμόσει ή και να ερμηνεύσει τους παρόντες όρους σύμφωνα με το δίκαιο της χώρας του χρήστη, καθώς και να υπαγάγει τις οποιεσδήποτε διαφορές ή/και στη δικαιοδοσία της χώρας του χρήστη.</p>";
    privacycont.appendChild(privacy);
	this.elem.appendChild(privacycont);
}
PrivacyInfo.prototype.handleKeyPress = function (keycode) {
	switch (keycode) {
		case VK_UP:
			var d = document.getElementById("privacyData");
			if (privacyTop == 0) {
				break;
			}
			privacyTop += 35;
			d.style.top = privacyTop + "px";
			break;
		case VK_DOWN:
			var d = document.getElementById("privacyData");
			if (Math.abs(privacyTop) >= d.scrollHeight - 570)
				break;
			privacyTop -= 35;
			d.style.top = privacyTop + "px";
			break;
		case VK_LEFT:
			returnfocus = "privacyInfo";
			var sm = GLOBALS.focusmgr.getObject("side-menu");
			sm.elem.style.opacity = 1;
			GLOBALS.focusmgr.focusObject("side-menu");
			break;
		case VK_BACK:
			GLOBALS.focusmgr.focusObject(activelist);
			var c = document.getElementById("scene0");
			var o = GLOBALS.focusmgr.getObject("privacyInfo");
			o.unregister();
			o.buttons = [];
			c.removeChild(o.elem);
			var sm = GLOBALS.focusmgr.getObject("side-menu");
			sm.elem.style.opacity = 0.5;
			break;
		default:
			break;
	}
}
function EpisodesListCont(idnam, data) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.data = data;
	this.listHeight = 210;
	this.ref = "";
	//this.ref = "ep-";
}

EpisodesListCont.prototype = new BaseObject();
EpisodesListCont.prototype.init = function (parent, xpos, ypos) {
	var cont = createClassDiv("", "", "list-container");
	cont.style.top = "425px";
	parent.appendChild(cont);
	this.baseInit(cont);
	this.register();
	this.buttons = [];
	if(this.isInner){
		for (var i = 0; i < this.data.length; i++) {
			var list = new HorizontalList("inner-list-" + i, i);
			list.parentObj = this;
			list.initEpisodesList(this.elem, "", "", this.data[i].items, this.data[i].title);
			this.buttons.push(list);
			this.top += this.listHeight;
		}
		if(GLOBALS.focusmgr.getObject("inner-list-0"))
			GLOBALS.focusmgr.focusObject("inner-list-0");
	}else{
		for (var i = 0; i < categories.length; i++) {

			var list = new HorizontalList(this.ref + "cat-list-" + i, i);
			list.parentObj = this;
			if(this.data[categories[i]].length == 1){
				list.initMoviesList(this.elem, "", "", this.data[categories[i]][0].items, starmenu[i]);
			}else{
				list.initMoviesList(this.elem, "", "", this.data[categories[i]], starmenu[i]);
			}
			this.buttons.push(list);
			this.top += this.listHeight;
		}
		if(GLOBALS.focusmgr.getObject(this.ref + "cat-list-0")){
			GLOBALS.focusmgr.focusObject(this.ref + "cat-list-0");
		}
	}

}
EpisodesListCont.prototype.scrollToFocused = function (factor) {
	this.innertop = (this.focusedId * this.listHeight);
	var result = parseInt(425) - parseInt(this.innertop);
	this.elem.style.top = result + "px";
}
function EpisodesList(idnam) {
	this.idnam = idnam;
	this.xpos = 0;
	this.ypos = 0;
	this.focusedId = 0;
	this.itemmargin = 280;
	this.strecke = 0;
	this.position = 100;
	this.animtimer = false;
	this.pixeltomove = 70;
	this.empty = false;
}
EpisodesList.prototype = new BaseObject();
EpisodesList.prototype.init = function (parent, xpos, ypos, episodes, title) {
	var e = createClassDiv("", "", "episodes-list");
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;

	this.episodes = episodes;
	this.title = title;
	var titlres = this.title.split(' ');

	var w = this.itemmargin;
	if (this.episodes.length > 0) {
		for (var i = 0; i < this.episodes.length; i++) {
			var inner = createClassDiv("", "", "episode");
			w += this.itemmargin;

			var im = document.createElement('img');
			im.src = this.episodes[i].image;
			var titl = createClassDiv("", "", "episode-title");
			var newtitl = this.episodes[i].title;
			titl.innerHTML = newtitl;
			inner.appendChild(im);
			inner.appendChild(titl);
			this.elem.appendChild(inner);
			this.buttons.push(inner);
		}
		if (this.buttons.length > 0)
			this.elem.style.width = w + "px";
	}
	if (this.buttons.length == 0) {
		this.elem.style.width = "92%";
		this.elem.style.height = "190px";
		var epslabel = createClassDiv("", "", "noeps");
		epslabel.innerHTML = "Δεν Υπάρχουν Επεισόδια !";
		this.elem.appendChild(epslabel);
		this.empty = true;
	}
}
EpisodesList.prototype.setFocused = function (otherobj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) {
				this.buttons[i].addClass("focused");
				if(VIDEO_PREVIEW){
					if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
					GLOBALS.previewTimer = null;
					var me = this;
					var item = this.episodes[i];

					GLOBALS.previewTimer = setTimeout(function(){
						if(item.mp4)
							GLOBALS.videopreview.setSourceWithHardReset(item.mp4);
						else if(item.video)
							GLOBALS.videopreview.setSourceWithHardReset(item.video);
						else
							GLOBALS.videopreview.setSourceWithHardReset(item.media_item_link);
						GLOBALS.previewTimer = null;
					}, 500);
					var imgToShow = this.createdItems[i].img;
					if(window.location.hostname == "127.0.0.1"){
						imgToShow = "http://smarttv.anixa.tv/"+item.img;
						GLOBALS.videopreview.setBgImg(imgToShow);
					}
					if(GLOBALS.videopreview.bg) 
						GLOBALS.videopreview.setBgImg(imgToShow);
				}
			} else {
				if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
			}
		} else {
			if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
		}
	}

}
EpisodesList.prototype.animScrollerLeft = function () {
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
		}, 100);
	}
}
EpisodesList.prototype.animScrollerRight = function () {
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
		}, 100);
	}
}
EpisodesList.prototype.checkTitle = function (str) {
	var matches = str.match(/(\d+)/g);
	var title = matches[matches.length - 3] + "/" + matches[matches.length - 2] + "/" + matches[matches.length - 1];
	return title;
}
EpisodesList.prototype.handleKeyPress = function (keyCode) {

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
		case VK_UP:
			GLOBALS.focusmgr.focusObject("show-detail");
			break;
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
				returnfocus = "episodes-list";
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				break;
			}
			this.animScrollerLeft();
			break;
		case VK_ENTER:
			var o = GLOBALS.focusmgr.getObject("list-cont"), item = this.episodes[this.focusedId];
			o.stopTeaser();
			var show = GLOBALS.focusmgr.getObject("show-detail"), showTitle="";
			if(show)
				showTitle = show.title;
			var movespath = show.data.title+"/"+item.title
			moves(movespath);
			GLOBALS.lastMoves = movespath;
			GLOBALS.scenemgr.openVideoPlayer();
			GLOBALS.videoplayer.oncase = ON_VOD;
			if (!GLOBALS.focusmgr.getObject("videoplayer")) {
				GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
				GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
			}

			GLOBALS.videoplayer.setTitle(item.title);

			if (ADCATS.indexOf(item.show) != -1 || NOAD.indexOf(item.category) == -1) {
				GLOBALS.videoplayer.todo = item;
				GLOBALS.videoplayer.ad = true;
				if(typeof prerollVideo !== "undefined") prerollVideo(item.show);
			} else {
				GLOBALS.videoplayer.setSource(item);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			}

			break;
		case VK_BACK:

			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

function EPG(idnam) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.elems = 0;
	this.items = 0;
}
EPG.prototype = new BaseObject();
EPG.prototype.init = function (parent, xpos, ypos) {
	if(VIDEO_PREVIEW){
	GLOBALS.videopreview.pause();
	} 
	var epgcontainer = createClassDiv("", "", "epg-container");
	this.parent = parent;
	parent.appendChild(epgcontainer);
	this.baseInit(epgcontainer);
	this.register();
	this.buttons = [];

	var me = this;
	var url = '/cretetv/json/epg.json?v'+Math.random();
	if(location.host == '127.0.0.1') url = './getShowsJson.php?key=epg';
	this.req = createHttpRequest(url, function (ret) {
		me.req = null;
		var JSONData = JSON.parse(ret);

		var epgday = new DaySelect("epg-dayselect");
		epgday.init(me.elem, "", "", JSONData);
		me.buttons.push(epgday);
	});
}

function EPGList(idnam) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.position = 0;
	this.topPosition = 0;
	this.itemmargin = 120;
	this.strecke = 0;
	this.pixeltomove = 80;
	this.pixeltomoveV = 120;
	this.animtimer = false;
}
EPGList.prototype = new BaseObject();
EPGList.prototype.init = function (parent, xpos, ypos, data) {
	if (VIDEO_PREVIEW)  {
		GLOBALS.videopreview.pause();

	}	
	var e = createClassDiv("", "", "epg-list");
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	this.items = [];
	var w = this.itemmargin;
	for (var i = 0; i < data.length; i++) {
		this.items.push(data[i]);
		inner = createClassDiv("", "", "epg-list-item");
		inner.id = "event_" + i;
		w += this.itemmargin;
		if(data[i].img){
			var evtimg = createClassDiv("", "", "epg-event-image");
			var img = document.createElement('img');
			img.src = "http://smarttv.anixa.tv/" + data[i].img;
			evtimg.appendChild(img);
		}
		if (data[i].trailer) {
			var evttrailer = createClassDiv("", "", "epg-event-trailer");
			evttrailer.innerHTML = "Play Trailer";
			inner.addClass("hasTrailer");
			inner.id = data[i].trailer;
			inner.appendChild(evttrailer);
		}
		var evttime = createClassDiv("", "", "epg-event-time");
		evttime.innerHTML = data[i].hour;
		var evtinf = createClassDiv("", "", "epg-info");
		var evttitle = createClassDiv("", "", "epg-event-title");
		evttitle.innerHTML = data[i].title;
		evtinf.appendChild(evttitle);
		var rat = document.createElement('img');
		rat.className = 'epg-event-rating';
		rat.width="25";
		rat.src = 'http://smarttv.anixa.tv/cretetv/img/rating/rating'+ data[i].rating.toLowerCase() +'.png';
		var ratCont = createClassDiv("","","epg-event-rating-container");
		ratCont.appendChild(rat);
		if (data[i].descr && data[i].descr != "") {
			var evtdescr = createClassDiv("", "", "epg-event-descr");
			evtdescr.innerHTML = data[i].descr;
			evtinf.appendChild(evtdescr);
		}
		inner.appendChild(ratCont);
		inner.appendChild(evttime);

		if(data[i].img) inner.appendChild(evtimg);


		inner.appendChild(evtinf);

		e.appendChild(inner);
		this.buttons[i] = inner;
		GLOBALS.focusmgr.focusObject("epg-list");
		this.setFocused(null, true);

	}
}
EPGList.prototype.setFocused = function (otherobj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) this.buttons[i].addClass("focused");
			else this.buttons[i].removeClass("focused");
		} else this.buttons[i].removeClass("focused");
	}
	return true;
}
EPGList.prototype.animScrollerLeft = function () {
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
		}, 100);
	}
}
EPGList.prototype.animScrollerRight = function () {
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
		}, 100);
	}
}
EPGList.prototype.animScrollerUp = function () {
	this.setFocused(this.idnam, true);
	this.position = this.position + this.itemmargin;
	this.elem.style.top = this.position + 'px';
}
EPGList.prototype.animScrollerDown = function () {
	this.setFocused(this.idnam, true);
	this.position = this.position - this.itemmargin;
	this.elem.style.top = this.position + 'px';
}
EPGList.prototype.handleKeyPress = function (keycode) {
	switch (keycode) {
		case VK_RIGHT:
			break;
		case VK_LEFT:
			returnfocus = this.idnam;
			var sm = GLOBALS.focusmgr.getObject("side-menu");
			sm.elem.classList.toggle("open");
			GLOBALS.focusmgr.focusObject("side-menu");
			break;
		case VK_ENTER:
			break;
			var e = new MovieDetail("show-detail", this.items[this.focusedId]);
			e.category = this.category;
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = e;
			GLOBALS.focusmgr.focusObject("show-detail");
			break;
		case VK_DOWN:
			if (this.animtimer) break;
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1){
				this.focusedId = this.buttons.length - 1;
			}
			else {
				this.animScrollerDown();
				this.setFocused(this.idnam, true);
			}   
			break;
		case VK_UP:
			if (this.animtimer) break;
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				GLOBALS.focusmgr.focusObject("epg-dayselect");
			} else {
				this.animScrollerUp();
				this.setFocused(this.idnam, true);

			}
			break;
		case VK_BACK:
			GLOBALS.scenemgr.goBack();
			//startRF2();
			if(!VIDEO_PREVIEW){
					startRF2();
				}else{
					GLOBALS.videopreview.play();
					}

			break;
		default:
			break;
	}
}

function DaySelect(idnam) {
	this.idnam = idnam;
	this.focusedId = 1;
}
DaySelect.prototype = new BaseObject();
DaySelect.prototype.init = function (parent, xpos, ypos, days) {
	var dayselect = createClassDiv("", "", "epg-day-select");
	parent.appendChild(dayselect);
	this.baseInit(dayselect);
	this.register();
	this.buttons = [];
	this.days = days;
	var dayNames = ["ΚΥΡΙΑΚΗ","ΔΕΥΤΕΡΑ", "ΤΡΙΤΗ", "ΤΕΤΑΡΤΗ", "ΠΕΜΠΤΗ", "ΠΑΡΑΣΚΕΥΗ", "ΣΑΒΒΑΤΟ"];

	for (var i = 0; i < days.length; i++) {

		var dayitem = createClassDiv("", "", "epg-day-item");
		dayitem.innerHTML = dayNames[(toDate(days[i].day).getDay())%7]+"<br/>"+days[i].day;
		dayselect.appendChild(dayitem);

		this.buttons[i] = dayitem;
	}
	this.focusedId = new Date().getDay();
	this.setActive(this.buttons[this.focusedId], true);

	var me = GLOBALS.focusmgr.getObject("epg");
	var cont = createClassDiv("", "", "epg-content");


	var list = new EPGList("epg-list");
	list.init(cont, "", "", days[this.focusedId].shows);
	me.elem.appendChild(cont);
	me.buttons.push(list);
	//GLOBALS.focusmgr.focusObject("epg-list");
}
function toDate(dateStr) {
	var parts = dateStr.split("-")
	return new Date(parts[2], parts[1] - 1, parts[0])
}
DaySelect.prototype.setFocused = function (otherobj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) this.buttons[i].addClass("focused");
			else this.buttons[i].removeClass("focused");
		} else this.buttons[i].removeClass("focused");
	}
	return true;
}
DaySelect.prototype.setActive = function (otherobj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) this.buttons[i].addClass("active");
			else this.buttons[i].removeClass("active");
		} else this.buttons[i].removeClass("active");
	}
	return true;
}
DaySelect.prototype.createWeek = function (day) {
	var days = ["ΚΥΡΙΑΚΗ", "ΔΕΥΤΕΡΑ", "ΤΡΙΤΗ", "ΤΕΤΑΡΤΗ", "ΠΕΜΠΤΗ", "ΠΑΡΑΣΚΕΥΗ", "ΣΑΒΒΑΤΟ"];
	var newdays = [];

	newdays.push(days[day]);
	for (var i = day; i < days.length; i++) {
		if (i != day) {
			newdays.push(days[i]);
		}

	}
	for (var i = 0; i < day; i++) {
		if (i != day) {
			newdays.push(days[i]);
		}

	}
	return newdays;
}
DaySelect.prototype.weekDates = function (today) {
	var weekdates = [];

	for (var i = 0; i < 7; i++) {
		var newDate = new Date(today.getTime() + i * 86400000);
		var day = newDate.getDate();
		var month = newDate.getMonth() + 1;

		var wdat = day + " / " + month;
		weekdates.push(wdat);
	}

	return weekdates;
}
DaySelect.prototype.handleKeyPress = function (keycode) {
	switch (keycode) {
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
			}
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				returnfocus = GLOBALS.focusmgr.getObject("epg-dayselect").idnam;
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				break;
			}
			this.setFocused(this.idnam, true);
			break;
		case VK_DOWN:
			GLOBALS.focusmgr.focusObject("epg-list");
			break;
		case VK_ENTER:
			this.setActive(this.idnam, true);

			if (GLOBALS.focusmgr.getObject("epg-list")) {
				var o = GLOBALS.focusmgr.getObject("epg-list");
				o.unregister();
				document.getElementsByClassName("epg-content")[0].removeChild(o.elem);
				var e = new EPGList("epg-list");
				e.init(document.getElementsByClassName("epg-content")[0], 0, 0, this.days[this.focusedId].shows);
				GLOBALS.focusmgr.focusObject("epg-list");
				this.currentDay = this.days[this.focusedId];
			}
			break;
		case VK_BACK:
			/*if (slideshowOpen) {
		var ti = GLOBALS.focusmgr.getObject("topInfo");
		ti.elem.style.display = "none";
	    }*/
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}


/**
 * MoviesInner constructor. It creates the view of buttons play and more details of a movie.
 * @class MoviesInner
 * @param {string} idnam is the name identifier of the object 
 */
function MoviesInner(idnam, isMovie) {
	this.idnam = idnam;
	this.focusedId = 0;
	this.isMovie = isMovie;
	this.scrollAllow = false;
	this.movedPixels = 150;
}
MoviesInner.prototype = new BaseObject();
/**
 * MoviesInner initialization
 * @memberof MoviesInner
 * @param {string} parent is the parent DOM element
 */
MoviesInner.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "movies-inner");
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.genres = [];
	this.ratingImg = null;
	this.infotop = Math.abs(0);
	// document.getElementById('details-inner').style.display = 'none';

	this.more = createClassDiv("", "", "more");
	this.more.innerHTML = this.descr;

	var m = createClassDiv("", "", "inner-menu");
	m.style.top = "45%";
	parent.appendChild(m);


	if (1 || this.isMovie) {
		var b = createClassDiv("", "", "back-black");
		b.style.top = "67%";
		this.moviesFooter = b;
		parent.appendChild(b);
	}
	var cont = createClassDiv("", "", "inner-menu-cont");
	m.appendChild(cont);
	this.menuCont = cont;

	var menu = [];
	menu.push({'more':'Περιγραφή'});
	if (this.data.exist)
		menu.push({'trailer':'TRAILER'});
	this.menu = menu;

	for (var i = 0;i < this.menu.length; i++) {
		var o = menu[i], keys = Object.keys(o), key = keys[0], m = createClassDiv("", "", "menu-item");
		m.innerHTML = o[key];
		m.setAttribute("key", key);
		this.menuCont.appendChild(m);
		this.buttons.push(m);
	}

	this.elem.appendChild(this.more);
}

MoviesInner.prototype.setFocused = function (obj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) this.buttons[i].addClass("focused");
			else this.buttons[i].removeClass("focused");
		} else {
			this.buttons[i].removeClass("focused");
		}
	}
}

MoviesInner.prototype.handleKeyPress = function (keyCode) {

	switch (keyCode) {
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				var o = GLOBALS.focusmgr.getObject("list-cont");
				returnfocus = o.ref + "cat-list-" + o.focusedId;
				returnfocus = this.idnam;
				var sm = GLOBALS.focusmgr.getObject("side-menu");
				sm.elem.classList.toggle("open");
				GLOBALS.focusmgr.focusObject("side-menu");
				break;
			}
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
			this.setFocused(this.buttons[this.focusedId], true);
			break;
		case VK_UP:

			if (this.scrollAllow) {
				this.setFocused(this.buttons[this.focusedId], false);
				if (this.infotop >= 0) {
					this.scrollAllow = false;
					this.infotop = 0;
					this.more.style.top = this.infotop + "px";
					this.setFocused(this.buttons[this.focusedId], "true");
					break;
				}

				this.infotop += 30;
				this.more.style.top = this.infotop + "px";
			}
			break;
		case VK_DOWN:
			this.scrollAllow = true;
			if (this.scrollAllow) {
				this.setFocused(this.buttons[this.focusedId], false);
				/*if (Math.abs(this.infotop) >= this.more.scrollHeight - 190)
		break;*/
				// if(this.infotop < 100) break;
				this.infotop -= 30;
				this.more.style.top = this.infotop + "px";
				break;
			}else {
				var o = GLOBALS.focusmgr.getObject("list-cont");
				GLOBALS.focusmgr.focusObject(o.ref + 'cat-list-6');
			}

		case VK_ENTER:
			if(this.focusedId == 0){
				this.scrollAllow = true;
				this.more.style.display = "block";
			}else if(this.focusedId == 1){  
				this.more.style.display = "none";
				if (this.data.exist) {
					GLOBALS.scenemgr.openVideoPlayer();
					var item = this.data, movespath = "Ταινίες/"+item.title;
					moves(movespath);
					GLOBALS.lastMoves = movespath;
					GLOBALS.videoplayer.oncase = ON_VOD;
					GLOBALS.videoplayer.setTitle(item.title);

					if (ADCATS.indexOf(item.show) != -1 || NOAD.indexOf(item.category) == -1) {
						GLOBALS.videoplayer.todo = item;
						GLOBALS.videoplayer.ad = true;
						if(typeof prerollVideo !== "undefined") prerollVideo(item.show);
					} else {
						GLOBALS.videoplayer.setSource(item);
						GLOBALS.videoplayer.start();
						GLOBALS.focusmgr.focusObject("videoplayer", true);
					}
				}

			}
			break;
		case VK_BACK:
			if (GLOBALS.scenemgr.sceneStack.length <= 1)
				break;
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

function VideoPreview(idnam) {
    this.idnam = idnam;
    this.prevsource = "";

    this._token = 0;
    this._pendingTimer = null;

    this._suspended = false;
    this._needsRebind = false;

    // NEW: some TVs cannot have 2 OIPF AV objects alive concurrently
    this._destroyedForMain = false;

    this.playerType = "oipf";
    this.firstPreview = 1;
}
VideoPreview.prototype = new BaseObject();

VideoPreview.prototype._dbg = function (s) {
    try { debug("[VP] " + s); } catch(e) {}
};

VideoPreview.prototype._mimeForUrl = function (url) {
    if (!url) return "application/dash+xml";
    var u = ("" + url).split("?")[0].toLowerCase();
    if (u.match(/mp4$/i)) return "video/mp4";
    if (u.match(/\.2ts$/i)) return "video/mpeg";
    return "application/dash+xml";
};

VideoPreview.prototype._createOipfObjectNode = function () {
    var obj = document.createElement("object");
    try { obj.setAttribute("id", "videopreview"); } catch(e) {}
    try { obj.id = "videopreview"; } catch(e) {}
if(!this._skipEarlyType()) try { obj.type = "video/mp4"; } catch(e) {}
    // keep layout stable
    try { obj.style.width = "100%"; } catch(e) {}
    try { obj.style.height = "100%"; } catch(e) {}
    try { obj.style.display = "block"; } catch(e) {}
    try { obj.style.visibility = "visible"; } catch(e) {}
    try { obj.style.opacity = 0; } catch(e) {}

    return obj;
};


VideoPreview.prototype._skipEarlyType = function () {
    try {
        return /tcl/i.test(navigator.userAgent || "");
    } catch (e) {
        return false;
    }
};

VideoPreview.prototype._ensurePreviewNode = function () {
    // If HTML5, nothing special
    if (this.playerType !== "oipf") return;

    // If preview object was destroyed (or missing), recreate it
    if (!this.video || !this.video.parentNode) {
        this._dbg("recreating OIPF preview object");
        this.video = this._createOipfObjectNode();
        try { this.container.appendChild(this.video); } catch(e) {}

        // Ensure stacking is same as before (bg, video, shadow)
        // If shadow exists and should be after video, keep it after video.
        try {
            if (this.shadow && this.shadow.parentNode === this.container) {
                this.container.removeChild(this.shadow);
                this.container.appendChild(this.shadow);
            }
        } catch(e) {}
    }

    // Browser weirdness: ensure id always present
    try {
        if (!this.video.id) {
            this.video.id = "videopreview";
            try { this.video.setAttribute("id", "videopreview"); } catch(e) {}
        }
    } catch(e) {}
};

VideoPreview.prototype.init = function(parent,xpos,ypos) {
	this.playerType = "oipf";
    this.firstPreview = 1;

    this._dbg("UA:" + navigator.userAgent);

    if (!navigator.userAgent.includes("HbbTV"))
        this.playerType = "html5";

    this._dbg("selected " + this.playerType + " player");

    var dvb = document.getElementById("mybroadcast");
    if (this.playerType == "oipf") {
        try { dvb.bindToCurrentChannel(); dvb.stop(); } catch (e) {}
    }
    if (dvb) dvb.style.display = "none";

    this.container = document.createElement("div");
    this.container.id = "previewcont";

    this.bg = document.createElement("img");
    this.bg.id = "showbg";

    this.shadow = document.createElement("div");
    this.shadow.id = "videoshadow";

    this.container.appendChild(this.bg);

    if (this.playerType == "html5") {
        this.video = document.createElement("video");
        this.video.id = "videopreview";
        this.video.muted = true;
        this.container.appendChild(this.video);
    } else {
        this.video = this._createOipfObjectNode();
        this.container.appendChild(this.video);
    }

    this.container.appendChild(this.shadow);

    if (GLOBALS.ui == 2) {
        try { this.container.classList.add("full"); } catch (e) {}
    }

    parent.appendChild(this.container);

    if (GLOBALS.ui == 3 && this.video)
        this.video.style.display = "none";
}

VideoPreview.prototype.setBgImg = function(source){
	if(!VIDEO_PREVIEW) return;
	this.bg.style.opacity = 0;
	this.bg.style.display = "none";

	var me = this;
	this.bg.onload = function() {
		me.bg.style.display = "block";
		me.bg.style.opacity = 1;
	};

	this.bg.onerror = function() {
		debug("Image failed to load: " + source);
	};

	this.bg.src = source;
}
VideoPreview.prototype.suspendForMain = function () {
    this._dbg("suspendForMain()");
    this._suspended = true;

    // Cancel any pending async
    this._token++;
    if (this._pendingTimer) {
        try { clearTimeout(this._pendingTimer); } catch(e) {}
        this._pendingTimer = null;
    }

    // Hard-destroy on OIPF devices to free decoder/video plane
    if (this.playerType === "oipf") {
        this._dbg("HARD destroy preview object for main player");
        this._destroyedForMain = true;

        try { this.video.onPlayStateChange = null; } catch(e) {}
        try { this.video.stop(); } catch(e) {}
        try { this.video.data = ""; } catch(e) {}
        try { this.video.setAttribute("data", ""); } catch(e) {}

        // remove from DOM to force TV to release resources
        try {
            if (this.video && this.video.parentNode) this.video.parentNode.removeChild(this.video);
        } catch(e) {}

        this.video = null;
        return;
    }

    // HTML5 fallback
    this.pause();
};

VideoPreview.prototype.resumeFromMain = function () {
    this._dbg("resumeFromMain()");
    this._suspended = false;
    this._needsRebind = true;

    if (this.playerType === "oipf" && this._destroyedForMain) {
        this._destroyedForMain = false;
        this._ensurePreviewNode();
    }

    if (this.prevsource) this.setSource(this.prevsource);
};

VideoPreview.prototype.pause = function () {
    if (GLOBALS.ui == 3) return;

    this._suspended = true;

    this._token++;
    if (this._pendingTimer) {
        try { clearTimeout(this._pendingTimer); } catch(e) {}
        this._pendingTimer = null;
    }

    this._dbg("pause()");

    try {
        if (this.playerType == "oipf") {
            try { this.video.onPlayStateChange = null; } catch(e) {}
            try { this.video.stop(); } catch(e) {}
            try { this.video.data = ""; } catch(e) {}
            try { this.video.setAttribute("data", ""); } catch(e) {}
        } else {
            try { this.video.oncanplay = null; this.video.onended = null; } catch(e) {}
            try { this.video.pause(); } catch(e) {}
            try { this.video.src = ""; this.video.load(); } catch(e) {}
        }
    } catch(e) {}

    this._needsRebind = true;

    try {
        this.video.style.opacity = 0;
        this.video.style.display = "none";
    } catch(e) {}
};

VideoPreview.prototype.play = function () {
    if (GLOBALS.ui == 3) return;
    if (!this.prevsource) return;

    this._dbg("play() -> setSource(prevsource)");
    this._suspended = false;
    this._needsRebind = true;

    if (this.playerType === "oipf") this._ensurePreviewNode();
    this.setSource(this.prevsource);
};

VideoPreview.prototype._applyOipfLocator = function (source, token) {
    var me = this;
    me._ensurePreviewNode();

    var t = me._mimeForUrl(source);
    me._dbg("setOipfType=" + t);

    try {
        me.video.onPlayStateChange = function () {
            if (me._suspended) return;
            if (token !== me._token) return;
            try {
                me._dbg("preview ps=" + me.video.playState + " err=" + me.video.error + " type=" + t);
                if (me.video.playState === 1) {
                    me.video.style.transition = "opacity 2s ease-in-out";
                    me.video.style.opacity = 1;
                    me.video.style.display = "block";
                    me.video.style.visibility = "visible";
                    me.bg.style.opacity = 0;
                }
                if (me.video.playState === 6) {
                    me._dbg("PREVIEW ERROR err=" + me.video.error +
                        " typeAttr=" + me.video.getAttribute("type") +
                        " typeProp=" + me.video.type +
                        " dataAttr=" + me.video.getAttribute("data") +
                        " dataProp=" + me.video.data);
                }
            } catch(e) {}
        };
    } catch(e) {}

    // ===== "VideoPlayer.setURL + stop()" style reset =====
    try { if (me.video.stop) me.video.stop(); } catch(e) {}

    // clear locator
    try { me.video.setAttribute("data", ""); } catch(e) {}
    try { me.video.data = ""; } catch(e) {}

    // stop again (yes, really)
    try { if (me.video.stop) me.video.stop(); } catch(e) {}

    // clear type too (important on some TVs for err=4 loops)
    try { me.video.setAttribute("type", ""); } catch(e) {}
    try { me.video.type = ""; } catch(e) {}

    // set type then data
    try { me.video.setAttribute("type", t); } catch(e) {}
    try { me.video.type = t; } catch(e) {}

    try { me.video.setAttribute("data", source); } catch(e) {}
    try { me.video.data = source; } catch(e) {}

    // show plane before play
    try {
        me.video.style.display = "block";
        me.video.style.visibility = "visible";
	me.video.style.transition = "opacity 2s ease 0s";
        me.video.style.opacity = 0;
    } catch(e) {}

    try { me.video.play(1); } catch(e) { me._dbg("preview play(1) threw"); }
    setTimeout(function () {
    	me.video.style.opacity = 1;
    }, 1000);
    setTimeout(function () {
        if (me._suspended) return;
        if (token !== me._token) return;
        try { me._dbg("afterPlay ps=" + me.video.playState + " err=" + me.video.error); } catch(e) {}
    }, 200);
};

VideoPreview.prototype.setSource = function (source) {
    if (GLOBALS.ui == 3) return;

    this.prevsource = source;

    if (this._suspended) {
        this._needsRebind = true;
        this._dbg("setSource stored while suspended: " + source);
        return;
    }

    if (this.firstPreview) this.firstPreview = 0;

    this._token++;
    var token = this._token;

    if (this._pendingTimer) {
        try { clearTimeout(this._pendingTimer); } catch(e) {}
        this._pendingTimer = null;
    }

    this._dbg("setSource APPLY token=" + token + " url=" + source);

    // NOTE: DO NOT aggressively stop broadcast here anymore.
    // On some TVs this interferes with main player lifecycles.
    // If you really need it, keep it outside preview.
    // var dvb = document.getElementById("mybroadcast");
    // try { dvb.bindToCurrentChannel(); debug("stop RF"); dvb.stop(); } catch (e) {}

    if (this.playerType === "oipf") {
        this._ensurePreviewNode();

        // Same-source optimization only if not needsRebind and data matches
        try {
            if (!this._needsRebind && this.video && this.video.data === source) {
                this._dbg("same source optimization: data matches, play()");
                try { this.video.play(1); } catch(e) {}
                try { this.video.style.opacity = 1; } catch(e) {}
                return;
            }
        } catch(e) {}

        this._needsRebind = false;

        var me = this;
        this._pendingTimer = setTimeout(function () {
            if (me._suspended) return;
            if (token !== me._token) return;
            me._pendingTimer = null;
            me._applyOipfLocator(source, token);
        }, 0);

    } else {
        if (!this.video) return;

        try { this.video.oncanplay = null; } catch(e) {}
        try { this.video.onended = null; } catch(e) {}

        try { this.video.pause(); } catch(e) {}
        try { this.video.src = source; this.video.load(); } catch(e) {}

        this._needsRebind = false;

        var me2 = this;
        this.video.oncanplay = function () {
            if (me2._suspended) return;
            if (token !== me2._token) return;
            try {
                me2.video.style.opacity = 1;
                var p = me2.video.play();
                me2.video.style.display = "block";
                if (p && p.catch) p.catch(function(){});
                me2.bg.style.opacity = 1;
            } catch(e) {}
        };

        this.video.onended = function () {
            if (me2._suspended) return;
            if (token !== me2._token) return;
            try { me2.video.style.display = "none"; } catch(e) {}
        };
    }
};

VideoPreview.prototype.setSourceWithHardReset = function (source) {
    if (GLOBALS.ui == 3) return;
    if (!source) return;

    this.prevsource = source;

    // same-source optimization (OIPF)
    try {
        if (this.playerType === "oipf") {
            if (!this._needsRebind && this.video && this.video.data === source) {
                this._dbg("hardReset same source optimization: play()");
                try { this.video.play(1); } catch(e) {}
                /*try {
                    this.video.style.display = "block";
                    this.video.style.visibility = "visible";
                    this.video.style.opacity = 1;
                } catch(e) {}*/
                return;
            }
        }
    } catch(e) {}

    // cancel pending work
    this._token++;
    var token = this._token;

    if (this._pendingTimer) {
        try { clearTimeout(this._pendingTimer); } catch(e) {}
        this._pendingTimer = null;
    }

    // HTML5: no decoder-plane drama
    if (this.playerType !== "oipf") {
        try { this.pause(); } catch(e) {}
        this._suspended = false;
        this._needsRebind = true;
        this.setSource(source);
        return;
    }

    // OIPF: HARD release like your VideoPlayer.stop/clearVideo sequence
    this._dbg("hardReset: HARD release + recreate");
    this._suspended = true;
    this._needsRebind = true;

    try { if (this.video) this.video.onPlayStateChange = null; } catch(e) {}

    try { if (this.video && this.video.stop) this.video.stop(); } catch(e) {}
    try { if (this.video) this.video.setAttribute("data", ""); } catch(e) {}
    try { if (this.video) this.video.data = ""; } catch(e) {}
    try { if (this.video && this.video.stop) this.video.stop(); } catch(e) {}

    // clear type as well
    try { if (this.video) this.video.setAttribute("type", ""); } catch(e) {}
    try { if (this.video) this.video.type = ""; } catch(e) {}

    // hide/neutralize plane before removal
    try { if (this.video) this.video.style.visibility = "hidden"; } catch(e) {}
    try { if (this.video) this.video.style.display = "none"; } catch(e) {}
    try { if (this.video) this.video.style.opacity = 0; } catch(e) {}

    // remove from DOM
    try { if (this.video && this.video.parentNode) this.video.parentNode.removeChild(this.video); } catch(e) {}
    var elem = document.getElementById("videopreview");
    if(elem) elem.remove();
    
    this.video = null;

    var me = this;

    // IMPORTANT: small delay helps TVs actually free resources (err=3)
    this._pendingTimer = setTimeout(function () {
        if (token !== me._token) return;
        me._pendingTimer = null;

        me._suspended = false;
        me._needsRebind = true;

        me._ensurePreviewNode();
        me.setSource(source);
    }, 80); // try 50-150ms if needed
};
