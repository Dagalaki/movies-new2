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
var totalVods = 0;
var totalVods1 = totalVods2 = 0;
function onSearch(){
	totalVods = totalVods1 = totalVods2 = 0;
	document.getElementById("total-vods").innerHTML = "";
	var label = document.getElementById("service_id").value;
	var from = document.getElementById("datepicker-from").value;
	var to = document.getElementById("datepicker-to").value;
	var selectedDay = document.getElementById("selectedDay").value;
	var title = document.getElementById("title").value;
	var a = location.pathname.split('/'), path = '';

	for (var i = 0; i < a.length-1; i++) {
		if (a[i])
			path += '/'+a[i];
	}
	if(selectedDay!=""){
		from = selectedDay;
		to = "";
	}
	if(from=="") from = new Date().toLocaleDateString("el-GR");

	var url = "getAnalytics.php?range="+from+","+to+"&label="+label+'&title='+title;
	
	createHttpRequest(url, function(ret) {
		parseAnalytics(ret, label);
		
		
		document.getElementById("search-results").style.display = "block";
		document.getElementById("brands-results").style.display = "none";
		document.getElementById("models-results").style.display = "none";
		document.getElementById("locations-results").style.display = "none";
		document.getElementById("channel-results").style.display = "none";

		document.getElementById("item-form").style.display = "block";
		document.getElementById("brands-form").style.display = "none";
		document.getElementById("models-form").style.display = "none";
		document.getElementById("loc-form").style.display = "none";

		if(!document.getElementById("statsBtn").classList.contains("active"))
			document.getElementById("statsBtn").classList.add("active");
		document.getElementById("brandsBtn").classList.remove("active");
		document.getElementById("modelsBtn").classList.remove("active");
		document.getElementById("locsBtn").classList.remove("active");
		/*$('#analyticsDataTable').DataTable({
			paging:false,
			ordering:false
		});*/
		var fromDate = moment(from, 'DD/MM/YYYY');
		var toDate = moment(to, 'DD/MM/YYYY');
		var changeDate = moment("2021/12/20");
		//console.log(fromDate.format('DD/MM/YYYY')+"<"+changeDate.format('DD/MM/YYYY')+" && "+toDate.format('DD/MM/YYYY')+">="+changeDate.format('DD/MM/YYYY'));
		if(0 && fromDate<changeDate && toDate>=changeDate){
			url1 = "getAnalytics.php?range="+from+",19/12/2021&label="+label+'&title='+title;
			url2 = "getAnalytics.php?range=20/12/2021,"+to+"&label="+label+'&title='+title;
			
			createHttpRequest(url2, function(ret) {
				var d = JSON.parse(ret);
				d.sort((a, b) => (a.label.trim() > b.label.trim()) ? 1: ((b.label.trim() > a.label.trim()) ? -1 : 0));

				
				for(var i=0;i<d.length;i++){
					if(d[i].label.trim() == "videoplayer"){
						totalVods1 = d[i].nb_hits;
						break;
					}
				}
				console.log("videos after 20/12/2021 "+totalVods1);
				checkTotalVods();
			});
			
			createHttpRequest(url1, function(ret) {
				
				var d = JSON.parse(ret);
				d.sort((a, b) => (a.label.trim() > b.label.trim()) ? 1: ((b.label.trim() > a.label.trim()) ? -1 : 0));
				var sortedArray = filterTable(d);
				sortedArray.sort((a, b) => (a.nb_hits < b.nb_hits) ? 1: ((b.nb_hits < a.nb_hits) ? -1 : 0));
				totalVods2 = countVODs(sortedArray);
				console.log("videos before 20/12/2021 "+totalVods2);
				checkTotalVods();
			});
			
		}else{
			checkTotalVods();
		}

	});
}
function checkTotalVods(){
	if(totalVods1!=0 && totalVods2!=0){	
		totalVods = "~"+(totalVods1+totalVods2).toLocaleString('de-DE');	
	}else if (totalVods1!=0 || totalVods2!=0) return;

	document.getElementById("total-vods").innerHTML = "<b>"+totalOpens.toLocaleString('de-DE') + " φορές το Κόκκινο Κουμπί πατήθηκε</b> συνολικά, για τις επιλεγμένες ημερομηνίες";
	document.getElementById("total-vods").innerHTML += "<br><b>" + totalVods.toLocaleString('de-DE') + " βίντεο</b> άνοιξαν συνολικά";
	document.getElementById("total-vods").innerHTML += "<br>Παρακάτω ακολουθούν τα αποτελέσματα για την υπηρεσία που επιλέξατε.";
}

