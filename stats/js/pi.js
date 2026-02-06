function buildall(channel, start, end) {
	const isday = start == end;
	const methods = ['UserCountry.getCountry', 'UserCountry.getCity', 'VisitTime.getVisitInformationPerServerTime', 'DevicesDetection.getBrand', 'DevicesDetection.getModel'];
	const labels = ['Country', 'City', 'Views per hour', 'Device brand', 'Device model'];
	const field = (isday ? 'nb_uniq_visitors' : 'nb_visits');
	const fieldLabel = (isday ? 'Unique Viewers' : 'Viewers');
	var i = 0, col = 0;

	$('.loading-state').css('visibility', 'visible');
	for (const k in methods) {
		const method=methods[k];
		const url = 'getpi.php?method='+ method +'&channel='+ channel +'&start='+ start +'&end='+ end;
		const widgetn = Math.round(methods.length / 3);
		const label = labels[i];
		var s = buildWidget(method, label);

		console.log(method);
		document.getElementsByClassName('col')[col].innerHTML += s;

		i++;
		if (i % widgetn == 0)
			col++;

		createHttpRequest(url, function(ret) {
			$('.loading-state').css('visibility', 'hidden');
			const res = JSON.parse(ret);
			for (const method in res) {
				const data = getData(res[method], channel, field, method);

				if (method == 'VisitTime.getVisitInformationPerServerTime')
					visitsChart(data, label, fieldLabel);
				else {
					const m = method.replace('.','-');
					var s = buildWidgetData(data, method, fieldLabel, label, method != 'DevicesDetection.getModel');
					document.getElementById('method-'+ m).getElementsByClassName('dataTableScroller')[0].innerHTML = s;
					console.log('-----------------');

					$('#method-'+ m +' td.column').on('mouseover', function() {
						$(this).parents("table:first").find('span').css('visibility', 'visible');
					});
					$('#method-'+ m +' td.column').on('mouseout', function() {
						$(this).parents("table:first").find('span').css('visibility', 'hidden');
					});
					$('#method-'+ m +' .dataTableFeatures span').each(function(i, el) {
						var table = $(this).parents('.dataTableWrapper').find('table'), offset = parseInt(table.attr('data-offset')), total = parseInt(table.attr('data-total'));

						if ($(this).attr('class') == 'dataTablePrevious') {
							$(this).on('click', function() {
								const offset = parseInt(table.attr('data-offset'));
								getPrev(method, channel, start, end, field, table, offset, method != 'DevicesDetection.getModel');
							});
							if (offset > 1)
								$(this).css('visibility', 'visible');
						} else if ($(this).attr('class') == 'dataTablePages') {
							$(this).html((offset+1) +'-'+ total);
						} else { //next
							$(this).on('click', function() {
								const offset = parseInt(table.attr('data-offset'));
								getNext(method, channel, start, end, field, table, offset, method != 'DevicesDetection.getModel');
							});
							if (total == 10)
								$(this).css('visibility', 'visible');
						}
					});
				}
			}
		});
	}
}

