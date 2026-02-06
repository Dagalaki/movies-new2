
var dateloadcomplete = false;
var statusloadcomplete = false;
var nameloadcomplete = false;
var infoloadcomplete = false;

// Window onload in generalscripts.js
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var rowEntries = new Array();

var chart = new AmCharts.AmSerialChart();
var totalSums = new Array();

var testcounter = 0;
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var chartData = new Array();
var chartData2 = new Array();
function reqListener () {
	//console.log(this.responseText);
}

/**
  * Sortiert die Tabelle nach der ausgewählten Spalte.
  * @params triggerelement Der Button, der die Sort auslöst.
  */
function sortCampaignTableFB(triggerelement) {
	var sortBy = triggerelement.parentNode.id;
	var fbTable = document.getElementById("facebooktablebody");
	var fbTableArr = new Array();
	for (var i = 0; i < fbTable.childNodes.length; i++) {	// Nodes in Array speichern, damit die sort-Funktion genutzt werden kann.
		fbTableArr.push(fbTable.childNodes[i]);
	}
	var childIndex = 2;	// Die ersten beiden Spalten werden nicht sortiert.
	switch(sortBy) {	// Die ausgewählte Spalte wird in einen Index übersetzt.
		case "colSpend":
			childIndex++;
		case "colCost":
			childIndex++;
		case "colReach":
			childIndex++;
		case "colTarget":
			childIndex++;
		case "colStatus":
			childIndex++;
		case "colCampaign":
			break;
		default:
			break;
	}
	
	switch(triggerelement.className) {	// Auswahl des nötigen Sort.
		case "sort-up":
			fbTableArr.sort(function (a,b) {
				return chooseSortFunctionFB(a,b,childIndex);
			});
			break;
		case "sort-down":
			fbTableArr.sort(function (a,b) {
				return chooseSortFunctionFB(b,a,childIndex);
			});
			break;
		default:
			break;
	}
	clearCampaignTable(); // Tabelle wird geleert.
	for (var i = 0; i < fbTableArr.length; i++) {	// Tabelle wird mit dem sortierten Array neu befüllt.
		fbTable.appendChild(fbTableArr[i]);
	}
}

/**
  * Wählt anhand eines Indexes für die statische Tabelle aus, welche Funktion genutzt werden soll.
  * @param a Erstes Element welches sortiert werden soll.
  * @param b Zweites Element welches sortiert werden soll.
  * @param childIndex Angabe zur ausgewählten Spalte, übersetzt als Integer.
  * @return Integerwert, der der sort-Funktion anweist.
  */
function chooseSortFunctionFB(a,b,childIndex) {
	switch(childIndex) {
		case 2:
		case 3:
			return a.childNodes[childIndex].innerHTML.localeCompare(b.childNodes[childIndex].innerHTML);	// Stringvergleich
		case 4:
		case 5:
			var floatValueA = parseFloat(a.childNodes[childIndex].innerHTML.split("<br>")[0].replace(".","").replace(".","").replace(",","."));	// Floatvergleich
			var floatValueB = parseFloat(b.childNodes[childIndex].innerHTML.split("<br>")[0].replace(".","").replace(".","").replace(",","."));
			if(a.childNodes[childIndex].innerHTML == "---") {
				floatValueA = 0.0;
			}
			if(b.childNodes[childIndex].innerHTML == "---") {
				floatValueB = 0.0;
			}
			return floatValueB - floatValueA;
		case 6:
		case 7:
			var intValueA = parseInt(a.childNodes[childIndex].innerHTML.split("<br>")[0].replace(".","").replace(".",""));	// Integervergleich
			var intValueB = parseInt(b.childNodes[childIndex].innerHTML.split("<br>")[0].replace(".","").replace(".",""));
			if(a.childNodes[childIndex].innerHTML == "---") {
				intValueA = 0;
			}
			if(b.childNodes[childIndex].innerHTML == "---") {
				intValueB = 0;
			}
			return intValueB - intValueA;
		default:
			break;
	}
}

function fillFieldList() {
	for (var i = 0; i < spge.field.length; i++) {
		if (typeof spge.field[i].screen === "string") {
			var option = document.createElement("option");
			option.text = spge.field[i].screen;
			option.value = spge.field[i].name;
			if (spge.field[i].parent) {
				option.title = spge.field[i].parent;
			} else {
				option.title = "";
			}
			var field_array = fields_global.split(",");
			var parentValue = "";
			for (field in field_array) {
				var fieldValue = field_array[field];
				
				if(fieldValue.indexOf("{") > -1) {
					parentValue = fieldValue.split("{")[0];
					fieldValue = fieldValue.split("{")[1];
				}
				var temp_fieldValue = fieldValue.indexOf("}") < 0 ? fieldValue : fieldValue.split("}")[0];
				if (option.value == temp_fieldValue && option.title == parentValue) {
					option.selected = true;
				}
				parentValue = fieldValue.indexOf("}") < 0 ? parentValue : "";
			}
			document.getElementById("fields").add(option);
		}
	}
}

function loadTags(fb_name) {
    for (var i = 0; i < spge.field.length; i++) {
        if(spge.field[i].name == fb_name) {
            return typeof spge.field[i].screen !== "string" ? spge.field[i].name : spge.field[i].screen;
        }
    }
    return "No Text -- " + fb_name;
}

function loadParent(fb_name) {
    for (var i = 0; i < spge.field.length; i++) {
        if(spge.field[i].name == fb_name) {
            return typeof spge.field[i].parent !== "string" ? spge.field[i].name : spge.field[i].parent;
        }
    }
    return false;
}

function loadBubble(fb_name) {
    for (var i = 0; i < spge.field.length; i++) {
        if(spge.field[i].name == fb_name) {
            return typeof spge.field[i].bubble !== "string" ? spge.field[i].name : spge.field[i].bubble;
        }
    }
    return "No Text -- " + fb_name;
}