function convertDate(dateStr) {
    var parts = dateStr.split('/');
    return parts[1] + '/' + parts[0] + '/' + parts[2];
}

function onBrands(){
	var label = document.getElementById("service_id").value;
	var from = document.getElementById("datepicker-from2").value;
	var to = document.getElementById("datepicker-to2").value;
	var selectedDay = document.getElementById("selectedDay2").value;
	if(selectedDay!=""){
		from = selectedDay;
		to = "";
	}
	console.log("FROM:",from);
	if(from=="") from = new Date().toLocaleDateString("el-GR");
	else from = convertDate(from);
	if(to!="") to = convertDate(to);
	console.log(from);
	var url = "getAnalytics.php?action=getBrands&range="+from+","+to+"&label="+label+'&title='+title;
	console.log(url);
	createHttpRequest(url, function(ret) {
		document.getElementById("brands-results").getElementsByClassName("content")[0].innerHTML="";
		document.getElementById("brands-results").getElementsByClassName("content")[0].appendChild(parseBrandsList(ret));
		
		document.getElementById("search-results").style.display = "none";
		document.getElementById("brands-results").style.display = "block";
		document.getElementById("models-results").style.display = "none";
		document.getElementById("locations-results").style.display = "none";
		document.getElementById("channel-results").style.display = "none";

		document.getElementById("item-form").style.display = "none";
		document.getElementById("brands-form").style.display = "block";
		document.getElementById("models-form").style.display = "none";
		document.getElementById("loc-form").style.display = "none";

		document.getElementById("statsBtn").classList.remove("active");
		if(!document.getElementById("brandsBtn").classList.contains("active"))
			document.getElementById("brandsBtn").classList.add("active");
		document.getElementById("modelsBtn").classList.remove("active");
		document.getElementById("locsBtn").classList.remove("active");
	}); 	

}
function onModels(){
	var label = document.getElementById("service_id").value;
	var from = document.getElementById("datepicker-from3").value;
	var to = document.getElementById("datepicker-to3").value;
	var selectedDay = document.getElementById("selectedDay3").value;
	if(selectedDay!=""){
		from = selectedDay;
		to = "";
	}
	if(from=="") from = new Date().toLocaleDateString("el-GR");
	else from = convertDate(from);
	if(to!="") to = convertDate(to);
	var url = "getAnalytics.php?action=getModels&range="+from+","+to+"&label="+label+'&title='+title;
	
	createHttpRequest(url, function(ret) {
		document.getElementById("models-results").getElementsByClassName("content")[0].innerHTML="";
		document.getElementById("models-results").getElementsByClassName("content")[0].appendChild(parseModelsList(ret));
		
		document.getElementById("search-results").style.display = "none";
		document.getElementById("brands-results").style.display = "none";
		document.getElementById("models-results").style.display = "block";
		document.getElementById("locations-results").style.display = "none";
		document.getElementById("channel-results").style.display = "none";

		document.getElementById("item-form").style.display = "none";
		document.getElementById("brands-form").style.display = "none";
		document.getElementById("models-form").style.display = "block";
		document.getElementById("loc-form").style.display = "none";

		document.getElementById("statsBtn").classList.remove("active");
		document.getElementById("brandsBtn").classList.remove("active");
		if(!document.getElementById("modelsBtn").classList.contains("active"))
			document.getElementById("modelsBtn").classList.add("active");
		document.getElementById("locsBtn").classList.remove("active");
	}); 	

}
function onLive(){
	var url = 'getAnalytics.php?action=getLive';
	
	createHttpRequest(url, function(ret) {
		document.getElementById("live-results").getElementsByClassName("content")[0].innerHTML="";
		document.getElementById("live-results").getElementsByClassName("content")[0].appendChild(parseLive(ret));

		document.getElementById("search-results").style.display = "none";
		document.getElementById("brands-results").style.display = "none";
		document.getElementById("models-results").style.display = "none";
		document.getElementById("channel-results").style.display = "none";
		document.getElementById("locations-results").style.display = "none";
		document.getElementById("live-results").style.display = "block";

		document.getElementById("item-form").style.display = "none";
		document.getElementById("brands-form").style.display = "none";
		document.getElementById("models-form").style.display = "none";
		document.getElementById("loc-form").style.display = "none";

		document.getElementById("statsBtn").classList.remove("active");
		document.getElementById("brandsBtn").classList.remove("active");
		document.getElementById("modelsBtn").classList.remove("active");
		document.getElementById("locsBtn").classList.remove("active");
		if(!document.getElementById("liveBtn").classList.contains("active"))
			document.getElementById("liveBtn").classList.add("active");
	}); 	
}
function parseLive(data){
	var outer = document.createElement("table"), res=[];
	outer.classList.add("table", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");
	var header = document.createElement("thead");
	var headrow = document.createElement("tr");
	var labels = ['BEST Hybrid 1', 'BEST Hybrid 2', 'BEST Hybrid 3'];
	var viewers = [];

	headrow.innerHTML = "<th></th><th>Stream</th><th>Τηλεθεατές</th>";

	header.appendChild(headrow);
	outer.appendChild(header);
	outer.appendChild(tbody);

	var d = JSON.parse(data), a = d['streams'];
	console.log(a);

	for(var i = 0; i< a.length; i++){
		var stream = a[i];
		var label = '', reg = /besttv/gi, reg2 = /hybrid2/gi, reg3 = /hybrid3/gi;

		if (stream['name'].match(reg)) {
			label = labels[0];
			viewers[0] = stream.connected;
		} else if (stream['name'].match(reg2)) {
			label = labels[1];
			viewers[1] = stream.connected;
		} else if (stream['name'].match(reg3)) {
			label = labels[2];
			viewers[2] = stream.connected;
		}
	}

	for(var i = 0; i< labels.length; i++){
		var label = labels[i];
		if (!viewers[i]) continue;
		var row = document.createElement("tr");
		var col0 = document.createElement("th");
		col0.style="width:40px;text-align:center;";
		col0.innerHTML = "<span>"+(i+1)+"</span>";
		var col1 = document.createElement("td");
		col1.style="width:200px";

		col1.innerHTML = label;

		var col2 = document.createElement("td");
		col2.innerHTML = "<span>"+ viewers[i] +"</span>";
		
		row.appendChild(col0);
		row.appendChild(col1);
		row.appendChild(col2);
		tbody.appendChild(row);
	}
	return outer;
}
function onLocations(){
	var label = document.getElementById("service_id").value;
	var from = document.getElementById("datepicker-from4").value;
	var to = document.getElementById("datepicker-to4").value;
	var selectedDay = document.getElementById("selectedDay4").value;
	if(selectedDay!=""){
		from = selectedDay;
		to = "";
	}
	if(from=="") from = new Date().toLocaleDateString("el-GR");
	else from = convertDate(from);
	if (to!="") to = convertDate(to);
	var url = "getAnalytics.php?action=getLocations&range="+from+","+to+"&label="+label+'&title='+title;
	
	createHttpRequest(url, function(ret) {
		document.getElementById("locations-results").getElementsByClassName("content")[0].innerHTML="";
		document.getElementById("locations-results").getElementsByClassName("content")[0].appendChild(parseLocationsList(ret));
		
		document.getElementById("search-results").style.display = "none";
		document.getElementById("brands-results").style.display = "none";
		document.getElementById("models-results").style.display = "none";
		document.getElementById("channel-results").style.display = "none";
		document.getElementById("locations-results").style.display = "block";

		document.getElementById("item-form").style.display = "none";
		document.getElementById("brands-form").style.display = "none";
		document.getElementById("models-form").style.display = "none";
		document.getElementById("loc-form").style.display = "block";

		document.getElementById("statsBtn").classList.remove("active");
		document.getElementById("brandsBtn").classList.remove("active");
		document.getElementById("modelsBtn").classList.remove("active");
		if(!document.getElementById("locsBtn").classList.contains("active"))
			document.getElementById("locsBtn").classList.add("active");
	}); 	

}

function onChannel() {
	var url = "getAnalytics.php?action=getChannel";
	
	createHttpRequest(url, function(ret) {
		console.log(ret);
		document.getElementById("channel-results").getElementsByClassName("content")[0].innerHTML="";
		document.getElementById("channel-results").getElementsByClassName("content")[0].appendChild(parseChannel(ret));
		
		document.getElementById("search-results").style.display = "none";
		document.getElementById("brands-results").style.display = "none";
		document.getElementById("models-results").style.display = "none";
		document.getElementById("locations-results").style.display = "none";
		document.getElementById("channel-results").style.display = "block";

		document.getElementById("item-form").style.display = "none";
		document.getElementById("brands-form").style.display = "none";
		document.getElementById("models-form").style.display = "none";
		document.getElementById("loc-form").style.display = "none";

		document.getElementById("statsBtn").classList.remove("active");
		document.getElementById("brandsBtn").classList.remove("active");
		document.getElementById("modelsBtn").classList.remove("active");
		document.getElementById("locsBtn").classList.remove("active");
		if(!document.getElementById("channelsBtn").classList.contains("active"))
			document.getElementById("channelsBtn").classList.add("active");
		createChart();
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
var totalOpens = 0;
var totalLabels = "";

function format ( d ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Full name:</td>'+
            '<td>'+d.name+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Extension number:</td>'+
            '<td>'+d.extn+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Extra info:</td>'+
            '<td>And any further details here (images etc)...</td>'+
        '</tr>'+
    '</table>';
}
function getSubtable(dIndex, index, parentId){
	if(!parentId) parentId = "outer-level-"+dIndex;
	var parentRow = document.createElement("tr");
	parentRow.id = parentId+"-sub";
	var parentCol = document.createElement("td");
	parentCol.colSpan = 3;

	var outer = document.createElement("table");
	outer.classList.add("table", "sub", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");

	d = d_array[dIndex];
	//console.log(d);
	for(var i = 0; i< d.length; i++){
		//if(d[i].label == label){
			
			var row = document.createElement("tr");
			row.classList.add(i%2==0?"even":"odd");
			var newparent = d[i].label + "-" + "subtable-"+dIndex + "";
			row.id = newparent;
			
			var button = document.createElement("td");
			button.style="width:20px;text-align:center;";
			if(d[i].subtable && d[i].subtable.length > 0 ){
				d_array[dCnt] = d[i].subtable;
				button.innerHTML = "<button class='button' onclick='getSubtable("+ dCnt +", " +i+", &apos;"+newparent+"&apos;); updateThis(&apos;"+newparent+"&apos;, this.innerHTML );'>+</button>" ;	
				dCnt++;
			}else button.innerHTML = "";


			var label = document.createElement("td");
			label.style="width:200px";
			label.innerHTML = d[i].label;
			//var nb_visits = document.createElement("td");
			//nb_visits.innerHTML = d[i].nb_visits;
			var nb_hits = document.createElement("td");
			nb_hits.innerHTML = d[i].nb_hits;
			//var avg_time = document.createElement("td");
			//avg_time.innerHTML = d[i].avg_time_on_page + " sec";


			row.appendChild(button);
			row.appendChild(label);
			//inner.appendChild(nb_visits);
			row.appendChild(nb_hits);
			//inner.appendChild(avg_time);
			tbody.appendChild(row);
		//}
	}
	//alert(outer.innerHTML);
	outer.appendChild(tbody);
	parentCol.appendChild(outer);
	
	console.log(parentId);
	parentRow.appendChild(parentCol);
	var nodeToInsertAfter = document.getElementById(""+ parentId+ "");
	nodeToInsertAfter.parentNode.insertBefore(parentRow, nodeToInsertAfter.nextSibling);
	
}

function hideSubtab(parentId){
	console.log(parentId);
	var elem = document.getElementById(parentId+"-sub").style.display = "none";
}
function showSubtab(parentId){
	var elem = document.getElementById(parentId+"-sub").style.display = "table-row";
}
function updateThis(parentId, value){
	
	if(!parentId) parentId ="outer-level";

	if(value == "+"){
		document.getElementById(parentId).getElementsByClassName("button")[0].parentNode.innerHTML = "<button class='button' onclick='hideSubtab(&apos;"+parentId+"&apos;);updateThis( &apos;"+ parentId+"&apos;, this.innerHTML);'>-</button>";
	}
	else if (value == "-"){
		document.getElementById(parentId).getElementsByClassName("button")[0].parentNode.innerHTML = "<button class='button' onclick='showSubtab(&apos;"+parentId+"&apos;);updateThis(&apos;"+ parentId+"&apos;, this.innerHTML);'>+</button>";
	}
	return true;
}
function parseBrandsList(data){
	var outer = document.createElement("table");
	outer.classList.add("table", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");
	var header = document.createElement("thead");
	var headrow = document.createElement("tr");

	headrow.innerHTML = "<th></th><th>Κατασκευαστής</th><th>Επισκέψεις</th>";
	header.appendChild(headrow);
	outer.appendChild(header);
	outer.appendChild(tbody);
	var d = JSON.parse(data);
	var total = 0;

	for(var i = 0; i< d.length; i++){
		if(d[i].nb_uniq_visitors)
			total += d[i].nb_uniq_visitors;
		else
			total += d[i].sum_daily_nb_uniq_visitors;
	}

	for(var i = 0; i< d.length; i++){
		if(d[i].nb_uniq_visitors)
			var visits = d[i].nb_uniq_visitors;
		else
			var visits = d[i].sum_daily_nb_uniq_visitors;

		var row = document.createElement("tr");

		var col0 = document.createElement("th");
		col0.style="width:40px;text-align:center;";
		col0.innerHTML = "<span>"+(i+1)+"</span>";
		var col1 = document.createElement("td");
		col1.style="width:200px";
		col1.innerHTML = "<span>"+(d[i].label=="Unknown"?"PC Access":d[i].label) + "</span>&nbsp;<img src = 'http://smarttv.anixa.tv/matomo/"+d[i].logo+"' height = 10>";
		var col2 = document.createElement("td");
		col2.innerHTML = "<span style='color:gray';font-size:10px>("+((visits / total) * 100).toFixed(1)+"%) </span><span>"+visits+"</span>";
		row.appendChild(col0);
		row.appendChild(col1);
		row.appendChild(col2);
		tbody.appendChild(row);
	}
	return outer;
}
function parseModelsList(data){
	var outer = document.createElement("table");
	outer.classList.add("table", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");
	var header = document.createElement("thead");
	var headrow = document.createElement("tr");

	headrow.innerHTML = "<th></th><th>Μοντέλο</th><th>Επισκέψεις</th>";
	header.appendChild(headrow);
	outer.appendChild(header);
	outer.appendChild(tbody);
	var d = JSON.parse(data);
	for(var i = 0; i< d.length; i++){
		if(d[i].nb_uniq_visitors)
			var visits = d[i].nb_uniq_visitors;
		else
			var visits = d[i].sum_daily_nb_uniq_visitors;

		var row = document.createElement("tr");
		var col0 = document.createElement("th");
		col0.style="width:40px;text-align:center;";
		col0.innerHTML = "<span>"+(i+1)+"</span>";
		var col1 = document.createElement("td");
		col1.style="width:200px";
		col1.innerHTML = "<span>"+d[i].label + "</span>";
		var col2 = document.createElement("td");
		col2.innerHTML = "<span>"+visits+"</span>";
		row.appendChild(col0);
		row.appendChild(col1);
		row.appendChild(col2);
		tbody.appendChild(row);
	}
	return outer;
}
function parseLocationsList(data){
	var outer = document.createElement("table");
	outer.classList.add("table", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");
	var header = document.createElement("thead");
	var headrow = document.createElement("tr");

	headrow.innerHTML = "<th></th><th>Πόλη</th><th>Επισκέψεις</th>";

	header.appendChild(headrow);
	outer.appendChild(header);
	outer.appendChild(tbody);

	var d = JSON.parse(data);

	for(var i = 0; i< d.length; i++){
		if(d[i].nb_uniq_visitors)
			var visits = d[i].nb_uniq_visitors;
		else
			var visits = d[i].sum_daily_nb_uniq_visitors;

		var row = document.createElement("tr");
		var col0 = document.createElement("th");
		col0.style="width:40px;text-align:center;";
		col0.innerHTML = "<span>"+(i+1)+"</span>";
		var col1 = document.createElement("td");
		col1.style="width:200px";
		col1.innerHTML = "<span>"+d[i].label + "</span>&nbsp;<img src = 'http://smarttv.anixa.tv/matomo/"+d[i].logo+"' height = 10 />";

		var col2 = document.createElement("td");
		col2.innerHTML = "<span>"+visits+"</span>";
		
		row.appendChild(col0);
		row.appendChild(col1);
		row.appendChild(col2);
		tbody.appendChild(row);
	}
	return outer;
}
function parseAnalytics(data, label){
	totalOpens = totalVods = 0;
	if(label =="archive") label = "arxeio";
	if(label == "menoume-spiti") label = "mathainoume-spiti";

	var outer = document.createElement("table");
	outer.id="analyticsDataTable";
	outer.classList.add("table", "text-nowrap", "w-100", "sortable", "20-margin", "dataTable");
	var tbody = document.createElement("tbody");
	var header = document.createElement("thead");
	var headrow = document.createElement("tr");

	headrow.innerHTML = "<th></th><th>ΤΙΤΛΟΣ ΣΕΛΙΔΑΣ</th><th>ΠΡΟΒΟΛΕΣ ΣΕΛΙΔΩΝ</th>";
	header.appendChild(headrow);
	outer.appendChild(header);
	outer.appendChild(tbody);

	var d = JSON.parse(data);
	d.sort((a, b) => (a.label.trim() > b.label.trim()) ? 1: ((b.label.trim() > a.label.trim()) ? -1 : 0));
	var sortedArray = [];
	var j=0;
	dCnt = 0;
	totalOpens = totalVods = 0;
	for(var i=0;i<d.length;i++){
		if(d[i].label.trim()  == "Run_APP"){
			totalOpens += d[i].nb_hits;
			continue;
		}
		if(d[i].label.trim() == "videoplayer"){
			totalVods = d[i].nb_hits;
			continue;
		}

	}
	console.log("unsorted Array:",d);
	sortedArray = filterTable(d);
	
	console.log("sorted Array:",sortedArray);

	sortedArray.sort((a, b) => (a.nb_hits < b.nb_hits) ? 1: ((b.nb_hits < a.nb_hits) ? -1 : 0));
	//console.log(sortedArray);
	document.getElementById("analytics").innerHTML = "";
	//console.log(countVODs(sortedArray));
	if(totalVods==0) 
		totalVods = countVODs(sortedArray);
	
	for(var i = 0; i< sortedArray.length; i++){

		totalLabels += sortedArray[i].label + ", ";
		//totalVods += sortedArray[i].nb_hits;

		if(sortedArray[i].label == label || label === ''){
			var row = document.createElement("tr");
			row.classList.add(i%2==0?"even":"odd");
			row.id="outer-level-"+dCnt;
			//var inner = createClassDiv("", "", "inner");
			//inner.id ="outer-level-"+dCnt;
			var button = document.createElement('td');
			button.style="text-align:center;width:20px;";
			if(sortedArray[i].subtable && sortedArray[i].subtable.length > 0 ){
				//console.log(sortedArray[i]);
				d_array[dCnt] = sortedArray[i].subtable;
				button.innerHTML = "<button class='button' onclick='getSubtable("+ i +", "+i+");updateThis(\""+ row.id +"\",this.innerHTML);'>+</button>" ;	
				//console.log(d_array[i]);
				
			}else button.innerHTML = "";


			var l = document.createElement('td');
			l.style="width:200px";
			l.innerHTML = sortedArray[i].label;
			var nb_visits = document.createElement('td');
			nb_visits.innerHTML = sortedArray[i].nb_visits;
			var nb_hits = document.createElement('td');
			var VoDCount = countVODs(sortedArray[i].subtable);
			nb_hits.innerHTML = sortedArray[i].nb_hits;// + (VoDCount?" ----- "+VoDCount +" VoDs":"");
			var avg_time = document.createElement('td');
			avg_time.innerHTML = sortedArray[i].avg_time_on_page + " sec";


			row.appendChild(button);
			row.appendChild(l);
			//inner.appendChild(nb_visits);
			row.appendChild(nb_hits);
			//inner.appendChild(avg_time);
			tbody.appendChild(row);
		}
		dCnt++;
	}
	//console.log(d_array);

	document.getElementById("analytics").innerHTML = "";
	//alert(outer.innerHTML);
	document.getElementById("analytics").appendChild(outer);
	
}
function countVODs(table){
	if(!table) return null;
	var total = 0;
	for(var i = 0; i< table.length; i++){
		if(table[i].label == "Live" || table[i].label == "Radio" || table[i].label == "Run_APP") continue;
		if(table[i].subtable)
			total += countVODs(table[i].subtable);
		else
			total += table[i].nb_hits;
	}
	return total;
}
function countCategoryVODs(table){
	var total = 0;

}
function onLoadAnalytics(){
	totalVods = 0;
	var today = new Date();
	$( "#datepicker-from" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	$( "#datepicker-to" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	//$( "#datepicker-from" ).datepicker("setDate", "-1"); 
	$( "#datepicker-from2" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	$( "#datepicker-to2" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	//$( "#datepicker-from2" ).datepicker("setDate", "-1"); 
	$( "#datepicker-from3" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	$( "#datepicker-to3" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	//$( "#datepicker-from3" ).datepicker("setDate", "-1"); 
	$( "#datepicker-from4" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	$( "#datepicker-to4" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, startDate:"01/12/2021", endDate:"0d"});
	//$( "#datepicker-from4" ).datepicker("setDate", "-1");
	var days = Math.round(new Date() - new Date(2022,3 - 1, 24)) / (1000 * 60 * 60 * 24 /*milliseconds in day*/);
	var dayOptions = createDateOptions(days<30?days:30);
	$("#selectedDay").html(dayOptions);
	$("#selectedDay2").html(dayOptions);
	$("#selectedDay3").html(dayOptions);
	$("#selectedDay4").html(dayOptions);
	$("input[id^='datepicker-']").on("change", function(){
		console.log("datepicker changed");
		$("select[id^='selectedDay']").each(function(e){
  			$(this).val("");
  		});
	});
	$("select[id^='selectedDay']").on("change", function(){
		console.log("selected changed");
		$("input[id^='datepicker-']").each(function(e){
  			$(this).val("");
		});
	});
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
		    $( "#datepicker-from" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, minDate: today});
		    $( "#datepicker-to" ).datepicker({format: 'dd/mm/yyyy', changeMonth: true, changeYear: true, minDate: today});
	
	

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
function createDateOptions(numberOfDays){
	var ret = "<option value='' id='' selected style='display:none'></option>";
	var options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
	var currentDate = new Date();
	var newDay = currentDate;
	for(var i = 0; i < numberOfDays; i++){
		var newDay = currentDate.subtractDays(i);
		ret += "<option value='"+newDay.toLocaleDateString("el-GR")+"' id='"+i+"'>"+newDay.toLocaleDateString('el-GR',options)+"</option>";
	}
	return ret;
}

Date.prototype.subtractDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

function filterTable(table){
	var newTable = [];
	var j = 0;
	for(var i=0;i<table.length;i++){
		if(table[i].label.trim() == "Πατήθηκε το Κόκκινο Κουμπί" || table[i].label.trim() == "videoplayer") continue;

		newTable[j] = {
			label: table[i].label.trim(),
			nb_hits: table[i].nb_hits,
			idsubdatatable: table[i].idsubdatatable
		};

		if (table[i].subtable) {
			newTable[j].subtable = filterTable(table[i].subtable);
		}
		j++;
	}

	var concArray = [];

	for(var i=0;i<newTable.length;i++){
		var found = concArray.findIndex(e => e.label === newTable[i].label); // Stricter condition
		if (found > -1) {
			// Combine nb_hits and subtables if necessary
			concArray[found].nb_hits += newTable[i].nb_hits;
			if (newTable[i].subtable) {
				if (!concArray[found].subtable) {
					concArray[found].subtable = newTable[i].subtable;
				} else {
					// Merge subtables if both exist
					concArray[found].subtable = concArray[found].subtable.concat(newTable[i].subtable);
				}
			}
		} else {
			concArray.push(newTable[i]);
		}
	}

	concArray.sort((a, b) => (a.nb_hits < b.nb_hits) ? 1 : -1);
	concArray.filtered = 1;
	return concArray;
}


/*function filterTable(table){
	var newTable = [];
	var j = 0;
	for(var i=0;i<table.length;i++){
		if(table[i].label.trim()=="Πατήθηκε το Κόκκινο Κουμπί" || table[i].label.trim()=="videoplayer") continue;
		newTable[j] = [];
		newTable[j].label = table[i].label;
		newTable[j].nb_hits = table[i].nb_hits;
		newTable[j].idsubdatatable = table[i].idsubdatatable;
		if(table[i].subtable)
			newTable[j].subtable = filterTable(table[i].subtable);
		//console.log("table "+table[i].label.trim()+":", newTable[j]);
		j++;
	}

	concArray = [];
	var j = 0;

	for(var i=0;i<newTable.length;i++){
		var found = concArray.findIndex(e => e.label.indexOf(newTable[i].label.trim()) > -1);
		if (found > -1) {
			if(!concArray[found].subtable){
				var hits = concArray[found].nb_hits;
				concArray[found] = newTable[i];
				concArray[found].nb_hits += hits;
			}else
			concArray[found].nb_hits += newTable[i].nb_hits;
		}else{
			concArray.push(newTable[i]);
			concArray[j].label = concArray[j].label.trim();

			j++;
		}
		
	}
	concArray.sort((a, b) => (a.nb_hits < b.nb_hits) ? 1: ((b.nb_hits < a.nb_hits) ? -1 : 0));
	concArray.filtered = 1;
	return concArray;
}*/

