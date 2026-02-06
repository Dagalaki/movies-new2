function updatePositions(){
	var service_id = document.getElementById("service-to-sort").value;
		
	var elems = document.getElementsByClassName("ui-sortable-handle");
	for(var i =0; i< elems.length; i++){
		var idnam = elems[i].id;
		var newpos = i;
		url = "/pub/smarttv/ert/admin/hbbtv_db_access.php?action=category-update-pos&idnam="+idnam+"&pos="+newpos + "&service_id="+service_id;
	
    	if (location.host == "127.0.0.1") url = "/pub/smarttv/ERT-clone/admin/hbbtv_db_access.php?action=category-update-pos&idnam="+idnam+"&pos="+newpos + "&service_id="+service_id;
	
		createHttpRequest(url, function(ret) {
	   		
	   	 });
	  
	}
}

function deleteItem(){
	var idname = document.getElementById('idnam').value;
	var title = document.getElementById('title').value
	var r = confirm("Θέλετε σίγουρα να διαγράψετε την κατηγορία-feed " + title + "?" );
	if (r == true) {
	  	url = "/pub/smarttv/ert/admin/hbbtv_db_access.php?action=delete&table=Categories&idnam="+idname;
		if (location.host == "127.0.0.1") url = "/pub/smarttv/ERT-clone/admin/hbbtv_db_access.php?action=delete&table=Categories&idnam="+idname;
    	createHttpRequest(url, function(ret) {
    		alert("Η υπηρεσία διαγράφηκε με επιτυχία.");
    		location.reload();
	   	 });
	} 

	return true;
}

function getDataByIdnam(idnam){
	url = "/pub/smarttv/ert/admin/db_access.php?action=get-data&idnam="+idnam + "&table=Categories";
	
    	if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/db_access.php?action=get-data&idnam="+idnam + "&table=Categories";
    	createHttpRequest(url, function(ret) {
	   		
	   		loadItemFormWithData(ret);
	   	 });
}

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}