function saveURL() {
	var date_start = makeTimePractical(document.getElementById("datumstart").value);
	var date_stop = makeTimePractical(document.getElementById("datumende").value);
	var adaccount = document.getElementById("adaccount").options[document.getElementById("adaccount").selectedIndex].text;
	var adcampaign = document.getElementById("adcampaign").options[document.getElementById("adcampaign").selectedIndex].text;
	var fieldsText = "";
	var temp_parent = "";

	var urlAddon = encodeURI("?datumstart=" + date_start + "&datumende=" + date_stop + "&adacc=" + adaccount + "&camp=" + adcampaign);
	var fixURL = "https://www.media-theia.de/eventmanager/drawGraph.php";

	window.history.pushState(null, null, fixURL + urlAddon);
	
}

function clearDropDown() {
	var select = document.getElementById("adcampaign");
	var length = select.options.length;
	for (i = length - 1; i >= 0 ; i--) {
		select.options.remove(i);
	}
}


function setInitialDropDownNames() {
	//var initial = true;
	//var startOption = document.createElement("option");
	//var startOptionText = document.createTextNode("---");
	//startOption.appendChild(startOptionText);
	//document.getElementById("adcampaign").appendChild(startOption);
	var initial = true;
	
	for (var i = 0; i < facebookInfo.length; i++) {
		
		var newOption = document.createElement("option");
		newOption.id = "" + facebookInfo[i]["id"][0];
		var newOptionText = document.createTextNode("" + facebookInfo[i]["name"][0]);
		newOption.appendChild(newOptionText);
		document.getElementById("adaccount").appendChild(newOption);
		
	}
	/*for (key in names) {
		if(adacc_global == "---" ? initial : key == adacc_global) {
			var iter = 1;
			for(var i = 0; i < names[key].length; i++) {
				var newOptionCamp = document.createElement("option");
				var newOptionTextCamp = document.createTextNode("" + names[key][i]);
				if (names[key][i] == campaign_global) {
					newOptionCamp.selected = true;
				}
				//document.getElementById("adcampaign").appendChild(newOptionCamp);
				newOptionCamp.appendChild(newOptionTextCamp);
				//document.getElementById("adcampaign").item(iter).value = "" + ids[key][i];
				initial = false;
				iter++;
			}
		}
		var newOption = document.createElement("option");
		var newOptionText = document.createTextNode("" + key);
		document.getElementById("adaccount").appendChild(newOption);
		newOption.appendChild(newOptionText);
	}*/
}

function setDropDownNames() {
	clearDropDown();
	var accIndex = document.getElementById("adaccount").selectedIndex;
	var startOption = document.createElement("option");
	var startOptionText = document.createTextNode("---");
	startOption.appendChild(startOptionText);
	document.getElementById("adcampaign").appendChild(startOption);
	document.getElementById("adcampaign").item(iterTwo).value = "---";
	var iter = 0;
	for (key in names) {
		if(iter == accIndex) {
			var iterTwo = 1;
			for(var i = 0; i < names[key].length; i++) {
				var newOptionCamp = document.createElement("option");
				var newOptionTextCamp = document.createTextNode("" + names[key][i]);
				document.getElementById("adcampaign").appendChild(newOptionCamp);
				document.getElementById("adcampaign").item(iterTwo).value = "" + ids[key][i];
				newOptionCamp.appendChild(newOptionTextCamp);
				iterTwo++;
			}
		}
		iter++;
	}
}

function clearCampaignTable() {
	var select = document.getElementById("facebooktablebody");
	while (select.firstChild) {
		select.removeChild(select.firstChild);
	}
}

function singleObjective(objective) {
	var singObj = objective;
	switch(objective) {
		default:
			singObj = "pro Ergebnis";
			break;
		case "CONVERSIONS":
			singObj = "pro Conversion";
			break;
		case "VIDEO_VIEWS":
			singObj = "pro Videoaufruf";
			break;
		case "PAGE_LIKES":
			singObj = "pro Like auf der Seite";
	}
	return singObj;
}

function getCostPerAction(cost, actions) {
	var costF = parseFloat(cost);
	var actionsF = parseFloat(actions);
	
	var res = actionsF / costF;
	
	
	return "" + res.toFixed(2) + " €";
}

