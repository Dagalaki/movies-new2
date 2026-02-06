

/**
  * Aufruf bei Seitenaufbau.
  * Ruft die Funktion zum Tabellenaufbau auf 
  */
window.onload = function() {
	
	buildActionTable(null);
	
	document.getElementById("loader").style.display = "none";
	document.getElementById("showtriggerdiv").style.display = "block";
	savedCampaignJSON = campaignList;
	initializeForIE();
	if (uploadedString != "") {
		var dataArray = JSON.parse(uploadedString);
		clearATRows();
		if (setMotive(dataArray[0])) {
			reloadCampaignList();
		}
		setTimeout(function() {blablubTest(dataArray)}, 3000);
	}
}

function initializeForIE() {
	document.getElementById("addmotive").onclick = function() {addMotive();};
	document.getElementById("checkmotive").onclick = function() {getMotives();};
}

/**
  * Fügt die Daten der Rows zu einem Array zusammen und, sollte mindestens eine Row "aktiv" sein,
  * schickt die Daten an den Server zurück, welcher aus diesen eine XLSX auf Basis des Templates baut.
  * Steigt aus, wenn das Motiv "Bitte wählen" aktiv ist.
  * Fügt keine Datensätze aus Rows ein, welche in der unsichtbaren Column ein "New" stehen haben.
  * Gibt ein Alert aus, wenn es keine aktiven Rows für das ausgewählte Motiv gibt.
  */
function downloadAL() {
	var dlArray = new Array();
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	var iter = 0;
	var motive = document.getElementById("admotive").value;
	if(motive == "Bitte wählen")
		return false;
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].className.indexOf("paused") < 0
			&& rows[i].className.indexOf("deleted") < 0
			&& rows[i].childNodes[4].firstChild.firstChild.innerHTML != "New") {
			var tempArray = new Array();
				
			for (var j = 0; j < 4; j++) {
				tempArray[j] = rows[i].childNodes[j].firstChild.firstChild.value;
			}

			dlArray[iter] = tempArray;
			iter++;
		}
	}
	if (iter > 0) {
		var dataJSON = JSON.stringify(dlArray);
		uploadXLSX.open("post", "triggermanager/?datajson=" + dataJSON + "&motive=" + motive + "&newfile=true", true);
		uploadXLSX.send();
	} else {
		alert("Keine aktiven Trigger gefunden!");
	}
}
/**
  * Geht jede Row durch und vergleicht die jeweiligen CampaignIDs mit den Daten aus Google.
  * Gibt es eine Übereinstimmung, so erscheint der Name der Kampagne neben oder unter dem Eingabefeld.
  * Gibt es keine Übereinstimmung, so erscheint der Text "Kampagne nicht gefunden!" und die Row
  * wird als "Deleted" markiert.
  */
function getCampaignNames() {
	var dataArray = JSON.parse(savedCampaignJSON);
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].childNodes;
	for (var i = 0; i < rows.length; i++) {
		var noMatch = true;
		for (var j = 0; j < dataArray.length; j++) {
			if (rows[i].firstChild.firstChild.firstChild.value == dataArray[j]["id"]) {
				rows[i].firstChild.firstChild.childNodes[3].innerHTML = dataArray[j]["name"];
				noMatch = false;
			}
		}
		if (noMatch) {
			rows[i].firstChild.firstChild.childNodes[3].innerHTML = "Kampagne nicht gefunden!";
			rows[i].childNodes[4].firstChild.firstChild.innerHTML = "Deleted";
		}
	}
}

/**
  * Holt sich die Länge der Tabelle und löst die Löschfunktion jeder Row aus.
  * Danach werden neue Reihen anhand der übergebenen Daten als Rows eingebaut.
  * Zum Ende wird den CampaignIDs ihr jeweiliger Name zugeordnet und die Farbe der Row angepasst.
  *
  * @param dataArray Array in genormter Form. Form wird in der Funktion "reconvert" gezeigt.
  */
function blablubTest(dataArray) {
	var sizeNodes = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].childNodes.length;
	if (sizeNodes > 0) {
		sizeNodes--;
		deleteTrigger(document.getElementById("delete" + sizeNodes));
		for (var i = 1; i < dataArray.length; i++) {
			loadATRow(reconvert(dataArray[i]),"yes");
		}
		getCampaignNames();
		changeRowColor();
	}
}

/**
  * Nimmt ein Array alter Norm an und gibt es in der aktuellen Norm wieder.
  *
  * @param dataArrayOld Array in alter Norm
  * @return array
  */
function reconvert(dataArrayOld) {
	var dataArrayNew = new Array();
	dataArrayNew["campaign_id"] = dataArrayOld["campaign_id"];
	dataArrayNew["triggertype"] = dataArrayOld["trigger_type"];
	dataArrayNew["triggeraction"] = dataArrayOld["trigger_action"];
	dataArrayNew["timespan"] = dataArrayOld["timespan"];
	return dataArrayNew;
}

/**
  * Wechselt die Adresse auf das Template-XLSX. Führt zum Download des XLSX.
  */
function downloadTemplate() {
	window.location = "../files/triggermanager/TemplateTriggerSheet.xlsx";
}

/**
  * Setzt die Reihe des Triggerelements auf "Pause" oder davon zurück. Eine Aktion auf "Pause" wird zwar angezeigt,
  * aber nicht ausgeführt. Hier geht es um Informationen in der unsichtbaren Column. Sollte hier "Deleted" stehen,
  * so wird nichts geändert. Sollte hier "Paused" stehen, so wird dieser Teil des Strings gelöscht,
  * womit die Row wieder aktiv wird. Zum Abschluss werden die Farben der Rows angepasst.
  *
  * @param triggerelement Das Element, welches die Funktion auslöst.
  */
function pauseTrigger(triggerelement) {
	var picSize = "32";
	var picToPause = "images/icons/fugue/control-pause.png";
	var picToStart = "images/icons/fugue/control.png";
	
	var rowNumber = parseInt(triggerelement.id.replace("pause",""));
	
	var row = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber];
	var picture = document.getElementById("pause" + rowNumber).firstChild;
	var divElement = row.childNodes[4].firstChild.firstChild;
	if (divElement.innerHTML.indexOf("Deleted") > -1) {
		return true;
	}
	if (divElement.innerHTML.indexOf("Paused") > -1) {
		divElement.innerHTML = divElement.innerHTML.replace("Paused","");
		if (divElement.innerHTML.indexOf("Old") > -1) {
			divElement.innerHTML = divElement.innerHTML.replace("Changed","");
			divElement.innerHTML = divElement.innerHTML.replace("Old","ChangedOld");
		}
		picture.src = picToPause;
		document.getElementById("pause" + rowNumber).title = "Pausieren";
	} else {
		if (divElement.innerHTML.indexOf("Old") > -1) {
			divElement.innerHTML = divElement.innerHTML.replace("Changed","");
			divElement.innerHTML = divElement.innerHTML.replace("Old","ChangedOld");
		}
		divElement.innerHTML += "Paused";
		document.getElementById("pause" + rowNumber).title = "Starten";
		picture.src = picToStart;
	}
	changeRowColor();
}
/**
  * Setzt die Row des Triggerelements auf "Deleted" oder zurück. Sollte die Row den Status "New" oder "Changed" haben,
  * So wird die Row entfernt. Nach dem Löschen werden die Row-Nummern neu bestimmt und gesetzt.
  * Danach werden die Farben der Rows neu überarbeitet.
  *
  * @param triggerelement Das Element, welches die Funktion auslöst.
  */
