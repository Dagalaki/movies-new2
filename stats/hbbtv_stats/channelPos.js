var chart = null,zero =0, total=0, chartData = [];
function createChart() {
	chart = AmCharts.makeChart("chartdiv", {
		"type": "serial",
		"categoryField": "pos",
		"path": "js/libs/amchart/",
		"angle": 10,
		"depth3D": 10,
		"color":"#000",
		"categoryAxis": {
			"gridPosition": "start"
		},

		"chartCursor": {
			"enabled": true
		},
		"chartScrollbar": {
			"enabled": true
		},

	"trendLines": [],
	"graphs": [{
		balloonText: "Channelplace: [[category]] Number: [[hits]]",
		"fillAlphas": 1,
		"type": "column",
		"id": "SD-0",
		"title": "sender",
		"valueField": "hits"
	}],

	"guides": [],
	"valueAxes": [{
		axisAlpha: 0.2,
		id: "v1",
		"title": "Number Smart-TV",
	}],

	"allLabels": [],
	"balloon": {},
	"legend": {
		"enabled": false,
		"valueText": ""
	},
	"titles": [{
		"enabled": false,
		"id": "Title-1",
		"size": 15,
		"text": "Senderplatz: ERT"
	}],

	"export": {
		"enabled": false,
		"libs": {
			"path": "amcharts/plugins/export/libs/"
		},
		"position": "top-left"
	},
	"dataProvider": chartData
	});

	console.log(chart);
	chart.columnsSet.togglable = true;
	chart.addListener("dataUpdated", zoomChart);

	if(document.getElementById("total")){
		document.getElementById("total").innerHTML="<b>"+total+"</b> SmartID's<br>("+ zero +" Unknown place)";
		//document.getElementById("total").innerHTML="("+ zero +" Unknown place)";
	}
	chart.addListener("clickGraphItem", function(ev) {
		var pos = parseInt(ev.item.category);
		//var col = ev.target.
		console.log(ev.item);
		console.log(chart.columnsArray[pos]);
		console.log("clicked on ", pos);
		chart.columnsArray[pos].column.setState('default');
	});

	setTimeout(zoomChart,500);
}

function zoomChart() {
	//chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
	chart.zoomToIndexes(0, 60);
}

Number.prototype.format = function(n, x) {
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
	return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};


function setPanSelect() {
	var chartCursor = chart.chartCursor;

	if (document.getElementById("rb1").checked) {
		chartCursor.pan = false;
		chartCursor.zoomable = true;

	} else {
		chartCursor.pan = true;
	}
	//chart.validateNow();
}


function loadplace(id){
	var src="/manager/sv/channelpos.php?sid="+id;
	var scriptElement = document.createElement('script');
	var dyid="chdata";
	removeScript("chdata");
	scriptElement.type = 'text/javascript';
	scriptElement.setAttribute('id', dyid);
	scriptElement.src = src + '&' + (new Date).getTime();
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
	return true;
};

function removeScript(pathToScript) {
	var head = document.getElementsByTagName("head")[0];
	var scripts = head.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		var js = scripts[i];
		if (js.id == pathToScript) {
			head.removeChild(js);
			break;
		}
	}
};

function parseChannel(res) {
	var j = JSON.parse(res);
	chartData = j['a'];
	total = j['total'];
	zero = j['zero'];
	console.log(total);

	var outer = document.createElement("div");
	var bl = document.createElement("div");
	bl.className = 'block-controls';
	bl.innerHTML = '<ul class="controls-buttons"><li id="total"><b>xxx</b> SmartID\'s<br><b>xxx</b>Unknown place</li></li></ul><div id="chartdiv" style="width:100%; height:450px;margin-top: ::::;border: 1px solid #ccc;"></div>';

	outer.appendChild(bl);
	return outer;
}