function fillCampaignTable() {
	//document.getElementById("tableloader").className = "loading";
	clearCampaignTable();
	var accIndex = document.getElementById("adaccount").selectedIndex;
	//var startOption = document.createElement("option");
	//var startOptionText = document.createTextNode("---");
	//startOption.appendChild(startOptionText);
	var iter = 0;
	var fbTable = document.getElementById("facebooktablebody");
	//var fbTableHead = fbTable.parentElement.childNodes[1];
	
	//console.log(fbTableHead.childNodes[1].childNodes[3]);
	
	//buildSorter(fbTableHead.childNodes[1].childNodes[3], false);
	//buildSorter(fbTableHead.childNodes[1].childNodes[5], false);
	
	var adacc = document.getElementById("adaccount");
	var checkId = adacc.childNodes[adacc.selectedIndex + 1].id;
	if (!checkId) {
		checkId = 0;
	}
	
	for (var i = 0; i < facebookInfo.length; i++) {
		if(facebookInfo[i]["id"][0] == checkId) {
			for (key in facebookInfo[i]) {
				if (key == "campaigns") {
					//for(var j = 0; j < facebookInfo[i][key].length; j++) {
					for(key2 in facebookInfo[i][key]) {
						
						var newRow = document.createElement("tr");
						newRow.id=facebookInfo[i][key][key2]["id"][0];
						//newRow.onclick=function () {showdetailclick(this);};
						var colHead = document.createElement("td");
						colHead.className="th table-check-cell";
						
						var keywordObjClass = "";
						var keywordObjText = "";
						switch(facebookInfo[i][key][key2]["status"][0]) {
							case "ACTIVE":
								keywordObjClass = ' class="green-keyword"';
								keywordObjText = 'Aktiv';
								break;
							case "PAUSED":
								keywordObjClass = ' class="grey-keyword"';
								keywordObjText = 'Inaktiv';
								break;
							default:
								break;
						}
						
						var colStatus = document.createElement("td");
						//colStatus.style.minWidth = "4em";
						colStatus.style.width = "12%";
						//colStatus.innerHTML = '<ul class="keywords"><li' + keywordObjClass + '>' + facebookInfo[i][key][key2]["status"][0] + '</li></ul>';
						colStatus.innerHTML = '<ul class="keywords"><li' + keywordObjClass + '>' + keywordObjText + '</li></ul>';
						//colStatus.innerHTML = "" + fbstatus[key][i];
						var colName = document.createElement("td");
						//colName.onmouseover = function () {showdetailloading(this);};
						//colName.style.minWidth = "8em";
						colName.style.width = "16%";
						//colName.onmouseout = function () {hideBubble();};
						colName.innerHTML = "" + facebookInfo[i][key][key2]["name"][0];
						var colObjective = document.createElement("td");
						var keywordClass = "";
						switch(facebookInfo[i][key][key2]["objective"][0]) {
							case "CONVERSIONS":
								keywordClass = ' class="orange-keyword"';
								break;
							case "LINK_CLICKS":
								keywordClass = ' class="purple-keyword"';
								break;
							case "VIDEO_VIEWS":
								keywordClass = ' class="yellow-keyword"';
								break;
							case "PAGE_LIKES":
								keywordClass = ' class="yellow-keyword"';
								break;
							default:
								break;
						}
						colObjective.style.minWidth = "8em";
						colObjective.style.width = "12%";
						colObjective.innerHTML = '<ul class="keywords"><li' + keywordClass + '>' + facebookInfo[i][key][key2]["objective"][0] + '</li></ul>';
						var colDateStart = document.createElement("td");
						colDateStart.innerHTML = makeTimeReadable("" + facebookInfo[i][key][key2]["date_start"][0]);
						//colDateStart.innerHTML = "" + dates[iter][i]["date_start"];
						var colDateStop = document.createElement("td");
						var tempTime = makeTimeReadable("" + facebookInfo[i][key][key2]["date_stop"][0]);
						
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth()+1; //January is 0!
						var yyyy = today.getFullYear();
						dd = dd < 10 ? "0" + dd : dd;
						mm = mm < 10 ? "0" + mm : mm;
						var timeString = dd + "." + mm + "." + yyyy;
						
						colDateStop.style.textAlign = "right";
						if (tempTime == timeString) {
							colDateStop.innerHTML = "Fortlaufend";
						} else {
							colDateStop.innerHTML = tempTime;
						}
						//colDateStop.innerHTML = "" + dates[iter][i]["date_stop"];
						
						var colTarget = document.createElement("td");
						colTarget.style.width = "12%";
						colTarget.style.textAlign = "right";
						if (typeof facebookInfo[i][key][key2]["target"] != "undefined") {
							colTarget.innerHTML = "" + setThousandsPoint(facebookInfo[i][key][key2]["target"][0]) + "<br/><small>" + facebookInfo[i][key][key2]["objective"][0] + "</small>";
						} else {
							//colTarget.innerHTML = "---" + "<br/><small>" + facebookInfo[i][key][key2]["objective"][0] + "</small>";
							colTarget.innerHTML = "---";
						}
						
						var colCpc = document.createElement("td");
						colCpc.style.width = "12%";
						colCpc.style.textAlign = "right";
						if ((typeof facebookInfo[i][key][key2]["target"] != "undefined") && (typeof facebookInfo[i][key][key2]["spend"] != "undefined")) {
							colCpc.innerHTML = "" + getCostPerAction(facebookInfo[i][key][key2]["target"][0], facebookInfo[i][key][key2]["spend"][0]) + "<br/><small>" + singleObjective(facebookInfo[i][key][key2]["objective"][0]) + "</small>";
						} else {
							colCpc.innerHTML = "---" + "<br/><small>pro Ergebnis</small>";
						}
						
						var colReach = document.createElement("td");
						colReach.style.width = "12%";
						colReach.style.textAlign = "right";
						if (typeof facebookInfo[i][key][key2]["reach"] != "undefined") {
							colReach.innerHTML = "" + setThousandsPoint(facebookInfo[i][key][key2]["reach"][0]);
						} else {
							colReach.innerHTML = "---";
						}
						
						var colSpend = document.createElement("td");
						colSpend.style.width = "12%";
						colSpend.style.textAlign = "right";
						if (typeof facebookInfo[i][key][key2]["spend"] != "undefined") {
							var tempSpend = "" + facebookInfo[i][key][key2]["spend"][0];
							if (tempSpend.indexOf(".") > -1) {
								var tempSpendArr = tempSpend.split(".");
								var tempLow = tempSpendArr[1].length > 1 ? tempSpendArr[1] : "0" + tempSpendArr[1];
								tempSpend = tempSpendArr[0] + "," + tempLow;
								tempSpend += " €";
							} else {
								tempSpend += ",00 €";
							}
							//colSpend.innerHTML = "" + facebookInfo[i][key][key2]["spend"][0];
							colSpend.innerHTML = "" + setThousandsPoint(tempSpend);
							
						} else {
							colSpend.innerHTML = "---";
						}
						
						var colOptions = document.createElement("td");
						colOptions.style.width = "12%";
						//colOptions.style.minWidth = "7%";
						var optionHead = document.createElement("div");
						optionHead.className = "menu";
						

						
						var triggerbutton = document.createElement("div");
						triggerbutton.className = "button menu-opener";
						
						if (fingerprinttest[facebookInfo[i][key][key2]["id"][0].toString()] != null) {
							console.log("Test: " + fingerprinttest[facebookInfo[i][key][key2]["id"][0].toString()]);
							if (fingerprinttest[facebookInfo[i][key][key2]["id"][0].toString()]["status"] == 1) {
								triggerbutton.className += " active";
							} else {
								triggerbutton.className += " triggerset";
							}
						} else {
							triggerbutton.className += " notrigger";
						}
						
						triggerbutton.innerHTML = "Trigger";
						var triggeroptions = document.createElement("ul");
						var triggeroption1 = document.createElement("li");
						triggeroption1.className = "icon_control";
						triggeroption1.innerHTML = '<a href="eventmanager/#" onclick="actualizeCampaign(this,true,false);return false;">Trigger On</a>';
						var triggeroption2 = document.createElement("li");
						triggeroption2.className = "icon_pause";
						triggeroption2.innerHTML = '<a href="eventmanager/#" onclick="actualizeCampaign(this,false,false);return false;">Trigger Off</a>';
						var triggerseperator = document.createElement("li");
						triggerseperator.className = "sep";
						var triggeroption3 = document.createElement("li");
						triggeroption3.className = "icon_computer";
						triggeroption3.innerHTML = '<a href="eventmanager/#" onclick="buildTriggerSettings(this,false);return false;">Trigger Settings</a>';
						
						triggeroptions.appendChild(triggeroption1);
						triggeroptions.appendChild(triggeroption2);
						triggeroptions.appendChild(triggerseperator);
						
						triggeroptions.appendChild(triggeroption3);
						optionHead.appendChild(triggeroptions);
						
						//var loading = document.createElement("img");
						//loading.src = "/images/mask-loader.gif";
						//loading.className = "loading";
						//loading.style.display = "none";
						//triggerbutton.appendChild(loading);
						triggerbutton.appendChild(optionHead);
						colOptions.appendChild(triggerbutton);
						
						newRow.appendChild(colHead);
						newRow.appendChild(colOptions);
						newRow.appendChild(colName);
						newRow.appendChild(colStatus);
						//newRow.appendChild(colObjective);
						newRow.appendChild(colTarget);
						newRow.appendChild(colReach);
						newRow.appendChild(colCpc);
						newRow.appendChild(colSpend);
						
						//newRow.appendChild(colDateStart);
						newRow.appendChild(colDateStop);
						fbTable.appendChild(newRow);
					}
				}
				//if (key == "id") {
				//	console.log(key + " " + facebookInfo[i][key][0]);
				//} else if (key == "name") {
				//	console.log(key + " " + facebookInfo[i][key][0]);
				//} else {
					
				//}
				//for (key2 in facebookInfo[i][key]) {
				//for (j = 0; j < facebookInfo[i][key].length; j++) {
					//if (key2 == ) {
				//}
			}
		}
	}
	
	
	/*for (key in names) {
		if (iter == accIndex) {
			var iterTwo = 0;
			for (var i = 0; i < names[key].length; i++) {
				
				var newRow = document.createElement("tr");
				newRow.id=ids[key][i];
				newRow.onclick=function () {showdetailclick(this);};
				var colHead = document.createElement("td");
				colHead.className="th table-check-cell";
				
				var keywordObjClass = "";
				switch(fbstatus[key][i]) {
					case "ACTIVE":
						keywordObjClass = ' class="green-keyword"';
						break;
					case "PAUSED":
						keywordObjClass = ' class="red-keyword"';
						break;
					default:
						break;
				}
				
				var colZero = document.createElement("td");
				colZero.style.width = "4em";
				colZero.innerHTML = '<ul class="keywords"><li' + keywordObjClass + '>' + fbstatus[key][i] + '</li></ul>';
				//colZero.innerHTML = "" + fbstatus[key][i];
				var colOne = document.createElement("td");
				colOne.onmouseover = function () {showdetailloading(this);};
				colOne.onmouseout = function () {hideBubble();};
				colOne.innerHTML = "" + names[key][i];
				var colMiddle = document.createElement("td");
				var keywordClass = "";
				switch(fbobjective[key][i]) {
					case "CONVERSIONS":
						keywordClass = ' class="orange-keyword"';
						break;
					case "LINK_CLICKS":
						keywordClass = ' class="purple-keyword"';
						break;
					case "VIDEO_VIEWS":
						keywordClass = ' class="yellow-keyword"';
						break;
					default:
						break;
				}
				colMiddle.style.width = "4em";
				colMiddle.innerHTML = '<ul class="keywords"><li' + keywordClass + '>' + fbobjective[key][i] + '</li></ul>';
				var colTwo = document.createElement("td");
				colTwo.innerHTML = makeTimeReadable("" + dates[iter][i]["date_start"]);
				//colTwo.innerHTML = "" + dates[iter][i]["date_start"];
				var colThree = document.createElement("td");
				colThree.innerHTML = makeTimeReadable("" + dates[iter][i]["date_stop"]);
				//colThree.innerHTML = "" + dates[iter][i]["date_stop"];
				var colFour = document.createElement("td");
				colFour.style.width = "4em";
				var optionHead = document.createElement("div");
				optionHead.className = "menu";
				var triggerbutton = document.createElement("div");
				triggerbutton.className = "button menu-opener";
				triggerbutton.innerHTML = "Trigger";
				var triggeroptions = document.createElement("ul");
				var triggeroption1 = document.createElement("li");
				triggeroption1.className = "icon_control";
				triggeroption1.innerHTML = '<a href="#">Trigger On</a>';
				var triggeroption2 = document.createElement("li");
				triggeroption2.className = "icon_pause";
				triggeroption2.innerHTML = '<a href="#">Trigger Off</a>';
				var triggerseperator = document.createElement("li");
				triggerseperator.className = "sep";
				var triggeroption3 = document.createElement("li");
				triggeroption3.className = "icon_computer";
				triggeroption3.innerHTML = '<a href="#">Trigger Settings</a>';
				
				triggeroptions.appendChild(triggeroption1);
				triggeroptions.appendChild(triggeroption2);
				triggeroptions.appendChild(triggerseperator);
				
				triggeroptions.appendChild(triggeroption3);
				optionHead.appendChild(triggeroptions);
				triggerbutton.appendChild(optionHead);
				colFour.appendChild(triggerbutton);
				
				newRow.appendChild(colHead);
				newRow.appendChild(colZero);
				newRow.appendChild(colOne);
				newRow.appendChild(colMiddle);
				newRow.appendChild(colTwo);
				newRow.appendChild(colThree);
				newRow.appendChild(colFour);
				fbTable.appendChild(newRow);
			}
		}
		iter++;
	}*/
	document.getElementById("tableloader").className = "";
	
}