function deleteTrigger(triggerelement) {
	
	var picSize = "32";
	var picDelete = "images/icons/web-app/" + picSize + "/Delete.png";
	var picReturn = "images/icons/web-app/" + picSize + "/Add.png";
	
	var rowNumber = parseInt(triggerelement.id.replace("delete",""));
	var row = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber];
	
	var isPaused = row.childNodes[4].firstChild.firstChild.innerHTML.indexOf("Paused") > -1;
	
	
	if (isPaused)
		row.childNodes[4].firstChild.firstChild.innerHTML = row.childNodes[4].firstChild.firstChild.innerHTML.replace("Paused","");
	
	if (row.childNodes[4].firstChild.firstChild.innerHTML == "New") {
		row.parentNode.removeChild(row);
	} else if (row.childNodes[4].firstChild.firstChild.innerHTML == "Changed") {
		row.parentNode.removeChild(row);
	} else if (row.childNodes[4].firstChild.firstChild.innerHTML == "ChangedOld") {
		row.childNodes[4].firstChild.firstChild.innerHTML = "DeletedChange";
		row.childNodes[5].firstChild.firstChild.firstChild.src = picReturn;
		triggerelement.title = "Wiederherstellen";
	} else if (row.childNodes[4].firstChild.firstChild.innerHTML == "Old") {
		row.childNodes[4].firstChild.firstChild.innerHTML = "Deleted";
		row.childNodes[5].firstChild.firstChild.firstChild.src = picReturn;
		triggerelement.title = "Wiederherstellen";
	} else if (row.childNodes[4].firstChild.firstChild.innerHTML == "DeletedChange") {
		row.childNodes[4].firstChild.firstChild.innerHTML = "ChangedOld";
		row.childNodes[5].firstChild.firstChild.firstChild.src = picDelete;
		triggerelement.title = "Löschen";
	} else if (row.childNodes[4].firstChild.firstChild.innerHTML == "Deleted") {
		row.childNodes[4].firstChild.firstChild.innerHTML = "Old";
		row.childNodes[5].firstChild.firstChild.firstChild.src = picDelete;
		triggerelement.title = "Löschen";
	}
	if (isPaused)
		row.childNodes[4].firstChild.firstChild.innerHTML += "Paused";
	rearrangeRowNumbers();
	changeRowColor();
}

/**
  * Die aktuelle Tabelle wird auf Fehler in der Abfolge überprüft und die Abfolge wenn nötig angepasst.
  * Es werden die eindeutigen Ziffern in den IDs der Teiler der Row neu bestimmt.
  */
function rearrangeRowNumbers() {
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	for (var i = 0; i < rows.length; i++) {
		var temp = "atRow" + i;
		if (rows[i].id != temp) {
			var wrongRowNumber = rows[i].id.replace("atRow","");
			for (var j = 0; j < rows[i].childNodes.length; j++) {
				for (var k = 0; k < rows[i].childNodes[j].firstChild.childNodes.length; k++) {
					var tempNode = rows[i].childNodes[j].firstChild.childNodes[k];
					tempNode.id = tempNode.id.replace(wrongRowNumber,i);
					if (tempNode.name) {
						tempNode.name = tempNode.name.replace(wrongRowNumber,i);
					}
				}
			}
			rows[i].id = rows[i].id.replace(wrongRowNumber,i);
		}
	}
}
/**
  * Enthält die Daten aus Google in Form eines JSON-Strings
  */
var savedCampaignJSON = "";

/**
  * Entfernt die Bezeichnung "triggered", anhand derer die Zuweisung von einer ausgesuchten Kampagne mit einer Row erfolgt,
  * aus allen Rows.
  */
function cleanFromTrigger() {
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	for (var i = 0; i < rows.length; i++) {
		var tempButton = document.getElementById("triggertargetchoose" + i);
		if (tempButton.name.indexOf("triggered") > -1) {
			tempButton.name = tempButton.id;
		}
	}
}

/**
  * Entfernt alle Vorkommnisse der Bezeichnung "triggered" und setzt diese Bezeichnung auf das Triggerelement.
  * Danach wird das Fenster für die Kampagnenwahl aufgerufen.
  * 
  * @param triggerelement Das Element, welches die Funktion auslöst
  */
function loadCampaignsByMotive(triggerelement) {
	cleanFromTrigger();
	triggerelement.name += "triggered";
	if (savedCampaignJSON != "") {
		refreshCampaignPreview(savedCampaignJSON);
	}
}

/**
  * Zeigt oder versteckt das Element "loader".
  * 
  * @param activate Zeigt das Element, wenn "true", versteckt das Element, wenn "false".
  */
function showLoader(activate) {
	document.getElementById("loader").style.display = activate ? "block" : "none";
}

/**
  * Zeigt das Element "miniloader" in der übergebenen Row, oder versteckt die Elemente "miniloader" aus allen Rows.
  * 
  * @param rownumber Die Rownumber, welche aktiviert werden soll. Kann "null" sein, wenn "activate" == "false".
  * @param activate "true" oder "false".
  */
function showSmallLoader(rownumber, activate) {
	if (activate) {
		document.getElementById("miniloader" + rownumber).style.display = "block";
	} else {
		activeMiniLoaders = document.getElementsByClassName("miniloader");
		for(var i = 0; i < activeMiniLoaders.length; i++) {
			activeMiniLoaders[i].style.display = "none";
		}
	}
}

/**
  * Sucht in den angezeigten CampaignIDs und CampaignNames aus den Googledaten Übereinstimmungen
  * mit dem Suchbegriff des Triggerelements. Kein Eintrag zeigt alle verfügbaren Kampagnen an.
  * 
  * @param triggerelement Element, welches die Funktion auslöst.
  */
function searchCampaigns(triggerelement) {
	var inputText = triggerelement.value;
	var campaignArray = JSON.parse(savedCampaignJSON);
	var tableBody = document.getElementById("showhintsdiv").getElementsByTagName("tbody")[0];
	var iter = 0;
	while (tableBody.firstChild) {
		tableBody.removeChild(tableBody.firstChild);
	}
	if (inputText != "") {
		for (var i = 0; i < campaignArray.length; i++) {
			if (isNaN(inputText)) {
				if (campaignArray[i]["name"].toLowerCase().indexOf(inputText.toLowerCase()) > -1) {
					var newRow = document.createElement("tr");
					newRow.onclick = function() {chooseCampaign(this);};
					var nameCell = document.createElement("td");
					nameCell.innerHTML = campaignArray[i]["name"];
					var idCell = document.createElement("td");
					idCell.innerHTML = campaignArray[i]["id"];
					newRow.appendChild(nameCell);
					newRow.appendChild(idCell);
					tableBody.appendChild(newRow);
					iter++;
				}
			} else {
				if (campaignArray[i]["id"].indexOf(inputText) > -1) {
					var newRow = document.createElement("tr");
					newRow.onclick = function() {chooseCampaign(this);};
					var nameCell = document.createElement("td");
					nameCell.innerHTML = campaignArray[i]["name"];
					var idCell = document.createElement("td");
					idCell.innerHTML = campaignArray[i]["id"];
					newRow.appendChild(nameCell);
					newRow.appendChild(idCell);
					tableBody.appendChild(newRow);
					iter++;
				}
			}
		}
	} else {
		for (var i = 0; i < campaignArray.length; i++) {
			var newRow = document.createElement("tr");
			newRow.onclick = function() {chooseCampaign(this);};
			var nameCell = document.createElement("td");
			nameCell.innerHTML = campaignArray[i]["name"];
			var idCell = document.createElement("td");
			idCell.innerHTML = campaignArray[i]["id"];
			newRow.appendChild(nameCell);
			newRow.appendChild(idCell);
			tableBody.appendChild(newRow);
			iter++;
		}
	}
	document.getElementById("nocampaigns").style.display = iter == 0 ? "block" : "none";
}

/**
  * Baut anhand der Googledaten über die Kampagnen eine Tabelle auf, in der CampaignName und CampaignID gelistet sind. 
  * 
  * @param responseText JSON-String, welcher die Googledaten enthält.
  */
