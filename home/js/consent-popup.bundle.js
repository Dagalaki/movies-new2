(function () {
	'use strict';
	
function encodeUnicode(str) {
    var unicodeStr = "";
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i).toString(16).toUpperCase();
        while (charCode.length < 4) {
            charCode = "0" + charCode;
        }
        unicodeStr += "\\u" + charCode;
    }
    return unicodeStr;
}

function decodeUnicode(str) {
    return str.replace(/\\u([0-9A-Fa-f]{4})/g, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
    });
}

	

function createClassDiv$1(xpos, ypos, className) {
		var ret = document.createElement('div');
		if (xpos !== false) {
			ret.style.left = xpos + 'px';
		}
		if (ypos !== false) {
			ret.style.top = ypos + 'px';
		}
		ret.className = className;
		return ret;
	}

	function hasClass(elem, className) {
		return elem.classList.contains(className);
	    //return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	}

	function addClass$1(elem, className) {
	    if (!hasClass(elem, className)) {
	        elem.className += ' ' + className;
	    }
	}

	function removeClass$1(elem, className) {
	    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
	    if (hasClass(elem, className) ) {
	        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
	            newClass = newClass.replace(' ' + className + ' ', ' ');
	        }
	        elem.className = newClass.replace(/^\s+|\s+$/g, '');
	    }
	}

	function getCookie$1(Name) {
		try {
			var offset, end, search = Name + "=";
			if (document.cookie.length > 0) {
				offset = document.cookie.indexOf(search);
				if (offset != -1) {
					offset += search.length;
					end = document.cookie.indexOf(";", offset);
					if (end == -1)
						end = document.cookie.length;
					return unescape(document.cookie.substring(offset, end))
				}
				return ('');
			}
		} catch (e) {}	return ('');
	}
	function setCookie$1(name,value,days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toUTCString();
		}
		//document.cookie = name + "=" + (value || "")  + expires + ";domain=.megatv-ctv.com;path=/";
		document.cookie = name + "=" + (value || "") + expires + ";domain=" + window.location.hostname + ";path=/";

	}



	window.createClassDiv = createClassDiv$1;
	window.addClass = addClass$1;
	window.removeClass = removeClass$1;
	window.getCookie = getCookie$1;
	window.setCookie = setCookie$1;

	function ConsentFrame(idnam){
		this.idnam = idnam;
		this.consentCookies = {consent:"true",person:"true",stats:"true", ads: "true"};
	}
	ConsentFrame.prototype = new BaseObject();

	ConsentFrame.prototype.init = function(parent, xpos, ypos){
		var e = createClassDiv("","","consentParent");
		parent.appendChild(e);
		this.baseInit(e);
		this.register();
		this.elem = e;
moves("Πατήθηκε το μπλε κουμπί");
		var tvbild = document.getElementById("tvbild");
		tvbild.style.display = "none";
		
	
		//var url = "./getChannelInfo.php?channel="+ "mega";
		
		var url = "./consent-info.json";

		var me = this;
		llog("Request Consent Specific data");
		this.req = createHttpRequest(url, function (ret) {
			me.req = null;
			me.data = JSON.parse(ret);

			llog(me.data.company);
			GLOBALS.consentInfo = me.data;

			if(getCookie(""+GLOBALS.consentInfo.cookiePerson+"") != ""){
				me.consentCookies.person = getCookie(""+GLOBALS.consentInfo.cookiePerson+"");
			}
			if(getCookie(""+GLOBALS.consentInfo.cookieStats+"") != ""){
				me.consentCookies.stats = getCookie(""+GLOBALS.consentInfo.cookieStats+"");
			}
			if(getCookie(""+GLOBALS.consentInfo.cookieAds+"") != ""){
				me.consentCookies.ads = getCookie(""+GLOBALS.consentInfo.cookieAds+"");
			}


			me.more = new ConsentMore("consentMore");
			me.more.init(me.elem);
			document.getElementById('redbutton').style.display='none';
		 var dvb= document.getElementById('mybroadcast');
        try {dvb.bindToCurrentChannel();}catch(e){}
document.getElementById('tvbild').style.display = 'block';
document.getElementById('dbg').style.display = 'none';
document.getElementById('dbg').style.visibility = 'hidden';
		});


		
	};

	ConsentFrame.prototype.showMore = function() {
		this.entry.elem.style.display = "none";
		this.more = new ConsentMore("consentMore");
		this.more.init(this.elem);
	};
	function ConsentMenu(idnam) {
		this.idnam = idnam;
		this.menuOptions = [
		{
			"id":"privacy",
			"label":"ΠΟΛΙΤΙΚΗ ΑΠΟΡΡΗΤΟΥ"
		},
		{
			"id":"info",
			/*"label":"Όροι και Προϋποθέσεις"*/
			label: "ΟΡΟΙ ΚΑΙ ΠΡΟΫΠΟΘΕΣΕΙΣ"
		},
		{
			"id":"cookies",
			"label":"ΕΠΙΛΟΓΕΣ COOKIES"
		},
		{
			"id":"exit",
			"label":"ΕΞΟΔΟΣ"
		}
		];

	}

	ConsentMenu.prototype = new BaseObject();

	ConsentMenu.prototype.init = function(parent,xpos,ypos) {
		var e = createClassDiv("", "", "consent-menu");
		this.parent = parent;
		parent.appendChild(e);
		this.baseInit(e);
		this.register();
		
		this.privacyContainer = document.createElement("div");
		addClass(this.privacyContainer,"privacy-container");
		var privacyFloater = document.createElement("div");
		addClass(privacyFloater,"floater");
		privacyFloater.innerHTML = privacyText;
		this.privacyContainer.appendChild(privacyFloater);
		this.privacyFloater = privacyFloater;
		parent.appendChild(this.privacyContainer);


		this.infoContainer = document.createElement("div");
		addClass(this.infoContainer,"info-container");
		var infoFloater = document.createElement("div");
		addClass(infoFloater,"floater");
		infoFloater.innerHTML = infoText;
		this.infoContainer.appendChild(infoFloater);
		this.infoFloater = infoFloater;
		parent.appendChild(this.infoContainer);
		this.infoContainer.style.display = "none";
		this.buildMenu();

		this.floaterTop = 0;
	};
	ConsentMenu.prototype.buildMenu = function() {
		this.buttons = [];
		this.focusedId = 0;
		var e = this.elem;
		e.innerHTML = '';
		

		for (var i = 0; i < this.menuOptions.length; i++) {
			var s = this.menuOptions[i];
			var option = createClassDiv("", "", "option");
			option.id = s.id;
			var labl = createClassDiv("", "", "side-icon-label");
			labl.innerHTML = s.label;
			if(i > 1) labl.style.top = "27px";
			
			option.appendChild(labl);

			this.buttons.push(option);
			e.appendChild(option);
		}
		this.buttons.push(this.infoContainer);
		this.setActive(this.buttons[this.focusedId],true);
		
		this.privacyContainer.style.display = "block";
		this.privacyShown = true;
		this.infoShown = false;
/*		//llog("focus moved to " + this.idnam);
		GLOBALS.focusmgr.focusObject(this.idnam);
		this.setFocused(this.idnam,true);
		addClass(this.privacyContainer,"focused");
		removeClass(this.elem,"focused");

*/

		this.arrowUp = createClassDiv("","","scroll up");
		var bg = createClassDiv("","","bg");
		var icon = createClassDiv("","","icon");
		this.arrowUp.appendChild(bg);
		this.arrowUp.appendChild(icon);
		this.arrowDown = this.arrowUp.cloneNode(true);
		this.arrowDown.className = "scroll down active";

		this.parent.appendChild(this.arrowUp);
		this.parent.appendChild(this.arrowDown);
GLOBALS.focusmgr.focusObject(this.idnam, true);

	};
	ConsentMenu.prototype.setActive = function (otherobj, focus) {
		for (var i = 0; i < this.buttons.length; i++) {
			if (focus) {
				if (i == this.focusedId) addClass(this.buttons[i],"active");
				else removeClass(this.buttons[i],"active");
			} else removeClass(this.buttons[i],"active");
		}
		return true;
	};
	ConsentMenu.prototype.setFocused = function(otherobj, focus){
		

		if(focus && !hasClass_(this.elem,"focused"))
			addClass(this.elem,"focused");
		else if (!focus)
			removeClass(this.elem,"focused");
		for(var i = 0; i < this.buttons.length; i++){
			
			if (i == this.focusedId){
				if(focus){
					addClass(this.buttons[i],"focused");
				}
			}else {
				removeClass(this.buttons[i],"focused");
			}
		}
	};

	function hasClass_(elem, className) {
		return elem.classList.contains(className);
	}


	ConsentMenu.prototype.handleKeyPress = function (keyCode) {
switch (keyCode) {
/*
		case VK_BLUE:
			this.onBlue();
			break;
*/
		case VK_BACK:
			if(hasClass_(this.infoContainer,"focused")){
				removeClass(this.infoContainer,"focused");
				break;
			}
		case VK_LEFT:
			if(this.infoShown){
				addClass(this.infoContainer,"focused");
				removeClass(this.elem,"focused");
			}else if(this.privacyShown){
				addClass(this.privacyContainer,"focused");
				removeClass(this.elem,"focused");
			}
			else
				GLOBALS.focusmgr.focusObject("consentMore", true);
			break;
		case VK_RIGHT:
			if(this.infoShown){
				removeClass(this.infoContainer,"focused");
				addClass(this.elem,"focused");
			}
			if(this.privacyShown){
				removeClass(this.privacyContainer,"focused");
				addClass(this.elem,"focused");
			}
			break;
		case VK_DOWN:
			
			llog('privacy container classname ' + this.privacyContainer.className);
			if(!hasClass_(this.infoContainer,"focused") && !hasClass_(this.privacyContainer,"focused")){
			//if(!this.infoContainer.classList.contains("focused") && !this.privacyContainer.classList.contains("focused")){
				llog("[ConsentMore] VK DOWN info and privacy containers are not focused.. ");
				this.focusedId++;
				if(this.focusedId > this.buttons.length - 2)
					this.focusedId = this.buttons.length - 2;
				this.setFocused(this.buttons[this.focusedId], true);
			}else {
				llog("[ConsentMore] VK DOWN fix floater top");
				this.floaterTop -= 100;
				if(!hasClass_(this.arrowUp,"active")) addClass(this.arrowUp,"active");
				if(hasClass_(this.infoContainer,"focused")){
					if(this.floaterTop < -7200) this.floaterTop = -7200;
					this.infoFloater.style.marginTop = this.floaterTop +'px';
					if(this.floaterTop == -7200) removeClass(this.arrowDown,"active");
					else if(!hasClass_(this.arrowDown,"active")) addClass(this.arrowDown,"active");
					break;
				}
				if(hasClass_(this.privacyContainer,"focused")){
					if(this.floaterTop < -9500) this.floaterTop = -9500;
					this.privacyFloater.style.marginTop = this.floaterTop +'px';
					if(this.floaterTop == -9500) removeClass(this.arrowDown,"active");
					else if(!hasClass_(this.arrowDown,"active")) addClass(this.arrowDown,"active");
					break;
				}
			}
			break;
		case VK_UP:
			llog("[ConsentMore] VK UP");
			if(!hasClass_(this.infoContainer,"focused") && !hasClass_(this.privacyContainer,"focused")){
				llog("[ConsentMore] VK UP set focus on "+ this.buttons[this.focusedId]);
				this.focusedId--;
				if(this.focusedId < 0)
					this.focusedId = 0;
				this.setFocused(this.buttons[this.focusedId], true);
			}else {
				llog("[ConsentMore] VK UP fix floater top");
				this.floaterTop += 100;
				if(!hasClass_(this.arrowDown,"active")) addClass(this.arrowDown,"active");
				if(this.floaterTop > 0) this.floaterTop = 0;
				if(this.floaterTop == 0) removeClass(this.arrowUp,"active");
				else if(!hasClass_(this.arrowUp,"active")) addClass(this.arrowUp,"active");
				if(hasClass_(this.infoContainer,"focused")){
					this.infoFloater.style.marginTop = this.floaterTop +'px';
					break;
				}
				if(hasClass_(this.privacyContainer,"focused")){
					this.privacyFloater.style.marginTop = this.floaterTop +'px';
					break;
				}
			}
			break;
		case VK_ENTER:

			if(!hasClass_(this.infoContainer,"focused") && !hasClass_(this.privacyContainer,"focused")){
				this.setActive(this.buttons[this.focusedId],true);
				this.floaterTop = 0;
				removeClass(this.arrowUp,"active");
				if(!hasClass_(this.arrowDown,"active")) addClass(this.arrowDown,"active");
				this.privacyFloater.style.marginTop = this.infoFloater.style.marginTop = "0px";


				if (this.buttons[this.focusedId].id == "cookies"){
					this.infoContainer.style.display = "none";
					this.privacyContainer.style.display = "none";
					this.infoShown = false;
					llog("line 409 privacyShown false");
					this.privacyShown = false;
					//this.privacyFloater.style.marginTop = "0px";
					removeClass(this.arrowUp,"active");
					if(!hasClass_(this.arrowDown,"active")) addClass(this.arrowDown,"active");
					var m = GLOBALS.focusmgr.getObject("consentMore");
					if(m) m.subline.style.display = "block";
					if(hasClass_(this.parent,"text")) removeClass(this.parent,"text");
					this.handleKeyPress(VK_LEFT);
					break;
				}else {
					var m = GLOBALS.focusmgr.getObject("consentMore");
					if(m) m.subline.style.display = "none";
				}

				if(this.buttons[this.focusedId].id == "privacy"){
					this.privacyContainer.style.display = "block";
					this.privacyShown = true;
					this.infoContainer.style.display = "none";
					this.infoShown = false;
					if(!hasClass_(this.parent,"text")) addClass(this.parent,"text");
					this.handleKeyPress(VK_LEFT);
				}

				if(this.buttons[this.focusedId].id == "info"){
					this.privacyContainer.style.display = "none";
					llog("line 435 enter on consent menu");
					this.privacyShown = false;
					this.infoContainer.style.display = "block";
					this.infoShown = true;
					if(!hasClass_(this.parent,"text")) addClass(this.parent,"text");
					this.handleKeyPress(VK_LEFT);
					break;
				}
				
				if(this.buttons[this.focusedId].id == "exit"){
					this.unregister();
					var c = GLOBALS.focusmgr.getObject("consentFrame");
					this.elem.remove();
					if(c){
						c.unregister();
						c.elem.remove();
					}

 window.setTimeout(function(){location.href = '/cretetv/home/index.php?sd='+it_stream+'&s='+aktueller_sender;}, 500);
/*
					if(!GLOBALS.lastFocus && typeof loadScene === "function"){
						loadScene(46);
					}else {

			//			if(!returnfocus)
							GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus); //GLOBALS.focusmgr.focusObject("list-cont-cat-list-0");
			//			else
			//				GLOBALS.focusmgr.focusObject(returnfocus);
					}*/
				}
			}
			break;
		}
	};
	function ConsentEntry(idnam){
		this.idnam = idnam;
	}
	ConsentEntry.prototype = new BaseObject();

	ConsentEntry.prototype.init = function(parent, xpos, ypos) {
		var e = createClassDiv("","","consentContainer");
		parent.appendChild(e);
		this.baseInit(e);
		this.register();
		this.elem = e;
		var headline = createClassDiv("","","headline");
		headline.innerHTML = "Σεβόμαστε την ιδιωτικότητά σας";
		this.top = 56;
		var textContainer = createClassDiv("","","consentTextContainer");
		this.text = createClassDiv("","","text");
		this.text.style.top = this.top+"px";
		this.text.innerHTML = "<p>Εμείς και οι συνεργάτες μας αποθηκεύουμε ή/και έχουμε πρόσβαση σε πληροφορίες σε μια συσκευή, όπως cookies και επεξεργαζόμαστε προσωπικά δεδομένα, όπως μοναδικά αναγνωριστικά και τυπικές πληροφορίες που αποστέλλονται από μια συσκευή για εξατομικευμένες διαφημίσεις και περιεχόμενο, μέτρηση διαφημίσεων και περιεχομένου, καθώς και απόψεις του κοινού για την ανάπτυξη και βελτίωση προϊόντων.</p>"+
		"<p>Με την άδειά σας, εμείς και οι συνεργάτες μας ενδέχεται να χρησιμοποιήσουμε ακριβή δεδομένα γεωγραφικής τοποθεσίας και ταυτοποίησης μέσω σάρωσης συσκευών. Μπορείτε να κάνετε κλικ για να συναινέσετε στην επεξεργασία από εμάς και τους συνεργάτες μας όπως περιγράφεται παραπάνω. Εναλλακτικά, μπορείτε να αποκτήσετε πρόσβαση σε πιο λεπτομερείς πληροφορίες και να αλλάξετε τις προτιμήσεις σας πριν συναινέσετε ή να αρνηθείτε να συναινέσετε.</p>"+
		"<p>Λάβετε υπόψη ότι κάποια επεξεργασία των προσωπικών σας δεδομένων ενδέχεται να μην απαιτεί τη συγκατάθεσή σας, αλλά έχετε το δικαίωμα να αρνηθείτε αυτήν την επεξεργασία. Οι προτιμήσεις σας θα ισχύουν μόνο για αυτόν τον ιστότοπο. Μπορείτε πάντα να αλλάξετε τις προτιμήσεις σας επιστρέφοντας σε αυτόν τον ιστότοπο ή επισκεπτόμενοι την πολιτική απορρήτου μας.</p>";

		this.arrowUp = createClassDiv("","","scroll up");
		var bg = createClassDiv("","","bg");
		var icon = createClassDiv("","","icon");
		this.arrowUp.appendChild(bg);
		this.arrowUp.appendChild(icon);
		this.arrowDown = this.arrowUp.cloneNode(true);
		this.arrowDown.className = "scroll down active";
		this.buttons = [];

		var buttons = createClassDiv("","","buttons focus");
		var acceptBtn = createClassDiv("","","button right focus");
		acceptBtn.innerHTML = "ΑΠΟΔΟΧΗ";
		var optionsBtn = createClassDiv("","","button left");
		optionsBtn.innerHTML = "ΠΕΡΙΣΣΟΤΕΡΕΣ ΕΠΙΛΟΓΕΣ";
		buttons.appendChild(acceptBtn);
		buttons.appendChild(optionsBtn);
		
		this.buttons.push(optionsBtn);
		this.buttons.push(acceptBtn);

		var overlayTop = createClassDiv("","","overlay top");
		var overlayBottom = createClassDiv("","","overlay bottom");

		textContainer.appendChild(this.text);
		textContainer.appendChild(overlayTop);
		textContainer.appendChild(overlayBottom);


		e.appendChild(textContainer);
		e.appendChild(headline);
		e.appendChild(this.arrowUp);
		e.appendChild(this.arrowDown);
		e.appendChild(buttons);
		this.focusedId = 1;
		GLOBALS.focusmgr.focusObject(this.idnam, true);
	};

	ConsentEntry.prototype.handleKeyPress = function (keyCode) {
		
		switch (keyCode) {
		case VK_LEFT:
			this.focusedId--;
			if(this.focusedId<0) this.focusedId = 0;
			this.setFocused(this.idnam,true);
			break;
		case VK_RIGHT:
			this.focusedId++;
			if(this.focusedId>1) this.focusedId = 1;
			this.setFocused(this.idnam,true);
			break;
		case VK_DOWN:
			this.scrollDown();
			break;
		case VK_UP:
			this.scrollUp();
			break;
		case VK_ENTER:
			
			var c = GLOBALS.focusmgr.getObject("consentFrame");
			if(this.focusedId == 0){
				if(c){
					c.showMore();
				}
			}else {
				
				this.unregister();
				

				setCookie(""+GLOBALS.consentInfo.cookiePerson+"",c.consentCookies.person);
				setCookie(""+GLOBALS.consentInfo.cookieStats+"",c.consentCookies.stats);
				setCookie(""+GLOBALS.consentInfo.cookieAds+"",c.consentCookies.ads);
				setCookie(""+GLOBALS.consentInfo.cookieConsent+"", "true");
				if(c){
					c.unregister();
					c.elem.remove();
				}
/*
				if(typeof loadScene === "function"){
						loadScene(46);
				}else {
					GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
				}
	*/
 window.setTimeout(function(){location.href = '/cretetv/index.php?sd='+it_stream+'&s='+aktueller_sender;}, 500);				
				//else
				//	GLOBALS.focusmgr.focusObject(returnfocus);
			}
			break;
		case VK_BACK:
			llog("exit app");
			break;
		}
	};

	ConsentEntry.prototype.setFocused = function (otherobj, focus) {
		for (var i = 0; i < this.buttons.length; i++) {
			if (focus) {
				if (i == this.focusedId) addClass(this.buttons[i],"focus");
				else removeClass(this.buttons[i],"focus");
			} else removeClass(this.buttons[i],"focus");
		}
		return true;
	};

	ConsentEntry.prototype.scrollDown = function() {
		llog('scroll down entry');
		if(this.top == -308) return;
		addClass(this.arrowUp,"active");
		llog("class added ");
		removeClass(this.arrowDown,"active");
		llog("class removed");
		this.top -= 364;
		this.text.style.top = this.top+"px";
	};
	ConsentEntry.prototype.scrollUp = function() {
		llog('scroll up entry');
		if(this.top == 56) return;
		addClass(this.arrowDown,"active");
		llog("class added ");
		removeClass(this.arrowUp,"active");
		llog("class removed ");
		this.top += 364;
		this.text.style.top = this.top+"px";
	};

	function ConsentMore(idnam){
		this.idnam = idnam;
		this.positions = [
			"top",
			"middle",
			"bottom",
			"last"
			];
	}
	ConsentMore.prototype = new BaseObject();

	ConsentMore.prototype.init = function(parent, xpos, ypos) {
		var c = GLOBALS.focusmgr.getObject("consentFrame");
		var e = createClassDiv("","","consentSettingsContainer text");
		parent.appendChild(e);
		this.baseInit(e);
		this.register();
		this.elem = e;
		this.buttonsY = [];
		this.buttonsX = [];
		var headline = createClassDiv("","","headline");
		headline.innerHTML = "Ρυθμίσεις Απορρήτου";

		var subline = createClassDiv("","","subline");
		subline.innerHTML = "Μπορείτε να ανακαλέσετε ή να αλλάξετε τη συγκατάθεσή σας ανά πάσα στιγμή πηγαίνοντας στις ρυθμίσεις.";
		subline.style.display = "none";
		this.subline = subline;
		var cont = createClassDiv("","","container");

		var btn1 = createClassDiv("","","button option top");

		var icon = createClassDiv("","","icon");
		var title = createClassDiv("","","title");
		title.innerHTML = "Απαραίτητα cookies";
		var txt = createClassDiv("","","txt");
		txt.innerHTML = "Κρατάει τις επιλογές σας εαν εγκρίνετε ή οχι τα υπόλοιπα cookies.";
		
		btn1.appendChild(icon);
		btn1.appendChild(title);
		btn1.appendChild(txt);


		var btn2 = createClassDiv("","","button option middle");
		if(c && c.consentCookies.person == "true"){
			addClass(btn2,"sel");
		}
		var toggle = createClassDiv("","","toggle");
		
		var title = createClassDiv("","","title");
		title.innerHTML = "Cookies εξατομίκευσης";
		var txt = createClassDiv("","","txt");
		txt.innerHTML = "Κρατάει αναγνωριστικά στοιχεία της συσκευής σας ώστε να μπορείτε να συνδέεστε αυτόματα και να συνεχίζετε ένα βίντεο από εκεί που το σταματήσατε.";

		btn2.appendChild(toggle);
		btn2.appendChild(title);
		btn2.appendChild(txt);

		var btn3 = createClassDiv("","","button option bottom");
		if(c && c.consentCookies.stats == "true")
			addClass(btn3,"sel");
		var toggle = createClassDiv("","","toggle");
		
		var title = createClassDiv("","","title");
		title.innerHTML = "Στατιστικά cookies";
		var txt = createClassDiv("","","txt");
		txt.innerHTML = "Κρατάει στοιχεία που μας βοηθάνε να συλλέγουμε στατιστικά δεδομένα.";

		btn3.appendChild(toggle);
		btn3.appendChild(title);
		btn3.appendChild(txt);

		var btn4 = createClassDiv("","","button option last");
		if(c && c.consentCookies.ads == "true")
			addClass(btn4,"sel");
		var toggle = createClassDiv("","","toggle");
		
		var title = createClassDiv("","","title");
		title.innerHTML = "Cookies διαδραστικής διαφήμισης";
		var txt = createClassDiv("","","txt");
		txt.innerHTML = "Τα cookies διαφήμισης ανιχνεύουν τις προτιμήσεις σας, επιτρέποντας εξατομίκευση των διαφημίσεων";

		btn4.appendChild(toggle);
		btn4.appendChild(title);
		btn4.appendChild(txt);

		cont.appendChild(btn1);
		cont.appendChild(btn2);
		cont.appendChild(btn3);
		cont.appendChild(btn4);

		var buttons = createClassDiv("","","buttons focus");
		var acceptBtn = createClassDiv("","","button right focus");
		acceptBtn.innerHTML = "ΑΠΟΔΟΧΗ ΟΛΩΝ";
		var optionsBtn = createClassDiv("","","button left");
		optionsBtn.innerHTML = "ΑΠΟΘΗΚΕΥΣΗ ΡΥΘΜΙΣΕΩΝ";
		buttons.appendChild(acceptBtn);
		buttons.appendChild(optionsBtn);
		
		this.buttonsY.push(btn1);
		this.buttonsY.push(btn2);
		this.buttonsY.push(btn3);
		this.buttonsY.push(btn4);
		this.buttonsY.push(buttons);

		this.buttonsX.push(optionsBtn);
		this.buttonsX.push(acceptBtn);

		this.focusedIdY = 4;
		this.focusedIdX = 1;

		this.cont = cont;
		e.appendChild(cont);
		e.appendChild(headline);
		e.appendChild(subline);
		e.appendChild(buttons);
		llog("[ConsentMore] set focus on " + this.idnam);
		GLOBALS.focusmgr.focusObject(this.idnam, true);


		this.menu = new ConsentMenu("consentMenu");
		this.menu.init(this.elem);

	};
	ConsentMore.prototype.handleKeyPress = function (keyCode) {
		
		switch (keyCode) {
		case VK_LEFT:
			if(this.focusedIdY!=4) return;
			this.focusedIdX--;
			if(this.focusedIdX<0) this.focusedIdX = 0;
			this.setFocused(this.idnam,true);
			break;
		case VK_RIGHT:
			if(this.focusedIdY!=4){
				GLOBALS.focusmgr.focusObject("consentMenu", true);
				break;
			}
			this.focusedIdX++;
			if(this.focusedIdX>1) {
				this.focusedIdX = 1;
				GLOBALS.focusmgr.focusObject("consentMenu", true);
			}else
			this.setFocused(this.idnam,true);
			break;
		case VK_DOWN:
			this.focusedIdY++;
			if(this.focusedIdY==4)
				addClass(this.buttonsY[4],"focus");
			if(this.focusedIdY>4) this.focusedIdY=4;
			llog("[ConsentMore] focusedIdY " + this.focusedIdY);
			llog(this.buttonsY[4]);
			this.setFocused(this.idnam,true);
			break;
		case VK_UP:
			this.focusedIdY--;
			removeClass(this.buttonsY[4],"focus");
			if(this.focusedIdY<0) this.focusedIdY=0;
			this.setFocused(this.idnam,true);
			break;
		case VK_ENTER:
			
			var c = GLOBALS.focusmgr.getObject("consentFrame");
			if(this.focusedIdY==4){
				if(this.focusedIdX == 1){
					this.unregister();

					if(c){
						//c.entry.unregister();
						c.unregister();
						c.elem.remove();
					}
					
					setCookie(""+GLOBALS.consentInfo.cookiePerson+"", "true");
					setCookie(""+GLOBALS.consentInfo.cookieStats+"", "true");
					setCookie(""+GLOBALS.consentInfo.cookieAds+"", "true");
					setCookie(""+GLOBALS.consentInfo.cookieConsent+"", "true");
					//loadScene(46);
					this.unregister();
					var c = GLOBALS.focusmgr.getObject("consentFrame");
					if(c){
						c.entry.elem.style.display = "block";
						//GLOBALS.focusmgr.focusObject(c.entry.idnam);
					}
					this.elem.remove();
					if(c){
						c.unregister();
						c.elem.remove();
					}
/*
					if(!GLOBALS.lastFocus && typeof loadScene === "function"){
						loadScene(46);
					}else {
						GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
					}
*/
 window.setTimeout(function(){location.href = '/cretetv/index.php?sd='+it_stream+'&s='+aktueller_sender;}, 500);

			break;
				}else {
					/// Here goes in ΑΠΟΘΗΚΕΥΣΗ ΡΥΘΜΙΣΕΩΝ

					setCookie(""+GLOBALS.consentInfo.cookiePerson+"",c.consentCookies.person);
					setCookie(""+GLOBALS.consentInfo.cookieStats+"",c.consentCookies.stats);
					setCookie(""+GLOBALS.consentInfo.cookieAds+"",c.consentCookies.ads);
					setCookie(""+GLOBALS.consentInfo.cookieConsent+"", "true");

					this.unregister();
					var c = GLOBALS.focusmgr.getObject("consentFrame");
					this.elem.remove();
					if(c){
						c.unregister();
						c.elem.remove();
					}
					//if(!returnfocus){
						GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
					//}
					//else
					//	GLOBALS.focusmgr.focusObject(returnfocus);
				}
			}else {
				if(hasClass_(this.buttonsY[this.focusedIdY],"sel")){
					c.consentCookies[Object.keys(c.consentCookies)[this.focusedIdY]] = "false";
					removeClass(this.buttonsY[this.focusedIdY],"sel");
				}else {
					c.consentCookies[Object.keys(c.consentCookies)[this.focusedIdY]] = "true";
					addClass(this.buttonsY[this.focusedIdY],"sel");
				}
				break;
			}
		case VK_BACK:
			this.unregister();
			var c = GLOBALS.focusmgr.getObject("consentFrame");
			//if(c){
				//c.entry.elem.style.display = "block";
				//GLOBALS.focusmgr.focusObject(c.entry.idnam);
			//}
			this.elem.remove();
			if(c){
				c.unregister();
				c.elem.remove();
			}
		//	if(!returnfocus){
				GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
		//	}
		//	else
		//		GLOBALS.focusmgr.focusObject(returnfocus);
			break;
		}
	};
	ConsentMore.prototype.setFocused = function (otherobj, focus) {
		if(this.focusedIdY<4){
			for (var i = 0; i < this.buttonsY.length; i++) {
				if (focus) {
					if (i == this.focusedIdY) addClass(this.buttonsY[i],"focus");
					else removeClass(this.buttonsY[i],"focus");
					this.cont.className = "container focus "+this.positions[this.focusedIdY];
				} else removeClass(this.buttonsY[i],"focus");
			}
		}else {
			this.cont.className = "container";
			for (var i = 0; i < this.buttonsX.length; i++) {
				if (focus) {
					if (i == this.focusedIdX) addClass(this.buttonsX[i],"focus");
					else removeClass(this.buttonsX[i],"focus");
				} else removeClass(this.buttonsX[i],"focus");
			}
		}
		if(!focus) {
			this.cont.className = "container";
		}
		return true;
	};


	window.ConsentFrame = ConsentFrame;
	window.ConsentMenu = ConsentMenu;
	window.ConsentEntry = ConsentEntry;
	window.ConsentMore = ConsentMore;

})();