function setThousandsPoint(numberShown) {
	var numbers = numberShown.split(",");
	if (numbers[0].length > 3) {
		var mod = numbers[0].length % 3;
		var output = (mod > 0 ? (numbers[0].substring(0,mod)) : '' );
		for (var i = 0; i < Math.floor(numbers[0].length / 3); i++) {
			if (mod == 0 && i == 0) {
				output += numbers[0].substring(mod + 3 * i, mod + 3 * i + 3);
			} else {
				output += '.' + numbers[0].substring(mod + 3 * i, mod + 3 * i + 3);
			}
		}
		if (numbers[1]) {
			return output + ',' + numbers[1];
		} else {
			return output;
		}
	} else {
		return numberShown;
	}
}

/*function setInitialDropDownNames() {
	//var initial = true;
	//var startOption = document.createElement("option");
	//var startOptionText = document.createTextNode("---");
	//startOption.appendChild(startOptionText);
	//document.getElementById("adcampaign").appendChild(startOption);
	var initial = true;
	
	
	for (key in names) {
		if(adacc_global == "---" ? initial : key == adacc_global) {
			alert(names[key][0][0] + " " + ids[key][0][0]);
			var iter = 1;
			for(var i = 0; i < names[key].length; i++) {
				for (secondKey in names[key][i])
				{
					var newOptionCamp = document.createElement("option");
					var newOptionTextCamp = document.createTextNode("" + names[key][i][secondKey]);
					if (names[key][i][secondKey] == campaign_global) {
						newOptionCamp.selected = true;
					}
					document.getElementById("adcampaign").appendChild(newOptionCamp);
					newOptionCamp.appendChild(newOptionTextCamp);
					document.getElementById("adcampaign").item(iter).value = "" + ids[key][i][secondKey];
					initial = false;
					iter++;
				}
			}
		}
		var newOption = document.createElement("option");
		var newOptionText = document.createTextNode("" + key);
		document.getElementById("adaccount").appendChild(newOption);
		newOption.appendChild(newOptionText);
	}
}

function setDropDownNames() {
	clearDropDown();
	var accIndex = document.getElementById("adaccount").selectedIndex;
	var startOption = document.createElement("option");
	var startOptionText = document.createTextNode("---");
	startOption.appendChild(startOptionText);
	document.getElementById("adcampaign").appendChild(startOption);
	document.getElementById("adcampaign").item(iterTwo).value = "---";
	var iter = 0;
	for (key in names) {
		if(iter == accIndex) {
			var iterTwo = 1;
			for(var i = 0; i < names[key].length; i++) {
				for (secondKey in names[key][i])
				{
					var newOptionCamp = document.createElement("option");
					var newOptionTextCamp = document.createTextNode("" + names[key][i][secondKey]);
					document.getElementById("adcampaign").appendChild(newOptionCamp);
					document.getElementById("adcampaign").item(iterTwo).value = "" + ids[key][i][secondKey];
					newOptionCamp.appendChild(newOptionTextCamp);
					iterTwo++;
				}
			}
		}
		iter++;
	}
}
*/
var date_today;
getToday();