function refreshCampaignPreview(responseText) {
	if (responseText != "" && responseText != "[]") {
		var campaignArray = JSON.parse(responseText);
		var inputField = '<input type="text" id="campaignsearchfield" class="float-right" onChange="searchCampaigns(this)" onpropertychange="searchCampaigns(this)" oninput="searchCampaigns(this)">';
		var showText = '<table class="table" style="width:521px;"><thead><tr><td>Name' + inputField + '</td><td>ID</td></tr></thead><tbody>';
		for (var i = 0; i < campaignArray.length; i++) {
			onclicktext = 'chooseCampaign(this)';
			showText += '<tr onclick="' + onclicktext + '"><td>' + campaignArray[i]["name"] + '</td><td>' + campaignArray[i]["id"] + '</td></tr>';
		}
		showText += '</tbody></table>';
		showText += '<div id="nocampaigns" style="display:none;">Keine Kampagnen gefunden</div>';
		document.getElementById("showhintsdiv").innerHTML = showText;
	} else {
		document.getElementById("showhintsdiv").innerHTML = "Keine Kampagnen verfügbar";
	}
	document.getElementsByClassName("fancybox-overlay")[0].style.display = "block";
	showSmallLoader(null,false);
}

var loadCampaigns = new XMLHttpRequest();


/**
  * Aktualisiert die globale Variable "savedCampaignJSON" mit dem zurückgegebenen Wert.
  */
loadCampaigns.onload = function() {
	try {
		savedCampaignJSON = this.responseText;
	} catch (err) {
	}
};

var uploadXLSX = new XMLHttpRequest();

/**
  * Prüft in dem Rückgabewert auf einen String, welcher den String des Werbemotivs beinhaltet.
  * Der Sollfall ist, dass der Pfad zur downloadbaren XLSX-Datei wiedergegeben wird.
  */
uploadXLSX.onload = function() {
	try {
		var motiv = document.getElementById("admotive").value;
		if (this.responseText.indexOf(motiv) > -1) {
			window.location = this.responseText;
		}
	} catch (err) {
	}
};

var oReq = new XMLHttpRequest();
var alData = new Array();

/**
  * Baut entweder mit den zurückgegebenen Daten die Tabelle neu auf, oder baut eine leere Tabelle neu auf. 
  */
oReq.onload = function() {
	alData = new Array();
	var alDataJSON;
	try {
		alDataJSON = JSON.parse(this.responseText);
	} catch (err) {
		alDataJSON = null;
	}
	buildActionTable(alDataJSON);
};

var sendJSON = new XMLHttpRequest();

/**
  * Sollte eine Antwort eingehen, so werden die IDs aktualisiert und die Motive neu geladen.
  */
sendJSON.onload = function() {
	try {
		if (this.responseText != "") {
			actualizeIDs(this.responseText);
		} else {
		}
		reloadMotiveField("");
	} catch (err) {
		alert("Speichervorgang abgebrochen " + err);
	}
};

var checkJSON = new XMLHttpRequest();

/**
  * Sollte eine Antwort eingehen, so werden die Fingerprints zurückgegeben.
  */
checkJSON.onload = function() {
	try {
		if (this.responseText != "") {
			checkFingerprintName(this.responseText);
		}
	} catch (err) {
		alert("Speichervorgang abgebrochen " + err);
	}
};

/**
  * Die ausgewählten Daten werden in die Triggertabelle übertragen und das Fenster geschlossen.
  * Die Farben werden angepasst und die Vorkommen von "triggered" entfernt.
  *
  * @param triggerelement Reihe, welche den Trigger auslöst.
  */
function chooseCampaign(triggerelement) {
	var chosenId = triggerelement.childNodes[1].innerHTML;
	var chosenName = triggerelement.childNodes[0].innerHTML;
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	var targetField;
	for (var i = 0; i < rows.length; i++) {
		targetField = document.getElementById("triggertargetchoose" + i);
		if (targetField.name.indexOf("triggered") > -1) {
			document.getElementById("triggertargetcampaign" + i).value = chosenId;
			document.getElementById("triggertargetlabel" + i).innerHTML = chosenName;

			rows[i].childNodes[4].firstChild.firstChild.innerHTML = rows[i].childNodes[4].firstChild.firstChild.innerHTML == "Old" ? "ChangedOld" : "Changed";
			
			break;
		}
	}
	changeRowColor();
	cleanFromTrigger();
	closeFancybox();
}

/**
  * Prüft, ob das Feld für die KampagnenID das Wort "Ziel" enthält oder leer ist, solange die unsichtbare Column "Changed" enthält.
  * Gibt "true" zurück, wenn alle Kampagnen gefüllt sind. "false", wenn auch nur eine Kampagne nicht angegeben wurde.
  *
  * @return true, wenn alle geänderten Rows CampaignIDs aufweisen, false, wenn mindestens eine Kampagne dies nicht tut.
  */
function checkChangedCampaigns() {
	var isFilled = true;
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Changed") > -1) {
			isFilled = isFilled && (rows[i].firstChild.firstChild.firstChild.value != "Ziel");
			isFilled = isFilled && (rows[i].firstChild.firstChild.firstChild.value != ""); 
		}
	}
	return isFilled;
}

/**
  * Prüft, ob alle Änderungen korrekt sind und das Motiv gewählt wurde. Sollte etwas davon nicht stimmen,
  * so wird der Speichervorgang mit einer Alert-Meldung abgebrochen. Ansonsten wird ein Confirm-Fenster gezeigt,
  * welches eine Bestätigung zum Speichern erwartet. Sollte eine Bestätigung erfolgen, so werden die Daten für
  * die Änderungen in ein JSON verpackt und zum Speichern in der Datenbank versendet.
  */
function saveToJSON() {
	
	if (!checkChangedCampaigns()) {
		alert("Bitte KampagnenID angeben");
		return false;
	}
	
	if (document.getElementById("admotive").value == "Bitte wählen") {
		alert("Kein Trigger ausgewählt");
		return false;
	}
	var isReady = confirm("Wirklich speichern?");
	if (isReady) {
		var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
		var rowArray = new Array();
		rowArray[0] = 0;
		rowArray[1] = document.getElementById("admotive").value;
		var rowIter = 2;
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Changed") > -1) {
				var previous = 0;
				// Eintrag wurde bearbeitet
				if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Old") > -1) {
					// Neuer Eintrag mit Verweis auf alten Eintrag
					previous = parseInt(rows[i].childNodes[4].firstChild.firstChild.id);
				}
				var cellArray = new Array();
				
				for (var j = 0; j < rows[i].childNodes.length; j++) {
					if (j == 4) {
						cellArray[j] = previous;
					} else {
						cellArray[j] = rows[i].childNodes[j].firstChild.firstChild.value;
					}
				}
				if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Paused") > -1) {
					cellArray[5] = "2";
				} else {
					cellArray[5] = "1";
				}
				rows[i].childNodes[4].firstChild.firstChild.innerHTML = "Pending";
				rowArray[rowIter++] = cellArray;
			} else if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Deleted") > -1) {
				var previous = parseInt(rows[i].childNodes[4].firstChild.firstChild.id);
				var cellArray = new Array();
				
				for (var j = 0; j < rows[i].childNodes.length; j++) {
					if (j == 4) {
						cellArray[j] = previous;
					} else if ( j == 3) {
						cellArray[j] = "0";
					} else {
						cellArray[j] = rows[i].childNodes[j].firstChild.firstChild.value;
					}
				}
				rowArray[rowIter++] = cellArray;
			}
		}
		
		for (var i = rows.length - 1; i >= 0; i--) {
			if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Deleted") > -1)
				rows[i].parentNode.removeChild(rows[i]);
		}
		if (rowArray.length > 2) {
			var stringJSON = JSON.stringify(rowArray);
			stringJSON = encodeURI(stringJSON);
			
			//sendJSON.open("get", "https://www.media-theia.de/triggermanager/?save=true&json=" + stringJSON, true);
			sendJSON.open("get", "/triggermanager/?save=true&json=" + stringJSON, true);
			sendJSON.send();
		} else {
			console.log("Keine Änderungen");
		}
	}
	rearrangeRowNumbers();
	changeRowColor();
}

