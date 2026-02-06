// Window.onload in generalscripts.js

function sortKeywordTableGoogle(triggerelement) {
	var sortBy = triggerelement.parentNode.id;
	var googleTable = document.getElementById("googleKeywordTable");
	var googleTableArr = new Array();
	for (var i = 0; i < googleTable.childNodes.length; i++) {
		googleTableArr.push(googleTable.childNodes[i]);
	}
	var childIndex = 0;
	switch(sortBy) {
		case "keyAvgPos":
			childIndex++;
		case "keyCost":
			childIndex++;
		case "keyAvgCpc":
			childIndex++;
		case "keyCtr":
			childIndex++;
		case "keyImpressions":
			childIndex++;
		case "keyClicks":
			childIndex++;
		case "keyMaxCpc":
			childIndex++;
		case "keyStatus":
			childIndex++;
		case "keyKeyword":
		default:
			break;
	}
	switch(triggerelement.className) {
		case "sort-up":
			googleTableArr.sort(function(a,b) {
				return chooseSortFunctionKeywordGoogle(a,b,childIndex);
			});
			break;
		case "sort-down":
			googleTableArr.sort(function(a,b) {
				return chooseSortFunctionKeywordGoogle(b,a,childIndex);
			});
			break;
		default:
			break;
	}
	//clearCampaignTable();
	for (var i = 0; i < googleTableArr.length; i++) {
		googleTable.appendChild(googleTableArr[i]);
	}
}

function sortCampaignTableGoogle(triggerelement) {
	var sortBy = triggerelement.parentNode.id;
	var googleTable = document.getElementById("facebooktablebody");
	var googleTableArr = new Array();
	for (var i = 0; i < googleTable.childNodes.length; i++) {
		googleTableArr.push(googleTable.childNodes[i]);
	}
	var childIndex = 2;
	switch(sortBy) {
		case "colCost":
			childIndex++;
		case "colCpc":
			childIndex++;
		case "colCtr":
			childIndex++;
		case "colClicks":
			childIndex++;
		case "colImpressions":
			childIndex++;
		case "colStatus":
			childIndex++;
		case "colBudget":
			childIndex++;
		case "colCampaign":
			break;
		default:
			break;
	}
	
	switch(triggerelement.className) {
		case "sort-up":
			googleTableArr.sort(function (a,b) {
				var temp = chooseSortFunctionGoogle(a,b,childIndex);
				return temp;
			});
			break;
		case "sort-down":
			googleTableArr.sort(function (a,b) {
				return chooseSortFunctionGoogle(b,a,childIndex);
			});
			break;
		default:
			break;
	}
	clearCampaignTable();
	for (var i = 0; i < googleTableArr.length; i++) {
		googleTable.appendChild(googleTableArr[i]);
	}
}