function setTimes() {
	if(document.getElementById("adcampaign").item(document.getElementById("adcampaign").selectedIndex).value == "---") {
		document.getElementById("datumstart").value = makeTimeReadable(date_today);
		document.getElementById("datumende").value = makeTimeReadable(date_today);
	} else {
		var index_adaccount = document.getElementById("adaccount").selectedIndex + 1;
		var index_adcampaign = document.getElementById("adcampaign").selectedIndex;
		var counter = 0;
		var camp = dates[index_adaccount][index_adcampaign];
		document.getElementById("datumstart").value = makeTimeReadable(camp["date_start"]);
		document.getElementById("datumende").value = makeTimeReadable(camp["date_stop"]);
	}
}

var getStatus = new XMLHttpRequest();
var fbstatus = new Array();
var fbobjective = new Array();
getStatus.onload = function () {
	var statusJSON = JSON.parse(this.responseText);
	var key = "";
	for (var j = 0; j < statusJSON.length; j++) {
		if (j % 2 == 0) {
			// adaccount names
			if (statusJSON[j][0].toUpperCase().indexOf("ANI") < 0) {
				key = statusJSON[j][0];
			}
		} else {
			// status and objectives
			if(statusJSON[j - 1][0].toUpperCase().indexOf("ANI") < 0) {
				var stati = new Array();
				var objectives = new Array();
				var iter = 0;
				
				for (var i = 0; i < statusJSON[j].length; i++) {
					if (i % 2 == 0) {
						// stati
						stati[iter] = statusJSON[j][i];
					} else {
						// objectives
						objectives[iter] = statusJSON[j][i];
						iter++;
					}
				}
				fbstatus[key] = stati;
				fbobjective[key] = objectives;
			}
		}
	}
	statusloadcomplete = true;
	if (dateloadcomplete && nameloadcomplete && statusloadcomplete && infoloadcomplete) {
		fillCampaignTable();
	}
}

var getNames = new XMLHttpRequest();
var names = new Array();
var ids = new Array();
getNames.onload = function() {
	var namesJSON = JSON.parse(this.responseText);
	var key = "";
	for(var j = 0; j < namesJSON.length; j++) {
		if(j % 2 == 0) {
			//adaccount names
			if (namesJSON[j][0].toUpperCase().indexOf("ANI") < 0) {
				key = namesJSON[j][0];
			}
		} else {
			if (namesJSON[j - 1][0].toUpperCase().indexOf("ANI") < 0) {
				//campaign names
				var dataArray = new Array();
				var idssmall = new Array();
				var iter = 0;
				for(var i = 0; i < namesJSON[j].length; i++) {
					if(i % 2 == 0) {
						// names
						dataArray[iter] = namesJSON[j][i];
					} else {
						// ids
						idssmall[iter] = namesJSON[j][i];
						iter++;
					}
				}
				names[key] = dataArray;
				ids[key] = idssmall;
			}
		}
	}
	nameloadcomplete = true;
	//setInitialDropDownNames();
	if (dateloadcomplete && nameloadcomplete && statusloadcomplete && infoloadcomplete) {
		fillCampaignTable();
	}
};

function compareDates(a,b) {
	
}