/**
  * Setzt alle IDs der Rows (nicht der Kampagnen) auf die Rückgabewerte der Speicherfunktion.
  * Dies bewirkt, dass die gespeicherten Änderungen den einzelnen Rows zuweisbar sind.
  *
  * @params responseText JSON-String mit den geordneten IDs der Rows
  */
function actualizeIDs(responseText) {
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	newNumberArray = JSON.parse(responseText);
	var iter = 0;
	for (var i = 0; i < rows.length; i++) {
		if(rows[i].childNodes[4].firstChild.firstChild.innerHTML == "Pending") {
			rows[i].childNodes[4].firstChild.firstChild.innerHTML = "Old";
			rows[i].childNodes[4].firstChild.firstChild.id = newNumberArray[iter];
			iter++;
		}
	}
}

/**
  * Erstellt eine Tabelle für die Triggerdaten. Sollte der übergebene String "null" sein, so wird eine neue Tabelle mit
  * einer leeren Row aufgebaut. Andernfalls werden die übergebenen Daten in die Tabelle als Rows eingebettet.
  *
  * @params alDataJSON JSON-String mit den übergebenen Daten.
  */
function buildActionTable(alDataJSON) {
	var std = document.getElementById("showtriggerdiv");
	
	var newText = '<table class="table" width="100%" style="table-layout:auto;">';
	newText += '<thead><tr align="left">';
	newText += '<th scope="col">Kampagnen - ID</th>';
	newText += '<th scope="col">Triggertyp</th>';
	newText += '<th scope="col">Triggeraction</th>';
	newText += '<th scope="col">Zeitspanne in Minuten</th>';
	newText += '<th scope="col">Aktionen</th>';
	newText += '</tr></thead><tbody>';
	newText +='</tbody></table>';
	std.innerHTML = newText;
	if (alDataJSON == null) {
		addATRow();
	} else {
		loadATRows(alDataJSON);
		addATRow();
	}
	fillCampaignNames();
}

/**
  * Schliesst das übergelagerte Fenster.
  */
function closeFancybox() {
	document.getElementsByClassName("fancybox-overlay")[0].style.display = "none";
}

/**
  * Entfernt alle Rows aus der Tabelle.
  */
function clearATRows() {
	std = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0];
	while (std.firstChild)
		std.removeChild(std.firstChild);
}

/**
  * Übernimmt die Triggerdaten als Array und übergibt diese Row für Row.
  *
  * @param alDataArray Array aus Triggerdaten. Formatinformation bei "reconvert".
  */
function loadATRows(alDataArray) {
	for (var i = 0; i < alDataArray.length; i++) {
		loadATRow(alDataArray[i], "no");
	}
}

/**
  * Baut eine Row aus den übergebenen Daten.
  * Die erste Zelle einer Row enthält die CampaignID, sofern gültig auch den CampaignName,
  * sowie einen Button, der ein Fenster öffnet um alle verfügbaren Kampagnen anzuzeigen.
  * Die zweite Zelle enthält ein Dropdownmenü, welches mit den möglichen Triggertypen beschrieben wird.
  * Die dritte Zelle enthält entweder ein Dropdownmenü oder ein Eingabefeld, abhängig von der zweiten Zelle.
  * Die vierte Zelle enthält ein Eingabefeld zur Eingabe der Zeit in Minuten.
  * Die fünfte Zelle ist unsichtbar und enthält einen String zur Bestimmung des Status der Reihe.
  * Der Value des Span-Elements dieser Row enthält die bisherige ID des Eintrags in der Datenbank, oder 0.
  * Die sechste Zelle enthält zwei Buttons zum Löschen oder Pausieren der Kampagne.
  * 
  * @params rowData DatenArray für eine Row.
  * @params isLoading Wenn String = "yes", so wird diese Row als "Changed" markiert, sonst "Old".
  */
function loadATRow(rowData, isLoading) {
	isLoading = isLoading == "yes" ? isLoading : "no";
	var std = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0];
	var amount = std.getElementsByTagName("tr").length;
	var row = document.createElement("tr");
	if (rowData["is_active"] == 2) {
		row.className = "paused";
	}
	row.align = "left";
	row.id = "atRow" + amount;
	for (var i = 0; i < 6; i++) {
		var cell = document.createElement("td");
		cell.scope = "col";
		var element = "";
		var divElement = document.createElement("div");
		divElement.className = "float-left gutter-right button-height form";
		switch(i) {
			case 1: // Triggertype
				var select = document.createElement("select");
				select.id = "triggertype" + amount;
				select.name = "triggertype" + amount;
				select.onchange = function(){changeRow(this);};
				var tempIter =	rowData["triggertype"] == "ccpc" ? 1 :
								rowData["triggertype"] == "acpc" ? 2 :
								rowData["triggertype"] == "kcpc" ? 3 : 4;
				select.appendChild(fillOptions("status","Status", tempIter == 4));
				select.appendChild(fillOptions("ccpc","Campaign-CPC", tempIter == 1));
				select.appendChild(fillOptions("acpc","Adgroup-CPC", tempIter == 2));
				select.appendChild(fillOptions("kcpc","Keyword-CPC", tempIter == 3));
				divElement.appendChild(select);
				break;
			case 2: // Triggeraction
				var select = null;
				var percField = null;
				var posiField = null;

				switch(rowData["triggertype"]) {
					case "ccpc":
					case "acpc":
					case "kcpc":
						
						select = document.createElement("input");
						select.type = "text";
						select.className = "float-left";
						
						var triggerActionValue = rowData["triggeraction"].replace("positive","+");
						triggerActionValue = rowData["triggeraction"].replace("negative","-");
						triggerActionValue = rowData["triggeraction"].replace("absolute","=");
						
						triggerActionValue = rowData["triggeraction"].replace("percent","%");
						triggerActionValue = rowData["triggeraction"].replace("currency","€");
						
						triggerActionValue = rowData["triggeraction"].replace(".",",");

						select.id = "triggeraction" + amount;
						select.name = "triggeraction" + amount;
						select.value = triggerActionValue;
						select.onchange = function(){changeRow(this);};
						var hoverElement = document.createElement("a");
						hoverElement.href = "#";
						hoverElement.onclick = "return false;";
						hoverElement.className = "hoverhelp float-left";
						hoverElement.id = "hoverhelp" + rownumber;
						var imgElement = document.createElement("img");
						imgElement.src = "images/icons/fugue/question-white.png";
						imgElement.style.width = "20px";
						imgElement.style.height = "20px";
						imgElement.style.marginLeft = "10px";
						hoverElement.appendChild(imgElement);
						break;
					case "status":
					default:
						select = document.createElement("select");
						select.id = "triggeraction" + amount;
						select.name = "triggeraction" + amount;
						select.onchange = function(){changeRow(this);};
						var tempIter = rowData["triggeraction"] == "status_off" ? 1 : 0;
						select.appendChild(fillOptions("status_on", "Starte Kampagne", tempIter == 0));
						select.appendChild(fillOptions("status_off", "Stoppe Kampagne", tempIter == 1));
						break;
				}
				
				divElement.appendChild(select);
				if (hoverElement != null)
					divElement.appendChild(hoverElement);
				
				break;
			case 0: // Triggertarget KampagnenID
				var input = document.createElement("input");
				input.type = "text";
				input.id = "triggertargetcampaign" + amount;
				input.className = "float-left";
				input.name = "triggertargetcampaign" + amount;
				input.value = rowData["campaign_id"];
				input.onchange = function(){changeRow(this);};
				input.onpropertychange = input.onchange;
				input.oninput = input.onchange;
				var buttonElement = document.createElement("input");
				buttonElement.style.marginLeft = "10px";
				buttonElement.value = "suchen";
				buttonElement.type = "button";
				buttonElement.className = "button float-left";
				buttonElement.id = "triggertargetchoose" + amount;
				buttonElement.name = "triggertargetchoose" + amount;
				buttonElement.onclick = function() {loadCampaignsByMotive(this)};
				var imgElement = document.createElement("img");
				imgElement.className = "miniloader float-left";
				imgElement.id = "miniloader" + amount;
				imgElement.src = "images/icons/loader.gif";
				imgElement.style.width = "20px";
				imgElement.style.height = "20px";
				imgElement.style.marginLeft = "10px";
				imgElement.style.display = "none";
				var labelElement = document.createElement("span");
				labelElement.id = "triggertargetlabel" + amount;
				labelElement.className = "big float-left";
				labelElement.style.marginTop = "6px";
				var brElement = document.createElement("br");
				divElement.appendChild(input);
				divElement.appendChild(buttonElement);
				divElement.appendChild(brElement);
				divElement.appendChild(labelElement);
				divElement.appendChild(imgElement);
				break;
			case 3: // Timespan
				var input = document.createElement("input");
				input.type = "text";
				input.id = "timespan" + amount;
				input.name = "timespan" + amount;
				var tempIter = parseInt(rowData["timespan"]) ? parseInt(rowData["timespan"]) : 10;
				input.value = tempIter;
				input.onchange = function(){changeRow(this);};
				divElement.appendChild(input);
				break;
			case 4: // Is New Row
				var statusRow = isLoading == "yes" ? "Changed" : "Old";
				var oldId = isLoading == "yes" ? "0" : rowData["action_id"];
				statusRow += rowData["is_active"] == 2 ? "Paused" : "";
				divElement.innerHTML = '<p id="' + oldId + '">' + statusRow + '</p>';
				break;
			case 5: // Aktionen
				var picSize = "32";
				var linkPath = "deleteTrigger(this)";
				var linkPathPause = "pauseTrigger(this)";
				var picSource = "images/icons/web-app/" + picSize + "/Delete.png";
				var picSourcePause = "images/icons/fugue/";
				picSourcePause += rowData["is_active"] == 2 ? "control.png" : "control-pause.png";
				var linkDeleteText = '<a href="#" title="Löschen" id="delete' + amount + '" onclick="' + linkPath + ';return false;"><img width="' + picSize + '" height="' + picSize + '" src="' + picSource + '"></a>';
				var linkPauseText = '<a href="#" title="Pausieren" id="pause' + amount + '" onclick="' + linkPathPause + ';return false;"><img width="' + picSize + '" height="' + picSize + '" src="' + picSourcePause + '"></a>';
				divElement.innerHTML = linkDeleteText + linkPauseText;
				break;
			default:
				break;
		}
		cell.appendChild(divElement);
		row.appendChild(cell);
	}
	std.appendChild(row);
}