function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function loadItemFormWithData(data){
document.getElementById("delBtn").style.display ="block";

	
	var d = JSON.parse(data);
	console.log("[loadItemFormWithData] live on: "+ d.live_on);
	console.log("[loadItemFormWithData] dev on: "+ d.dev_on);
	document.getElementById("item-form").style.display="block";
	document.getElementById('idnam').value = d.idnam;
	document.getElementById('service_id').value = d.service_id;
	//create parent id select box
	updateChildCategories(d.service_id, d.parent_id);
	document.getElementById('parent_id').value = d.parent_id;
	document.getElementById('structure').value = d.structure;
	document.getElementById('feedurl').value = d.feedurl;
	document.getElementById('title').value = decodeHtml(d.title);
	document.getElementById('margin').value = d.margin;
	document.getElementById('menu-img-td').innerHTML += '<a target="_blank" href="'+d.menu_img_url+'">'+d.menu_img_url+'</a>';
	document.getElementById('bg-img-td').innerHTML += '<a target="_blank" href="'+d.bg_img_url+'">'+d.bg_img_url+'</a>';
	document.getElementById('ver-bg-img-td').innerHTML += '<a target="_blank" href="'+d.ver_bg_img_url+'">'+d.ver_bg_img_url+'</a>';
	document.getElementById('sima-img-td').innerHTML += '<a target="_blank" href="'+d.sima_katallilotitas+'">'+d.sima_katallilotitas+'</a>';
	
	document.getElementById('position').value = d.position;	
	document.getElementById('live_on').checked = parseInt(d.live_on) == 1  ? 'checked' : '';
	document.getElementById('dev_on').checked = parseInt(d.dev_on) == 1  ? 'checked' : '';
	document.getElementById('sams_on').checked = parseInt(d.sams_on) == 1  ? 'checked' : '';
	document.getElementById("hour-from").value = d.hour_from;
	document.getElementById("hour-to").value = d.hour_to;	
	document.getElementById("home_feature").value = d.home_feature;	

	if (d.selections) {
		for (var i = 0; i < d.selections.length; ++i) {
			var service = d.selections[i];
			document.getElementById(service).checked = 'checked';
		}
	}
	
	document.getElementsByClassName('richText-editor')[0].innerHTML = d.short_desc;
	document.getElementsByClassName('richText-editor')[1].innerHTML = d.description;
	
	//document.getElementById("desc") = d.description;
	//document.getElementById("shortdesc") = d.short_desc;
	//eventFire(document.getElementsByClassName('richText')[0], 'click');
	//eventFire(document.getElementsByClassName('richText')[1], 'click');
	
	
	var date = new Date(d.start_date*1000);
	document.getElementById("datepicker-from").value = (date.getMonth()+1) +"/"+ date.getDate() +"/"+date.getFullYear();
	document.getElementById("hour-from").value = date.getHours() +":"+date.getMinutes();
	console.log("hour from: " +date.getHours() +":"+date.getMinutes());
	var date = new Date(d.end_date*1000);
	document.getElementById("datepicker-to").value = (date.getMonth()+1) +"/"+ date.getDate() +"/"+date.getFullYear();
	document.getElementById("hour-to").value = date.getHours() +":"+date.getMinutes();
	console.log("hour to: " +date.getHours() +":"+date.getMinutes());
}
function changeAttributeQuotes(string) {
            if(!string) {
                return '';
            }

            var regex;
            var rstring;
           regex = /\s+(\w+\s*=\s*(['][^']*['])|(["][^"]*["]))+/g;
                rstring = string.replace(regex, function($0,$1,$2){
                    if(!$2) {return $0;}
                    return $0.replace($2, $2.replace(/'/g, '"'));
                });
           
            return rstring;
        }

function onSearch(){
	var label = document.getElementById("service_id").value;
	var from = document.getElementById("datepicker-from").value;
	var to = document.getElementById("datepicker-to").value;
	var title = document.getElementById("title").value;
	var a = location.pathname.split('/'), path = '';

	for (var i = 0; i < a.length-1; i++) {
		if (a[i])
			path += '/'+a[i];
	}

	var url = "getAnalytics.php?range="+from+","+to+"&label="+label+'&title='+title;
	
	createHttpRequest(url, function(ret) {
		parseAnalytics(ret, label);
		document.getElementById("search-results").style.display = "block";
	}); 	

}

function createClassDiv(xpos, ypos, className) {
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

var d_array = [];
var dCnt = 0;
var totalVods = 0;
var totalOpens = 0;
var totalLabels = "";

function getSubtable(dIndex, index, parentId){
	var outer = createClassDiv("", "", "subtable");

	d = d_array[dIndex];

	for(var i = 0; i< d.length; i++){
		//if(d[i].label == label){
			
			var inner = createClassDiv("", "", "inner");
			
			var newparent = d[i].label + "-" + "subtable-"+dIndex + "";
			inner.id = newparent;
			
			var button = createClassDiv("","", "btn column");
			if(d[i].subtable && d[i].subtable.length > 0 ){
				d_array[dCnt] = d[i].subtable;
				button.innerHTML = "<button onclick='getSubtable("+ dCnt +", " +i+", &apos;"+newparent+"&apos;); updateThis(&apos;"+newparent+"&apos;, this.innerHTML );'>+</button>" ;	
				dCnt++;
			}else button.innerHTML = "";


			var label = createClassDiv("", "", "label column");
			label.innerHTML = d[i].label;
			var nb_visits = createClassDiv("", "", "nb_visits column");
			nb_visits.innerHTML = d[i].nb_visits;
			var nb_hits = createClassDiv("", "", "nb_hits column");
			nb_hits.innerHTML = d[i].nb_hits;
			var avg_time = createClassDiv("", "", "avg_time column");
			avg_time.innerHTML = d[i].avg_time_on_page + " sec";


			inner.appendChild(button);
			inner.appendChild(label);
			//inner.appendChild(nb_visits);
			inner.appendChild(nb_hits);
			//inner.appendChild(avg_time);
			outer.appendChild(inner);
		//}
	}
	//alert(outer.innerHTML);
	if(!parentId) parentId = "outer-level-"+dIndex;

	document.getElementById(""+ parentId+ "").appendChild(outer);
}

function hideSubtab(parentId){
	var elem = document.getElementById(parentId).getElementsByClassName("subtable")[0].style.display = "none";
}
function showSubtab(parentId){
	var elem = document.getElementById(parentId).getElementsByClassName("subtable")[0].style.display = "block";
}
function updateThis(parentId, value){
	
	if(!parentId) parentId ="outer-level";

	if(value == "+"){
		document.getElementById(parentId).getElementsByClassName("btn")[0].innerHTML = "<button onclick='hideSubtab(&apos;"+parentId+"&apos;);updateThis( &apos;"+ parentId+"&apos;, this.innerHTML);'>-</button>";
	}
	else if (value == "-"){
		document.getElementById(parentId).getElementsByClassName("btn")[0].innerHTML = "<button onclick='showSubtab(&apos;"+parentId+"&apos;);updateThis(&apos;"+ parentId+"&apos;, this.innerHTML);'>+</button>";
	}
	return true;
}

function parseAnalytics(data, label){

	if(label =="archive") label = "arxeio";
	if(label == "menoume-spiti") label = "mathainoume-spiti";

	var outer = createClassDiv("", "", "outer");
	var header = createClassDiv("", "", "inner");

	header.innerHTML = "<div class='column'></div><div class='column'>ΤΙΤΛΟΣ ΣΕΛΙΔΑΣ</div><div class='column'>ΠΡΟΒΟΛΕΣ ΣΕΛΙΔΩΝ</div>";
	outer.appendChild(header);

	var d = JSON.parse(data);
	document.getElementById("analytics").innerHTML = "";

	totalVods = 0;
	for(var i = 0; i< d.length; i++){
		if(d[i].label  == " Run_APP")
			totalOpens = d[i].nb_hits; 

		if(d[i].label === "active" || d[i].label === "sidemenu" || d[i].label === " Run_APP")
			continue;

		totalLabels += d[i].label + ", ";
		totalVods += d[i].nb_hits;

		if(d[i].label == label || label === ''){
			
			var inner = createClassDiv("", "", "inner");
			inner.id ="outer-level-"+dCnt;
			var button = createClassDiv("","", "btn column");
			if(d[i].subtable && d[i].subtable.length > 0 ){

				d_array[dCnt] = d[i].subtable;
				button.innerHTML = "<button onclick='getSubtable("+ dCnt +", "+i+");updateThis(\""+ inner.id +"\",this.innerHTML);'>+</button>" ;	
				dCnt++;
				
			}else button.innerHTML = "";


			var l = createClassDiv("", "", "label column");
			l.innerHTML = d[i].label;
			var nb_visits = createClassDiv("", "", "nb_visits column");
			nb_visits.innerHTML = d[i].nb_visits;
			var nb_hits = createClassDiv("", "", "nb_hits column");
			nb_hits.innerHTML = d[i].nb_hits;
			
			var avg_time = createClassDiv("", "", "avg_time column");
			avg_time.innerHTML = d[i].avg_time_on_page + " sec";


			inner.appendChild(button);
			inner.appendChild(l);
			//inner.appendChild(nb_visits);
			inner.appendChild(nb_hits);
			//inner.appendChild(avg_time);
			outer.appendChild(inner);
		}
	}
	document.getElementById("total-vods").innerHTML = "<br>Για τις επιλεγμένες ημερομηνίες, στην εφαρμογή μπήκαν <b>συνολικά " + totalOpens + " χρήστες</b>.";
	document.getElementById("total-vods").innerHTML += "<br>Ο <b>συνολικός αριθμός βίντεο</b> που άνοιξαν είναι  <b>" + totalVods + "</b>" ;
	document.getElementById("total-vods").innerHTML += "<br>Παρακάτω ακολουθούν τα αποτελέσματα για την υπηρεσία που επιλέξατε.";

	document.getElementById("analytics").innerHTML = "";
	//alert(outer.innerHTML);
	document.getElementById("analytics").appendChild(outer);
	
}

function onLoadAnalytics(){
	totalVods = 0;
	var today = new Date();
	$( "#datepicker-from" ).datepicker({dateFormat: "dd-mm-yy", changeMonth: true, changeYear: true, minDate: today});
	$( "#datepicker-to" ).datepicker({dateFormat: 'dd-mm-yy', changeMonth: true, changeYear: true, minDate: today});
	$( "#datepicker-from" ).datepicker("setDate", "-1"); 
	//$( "#datepicker-to" ).datepicker("setDate", "-1"); 
	//var url = "list.json";
	var url = "getAnalytics.php?action=getJson";
	//var url = "https://lookmega.smart-tv-data.com/index.php?module=API&method=Actions.getPageTitles&idSite=3&period=day&date=yesterday&format=JSON&token_auth=48826b1ea11e1ad44c32f93157684069&expanded=1";
	//console.log(url);
	//var url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=services-labels-list&stats=1"; 
	createHttpRequest(url, function(ret) {
		json = JSON.parse(ret);
		var options = '<option id="" value="">Όλα</option>';
		for(var i=0;i<json.length;i++){
			options += '<option id="'+json[i].label+'" value="'+json[i].label+'">'+json[i].label+'</option>';
			//console.log(options);
		}
		//console.log(json);
		document.getElementById("service_id").innerHTML = options;
		onSearch();
	}, "GET");

}
     
function updateChildCategories(value, parent_id){
	url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=get-master-categories&service_id="+value; 
    createHttpRequest(url, function(ret) {
    	document.getElementById("parent_id").innerHTML = ret;
		if(parent_id) document.getElementById('parent_id').value = parent_id;				
	});
}

function onLoad(){
	var today = new Date();
		    $( "#datepicker-from" ).datepicker({format: 'dd-mm-yyyy', changeMonth: true, changeYear: true, minDate: today});
		    $( "#datepicker-to" ).datepicker({format: 'dd-mm-yyyy', changeMonth: true, changeYear: true, minDate: today});
	


   var url = "hbbtv_db_access.php?action=services-select-list";
    			if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=services-select-list"; 
    				createHttpRequest(url, function(ret) {
    					document.getElementById("service_id").innerHTML = ret;
    					document.getElementById("service-to-sort").innerHTML = ret;

	var url2 = "hbbtv_db_access.php?action=get-master-categories";
    if (location.host == "127.0.0.1") url2 = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=get-master-categories"; 
    createHttpRequest(url2, function(ret) {
    	document.getElementById("master-categories-to-sort").innerHTML = ret;
    });


    if(document.getElementById("service-to-sort")){
		var service_id = document.getElementById("service-to-sort").value;
	}else if(document.getElementById("master-categories-to-sort")){
		var service_id = document.getElementById("master-categories-to-sort").value;
	}
	var url = "hbbtv_db_access.php?action=retrieve&table=Categories&service_id="+service_id;
	if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=retrieve&table=Categories&service_id="+service_id; 
	
    createHttpRequest(url, function(ret) {
    		

	        buildSortable(ret);
	        /// make sortable
		  $( function() {
		  	
		  	
		  	
		    $( "#sortable" ).sortable({
		      placeholder: "ui-state-highlight", 
		      update: function( event, ui ) { updatePositions();}
		    });
		    $( "#sortable" ).disableSelection();
		    $( "#sortable" ).on("dblclick", "li", function (){
		    	getDataByIdnam(this.id);
		    });
		  } );
		  ///
	    }); 
	    
	    var list = new List();
	  document.getElementById("add-item").addEventListener("click", function (){
			if(this.innerHTML == "+"){
				var url = "hbbtv_db_access.php?action=services-select-list";
    			if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=services-select-list"; 
    				createHttpRequest(url, function(ret) {
    					alert(ret);
    					document.getElementById("service_id").innerHTML = ret;
						list.addItem();
						this.innerHTML = '-';
			  }); 	
			}else {
				document.getElementById("item-form").style.display = "none";
				this.innerHTML = '+';
			}
		});
	  
	   document.getElementById("save-item").addEventListener("click", function (){
	   	//alert("submit form click");
	   	$( ".richText-editor" ).each(function(  ) {
	            var content = $(this).html();
	    
	            $(this).siblings('.richText-initial').val(content);
            });
	   	
	   });

	    }); 
}


function updateSortableList(isMaster){

	var service_id = document.getElementById("service-to-sort").value;
	var url = "hbbtv_db_access.php?action=retrieve&table=Categories&service_id="+service_id;
    if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=retrieve&table=Categories&service_id="+service_id; 
    
    if(isMaster){
    	var parent_id = document.getElementById("master-categories-to-sort").value;
		var url = "hbbtv_db_access.php?action=retrieve&table=Categories&parent_id="+parent_id;
	    if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/admin/hbbtv_db_access.php?action=retrieve&table=Categories&parent_id="+parent_id; 
	    	
    }

    createHttpRequest(url, function(ret) {
    		
	        buildSortable(ret);
	        /// make sortable
		  $( function() {
		    $( "#sortable" ).sortable({
		      placeholder: "ui-state-highlight", 
		      update: function( event, ui ) { updatePositions();}
		    });
		    $( "#sortable" ).disableSelection();
		    $( "#sortable" ).on("dblclick", "li", function (){
		    	getDataByIdnam(this.id);
		    });
		  } );
		  ///
	    }); 
	    
}

function buildSortable(inner){
	var ul = document.createElement("ul");
	ul.id = "sortable";
	ul.innerHTML = inner;
	document.getElementById("categories-list").innerHTML = "";
	document.getElementById("categories-list").appendChild(ul);
}


var fields = [
	{"idnam": "idnam", "name": "Idnam : ", "type":"input-text"},
	{"idnam": "feedurl", "name": "Feed Url : ", "type":"input-text"},
	{"idnam": "title", "name": "Τίτλος Ξένης Σειράς: ", "type":"input-text"},
	{"idnam": "menuiconimg", "name": "Εικόνα για αρχικό μενού επιλογής: ", "type":"upload"},
	{"idnam": "backgroundimg", "name": "Background εικόνα: ", "type":"upload"},
	{"idnam": "simaimg", "name": "Σήμα Καταλληλότητας: ", "type":"upload"},
	
	{"idnam": "margin", "name": "Απόσταση τίτλου από logo: ", "type":"input-text"},
	{"idnam": "shortdesc", "name": "Σύντομη περιγραφή: ", "type":"textarea"}, 
	{"idnam": "desc", "name": "Περιγραφή: ", "type":"textarea"},
];

function List(){
	this.items = null;
}
List.prototype = new Object();
List.prototype.setItems = function (items){
	this.items = items;
}
List.prototype.createField = function (type, id){
	
	switch(type){
		case "input-text":
			return "<input type='text' value='' id='"+id+"'/>";
			break;
		case "textarea":
			return "<textarea id='"+id+"' class='"+id+"' name='example'></textarea>";
			break;
		case "upload":
			return "<input type='file' name='"+id+"' id='"+id+"' />";
			break;
		default:
			break;
	}
	return true;
}
List.prototype.addItem = function (){
	document.getElementById("item-form").style.display = "block";
	return true;
	
}
function uploadImage(idnam){
	return true;
	
	var mime_types = [ 'image/png', 'image/jpeg' ];
	var bgImg = document.getElementById(idnam).files[0];
	if(mime_types.indexOf(bgImg.type) == -1) {
		alert('Error : Incorrect file type for background image. Only png format is accepted.');
		return;
	}
	
	var images = new FormData();
	var request = new XMLHttpRequest();
	images.append('file', bgImg);
	request.responseType = 'json';
	// Send POST request to the server side script
	request.open('post', 'file_upload_images.php'); 
	request.send(images);
}


List.prototype.getDataById = function (index){
	var ret = index.split("_");
	var id = ret[0];
	var theTitle = ret[1];
	
	document.getElementById("item-data").innerHTML = "";
	var item = this.items[id];
	
	var table = document.createElement("table");
	table.className = "table sortable 20-margin dataTable";
	
	
	var thead = document.createElement("thead");
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	th.setAttribute("colspan", 2);
	th.style.fontSize = "20px!important";
	th.innerHTML = theTitle;
	
	tr.appendChild(th);
	thead.appendChild(tr);
	table.appendChild(thead);
	
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	
	
	console.log("[List.prototype.getDataById] item: "+JSON.stringify(item));
	for(var i in item){
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.style.fontWeight = "bold";
		td.innerHTML = i;
		tr.appendChild(td);
		var td = document.createElement("td");
		if(i == "feedurl"){
			td.innerHTML = "<a target='_blank' href='" + item[i]+"'>"+ item[i]+"</a>"
		}
		else td.innerHTML = item[i];
		tr.appendChild(td);
		tbody.appendChild(tr);
	}
	
	document.getElementById("item-data").appendChild(table);
}