var getFacebookInfo = new XMLHttpRequest();
var facebookInfo = new Array();
getFacebookInfo.onload = function () {
	var UIDArray = JSON.parse(fbuidarray);
	
	facebookInfo = new Array();
	
	var facebookInfoTemp = JSON.parse(this.responseText);
	
	facebookInfo[0] = "";
	var iter = 0;
	for(var i = 0; i < facebookInfoTemp.length; i++) {
		//console.log(facebookInfoTemp[i]["campaigns"][0]["id"][0]);
		/*facebookInfoTemp[i]["campaigns"].sort(function (a,b) {
			return a["name"][0].localeCompare(b["name"][0]);
		});*/
		/*facebookInfoTemp[i]["campaigns"].sort(function (a,b) {
			return b["date_start"][0].localeCompare(a["date_start"][0]);
		});*/
		/*facebookInfoTemp[i]["campaigns"].sort(function (a,b) {
			return b["date_stop"][0].localeCompare(a["date_stop"][0]);
		});*/
		
		facebookInfoTemp[i]["campaigns"].sort(function (a,b) {
			if (typeof a["spend"] == "undefined") {
				a["spend"] = new Array();
				a["spend"][0] = 0;
				//console.log("a undefined");
				//return 0;
			}
			if (typeof b["spend"] == "undefined") {
				b["spend"] = new Array();
				b["spend"][0] = 0;
				//console.log("b undefined");
				//return 1;
			}
			return b["spend"][0] - a["spend"][0];
		});
		
		facebookInfoTemp[i]["campaigns"].sort(function (a,b) {
			return a["status"][0].localeCompare(b["status"][0]);
		});
		for (var j = 0; j < UIDArray.length; j++) {
			//console.log(facebookInfoTemp[i]["id"][0] + " - " + UIDArray[j] + " - " + iter);
			if (facebookInfoTemp[i]["id"][0] === UIDArray[j]) {
				facebookInfo[iter] = facebookInfoTemp[i];
				iter++;
			}
		}
	}
	
	setInitialDropDownNames();
	
	fillCampaignTable();
	
}

var getDates = new XMLHttpRequest();
var dates = new Array();
getDates.onload = function() {
	var datesJSON = JSON.parse(this.responseText);
	for(var j = 0; j < datesJSON.length; j++) {
		var data = new Array();
		for(var i = 1; i < datesJSON[j].length; i++) {
		//for (var i = 0; i < datesJSON.length; i++) {
				data[i - 1] = new Array();
				
				//data[i]["date_start"] = datesJSON[j][i]["date_start"] == "" ? date_today : datesJSON[j][i]["date_start"];
				//data[i]["date_stop"] = datesJSON[j][i]["date_stop"] == "" ? date_today : datesJSON[j][i]["date_stop"];
				data[i - 1]["date_start"] = datesJSON[j][i][0] == "" ? date_today : datesJSON[j][i][0];
				data[i - 1]["date_stop"] = datesJSON[j][i][1] == "" ? date_today : datesJSON[j][i][1];
				//data[i]["date_start"] = datesJSON[i][0] == "" ? date_today : datesJSON[i][0];
				//data[i]["date_stop"] = datesJSON[i][1] == "" ? date_today : datesJSON[i][1];
		}
		dates[j] = data;
	}
	//console.log(datesJSON);
	dateloadcomplete = true;
	if (dateloadcomplete && nameloadcomplete && statusloadcomplete && infoloadcomplete) {
		fillCampaignTable();
	}
};

function saveJSON(date_start, chartDataJSON) {
	
}

var oReq = new XMLHttpRequest();
var oReq2 = new XMLHttpRequest();
var dataObject = new Array();
var dataObjectOwn = new Array();

oReq2.onload = function() {
	chartDataStandard = new Array();
	chartDataTrigger = new Array();
	
	var chartDataJSON;
	try {
		chartDataJSON = JSON.parse(this.responseText);
	} catch (err){
		alert("Daten konnten nicht geladen werden");
		return false;
	}
	
	if(chartDataJSON.data !== undefined) {
		if(chartDataJSON.data.length > 0) {
			for(var j = 0; j < chartDataJSON.data.length; j++) {
				var hasDate = false;
				dataObjectOwn = new Array();
				for(key in chartDataJSON.data[j]) {
					if(key == "actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[/*key + "-" + */chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "unique_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "total_unique_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_action_type") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_unique_action_type") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_10_sec_video_view") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_avg_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_avg_pct_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_10_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_15_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if (key == "hourly_stats_aggregated_by_advertiser_time_zone"){
						dataObjectOwn["time"] = chartDataJSON.data[j].hourly_stats_aggregated_by_advertiser_time_zone;
					} else if(key == "date_start"){
						hasDate = true;
						dataObjectOwn[key] = chartDataJSON.data[j][key];
					} else if(key == "video_p25_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p50_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p75_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p95_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p100_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_complete_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_30_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObjectOwn[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else {
						dataObjectOwn[key] = chartDataJSON.data[j][key];
					}
				}
				if(!hasDate)
					dataObjectOwn["date_start"] = timeArray[j];
				chartData.push(dataObjectOwn);
				testcounter++;
			}
		} else {
			alert("Keine Daten fuer den ausgewaehlten Zeitraum");
			for(var i = 0; i < time_array.length; i++) {
				chartData.push(time_array[i]);
			}
		}
	} else {
		for(var i = 0; i < chartDataJSON.length; i++) {
			dataObject = new Array();
			if(chartDataJSON[i]["name"] == document.getElementById("adcampaign").options[document.getElementById("adcampaign").selectedIndex].text &&
			  isDateBetween(chartDataJSON[i]["date_start"].split(" ")[0].replace(/\./g, "-"), makeTimePractical(document.getElementById("datumstart").value), makeTimePractical(document.getElementById("datumende").value))) {
				for(key in chartDataJSON[i]) {
					dataObject[key] = chartDataJSON[i][key];
				}
				chartData.push(dataObject);
				testcounter++;
			}
		}
	}
}

var isSending = false;