/**
  * Prüft, ob der übergebene String in der Liste der Motive enthalten ist. Stimmt das, so wird dieses Motiv angezeigt.
  * 
  * @params newmotive String mit dem zu überprüfenden Motiv.
  * @return true, wenn das Motiv enthalten ist, false, wenn nicht.
  */
function setMotive(newMotive) {
	var motives = document.getElementById("admotive").childNodes;
	for (var i = 0; i < motives.length; i++) {
		if(motives[i].value == newMotive) {
			document.getElementById("admotive").value = newMotive;
			return true;
		}
	}
	return false;
}

/**
  * Prüft jede Row, ob die darin enthaltene CampaignID bekannt ist. Ist das der Fall, so wird hinter oder unter dem Feld
  * der CampaignID der CampaignName angezeigt.
  */
function fillCampaignNames() {
	if (savedCampaignJSON != "") {
		var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
		campaignArray = JSON.parse(savedCampaignJSON);
		for (var i = 0; i < rows.length - 1; i++) {
			for (var j = 0; j < campaignArray.length; j++) {
				if (rows[i].firstChild.firstChild.firstChild.value == campaignArray[j]["id"]) {
					rows[i].firstChild.firstChild.childNodes[3].innerHTML = campaignArray[j]["name"];
					break;
				}
			}
		}
	}
}

/**
  * Erstellt eine neue leere Reihe, welche der Tabelle hinzugefügt wird.
  */
function addATRow() {
	var std = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0];
	var amount = std.getElementsByTagName("tr").length;
	var row = document.createElement("tr");
	row.align = "left";
	row.id = "atRow" + amount;
	for (var i = 0; i < 6; i++) {
		var cell = document.createElement("td");
		cell.scope = "col";
		var element = "";
		var divElement = document.createElement("div");
		divElement.className = "float-left gutter-right button-height form";
		switch(i) {
			case 1: // Triggertype
				var select = document.createElement("select");
				select.id = "triggertype" + amount;
				select.name = "triggertype" + amount;
				select.onchange = function(){changeRow(this)};
				select.appendChild(fillOptions("status","Status", true));
				select.appendChild(fillOptions("ccpc","Campaign-CPC", false));
				select.appendChild(fillOptions("acpc","Adgroup-CPC",false));
				select.appendChild(fillOptions("kcpc","Keyword-CPC",false));
				divElement.appendChild(select);
				break;
			case 2: // Triggeraction
				var select = document.createElement("select");
				select.id = "triggeraction" + amount;
				select.name = "triggeraction" + amount;
				select.onchange = function(){changeRow(this);};
				select.appendChild(fillOptions("status_on", "Starte Kampagne", true));
				select.appendChild(fillOptions("status_off", "Stoppe Kampagne",false));
				divElement.appendChild(select);
				break;
			case 0: // Triggertarget KampagnenID
				var input = document.createElement("input");
				input.type = "text";
				input.id = "triggertargetcampaign" + amount;
				input.name = "triggertargetcampaign" + amount;
				input.className = "float-left";
				input.value = "Ziel";
				input.disabled = false;
				input.onchange = function(){changeRow(this);};
				input.onpropertychange = input.onchange;
				input.oninput = input.onchange;
				var buttonElement = document.createElement("input");
				buttonElement.style.marginLeft = "10px";
				buttonElement.value = "suchen";
				buttonElement.type = "button";
				buttonElement.className = "button float-left";
				buttonElement.id = "triggertargetchoose" + amount;
				buttonElement.name = "triggertargetchoose" + amount;
				buttonElement.onclick = function() {loadCampaignsByMotive(this)};
				var imgElement = document.createElement("img");
				imgElement.className = "miniloader float-left";
				imgElement.id = "miniloader" + amount;
				imgElement.src = "images/icons/loader.gif";
				imgElement.style.width = "20px";
				imgElement.style.height = "20px";
				imgElement.style.marginLeft = "10px";
				imgElement.style.display = "none";
				var labelElement = document.createElement("span");
				labelElement.id = "triggertargetlabel" + amount;
				labelElement.className = "big float-left";
				labelElement.style.marginTop = "6px";
				var brElement = document.createElement("br");
				divElement.appendChild(input);
				divElement.appendChild(buttonElement);
				divElement.appendChild(brElement);
				divElement.appendChild(labelElement);
				divElement.appendChild(imgElement);
				break;
			case 3: // Timespan 
				var input = document.createElement("input");
				input.type = "text";
				input.id = "timespan" + amount;
				input.name = "timespan" + amount;
				input.value = "10";
				input.onchange = function(){changeRow(this);};
				divElement.appendChild(input);
				break;
			case 4: // Is New Row
				divElement.innerHTML = '<p id="0">New</p>';
				break;
			case 5: // Aktionen
				var picSize = "32";
				var linkPath = "deleteTrigger(this)";
				var linkPathPause = "pauseTrigger(this)";
				var picSource = "images/icons/web-app/" + picSize + "/Delete.png";
				var picSourcePause = "images/icons/fugue/";
				picSourcePause += "control-pause.png";
				var linkDeleteText = '<a href="#" title="Löschen" id="delete' + amount + '" onclick="' + linkPath + ';return false;"><img width="' + picSize + '" height="' + picSize + '" src="' + picSource + '"></a>';
				var linkPauseText = '<a href="#" title="Pausieren" id="pause' + amount + '" onclick="' + linkPathPause + ';return false;"><img width="' + picSize + '" height="' + picSize + '" src="' + picSourcePause + '"></a>';
				divElement.innerHTML = linkDeleteText + linkPauseText;
				break;
			default:
				break;
		}
		cell.appendChild(divElement);
		row.appendChild(cell);
	}
	std.appendChild(row);
}