function chooseSortFunctionKeywordGoogle(a,b,childIndex) {
	switch(childIndex) {
		case 0:
		case 1:
			return a.childNodes[childIndex].innerHTML.localeCompare(b.childNodes[childIndex].innerHTML);
		case 2:
		case 5:
		case 6:
		case 7:
			var floatValueA = parseFloat(a.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			var floatValueB = parseFloat(b.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			return floatValueB - floatValueA;
		case 8:
			var floatValueA = parseFloat(a.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			var floatValueB = parseFloat(b.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			floatValueA = floatValueA == 0.0 ? 10.0 : floatValueA;
			floatValueB = floatValueB == 0.0 ? 10.0 : floatValueB;
			return floatValueA - floatValueB;
		case 3:
		case 4:
			var intValueA = parseInt(a.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".",""));
			var intValueB = parseInt(b.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".",""));
			return intValueB - intValueA;
		default:
			break;
	}
}
function chooseSortFunctionGoogle(a,b,childIndex) {
	switch(childIndex) {
		case 2:
		case 4:
			return a.childNodes[childIndex].innerHTML.localeCompare(b.childNodes[childIndex].innerHTML);
		case 3:
		case 7:
		case 8:
		case 9:
			var floatValueA = parseFloat(a.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			var floatValueB = parseFloat(b.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".","").replace(",","."));
			return floatValueB - floatValueA;
		case 5:
		case 6:
			var intValueA = parseInt(a.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".",""));
			var intValueB = parseInt(b.childNodes[childIndex].innerHTML.split(" ")[0].replace(".","").replace(".",""));
			return intValueB - intValueA;
		default:
			break;
	}
}

function fillCampaignTableGoogle() {
	//document.getElementById("tableloader").className = "loading";
		document.getElementById("loader").style.display = "none";
		document.getElementById("googleDataTable").style.display = "";
	clearCampaignTable();
	var accIndex = document.getElementById("adaccountgoogle").selectedIndex + 1;
	var checkId = document.getElementById("adaccountgoogle").childNodes[accIndex].id;
	var checkName = document.getElementById("adaccountgoogle").childNodes[accIndex].innerHTML;
	var iter = 0;
	
	var fbTable = document.getElementById("facebooktablebody");
	//alert();
	for (var i = 0; i < googleData.length; i++) {
		if (googleData[i]["id"] == checkId) {
			for (var j = 0; j < googleData[i]["campaigns"].length; j++) {
				
				var keywordObjClass = "";
				var statusText = "";
				switch(googleData[i]["campaigns"][j]["status"]) {
					case "ENABLED":
						statusText = "Aktiv";
						keywordObjClass = ' class="green-keyword"';
						break;
					case "PAUSED":
						statusText = "Pausiert";
						keywordObjClass = ' class="red-keyword"';
						break;
					default:
						break;
				}
				var keywordClass = "";
				var keywordText = "";
				var tempTarget = googleData[i]["campaigns"][j]["target"];
				if (tempTarget - 8 >= 0) {
					tempTarget -= 8;
					keywordText += '<li class="orange-keyword">Content Network</li>';
				}
				if (tempTarget - 4 >= 0) {
					tempTarget -= 4;
					keywordText += '<li class="purple-keyword">Google Suche</li>';
				}
				if (tempTarget - 2 >= 0) {
					tempTarget -= 2;
					keywordText += '<li class="orange-keyword">Partner Network</li>';
				}
				if (tempTarget - 1 >= 0) {
					tempTarget -= 1;
					keywordText += '<li class="yellow-keyword">Search Network</li>';
				}
				/*switch(googleData[i]["campaigns"][j]["target"]) {
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
				}*/
				var newRow = document.createElement("tr");
				newRow.id = googleData[i]["campaigns"][j]["id"];
				//newRow.onclick=function () {showkeyworddetailgoogle(this);};
				var colHead = document.createElement("td");
				colHead.className="th table-check-cell";
				var colStatus = document.createElement("td");
				colStatus.innerHTML = '<ul class="keywords"><li' + keywordObjClass + '>' + statusText + '</li></ul>';
				colStatus.style.width = "10%";
				//colOne.innerHTML = "" + googleData[i]["campaigns"][j]["status"];
				var colName = document.createElement("td");
				colName.innerHTML = "" + googleData[i]["campaigns"][j]["name"];
				//colName.onmouseover = function () {showdetailloadinggoogle(this);};
				//colName.onmouseout = function () {hideBubble();};
				
				var colBudget = document.createElement("td");
				var budget = googleData[i]["campaigns"][j]["budget"] / 1000000;
				colBudget.innerHTML = setThousandsPoint(budget.toFixed(2).replace(".",",")) + ' €/Tag';
				colBudget.style.textAlign = "right";
				colBudget.width = "10%";
				
				var colImpressions = document.createElement("td");
				colImpressions.width = "10%";
				colImpressions.style.textAlign = "right";
				var colClicks = document.createElement("td");
				colClicks.width = "10%";
				colClicks.style.textAlign = "right";
				var colCtr = document.createElement("td");
				colCtr.width = "10%";
				colCtr.style.textAlign = "right";
				var colCpc = document.createElement("td");
				colCpc.width = "10%";
				colCpc.style.textAlign = "right";
				var colCost = document.createElement("td");
				colCost.width = "10%";
				colCost.style.textAlign = "right";
				
				if(googleCampaignData[checkId] == null) {
					colImpressions.innerHTML = "---";
					colClicks.innerHTML = "---";
					colCtr.innerHTML = "---";
					colCpc.innerHTML = "---";
					colCost.innerHTML = "---";
				} else {
					var cost = googleCampaignData[checkId][googleData[i]["campaigns"][j]["id"]]["cost"] / 1000000;
					var clicks = googleCampaignData[checkId][googleData[i]["campaigns"][j]["id"]]["clicks"];
					var cpc = clicks == 0 ? 0 : cost / clicks;
					cpc = cpc.toFixed(2);
					colImpressions.innerHTML = setThousandsPoint(googleCampaignData[checkId][googleData[i]["campaigns"][j]["id"]]["impressions"]);
					colClicks.innerHTML = setThousandsPoint(googleCampaignData[checkId][googleData[i]["campaigns"][j]["id"]]["clicks"]);
					colCtr.innerHTML = setThousandsPoint(googleCampaignData[checkId][googleData[i]["campaigns"][j]["id"]]["ctr"].replace(".",","));
					colCpc.innerHTML = setThousandsPoint(cpc.replace(".",",")) + " €";
					colCost.innerHTML = setThousandsPoint(cost.toFixed(2).replace(".",",")) + " €";
				}
				
				var colObjective = document.createElement("td");
				colObjective.innerHTML = '<ul class="keywords">' + keywordText + '</ul>';
				colObjective.style.width = "10%";
				//colThree.innerHTML = "" + googleData[i]["campaigns"][j]["target"];
				var colDateStart = document.createElement("td");
				colDateStart.innerHTML = makeTimeReadable("" + googleData[i]["campaigns"][j]["startDate"]);
				var colDateStop = document.createElement("td");
				
				var tempTime = makeTimeReadable("" + googleData[i]["campaigns"][j]["endDate"]);
				
				//var today = new Date();
				//var dd = today.getDate();
				//var mm = today.getMonth()+1; //January is 0!
				//var yyyy = today.getFullYear();
				//dd = dd < 10 ? "0" + dd : dd;
				//mm = mm < 10 ? "0" + mm : mm;
				//var timeString = dd + "." + mm + "." + yyyy;
				var timeString = "30.12.2037";
				
				if (tempTime == timeString) {
					colDateStop.innerHTML = "Fortlaufend";
				} else {
					colDateStop.innerHTML = tempTime;
				}
				//colDateStop.innerHTML = makeTimeReadable("" + googleData[i]["campaigns"][j]["endDate"]);
				
				var colOptions = document.createElement("td");
				colOptions.style.width = "10%";
				var optionHead = document.createElement("div");
				optionHead.className = "menu";
				
				var triggerbutton = document.createElement("div");
				triggerbutton.className = "button menu-opener";
				
				if (fingerprinttest[googleData[i]["campaigns"][j]["id"].toString()] != null) {
					if (fingerprinttest[googleData[i]["campaigns"][j]["id"].toString()]["status"] == 1) {
						triggerbutton.className += " active";
					} else {
						triggerbutton.className += " triggerset";
					}
				} else {
					triggerbutton.className += " notrigger";
				}
				
				//var triggerbutton = document.createElement("div");
				//triggerbutton.className = "button menu-opener";
				triggerbutton.innerHTML = "Trigger";
				var triggeroptions = document.createElement("ul");
				var triggeroption1 = document.createElement("li");
				triggeroption1.className = "icon_control";
				triggeroption1.innerHTML = '<a href="googleeventmanager/#" onclick="actualizeCampaign(this,true,true);return false;">Trigger On</a>';
				var triggeroption2 = document.createElement("li");
				triggeroption2.className = "icon_pause";
				triggeroption2.innerHTML = '<a href="googleeventmanager/#" onclick="actualizeCampaign(this,false,true);return false;">Trigger Off</a>';
				var triggerseperator = document.createElement("li");
				triggerseperator.className = "sep";
				var triggeroption3 = document.createElement("li");
				triggeroption3.className = "icon_computer";
				triggeroption3.innerHTML = '<a href="googleeventmanager/#" onclick="buildTriggerSettings(this,true);return false;">Trigger Settings</a>';
				
				triggeroptions.appendChild(triggeroption1);
				triggeroptions.appendChild(triggeroption2);
				triggeroptions.appendChild(triggerseperator);
				
				triggeroptions.appendChild(triggeroption3);
				optionHead.appendChild(triggeroptions);
				triggerbutton.appendChild(optionHead);
				colOptions.appendChild(triggerbutton);
				
				
				newRow.appendChild(colHead);
				newRow.appendChild(colOptions);
				newRow.appendChild(colName);
				newRow.appendChild(colBudget);
				newRow.appendChild(colStatus);
				newRow.appendChild(colImpressions);
				newRow.appendChild(colClicks);
				newRow.appendChild(colCtr);
				newRow.appendChild(colCpc);
				newRow.appendChild(colCost);
				//newRow.appendChild(colObjective);
				//newRow.appendChild(colDateStart);
				//newRow.appendChild(colDateStop);
				fbTable.appendChild(newRow);
			}
			break;
		}
	}
}

var googleData = new Array();

var getGoogleData = new XMLHttpRequest();
getGoogleData.onload = function () {
	//googleData = JSON.parse(this.responseText);
	//fillGoogleData();
	//alert(dataJSON);
}

var isSendingGoogle = false;

var googleCampaignData = new Array();

var oReqGoogle = new XMLHttpRequest();
oReqGoogle.onload = function() {
	
	var chartDataJSON;
	try {
		chartDataJSON = JSON.parse(this.responseText);
	} catch (err){
		//alert("Daten konnten nicht geladen werden");
		isSendingGoogle = false;
		return false;
	}
	
	var adaccgoogle = document.getElementById("adaccountgoogle");
	var clientId = adaccgoogle.childNodes[adaccgoogle.selectedIndex + 1].id;
	
	googleCampaignData[clientId] = chartDataJSON;
	
	if (isSendingGoogle) {
		//campaignDetailData[chartData[0]["campaign_id"].toString()] = chartData[0];
		//showdetaillatergoogle();
	} else {
		//console.log(chosenIDGlobal);
		//campaignDetailData[chosenIDGlobal.toString()] = 'Keine Daten zur Kampagne "' + chosenNameGlobal + '"!';
	}
	isSendingGoogle = false;
	
	//showdetaillatergoogle();
	fillCampaignTableGoogle();
	//showData();
	//paintGraph();

	//document.getElementById("tableloader").className = "";
	//document.getElementById("loader").style.display = "none";
	//document.getElementById("chartdiv").style.display = "block";
	//document.getElementById("overviewdiv").style.display = "block";
};

var isSendingKeywordGoogle = false;

var googleKeywordsData = new Array();

var oReqKeywordsGoogle = new XMLHttpRequest();

oReqKeywordsGoogle.onload = function() {
	var chartDataJSON;
	try {
		chartDataJSON = JSON.parse(this.responseText);
	} catch (err){
		//alert("Daten konnten nicht geladen werden");
		isSendingKeywordGoogle = false;
		return false;
	}
	var adaccgoogle = document.getElementById("adaccountgoogle");
	var clientId = adaccgoogle.childNodes[adaccgoogle.selectedIndex + 1].id;
	googleKeywordsData[clientId] = chartDataJSON;
	isSendingKeywordGoogle = false;
	showdetaillatergoogle();
}

function fillGoogleData() {
	//if (googledata !== "empty") {
		googleData = JSON.parse(googledata);
		//alert(googleData);
	if (googleData !== "empty") {
		var adaccountlist = document.getElementById("adaccountgoogle");
		
		//for (key in googleData) {
		for (var i = 0; i < googleData.length; i++) {
			var newOption = document.createElement("option");
			//var newOptionText = document.createTextNode("" + key["name"]);
			var newOptionText = document.createTextNode("" + googleData[i]["name"]);
			
			newOption.appendChild(newOptionText);
			newOption.id="" + googleData[i]["id"];
			adaccountlist.appendChild(newOption);
			
		}
	} else {
		alert("Keine verknüpften Konten für diesen Account");
	}
}