oReq.onload = function() {
	
	chartData = new Array();
	//time_array = timeArray();
	var tempCampaignID = "";
	var chartDataJSON;
	try {
	chartDataJSON = JSON.parse(this.responseText);
	} catch (err){
		isSending = false;
		alert("Daten konnten nicht geladen werden");
		return false;
	}
	
	if(chartDataJSON.data !== undefined) {
		if(chartDataJSON.data.length > 0) {
			for(var j = 0; j < chartDataJSON.data.length; j++) {
				var hasDate = false;
				dataObject = new Array();
				for(key in chartDataJSON.data[j]) {
					//alert(key);
					if(key == "actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[/*key + "-" + */chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "unique_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "total_unique_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_action_type") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_unique_action_type") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "cost_per_10_sec_video_view") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_avg_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_avg_pct_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_10_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_15_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if (key == "hourly_stats_aggregated_by_advertiser_time_zone"){
						dataObject["time"] = chartDataJSON.data[j].hourly_stats_aggregated_by_advertiser_time_zone;
					} else if(key == "date_start"){
						hasDate = true;
						dataObject[key] = chartDataJSON.data[j][key];
					} else if(key == "video_p25_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p50_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p75_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p95_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_p100_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_complete_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "video_30_sec_watched_actions") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else if(key == "website_ctr") {
						for(var i = 0; i < chartDataJSON.data[j][key].length; i++) {
							dataObject[chartDataJSON.data[j].actions[i].action_type] = chartDataJSON.data[j].actions[i].value;
						}
					} else {
						dataObject[key] = chartDataJSON.data[j][key];
						if (key == "campaign_id") {
							tempCampaignID = dataObject[key];
						}
					}
				}
				if(!hasDate) {
					dataObject["date_start"] = timeArray[j];
					//dataObject["date_start"] = "";
				}
				chartData.push(dataObject);
				testcounter++;
			}
		} else {
			alert('Keine Daten zur Kampagne "' + chosenNameGlobal + '"!');
			isSending = false;
			//for(var i = 0; i < time_array.length; i++) {
			//	chartData.push(time_array[i]);
			//}
		}
	} else {
		for(var i = 0; i < chartDataJSON.length; i++) {
			dataObject = new Array();
			if(chartDataJSON[i]["name"] == document.getElementById("adcampaign").options[document.getElementById("adcampaign").selectedIndex].text &&
			  isDateBetween(chartDataJSON[i]["date_start"].split(" ")[0].replace(/\./g, "-"), makeTimePractical(document.getElementById("datumstart").value), makeTimePractical(document.getElementById("datumende").value))) {
				for(key in chartDataJSON[i]) {
					dataObject[key] = chartDataJSON[i][key];
				}
				chartData.push(dataObject);
				testcounter++;
			}
		}
	}
	//console.log(JSON.stringify(chartDataJSON));
	//showFacebookData(chartDataJSON.data);
	if (isSending) {
		campaignDetailData[chartData[0]["campaign_id"].toString()] = chartData[0];
		showdetaillater(tempCampaignID.toString());
	} else {
		//console.log(chosenIDGlobal);
		campaignDetailData[chosenIDGlobal.toString()] = 'Keine Daten zur Kampagne "' + chosenNameGlobal + '"!';
	}
	isSending = false;
	//showData();
	//paintGraph();

	document.getElementById("tableloader").className = "";
	document.getElementById("loader").style.display = "none";
	//document.getElementById("chartdiv").style.display = "block";
	//document.getElementById("overviewdiv").style.display = "block";
};

function showData() {
	// showcampaigndetails	
	
	//Zeige alle Daten von Facebook an
	var datastring = "";
	var counter = 0;
	
	addTogether();
	
	
	for(var i = 0; i < chartData.length; i++) {
		datastring +='<div style="float:left;margin:0 auto;margin-right:20px;"><table>';
		for (key in chartData[i]) {
			if (loadTags(key).indexOf("No Text --") < 0) {
				counter++;
			}
		}
		counter = Math.floor(counter / 2);
		for(key in chartData[i]) {
			if (loadTags(key).indexOf("No Text --") < 0) {
				var hasSelectedField = false;
				if (key == "date_start" || key == "date_stop") {
					var year = chartData[i][key].split("-")[0];
					var month = chartData[i][key].split("-")[1];
					var day = chartData[i][key].split("-")[2];
					chartData[i][key] = day + "." + month + "." + year;
				}
				var number = Math.floor(parseFloat(chartData[i][key]) * 100) / 100;
				
				if (counter == 0) {
					datastring += '</table></div><div style="float:left;margin-right:20px;"><table>';
				}
				//datastring += '<tr id="' + key + '" onmousemove="changeBubble(event)" onmouseout="hideBubble()"><td style="padding-right:5px;font-size:12px !important;text-align:left;">' + number + '</td><td style="font-size:12px !important;text-align:left;">' + loadTags(key) + "</td></tr>";
				datastring += '<tr id="' + key + '" onmousemove="changeBubble(event)"><td style="padding-right:5px;font-size:12px !important;text-align:left;">' + number + '</td><td style="font-size:12px !important;text-align:left;">' + loadTags(key) + "</td></tr>";

				counter--;
			}
		}
		datastring+="</table></div>";
	}
	//saveURL();
	return datastring;
	//document.getElementById("overviewdiv").innerHTML = datastring;
}

function hasClass(parent_element, class_name) {
	console.log("Test has " + parent_element.className);
	return parent_element.className.indexOf(class_name) >= 0;
}

function addClass(parent_element, class_name) {
	if (!hasClass(parent_element, class_name)) {
		console.log("Test add start");
		if (parent_element.className != "")
			parent_element.className += " ";
		parent_element.className += class_name;
	}
}

function removeClass(parent_element, class_name) {
	if (hasClass(parent_element, class_name)) {
		console.log("Test start remove " + parent_element.className);
		parent_element.className.replace(class_name, '');
		parent_element.className = parent_element.className.trim();
	}
}