var reloadmotive = new XMLHttpRequest();

/**
  * Führt nach Erhalt einer Antwort ein Neuladen der Motive aus.
  */
reloadmotive.onload = function() {
	try {
		if (this.responseText != "") {
			reloadMotiveField(this.responseText);
		}
	} catch (err) {
		//alert("Speichervorgang abgebrochen " + err);
	}
};

/**
  * Lädt das Motivfeld neu, nachdem ein weiteres Motiv hinzugefügt wurde.
  * Ist der resonseText leer, so wird ein AJAX-Request dafür losgeschickt.
  *
  * @params responseText Standardmäßig leer, enthält einen JSON-String, welcher die Motivliste enthält.
  */
function reloadMotiveField(responseText) {
	if (responseText != "") {
		var motiveField = document.getElementById("admotive");
		
		while (motiveField.firstChild)
			motiveField.removeChild(motiveField.firstChild);
		var motiveArray = JSON.parse(responseText);
		var firstOption = document.createElement("option");
		firstOption.innerHTML = "Bitte wählen";
		motiveField.appendChild(firstOption);
		for (var i = 0; i < motiveArray.length; i++) {
			var tempElement = document.createElement("option");
			tempElement.value = motiveArray[i]["ac_motiv"];
			tempElement.innerHTML = motiveArray[i]["ac_motiv"] + " (" + motiveArray[i]["tv_trigger"] + ")";
			motiveField.appendChild(tempElement);
		}
	} else {
		reloadmotive.open("get","triggermanager/?reloadMotives=true");
		reloadmotive.send();
		document.getElementsByClassName("fancybox-overlay")[0].style.display = "none";
	}
}

/**
  * Schickt einen AJAX-Request los um die Kampagnenliste zu erneuern.
  */
function reloadCampaignList() {
	var motive = document.getElementById("admotive").value;
	//oReq.open("get", "https://www.media-theia.de/triggermanager/?reloadcampaignlist=true&m=" + motive, true);
	oReq.open("get", "/triggermanager/?reloadcampaignlist=true&m=" + motive, true);
	oReq.send();
}

/**
  * Wechselt die dritte Zelle einer Row aufgrund der zweiten Zelle.
  *
  * @params sel Triggerelement.
  */
function changeRow(sel) {
	var parentnode = sel;
	while (parentnode.tagName != "TR") {
		parentnode = parentnode.parentNode;
	}
	
	if (parentnode.getElementsByTagName("td")[4].firstChild.firstChild.innerHTML == "New") {
		parentnode.getElementsByTagName("td")[4].firstChild.firstChild.innerHTML = "Changed";
	}
	if (parentnode.getElementsByTagName("td")[4].firstChild.firstChild.innerHTML == "Old") {
		parentnode.getElementsByTagName("td")[4].firstChild.firstChild.innerHTML = "ChangedOld";
	}
	var id = parentnode.getElementsByTagName("td")[4].firstChild.firstChild.id;
	var rowNumber = parentnode.id.replace("atRow","");
	var triggertarget = sel.id.indexOf("triggertype") > -1 ? "tt" :
		sel.id.indexOf("triggeraction") > -1 ? "ta" :
		sel.id.indexOf("triggertargetcampaign") > -1 ? "tgc" :
		sel.id.indexOf("triggertargetadgroup") > -1 ? "tga" : 
		sel.id.indexOf("triggertargetkeyword") > -1 ? "tgk" : 
		sel.id.indexOf("timespan") > -1 ? "ts" : "er";
	switch(triggertarget) {
		case "tt":
			reloadTriggerActionField(rowNumber);
			break;
		case "ta":
			checkTriggerActionField(sel);
			break;
		case "tgc":
			checkForCampaignName(rowNumber);
			break;
		case "tga":
		case "tgk":
			break;
		case "ts":
			checkTimespanField(sel);
			break;
		default:
			break;
	}
	changeRowColor();
}

/**
  * Wechselt die Hintergrundfarbe eines Input-Feldes(Text) auf gruen oder rot. Dies soll eine falsche, oder eben richtige
  * Eingabe eines Nutzers darstellen.
  * 
  * @params inputField Ein Inputfeld(Text).
  * @params isCorrect boolean, welcher die Farbe einstellt. True wird gruen, False wird rot.
  */
function setInputFieldColor(inputField, isCorrect) {
	var bgStringA = "-moz-linear-gradient(center top , #d4d4d4, #ebebeb 3px, #66ff99 27px) repeat scroll 0 0%, white none repeat scroll 0 0";
	var bgStringB = "-moz-linear-gradient(center top , #d4d4d4, #ebebeb 3px, #ff9966 27px) repeat scroll 0 0%, white none repeat scroll 0 0";
	
	if (isCorrect) {
		inputField.style.background = bgStringA;
	} else {
		inputField.style.background = bgStringB;
	}
}

/**
  * Prueft die Eingabe in einem Timespan-Feld. Wird etwas anderes als eine Zahl oder eine Zahl größer als 120 eingegeben,
  * so wird der Hintergrund des Textes rot gesetzt. Andernfalls wird der Hintergrund gruen gesetzt.
  * 
  * @params inputField Ein Inputfeld(Text).
  */
function checkTimespanField(inputField) {
	if (isNaN(inputField.value)) {
		setInputFieldColor(inputField,false);
	} else if (inputField.value > 120) {
		setInputFieldColor(inputField,false);
	} else {
		setInputFieldColor(inputField,true);
	}
}

/**
  * Prueft mit Hilfe eines RegEx den Inhalt des uebergebenen Inputfeldes(Text) auf Gueltigkeit.
  * Ruft anschliessend die Funktion zum Anpassen der Farbe auf.
  *
  * @params inputField Ein Inputfeld(Text).
  */
function checkTriggerActionField(inputField) {
	var regex = /^[\+-=]?[0-9]+(,[0-9]{2})?[\Q%€$]/;
	
	setInputFieldColor(inputField, inputField.value.match(regex) != null);
}

/**
  * Prueft bei haendischer Eingabe der Kampagnen-ID auf Korrektheit, indem alle bekannten Kampagnen
  * mit der Eingabe verglichen werden. Sollte keine Uebereinstimmung gefunden werden, so wird der 
  * Hintergrund des Textfeldes rot, andernfalls gruen und der Name der Kampagne wird dargestellt.
  * 
  * @params rowNumber Reihe in der Tabelle von oben, initial null.
  */
function checkForCampaignName(rowNumber) {
	var campElement = document.getElementById("triggertargetcampaign" + rowNumber);
	var campId = campElement.value;
	if (campId.length > 7) {
		var labelElement = document.getElementById("triggertargetlabel" + rowNumber);
		var campaignArray = JSON.parse(savedCampaignJSON);
		var isNotKnown = true;
		for (var i = 0; i < campaignArray.length; i++) {
			if (campId == campaignArray[i]["id"]) {
				labelElement.innerHTML = campaignArray[i]["name"];
				isNotKnown = false;
				setInputFieldColor(campElement, true);
			}
		}
		if (isNotKnown) {
			labelElement.innerHTML = "";
			setInputFieldColor(campElement, false);
		}
		
	}
}