function getPrev(method, channel, start, end, field, table, offset, showLogo) {
	offset-=10;
	var url = 'getpi.php?action=page&method='+ method +'&channel='+ channel +'&start='+ start +'&end='+ end +'&offset='+ offset;
	createHttpRequest(url, function(ret) {
		const res = JSON.parse(ret);
		const m = method.replace('.','-');
		for (const method in res) {
			if (!res[method])
				continue;
			const data = getData(res[method], channel, field, method);
			var s='',tot = 0, total=0;
			for (var i = 0; i < data.length; i++) {
				tot += parseInt(data[i]['n']);
				total++;
			}
			for (var i = 0; i < data.length; i++) {
				s += '<tr><td class="label">' +(showLogo ? '<img src="'+ logoPrefix + data[i]['logo'] +'" /> ':'')+ data[i]['label'] +'</td><td class="column"><span class="ratio">'+ percent(data[i]['n'], tot) +'%</span>'+ fm(data[i]['n']) +'</td></tr>';
			}
			table.find('tbody')[0].innerHTML = s;
		}
		table.attr('data-total', total);
		table.attr('data-offset', offset);
		$('#method-'+ m +' .dataTableFeatures span.dataTablePages')[0].innerHTML = (offset+1) +'-'+ (offset+10);
		$('#method-'+ m +' .dataTableFeatures span.dataTableNext').css('visibility', 'visible');
		if (offset == 0)
			$('#method-'+ m +' .dataTableFeatures span.dataTablePrevious').css('visibility', 'hidden');
	});
}
function getNext(method, channel, start, end, field, table, offset, showLogo) {
	offset+=10;
	var url = 'getpi.php?action=page&method='+ method +'&channel='+ channel +'&start='+ start +'&end='+ end +'&offset='+ offset;
	createHttpRequest(url, function(ret) {
		const res = JSON.parse(ret);
		const m = method.replace('.','-');
		for (const method in res) {
			if (!res[method])
				continue;
			const data = getData(res[method], channel, field, method);
			var s='',tot = 0, total=0;
			for (var i = 0; i < data.length; i++) {
				tot += parseInt(data[i]['n']);
				total++;
			}
			if (!total)
				continue;
			for (var i = 0; i < data.length; i++) {
				s += '<tr><td class="label">' +(showLogo ? '<img src="'+ logoPrefix + data[i]['logo'] +'" /> ':'')+ data[i]['label'] +'</td><td class="column"><span class="ratio">'+ percent(data[i]['n'], tot) +'%</span>'+ fm(data[i]['n']) +'</td></tr>';
			}
			table.find('tbody')[0].innerHTML = s;
			table.attr('data-total', total);
			table.attr('data-offset', offset);
			$('#method-'+ m +' .dataTableFeatures span.dataTablePages')[0].innerHTML = (offset+1) +'-'+ (total+offset);
			$('#method-'+ m +' .dataTableFeatures span.dataTablePrevious').css('visibility', 'visible');
			if (total != 10)
				$('#method-'+ m +' .dataTableFeatures span.dataTableNext').css('visibility', 'hidden');
		}
	});
}
function buildWidget(method, label) {
	var s = '<div class="sortable"><div class="widget">';
	s += '<div class="widgetTop"><h3 class="widgetName">'+ label +'</h3></div>';
	s += '<div class="widgetContent">';
	s += '<div class="dataTable">';
	const m = method.replace('.','-');
	s += '<div id="method-'+ m +'" class="dataTableWrapper">';

	if (method == 'VisitTime.getVisitInformationPerServerTime') {
		s += '<div id="chart_div" style="height: 330px;"></div>';
	} else {
		s += '<div class="dataTableScroller">';
		s+= '</div>';
		s+= '<div class="dataTableFeatures"><div class="dataTableFooterNavigation">';
		s+= '<span class="dataTablePrevious">‹ Previous</span> &nbsp; <span class="dataTablePages">Loading...</span> &nbsp;<span data-method="'+ method +'" class="dataTableNext">Next ›</span>';
		s+= '<div class="row dataTablePaginationControl">';
		s+= '</div>';
		s+= '</div></div>';
	}

	s+= '</div>';
	s+= '</div>';
	s+= '</div>';
	s+= '</div></div>';
	return s;
}
function buildWidgetData(data, method, fieldLabel, label, showLogo) {
	var s ='', f = fieldLabel;
	if (method == 'DevicesDetection.getBrand' || method == 'DevicesDetection.getModel')
		f = f.replace('Viewers', 'Devices');
	s += '<table cellspacing="0" class="dataTable" data-offset="0" data-total="'+ data.length +'">';
	s += '<thead><tr><th class="label">'+ label +'</th><th class="last">'+ f +'</th></tr></thead>';
	s += '<tbody>';
	var tot = 0;
	for (var i = 0; i < data.length; i++) {
		tot += parseInt(data[i]['n']);
	}
	for (var i = 0; i < data.length; i++) {
		s += '<tr><td class="label">' +(showLogo ? '<img src="'+ logoPrefix + data[i]['logo'] +'" /> ':'')+ data[i]['label'] +'</td><td class="column"><span class="ratio">'+ percent(data[i]['n'], tot) +'%</span>'+ fm(data[i]['n']) +'</td></tr>';
	}

	s += '</tbody>';
	s+= '</table>';
	return s;
}
function visitsChart(xdata, label, fieldLabel) {
	google.load('visualization', '1', {'packages':['corechart']});
	var cols = [], visits = [], i = 0;

	for (var i = 0; i < xdata.length; i++) {
		visits.push(parseInt(xdata[i]['n']));
		cols.push( (i < 10 ? '0':'') +i);
	}

	visits.unshift(fieldLabel);
	var data = new google.visualization.DataTable();
	var raw_data = [visits];

	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i) {
		data.addColumn('number', raw_data[i][0]);	
	}
	data.addRows(cols.length);

	for (var j = 0; j < cols.length; ++j) {	
		data.setValue(j, 0, cols[j]);
	}

	for (var i = 0; i < raw_data.length; ++i) {
		for (var j = 1; j < raw_data[i].length; ++j) {
			data.setValue(j-1, i+1, raw_data[i][j]);
		}
	}

	// Create and draw the visualization.
	var div = $('#chart_div'), googleChart = new google.visualization.ChartWrapper();

	googleChart.setContainerId('chart_div');
	//googleChart.setChartType('LineChart');
	googleChart.setChartType('ColumnChart');
	googleChart.setDataTable(data);
	googleChart.setOptions({
		title: label,
		width: div.width(),
		height: 330,
		legend: 'right',
		yAxis: {title: '(thousands)'},
		vAxis: {minValue: 0},
		hAxis:{title:"Hours"}
	});
	googleChart.draw();
}

function getData(res, channel, field, method) {
	var a = [];
	if (channel == 'all' || channel.indexOf(',') != -1) {
		var k = 0;
		for (var id in res) {
			for (var i = 0; i < res[id].length; i++) {
				if (channel != 'megaapp' && method == 'UserCountry.getCountry' && res[id][i]['label'] != 'Greece')
					continue;
				if (k == 0) {
					var item = [];
					item['label'] = res[id][i]['label'];
					item['n'] = parseInt(res[id][i][field]);
					if (method == 'UserCountry.getCountry' || method == 'UserCountry.getCity' || method == 'DevicesDetection.getBrand')
						item['logo'] = res[id][i]['logo'];
					a.push(item);
				} else {
					a[i]['n'] += parseInt(res[id][i][field]);
				}
			}
			k++;
		}
	} else {
		for (var i = 0; i < res.length; i++) {
			var item = [];
			item['label'] = res[i]['label'];
			item['n'] = res[i][field];
			if (method == 'UserCountry.getCountry' || method == 'UserCountry.getCity' || method == 'DevicesDetection.getBrand')
				item['logo'] = res[i]['logo'];
			a.push(item);
		}
	}
	return a;
}
function fm(n) {
	return number_format(n, 0, ',', '.');
}
function number_format (number, decimals, dec_point, thousands_sep) {
	// Strip all characters but numerical ones.
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}
function percent(x, total) {
	if (!total)
		return 0;
	var percent = (x * 100) / total;
	return number_format(percent, 2 ); // change 2 to # of decimals
}