function refreshGraph() {
	//removeClass(document.getElementById("loader"), "eventmanager_loader_hid");
	//addClass(document.getElementById("chartdiv"), "eventmanager_loader_hid");

	//document.getElementById("tableloader").className = "loading";
	
	//document.getElementById("loader").style.display = "inline-block";
	//document.getElementById("chartdiv").style.display = "none";
	document.getElementById("overviewdiv").style.display = "none";
	//var camp = document.getElementById("adcampaign").item(document.getElementById("adcampaign").selectedIndex).value;
	var field_list = new Array();
	
	chosenStartDateGlobal = triggerelement.childNodes[4].innerHTML;
	chosenEndDateGlobal = triggerelement.childNodes[5].innerHTML;
	//if(camp != "" && camp != "---") {
		//var time = makeTimePractical(document.getElementById("datumstart").value) + "___" + makeTimePractical(document.getElementById("datumende").value);
		var time = makeTimePractical(chosenStartDateGlobal) + "___" + makeTimePractical(chosenEndDateGlobal);
		var action_field_select = "comment,like,link_click,photo_view,post_like,unlike,video_play,video_view,page_engagement,post_engagement";
		var field_select = "actions{" + action_field_select + "},unique_actions{" + action_field_select + "},total_actions,total_action_value,impressions,social_impressions,social_clicks,unique_impressions";
		field_select += ",unique_social_impressions,unique_clicks,unique_social_clicks,spend,frequency,deeplink_clicks,website_clicks";
		//field_select = "call_to_action_clicks,clicks,cpc,cpm,cpp,ctr,deeplink_clicks,website_clicks,website_ctr,unique_clicks,unique_ctr,impressions,reach,inline_link_clicks,spend,actions";
		//field_select += ",unique_actions";
		//oReq.open("get", "https://www.media-theia.de/loadFacebook.php?camp=" + camp + "&fields=" + field_select + "&time=" + time, true);
		oReq.open("get", "/loadFacebook.php?camp=" + camp + "&fields=" + field_select + "&time=" + time, true);
		oReq.send();
	//}
}

function addTogether() {
    totalSums = new Array();
    for (var i = 0; i < chartData.length; i++) {
        for (key in chartData[i]) {
            if(key != "time" && key != "date_start" && key != "date_stop" && key != "acc_name" && key != "camp_name" && key != "campaign_id"
					&& key != "buying_type") {
                totalSums[key] = 0;
            }
        }
    }
    for (var i = 0; i < chartData.length; i++) {
        for (key in chartData[i]) {
            if(key != "time" && key != "date_start" && key != "date_stop" && key != "acc_name" && key != "camp_name" && key != "campaign_id"
					&& key != "buying_type") {
                totalSums[key] += parseFloat(parseInt(chartData[i][key] * 100) / 100);
            }
        }
    }
}

function paintGraph() {
	//saveURL();
	addTogether();
	
	chart.dataProvider = chartData;
	//chart.categoryField = "time";
	chart.categoryField = "date_start";
	//chart.validateData();
	var objective = "";
	for(var i = 0; i < chartData.length; i++) {
		for(key in chartData[i]) {
			if(!checkDouble(rowEntries, key)) {
				if(key == "objective") {
					objective = chartData[i][key];
				}
				rowEntries.push(key);
				var hasSelectedField = false;
				//for (var k = 0; k < document.getElementById("fields").selectedOptions.length; k++) {
					//if (document.getElementById("fields").selectedOptions[k].value == key) {
					//	hasSelectedField = true;
					//}
				//}
			//	if(key != "starting" && key != "name" && key != "time" && key != "date_start" && key != "date_stop" && key != "acc_name" && key != "camp_name" && key != "campaign_id"
			//		&& key != "buying_type" && chartData[i][key] > 0) {
			//	if(key == "spend" || key == "like" || key == "page_engagement" || key == "post_engagement" || key == "reach" || key == "impressions") {
				if (hasSelectedField) {
					var graph = new AmCharts.AmGraph();
					graph.valueField = key;
					graph.fillAlphas = 1;
					graph.type = "column";
					graph.title = totalSums[key] + " -- " + loadTags(key);
                	//graph.labelText = parseFloat(parseInt(chartData[i][key] * 100) / 100).toString();
                	//graph.labelText = "Test";
                	//graph.labelPosition = "inside";
					var balloon = new AmCharts.AmBalloon();
					graph.balloon = balloon;
					graph.balloonText = loadBubble(key);
					
					chart.addGraph(graph);
					hasSelectedField = false;
				}
			}
		}
	}
	var categoryAxis = chart.categoryAxis;
	categoryAxis.title = objective;
	categoryAxis.autoGridCount  = false;
	categoryAxis.gridCount = chartData.length;
	//console.log(chartData.length);
	categoryAxis.gridPosition = "start";
	categoryAxis.labelRotation = 90;
	chart.validateData();
	chart.write('chartdiv');
	//*/
}

function firstDraw() {
	AmCharts.ready(function() {
		chart = new AmCharts.AmSerialChart();
		chart.dataProvider = chartData;
		chart.categoryField = "time";
		
		var legend = new AmCharts.AmLegend();
		legend.enabled = true;
		legend.useGraphSettings = true;
		chart.legend = legend;

		rowEntries = new Array();
		
		var graph;
		var objective = "";
		addTogether();
		for(var i = 0; i < chartData.length; i++) {
			for(key in chartData[i]) {
				if(!checkDouble(rowEntries, key)) {
					if(key == "objective")
						objective = chartData[i][key];
					rowEntries.push(key);
					var hasSelectedField = false;
					for (var k = 0; k < document.getElementById("fields").selectedOptions.length; k++) {
						if (document.getElementById("fields").selectedOptions[k].value == key) {
							hasSelectedField = true;
						}
					}
				//	if(key != "time" && key != "date_start" && key != "date_stop" && key != "acc_name" && key != "camp_name" && key != "campaign_id"
				//		&& key != "buying_type") {
				//	if(key == "spend" || key == "like" || key == "page_engagement" || key == "post_engagement" || key == "reach" || key == "impressions") {
					if (hasSelectedField && chartData[i][key] > 0) {
						graph = new AmCharts.AmGraph();
						graph.valueField = key;
						graph.fillAlphas = 1;
						graph.type = "column";
						graph.title = totalSums[key] + " -- " + loadTags(key);
	                	//graph.labelText = parseFloat(parseInt(chartData[i][key] * 100) / 100).toString();
	                	//graph.labelText = "TestFirst";
	                	//graph.labelPosition = "inside";
						var balloon = new AmCharts.AmBalloon();
						graph.balloon = balloon;
						graph.balloonText = loadBubble(key);
						chart.addGraph(graph);
						hasSelectedField = false;
					}
				}
			}
		}
		
		
		var categoryAxis = chart.categoryAxis;
		categoryAxis.autoGridCount  = false;
		categoryAxis.gridCount = testcounter;
		categoryAxis.gridPosition = "start";
		categoryAxis.labelRotation = 90;
		categoryAxis.title = objective;
		chart.validateData();
		chart.write('chartdiv');
	});
}