/**
  * Wechselt die Klassen der Rows nach deren unsichtbarer Zelle. Hierdurch ändert sich die Farbe der Reihe.
  */
function changeRowColor() {
	var rows = document.getElementById("showtriggerdiv").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Paused") > -1) {
			rows[i].className = "paused";
		}
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML == "Changed") {
			rows[i].className = "changed";
		}
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML == "ChangedOld") {
			rows[i].className = "changedold";
		}
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML == "Old") {
			rows[i].className = "old";
		}
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML == "New") {
			rows[i].className = "new";
		}
		if (rows[i].childNodes[4].firstChild.firstChild.innerHTML.indexOf("Deleted") > -1) {
			rows[i].className = "deleted";
		}	
	}
}

/**
  * Baut die dritte Zelle der Row nach Vorgabe der zweiten Zelle auf. 
  * 
  * @params rownumber Zeilennummer
  */
function reloadTriggerActionField(rownumber) {
	var currentRow = document.getElementById("atRow" + rownumber);
	var ttf = document.getElementById("triggertype" + rownumber);
	var option_name = ttf.value;
	
	var newTriggerAction;
	var percField = null;
	var posiField = null;
	if (option_name == "status") {
		newTriggerAction = document.createElement("select");
		newTriggerAction.appendChild(fillOptions("status_on", "Starte Kampagne", true));
		newTriggerAction.appendChild(fillOptions("status_off", "Stoppe Kampagne", false));
	} else {
		newTriggerAction = document.createElement("input");
		newTriggerAction.className = "float-left";
		newTriggerAction.type = "text";
		newTriggerAction.value = "Ziel";
		
		var hoverElement = document.createElement("a");
		hoverElement.href = "#";
		hoverElement.onclick = "return false;";
		hoverElement.className = "hoverhelp float-left";
		hoverElement.id = "hoverhelp" + rownumber;
		var imgElement = document.createElement("img");
		imgElement.src = "images/icons/fugue/question-white.png";
		imgElement.style.width = "20px";
		imgElement.style.height = "20px";
		imgElement.style.marginLeft = "10px";
		var spanElement = document.createElement("span");
		//spanElement.style.display = "none";
		spanElement.style.position = "absolute";
		spanElement.innerHTML = "Mögliche Zeichen: +/-/=|0,00|%/€";
		hoverElement.appendChild(spanElement);
		hoverElement.appendChild(imgElement);
	}
	newTriggerAction.id = "triggeraction" + rownumber;
	newTriggerAction.name = "triggeraction" + rownumber;
	newTriggerAction.onchange = function(){changeRow(this);};
	var divelement = currentRow.childNodes[2].childNodes[0];
	
	while(divelement.firstChild) {
		divelement.removeChild(divelement.firstChild);
	}
	//if (posiField != null) 
	//	divelement.appendChild(posiField);
	divelement.appendChild(newTriggerAction);
	if (hoverElement != null) 
		divelement.appendChild(hoverElement);
}

/**
  * Erstellt ein "option"-Element, welches einen übergebenen Value und einen übergebenen Text erhält.
  * Außerdem wird eingestellt, ob dieses Element aktiv ist.
  *
  * @params option_value Eintrag in Value.
  * @params option_text Angezeigter Text.
  * @params is_selected "true", wenn dieses Element selektiert sein soll. "false" ist Standard.
  * @return Das fertige "option"-Element. 
  */
function fillOptions(option_value, option_text, is_selected) {
	var option_field = document.createElement("option");
	option_field.text = option_text;
	option_field.value = option_value;
	option_field.selected = is_selected;
	return option_field;
}

/**
  * Leert das übergebene Element von "option"-Elementen.
  * 
  * @params elementName String mit dem Elementnamen.
  */
function clearDropDown(elementName) {
	var select = document.getElementById(elementName);
	var length = select.options.length;
	for (i = length - 1; i >= 0 ; i--) {
		select.options.remove(i);
	}
}

/**
  * Prüft, ob man mit dem eingetragenen Wert Fingerprints findet. Die Gefundenen Fingerprints werden in einer Liste unter dem
  * Button angezeigt.
  * 
  * @params responseText Fingerprintliste als JSON-String
  */
function checkFingerprintName(responseText) {
	if (responseText == "") {
		var newmotive = document.getElementById("newmotive").value;
		if (newmotive != "") {
			checkJSON.open("get","triggermanager/?getFingerprints=true&fpn=" + newmotive);
			checkJSON.send();
		} else {
			alert("Triggerkürzel leer");
		}
	} else {
		var nameArray = JSON.parse(responseText);
		var divTable;
		if (document.getElementById("fpList")) {
			divTable = document.getElementById("fpList");
			while (divTable.firstChild)
				divTable.removeChild(divTable.firstChild);
		} else {
			divTable = document.createElement("div");
		}
		divTable.className = "margin-top margin-left float-left";
		divTable.id = "fpList";
		divTable.style.width = "100%";
		var showText = '<ul class="mini-blocks-list" style="width:90%;">';
		for (var i = 0; i < nameArray.length; i++) {
			showText += "<li>" + nameArray[i] + "</li>";
		}
		showText += "</ul>";
		divTable.innerHTML = showText;
		var shd = document.getElementById("showhintsdiv");
		shd.appendChild(divTable);
	}
}

/**
  * Wenn das Feld nicht leer ist, wird dem Nutzer eine Confirm-Meldung geschickt. Wird dieser zugestimmt, so wird
  * eine Abfrage geschickt, welche das neue Motiv in die Datenbank einträgt.
  */
function createFingerprintName() {
	var fingerprintname = document.getElementById("newfingerprintname").value;
	var newmotive = document.getElementById("newmotive").value;
	if (newmotive != "" && fingerprintname != "") {
		var res = confirm("Wirklich neu erstellen für: '" + newmotive +  "' ?");
		if (res) {
			sendJSON.open("get", "triggermanager/?fpn=" + newmotive + "&fpnsc=" + fingerprintname + "&setFingerprints=true");
			sendJSON.send();
		}
	} else {
		alert("Triggerkürzel leer");
	}
}

/**
  * Prüft zuerst auf Fehlermeldungen in der Antwort. Sollte mit einer Fehlermeldung geantwortet werden, so wird dem Nutzer
  * eine Alert-Meldung präsentiert. Andernfalls wird ein Fenster aufgebaut, in dem die Liste mit den Stichworten und eine
  * Fingerprintliste präsentiert werden.
  *
  * @params responseText Fehlertext oder JSON-String mit Stichworten und Fingerprints.
  */
function checkMotive(responseText) {
	if (responseText == "No Motive") {
		alert("Keine Verbindung zur Datenbank!");
	} else if (responseText == "No Trigger") {
		alert("Trigger enthält keine Fingerprints!");
	} else {
		var nameArray = JSON.parse(responseText);
		var shd = document.getElementById("showhintsdiv");
		while (shd.firstChild)
			shd.removeChild(shd.firstChild);
		var divElement = document.createElement("div");
		divElement.className = "float-left margin-top margin-left form gutter-right button-height";
		
		var list = document.createElement("ul");
		list.className = "mini-blocks-list";
		for (var i = 0; i < nameArray["fp"].length; i++) {
			var listEntry = document.createElement("li");
			listEntry.innerHTML = nameArray["fp"][i];
			list.appendChild(listEntry);
		}
		
		var headline = document.createElement("h3");
		headline.className = "margin-bottom";
		headline.innerHTML = "Stichworte";
		
		var motList = document.createElement("ul");
		motList.className = "mini-blocks-list";
		for (var i = 0; i < nameArray["trigger"].length; i++) {
			var listEntry = document.createElement("li");
			listEntry.innerHTML = nameArray["trigger"][i];
			motList.appendChild(listEntry);
		}
		
		var labelElement = document.createElement("h3");
		labelElement.innerHTML = "Fingerprintliste";
		labelElement.className = "margin-bottom";
		
		divElement.appendChild(headline);
		divElement.appendChild(motList);
		
		divElement.appendChild(labelElement);
		divElement.appendChild(list);
		shd.appendChild(divElement);
		document.getElementsByClassName("fancybox-overlay")[0].style.display = "block";
	}
	
}

/**
  * Stößt eine Anfrage nach den Motiven an.
  */
function getMotives() {
	var motive = document.getElementById("admotive").value;
	checkfps.open("get", "triggermanager/?checkfp=" + motive + "&checkFingerprints=true");
	checkfps.send();
}

var checkfps = new XMLHttpRequest();
/**
  * Löst bei Antwort einen Check auf die Motive aus.
  */
checkfps.onload = function() {
	try {
		if (this.responseText != "") {
			checkMotive(this.responseText);
		}
	} catch (err) {
	}
};

var checklog = new XMLHttpRequest();
/**
  * Löst bei Antwort die Anzeige der Logs aus.
  */
checklog.onload = function() {
	try {
		if (this.responseText != "") {
			checkLog(this.responseText);
		}
	} catch (err) {
	}
};

/**
  * Es werden die Logs der Trigger gelesen und dargestellt.
  *
  * @params responseText JSON-String, der die Logs beinhaltet.
  */
function checkLog(responseText) {
	try {
		if (savedCampaignJSON != "") {
			var campaignArray = JSON.parse(savedCampaignJSON);
			var logArray = JSON.parse(responseText);
			var shd = document.getElementById("showhintsdiv");
			while (shd.firstChild)
				shd.removeChild(shd.firstChild);
			var divElement = document.createElement("div");
			divElement.className = "float-left margin-top margin-left form gutter-right button-height";
			
			var list = document.createElement("ul");
			list.className = "mini-blocks-list";
			
			var headline = document.createElement("h3");
			headline.innerHTML = "Ausgeführte Trigger";
			headline.className = "margin-bottom";
			var atRows = document.getElementById("showtriggerdiv").firstChild.childNodes[1].childNodes;
			//for(var i = 0; i < atRows.length; i++) {
			
			var logTimes = new Array();
			
			for (var i = 0; i < logArray.length; i++) {
				var listEntry = document.createElement("li");
				var logText = logArray[i];
				for (var j = 0; j < campaignArray.length; j++) {
					if (logText.indexOf(campaignArray[j]["id"]) > -1) {
						logText = logText.replace(campaignArray[j]["id"],'"' + campaignArray[j]["name"] + '" - ' + campaignArray[j]["id"]);
						listEntry.innerHTML = logText;
						list.appendChild(listEntry);
						break;
					} else if(logText.indexOf("trigger") > -1) {
						listEntry.innerHTML = logText;
						list.appendChild(listEntry);
					}
				}
				/*
				for (var j = 0; j < atRows.length; j++) {
					if (document.getElementById("triggertargetcampaign"+j).value == "Ziel") {
						break;
					}
					var actualMotiveFrame = document.getElementById("admotive");
					var actualMotive = actualMotiveFrame[actualMotiveFrame.selectedIndex].value;
					if (logText.indexOf(document.getElementById("triggertargetcampaign"+j).value) > -1) {
						var campName = "";
						for (var k = 0; k < campaignArray.length; k++) {
							if (campaignArray[k]["id"] == document.getElementById("triggertargetcampaign"+j).value) {
								campName = campaignArray[k]["name"];
								break;
							}
						}
						
						logText = logText.replace(document.getElementById("triggertargetcampaign"+j).value,'"' + campName + '" - ' + document.getElementById("triggertargetcampaign"+j).value);
						listEntry.innerHTML = logText;
						list.appendChild(listEntry);
						
						var logTime = logText.split("<br>")[0];
						
						if (logText.indexOf("initial") > -1) {
							var tempArray = new Array();
							tempArray["initial"] = logTime;
							tempArray["end"] = "";
							logTimes.push(tempArray);
						} else if (logText.indexOf("end") > -1) {
							logTimes[logTimes.length - 1]["end"] = logTime;
						}
						console.log(logTime);
						break;
					} else if (logText.indexOf("trigger") > -1) {
						listEntry.innerHTML = logText;
						list.appendChild(listEntry);
					}
					//console.log(actualMotive);
				}
				*/
			}
			divElement.appendChild(headline);
			divElement.appendChild(list);
			shd.appendChild(divElement);
			document.getElementsByClassName("fancybox-overlay")[0].style.display = "block";
			
		}
	} catch (err) {
		return false;
	}
}

/**
  * Lädt alle Logs, welche zu dem ausgewählten Motiv ausgelöst wurden.
  */
function showLog() {
	var motiv = document.getElementById("admotive").value;
	checklog.open("get", "triggermanager/?checklog=" + motiv, true);
	checklog.send();
}

/**
  * Baut und zeigt das Fenster zur Auswahl und Sicherung eines neuen Motivs. 
  */
function addMotive() {
	var shd = document.getElementById("showhintsdiv");
	while (shd.firstChild)
		shd.removeChild(shd.firstChild);
	var divElement = document.createElement("div");
	divElement.className = "float-left margin-top margin-left margin-bottom form gutter-right button-height";
	var divShowName = document.createElement("div");
	divShowName.className = "margin-top margin-left gutter-right button-height";
	var divFingerprintName = document.createElement("div");
	divFingerprintName.className = "float-left margin-top margin-left gutter-right button-height";
	var divButtons = document.createElement("div");
	divButtons.className = "float-left margin-top margin-left gutter-right button-height";
	var headlineElement = document.createElement("h3");
	headlineElement.innerHTML = "Neuen Trigger anlegen";
	var labelElement = document.createElement("span");
	labelElement.className = "label";
	labelElement.innerHTML = "Stichwort im Dateinamen";
	var buttonElement = document.createElement("input");
	buttonElement.style.marginLeft = "10px";
	buttonElement.value = "Trigger speichern";
	buttonElement.type = "button";
	buttonElement.className = "big-button";
	buttonElement.id = "newmotivebutton";
	buttonElement.name = "newmotivebutton";
	buttonElement.onclick = function() {createFingerprintName()};
	var buttonCheckElement = document.createElement("input");
	//buttonCheckElement.style.marginLeft = "10px";
	buttonCheckElement.value = "Stichwortcheck";
	buttonCheckElement.type = "button";
	buttonCheckElement.className = "big-button";
	buttonCheckElement.id = "newmotivecheckbutton";
	buttonCheckElement.name = "newmotivecheckbutton";
	buttonCheckElement.onclick = function() {checkFingerprintName("")};
	var input = document.createElement("input");
	input.type = "text";
	input.id = "newmotive";
	input.name = "newmotive";
	
	var labelNameElement = document.createElement("span");
	labelNameElement.className = "label";
	labelNameElement.innerHTML = "Trigger-Anzeigename";
	
	var inputName = document.createElement("input");
	inputName.type = "text";
	inputName.id = "newfingerprintname";
	inputName.name = "newfingerprintname";
	
	divElement.appendChild(headlineElement);
	divShowName.appendChild(labelNameElement);
	divShowName.appendChild(inputName);
	divElement.appendChild(divShowName);
	divFingerprintName.appendChild(labelElement);
	divFingerprintName.appendChild(input);
	divElement.appendChild(divFingerprintName);
	divButtons.appendChild(buttonCheckElement);
	divButtons.appendChild(buttonElement);
	divElement.appendChild(divButtons);
	shd.appendChild(divElement);
	document.getElementsByClassName("fancybox-overlay")[0].style.display = "block";
}