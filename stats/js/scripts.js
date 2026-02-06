var chartToggle = false;

$(document).ready(function () {

    if (typeof openHistoryReport !== 'undefined') {
        openHistoryReport();
    }

    if (typeof werbeblock !== 'undefined') {
        loadBlockData(werbeblock);
    }

    $('.grid.video-match .play-small').click(function (event) {
        event.preventDefault();
        var index = $(this).parent().parent().parent().index();
	var srv = getMediaSRV(werbeblock[index].tag.replace("-","").replace("-", ""));

        $.fancybox.open({
            openEffect: 'fade',
            closeEffect: 'fade',
            nextEffect: 'none',
            prevEffect: 'none',
            autoFit: true,
            autoSize: false,
            height: 'auto',
            width: 800,
            padding: 0,
            margin: 50,
            content: "<video id=\"video\" width=\"800\" controls autoplay>" +
            "<source src=\"https://"+srv+".anixa.tv/vlc/" + werbeblock[index].sender + "/werbeclip/" + werbeblock[index].tag.replace("-","").replace("-", "") + "/" + werbeblock[index].play.replace(".mpg", ".mp4") + "\" type=\"video/mp4\">" +
            "</source>" +
            "</video>"
        });

    });

    $('.planning li > ul > li a').click(function (event) {
        event.preventDefault();
        var index = $(this).data("id");
	var srv = getMediaSRV(werbeblock[index].tag.replace("-","").replace("-", ""));

        $.fancybox.open({
            openEffect: 'fade',
            closeEffect: 'fade',
            nextEffect: 'none',
            prevEffect: 'none',
            autoFit: true,
            autoSize: false,
            height: 'auto',
            width: 800,
            padding: 0,
            margin: 50,
            content: "<video id=\"video\" width=\"800\" controls autoplay>" +
            "<source src=\"https://"+srv+".anixa.tv/vlc/" + werbeblock[index].sender + "/werbeclip/" + werbeblock[index].tag.replace("-","").replace("-", "") + "/" + werbeblock[index].play.replace(".mpg", ".mp4") + "\" type=\"video/mp4\">" +
            "</source>" +
            "</video>"
        });

    });

    $('.grid .edit').click(function (event) {
        event.preventDefault();
        refId = $(this).parent().parent().parent().data('vclip-detail-id');

        $.post("index.php", {ajax: 1, fnc: 'loadVclipData', vclip_detail: refId}).done(function (jdata) {
            data = JSON.parse(jdata);
            $('.fancybox-inner fieldset .message').remove();
            $('#videoinfo .message').remove();
            $('#videoinfo #vclip_detail').val(refId);
            $('#videoinfo #no').val(data.no);
            $('#videoinfo #type').val(data.type);
            $('#videoinfo #sector').val(data.sector);
            $('#videoinfo #segment').val(data.segment);
            $('#videoinfo #pgroup').val(data.pgroup);
            $('#videoinfo #concern').val(data.concern);
            $('#videoinfo #brand').val(data.brand);
            $('#videoinfo #product').val(data.product);
            $('#videoinfo #time').val(data.time);
            $('#videoinfo #last_time').val(data.last_time);
            $('#videoinfo #country').val(data.country);
            $('#videoinfo #duration').val(data.duration);
            $('#videoinfo #ad_type').val(data.ad_type);

            $.fancybox.open({
                openEffect: 'fade',
                closeEffect: 'fade',
                nextEffect: 'none',
                prevEffect: 'none',
                autoFit: true,
                autoSize: false,
                height: 'auto',
                width: 420,
                padding: 0,
                margin: 50,
                //content: '<form class="form" id="videoinfo" method="post" action=""><fieldset><input type="hidden" value=""><div class="form-row"><label for="branch">Branche</label><span class="input-type-text"><input type="text" name="branch" id="branch" value=""></span></div><div class="form-row"><label for="segment">Segment</label><span class="input-type-text"><input type="text" name="segment" id="segment" value=""></span></div><div class="form-row"><label for="group">Gruppe</label><span class="input-type-text"><input type="text" name="group" id="group" value=""></span></div><div class="form-row"><label for="company">Konzern</label><span class="input-type-text"><input type="text" name="company" id="company" value=""></span></div><div class="form-row"><label for="brand">Marke</label><span class="input-type-text"><input type="text" name="brand" id="brand" value=""></span></div><div class="form-row"><label for="product">Produkt</label><span class="input-type-text"><input type="text" name="product" id="product" value=""></span></div><div><button class="center" id="submit">Daten speichern</button></div></fieldset></form>'
                content: $('#videoinfo')
            });


        });

    });

    $('.grid .info').click(function (event) {
        event.preventDefault();
        refId = $(this).parent().parent().parent().data('vclip-detail-id');
        var data;
        $.post("index.php", {ajax: 1, fnc: 'loadVclipData', vclip_detail: refId}).done(function (jdata) {
            data = JSON.parse(jdata);

            $.fancybox.open({
                openEffect: 'fade',
                closeEffect: 'fade',
                nextEffect: 'none',
                prevEffect: 'none',
                autoFit: true,
                autoSize: false,
                height: 'auto',
                width: 320,
                padding: 0,
                margin: 50,

                content: "<div class='table'><table style='width: 100%'><tr><td>Motivnummer:</td><td>" + data.no + "</td>" +
                "<tr><td>Mediengattung:</td><td>" + data.type + "</td></tr>" +
                "<tr><td>Branche:</td><td>" + data.sector + "</td></tr>" +
                "<tr><td>Segment:</td><td>" + data.segment + "</td></tr>" +
                "<tr><td>Gruppe:</td><td>" + data.pgroup + "</td></tr>" +
                "<tr><td>Konzern:</td><td>" + data.concern + "</td></tr>" +
                "<tr><td>Marke:</td><td>" + data.brand + "</td></tr>" +
                "<tr><td>Produkt:</td><td>" + data.product + "</td></tr>" +
                "<tr><td>Startzeit:</td><td>" + data.time + "</td></tr>" +
                "<tr><td>Endzeit:</td><td>" + data.last_time + "</td></tr>" +
                "<tr><td>Land:</td><td>" + data.country + "</td></tr>" +
                "<tr><td>Dauer:</td><td>" + data.duration + "</td></tr>" +
                "<tr><td>Werbeart:</td><td>" + data.ad_type + "</td></tr>" +
                "<tr><td>Anzahl:</td><td>" + data.cc + "</td></tr></table></div>"

            });

        });

    });

    $('body').on('click', '.fancybox-inner #videoinfo button', function (event) {
        event.preventDefault();

        var data;
        data = JSON.stringify($('.fancybox-inner #videoinfo').serializeArray());

        $.post("index.php", {ajax: 1, fnc: 'saveVclipData', data: data}).done(function (jdata) {
            data = JSON.parse(jdata);
            $('.fancybox-inner fieldset .message').remove();
            $('.fancybox-inner fieldset').prepend('<ul class="message ' + data.type + ' no-margin"><li>' + data.msg + '</li></ul>');
        });
        //$.post("index.php", {ajax: 1, call: "startGame",settings: JSON.stringify($('#settings').serializeArray())});

    });

    var datum = $('#datum').val();


    $('#datum').datepick({

        dateFormat: 'yyyy-mm-dd',
        onSelect: function () {
            if ($('#datum').val() != datum) {
                jsFunction(true);
            }

        },
        alignment: 'bottom',
        showOtherMonths: true,
        selectOtherMonths: true,
        renderer: {
            picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
            '{months}</div></div>',
            monthRow: '{months}',
            month: '<div class="calendar-controls" style="white-space: nowrap">' +
            '{monthHeader:M yyyy}' +
            '</div>' +
            '<table cellspacing="0">' +
            '<thead>{weekHeader}</thead>' +
            '<tbody>{weeks}</tbody></table>',
            weekHeader: '<tr>{days}</tr>',
            dayHeader: '<th>{day}</th>',
            week: '<tr>{days}</tr>',
            day: '<td>{day}</td>',
            monthSelector: '.month',
            daySelector: 'td',
            rtlClass: 'rtl',
            multiClass: 'multi',
            defaultClass: 'default',
            selectedClass: 'selected',
            highlightedClass: 'highlight',
            todayClass: 'today',
            otherMonthClass: 'other-month',
            weekendClass: 'week-end',
            commandClass: 'calendar',
            commandLinkClass: 'button',
            disabledClass: 'unavailable'

        },
        regionalOptions: ['de']

    });

    $('.datum-noauto').datepick({
        dateFormat: 'yyyy-mm-dd',
        alignment: 'bottom',
        showOtherMonths: true,
        selectOtherMonths: true,
        renderer: {
            picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
            '{months}</div></div>',
            monthRow: '{months}',
            month: '<div class="calendar-controls" style="white-space: nowrap">' +
            '{monthHeader:M yyyy}' +
            '</div>' +
            '<table cellspacing="0">' +
            '<thead>{weekHeader}</thead>' +
            '<tbody>{weeks}</tbody></table>',
            weekHeader: '<tr>{days}</tr>',
            dayHeader: '<th>{day}</th>',
            week: '<tr>{days}</tr>',
            day: '<td>{day}</td>',
            monthSelector: '.month',
            daySelector: 'td',
            rtlClass: 'rtl',
            multiClass: 'multi',
            defaultClass: 'default',
            selectedClass: 'selected',
            highlightedClass: 'highlight',
            todayClass: 'today',
            otherMonthClass: 'other-month',
            weekendClass: 'week-end',
            commandClass: 'calendar',
            commandLinkClass: 'button',
            disabledClass: 'unavailable'

        },
        regionalOptions: ['de']

    });

    $('#datum-noauto').datepick({
        dateFormat: 'yyyy-mm-dd',
        alignment: 'bottom',
        showOtherMonths: true,
        selectOtherMonths: true,
        renderer: {
            picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
            '{months}</div></div>',
            monthRow: '{months}',
            month: '<div class="calendar-controls" style="white-space: nowrap">' +
            '{monthHeader:M yyyy}' +
            '</div>' +
            '<table cellspacing="0">' +
            '<thead>{weekHeader}</thead>' +
            '<tbody>{weeks}</tbody></table>',
            weekHeader: '<tr>{days}</tr>',
            dayHeader: '<th>{day}</th>',
            week: '<tr>{days}</tr>',
            day: '<td>{day}</td>',
            monthSelector: '.month',
            daySelector: 'td',
            rtlClass: 'rtl',
            multiClass: 'multi',
            defaultClass: 'default',
            selectedClass: 'selected',
            highlightedClass: 'highlight',
            todayClass: 'today',
            otherMonthClass: 'other-month',
            weekendClass: 'week-end',
            commandClass: 'calendar',
            commandLinkClass: 'button',
            disabledClass: 'unavailable'

        },
        regionalOptions: ['de']

    });

    $('.trigger').click(function () {
        $('#datum').datepick('show');
    });


    $('.with-tip').tip();

    $('.play').click(function () {

        $('.play').fancybox({
            openEffect: 'fade',
            closeEffect: 'fade',
            nextEffect: 'none',
            prevEffect: 'none',
            autoFit: true,
            autoSize: false,
            height: 'auto',
            width: 800,
            padding: 0,
            margin: 50,
            content: "<video id=\"video\" width=\"800\" controls autoplay>" +
            "<source src=\"" + $(this).data("src") + "\" type=\"video/mp4\">" +
            "</source>" +
            "</video>"
        });
    });


    $('.more-chart').click(function (event) {

        var info = getcData($(this).attr('data'));


        chart = $('#detailchart').detach();

        $('.more-chart').fancybox({
            openEffect: 'fade',
            closeEffect: 'fade',
            nextEffect: 'none',
            prevEffect: 'none',
            autoFit: true,
            autoSize: false,
            height: 'auto',
            width: 400,
            padding: 0,
            margin: 50,
            content: "<div class='chart-info'>" + info + "</div><div class='chart'></div>"
        });
        setTimeout("chart.appendTo('.chart');chart = null;$('body').append('<div id=\"detailchart\"></div>')", 10);
    });


    $('.btn-toggle-chart').click(function (event) {
        event.preventDefault();
        $('.chart-toggle').slideToggle();

        if (chartToggle == true) {
            $('.btn-toggle-chart img').attr('src', "images/icons/fugue/arrow-090.png");
            chartToggle = false;
        } else {
            $('.btn-toggle-chart img').attr("src", "images/icons/fugue/arrow-270.png");
            chartToggle = true;
        }


    });


    if ($('.wrapper1').length > 0) {
        $(".div1").width($(".div2 table").width());
        $(".wrapper1").scroll(function () {
            $(".wrapper2")
                .scrollLeft($(".wrapper1").scrollLeft());
        });
        $(".wrapper2").scroll(function () {
            $(".wrapper1")
                .scrollLeft($(".wrapper2").scrollLeft());
        });
    }

    $('#winsel').submit(function (event) {
        formRewrite($("#winsel"));
        window.location = $('#winsel').attr('action');
        event.preventDefault();
    });
    
    $('#linkFacebook').click(function (event) {
    	
		fillCampaignTable();
        //alert("linkFacebook");
        //console.log("linkFacebook");
        event.preventDefault();
    });
    $('#linkGoogle').click(function (event) {
        //alert("linkGoogle");
        //console.log("linkGoogle");
        fillCampaignTableGoogle();
        event.preventDefault();
    });

});


/**
 *
 * @param data
 */
function loadBlockData(data) {

    if (data.length > 0) {

        if(typeof epgData !== "undefined" && typeof epgData !== "boolean" && epgData!="") {

            $('.planning').append("<li><ul style='padding-left:2%;overflow: hidden;white-space: nowrap;'>"+ epgData.titel + " - " + epgData.longdesc + "</ul></li>");
        }

        if (typeof data[0].mint !== "undefined") {

            minTimeA = data[0].mint.split(":");
            maxTimeA = data[0].maxt.split(":");

            minTime = (parseInt(minTimeA[0]) * 3600) + (parseInt(minTimeA[1]) * 60) + parseInt(minTimeA[2]) - 1200;
            maxTime = (parseInt(maxTimeA[0]) * 3600) + (parseInt(maxTimeA[1]) * 60) + parseInt(maxTimeA[2]);

            availTime = maxTime - minTime;

            pps = 95 / availTime;

            lastp = 2;

            tagOld = "";

            for (i = minTime + 1200; i < maxTime; i += 7200) {
                lastp = Math.abs((pps * (maxTime - i + 600)) - 95);
                $(".planning-header ul").append('<li style="left:' + (lastp) + '%;">' + toHHMMSS(i) + '</li>')
            }

            $.each(data, function (i, item) {
                time = item.szeit.split(":");
//console.log((pps * (parseInt(time[0])*3600)+(parseInt(time[1])*60)+parseInt(time[2])));

                times = (parseInt(time[0]) * 3600) + (parseInt(time[1]) * 60) + parseInt(time[2]);
                lastp = Math.abs((pps * (maxTime - times + 600)) - 95);
		srv = getMediaSRV(item.tag.replace("-", "").replace("-", ""));

                percentage = pps * item.dauer;
                //$pic = "http://213.183.95.102/vlc/".$sender."/werbeclip/".$tag."/".str_replace (".mpg",".png",$row['play']);
                /*if(data.length<6){
                 $('.grid').append('<li style="width: '+100/data.length+'%;max-width:300px;float:left;"><img src="http://213.183.95.102/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '"></li>');
                 }else {
                 $('.grid').append('<li><img src="http://213.183.95.102/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '"></li>');
                 }*/
                $('.grid').append('<li class="' + item.class + '" data-vclip-detail-id="' + item.vclip_detail_id + '"><img src="https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '">' +
                    '<ul class="grid-actions">' +
                    '<li><a href="#" class="play-small" class="with-tip"><img src="images/icons/fugue/control.png" width="16" height="16"></a></li>' +
                    '<li><a href="#" class="edit" class="with-tip"><img src="images/icons/fugue/pencil.png" width="16" height="16"></a></li>' +
                    '<li><a href="#" class="info" class="with-tip"></a></li>' +
                    '<li class="with-tip" title="<span style=\'font-size:14px;\'>'+ item.cc +'</span>">' + item.ccT + '</li>' +

                    '</ul>' +
                    '</li>');

                if (item.tag != tagOld) {
                    $('.planning').append('<li><a>' + item.tag + '</a><ul class="zebras"></ul></li>');
                }
                if (item.cc > 1) {
                    $('.planning').append('<li ' + (i == 0 ? 'class="active"' : '') + ' data-id="' + i + '"><a class="clip-name with-tip" title="<span style=\'font-size:13px\'>' + item.tag + '</span></br><img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="winsel/sender/' + item.sender + '/datum/' + item.tag + '/block/' + item.block + '"><!--<img src="images/icons/fugue/user-red.png" width="16" height="16">-->Clip ' + (i < 9 ? '0' + (i + 1) : i + 1) + " [" + item.szeit + '] ' + item.sender + '</a>' +
                        '<ul><li style="left:' + lastp + '%;width:' + percentage + '%;min-width:65px;">' +
                        '<a class="with-tip" title="<img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="#">' + item.dauer + ' sec<span class="event-' + item.color + '" style="width:calc(100% - 20px)">' + item.dauer + ' sec</span><div style="display:block;top:0;position:absolute;left:calc(100% - 22px);width:20px;text-align:center;">' + item.cc + '</div></a>' +
                        '</li>' +
                        '</ul>' +
                        '</li>');
                } else {
                    $('.planning').append('<li ' + (i == 0 ? 'class="active"' : '') + ' data-id="' + i + '"><a class="clip-name with-tip" title="<span style=\'font-size:13px\'>' + item.tag + '</span></br><img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="winsel/sender/' + item.sender + '/datum/' + item.tag + '/block/' + item.block + '"><!--<img src="images/icons/fugue/user-red.png" width="16" height="16">-->Clip ' + (i < 9 ? '0' + (i + 1) : i + 1) + " [" + item.szeit + '] ' + item.sender + '</a>' +
                        '<ul><li style="left:' + lastp + '%;width:' + percentage + '%;min-width:65px;">' +
                        '<a class="with-tip" title="<img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="#">' + item.dauer + ' sec<span class="event-' + item.color + '" style="width:100%">' + item.dauer + ' sec</span></a>' +
                        '</li>' +
                        '</ul>' +
                        '</li>');
                }
                if (i % 2 == 0) {
                    //$(".planning-header ul").append('<li style="left:' + (lastp) + '%;">' + item.szeit + '</li>');
                }

                //lastp += percentage;

                tagOld = item.tag;
            });


        } else {


            cnt = 0;
            allTime = 0;
            $.each(data, function (i, item) {
                allTime += parseInt(item.dauer);
                cnt++;
            });

            $('#month_planning').find('.message li').html(cnt + " Einträge");
            //$('.title-plan').html('<a href="http://213.183.95.102/vlc/'+data[0].insel+'/werbeinsel/'+data[0].tag+'/'+data[0].insel+'.mpg" target="insel">Werbeinsel: '+data[0].insel+'</a>');

            pps = 95 / allTime;
            lastp = 2;

            $.each(data, function (i, item) {

		srv = getMediaSRV(item.tag.replace("-", "").replace("-", ""));

                percentage = pps * item.dauer;
                //$pic = "http://213.183.95.102/vlc/".$sender."/werbeclip/".$tag."/".str_replace (".mpg",".png",$row['play']);
                /*if(data.length<6){
                 $('.grid').append('<li style="width: '+100/data.length+'%;max-width:300px;float:left;"><img src="http://213.183.95.102/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '"></li>');
                 }else {
                 $('.grid').append('<li><img src="http://213.183.95.102/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '"></li>');
                 }*/
                $('.grid').append('<li class="' + item.class + '" data-vclip-detail-id="' + item.vclip_detail_id + '"><img src="https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '">' +
                    '<ul class="grid-actions">' +
                    '<li><a href="#" class="play-small" class="with-tip"><img src="images/icons/fugue/control.png" width="16" height="16"></a></li>' +
                    '<li><a href="#" class="edit" class="with-tip"><img src="images/icons/fugue/pencil.png" width="16" height="16"></a></li>' +
                    '<li><a href="#" class="info" class="with-tip"></a></li>' +
                    '<li class="with-tip" title="<span style=\'font-size:14px;\'>'+ item.cc +'</span>">' + item.ccT + '</li>' +

                    '</ul>' +
                    '</li>');
                if (item.cc > 1) {
                    $('.planning').append('<li ' + (i == 0 ? 'class="active"' : '') + ' data-id="' + i + '"><a class="clip-name with-tip" title="<span style=\'font-size:13px\'>' + item.tag + '</span></br><img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="winsel/sender/' + item.sender + '/datum/' + item.tag + '/block/' + item.block + '"><!--<img src="images/icons/fugue/user-red.png" width="16" height="16">-->Clip ' + (i < 9 ? '0' + (i + 1) : i + 1) + " [" + item.szeit + '] ' + item.sender + '</a>' +
                        '<ul><li style="left:' + lastp + '%;width:' + percentage + '%;min-width:65px;">' +
                        '<a class="with-tip" title="<img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="#">' + item.dauer + ' sec<span class="event-' + item.color + '" style="width:calc(100% - 20px)">' + item.dauer + ' sec</span><div style="display:block;top:0;position:absolute;left:calc(100% - 22px);width:20px;text-align:center;">' + item.ccT + '</div></a>' +
                        '</li>' +
                        '</ul>' +
                        '</li>');
                } else {
                    $('.planning').append('<li ' + (i == 0 ? 'class="active"' : '') + ' data-id="' + i + '"><a class="clip-name with-tip" title="<span style=\'font-size:13px\'>' + item.tag + '</span></br><img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="winsel/sender/' + item.sender + '/datum/' + item.tag + '/block/' + item.block + '"><!--<img src="images/icons/fugue/user-red.png" width="16" height="16">-->Clip ' + (i < 9 ? '0' + (i + 1) : i + 1) + " [" + item.szeit + '] ' + item.sender + '</a>' +
                        '<ul><li style="left:' + lastp + '%;width:' + percentage + '%;min-width:65px;">' +
                        '<a class="with-tip" title="<img src=\'https://'+srv+'.anixa.tv/vlc/' + item.sender + '/werbeclip/' + item.tag.replace("-", "").replace("-", "") + '/' + item.play.replace(".mpg", ".png") + '\'></img>" data-id="' + i + '" href="#">' + item.dauer + ' sec<span class="event-' + item.color + '" style="width:100%">' + item.dauer + ' sec</span></a>' +
                        '</li>' +
                        '</ul>' +
                        '</li>');
                }
                if (i % 2 == 0) {
                    $(".planning-header ul").append('<li style="left:' + (lastp) + '%;">' + item.szeit + '</li>');
                }

                lastp += percentage;
            });
        }
    }
}

Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

function jsFunction(clear) {
    if (clear) {
        $('#block').find('option:selected').prop("selected", false)
    }
    var $winsel = $('#winsel');
    formRewrite($winsel);
    window.location = $winsel.attr('action');
    //$('#winsel').submit();
}

function pophidden() {
    $('#pop').hide();
}

function getcData(d) {
    var ar = d.split('-');
    aktuellData = ar;
    var key = '';
    var dt = getObjects(cDaten, 'date', cDatum + ' ' + ar[0], cDatum + ' ' + ar[1]);
    for (var i = 0; i < pSet.length; i++) {
        if (pSet[i][1] == ar[2]) {
            key = pSet[i][0];
            break;
        }
    }

    var zeit, out = '';
    var daten = [];

    for (var i in dt) {
        if (!dt.hasOwnProperty(i)) continue;
        if (dt[i][key]) {
            daten.push(dt[i]);
            zeit = dt[i]['date'].split(' ')[1];

            out += '<li class="' + (zeit == ar[3] ? 'ligr' : '') + '">' + zeit + ' Uhr - Besucher: ' + dt[i][key] + '</li>';
        }
    }

    ch = AmCharts.makeChart('detailchart', {
            'type': 'serial',
            'path': 'https://database.smart-tv-data.de/pub/smdata/amcharts/',
            'categoryField': 'date',
            'dataDateFormat': 'YYYY-MM-DD HH:NN',
            'categoryAxis': {
                'minPeriod': 'mm',
                'parseDates': true
            },
            'chartCursor': {
                'categoryBalloonDateFormat': 'JJ:NN'
            },
            'trendLines': [],
            'graphs': [
                {
                    'balloonText': 'Besucher:[[value]]',
                    'bullet': 'round',
                    'id': 'AmGraph-1',
                    'title': 'graph 1',
                    'type': 'smoothedLine',
                    'valueField': key
                }
            ],
            'guides': [],
            'allLabels': [],
            'balloon': {},
            'dataProvider': daten
        }
    );

    var ret = '<p><strong>Besucher von ' + ar[2] + ' ab ' + ar[0] + ' bis ' + ar[1] +
        '</strong></p><ul class="det">' + out + '</ul><div style="clear:both;"><a href="#" onclick="getDeData();return false">Besucher Details Livesearch!</a></div>';

    return ret;
}

function getDeData() {

    //console.log(aktuellData);

    var req = new XMLHttpRequest();
    req.open('GET', '../../guiWerbeblockDetail.php?datum=' + cDatum + '&motiv=' + aktuellData[2] + '&von=' + aktuellData[0] + '&bis=' + aktuellData[1], true);
    req.onreadystatechange = function (e) {
        if (req.readyState == 4 && req.status == 200) {
            $('.chart-info').html(req.responseText);
        }
    };
    req.send(null);
}

function getObjects(obj, key, val, vax) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val, vax));
        } else if ((i == key && obj[key] >= val) && (i == key && obj[key] <= vax)) {

            objects.push(obj);
        }
    }
    return objects;
}

function showpage(key) {
    var config = {
        'client_id': '275326982814-5e15opf196f82ete7hsuh7f32jj0j9id.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/analytics.readonly'
    };
    gapi.auth.authorize(config, function () {
        console.log('login complete');
        var tk = gapi.auth.getToken();

        var req = new XMLHttpRequest();
        req.open('GET', 'https://www.media-theia.de/oauth.php?tk=' + tk['access_token'] + (key == null ? '' : '&key=' + escape(key) ), true);
        req.onreadystatechange = function (e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (key == null) document.getElementById('pageinfo').innerHTML = req.responseText;
                    console.log('done');
                } else if (req.status == 400) {
                    console.log('There was an error processing the token.')
                } else {
                    console.log('something else other than 200 was returned')
                }
            }
        };
        req.send(null);
    });
}

function formRewrite(form) {
    base = $(form).attr('action');
    actionUrl = $(form).attr('action');
    params = $(form).serializeArray();
    checkboxes = $(form).find('input[type=checkbox]:not(:checked)');
    $(checkboxes).each(function(h, check){
        "use strict";
        params.push({name: $(check).attr('name'), value:"0"})
    });
    console.log(params);
    $(params).each(function (i, param) {
        console.log(param);
        if (param.value != "") {
            actionUrl = actionUrl + param.name + "/" + param.value + "/";
        }

        if (param.name == "search" && param.value != "") {
            actionUrl = base + param.name + "/" + param.value + "/";
            return;
        }
    });

    $(form).attr('action', document.getElementsByTagName('base')[0].href + actionUrl);
    //sleep(100)
}

function toHHMMSS(sec) {
    var sec_num = parseInt(sec, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
}

function toAbsURL(s) {
    var l = location, h, p, f, i;
    if (/^\w+:/.test(s)) {
        return s;
    }
    h = l.protocol + '//' + l.host + (l.port != '' ? (':' + l.port) : '');
    if (s.indexOf('/') == 0) {
        return h + s;
    }
    p = l.pathname.replace(/\/[^\/]*$/, '');
    f = s.match(/\.\.\//g);
    if (f) {
        s = s.substring(f.length * 3);
        for (i = f.length; i--;) {
            p = p.substring(0, p.lastIndexOf('/'));
        }
    }
    return h + p + '/' + s;
}

function showLoader() {
    $('#loader').fakeLoader({
        timeToHide: 120000,
        zIndex: "999999",
        spinner: "spinner2",
        bgColor: "#666666"
    });
}

function getMediaSRV(t){
 if(t >20160531) return('media2')
 return('media')
}

function showAnalytics(){
 var ac= $( "#gaid option:selected" ).val();
 var dt= $( "#datum-noauto" ).val();
 if(ac=='') return( alert('Bitte wählen Sie eine Account') );
 if(dt=='') return( alert('Bitte wählen Sie einen Termin') );
 url = '/native/js.php?fn='+dt+'_'+ac+'.json';
 win = window.open(url,'Analytics', "scrollbars=yes, width=600, height=400");
 win.focus();
}

function accSwitch(){

	var refId = $( "#mediaacc" ).val();
	if(refId >0){
	 $.post("index.php", {ajax: 1, fnc: 'updateACCData', accID: refId}).done(function (jdata) {
		data = JSON.parse(jdata);
		alert(data.msg);
		location.reload();

	 });
	}

}

function senderListe() {

	 $.post("index.php", {ajax: 1, fnc: 'getAllSender'}).done(function (jdata) {
		data = JSON.parse(jdata);
		$('#sat').html('');
		$('#kabel').html('');
		var e=0;
		$.each(data, function (i, item) {
		 if(item.type==0){
			$('#sat').append('<li><a href="/winsel/sender/'+item.sd+'" class="document-image" target="werbeinsel"><span>'+item.epg+'</span></a></li>');

		 }else{
			$('#kabel').append('<li><a href="/winsel/sender/'+item.sd+'" class="document-image" target="werbeinsel"><span>'+item.epg+'</span></a></li>');
		
		 }
		 e++;
		 $('#sd_icon').append('<li><a href="#" onclick="openNow(\''+item.sd+'\');return false"><span><img src="images/sender/n/'+item.sd+'.png" class="thumb" height="45"></span>'+item.epg+'</a></li>');

		});
		$('#sinfo').append('<li>'+e+' Sender aktiv</li>');

	 });
};


function pl(s,f){
	var url= '//media.anixa.tv/vlc/'+s+'/recall/'+f;
        $.fancybox.open({
            openEffect: 'fade',
            closeEffect: 'fade',
            nextEffect: 'none',
            prevEffect: 'none',
            autoFit: true,
            autoSize: false,
            height: 'auto',
            width: 800,
            padding: 0,
            margin: 50,
            content: "<video id=\"video\" width=\"800\" controls autoplay>" +
            "<source src=\""+url+"\" type=\"video/mp4\">" +
            "</source>" +
            "</video>"
        });
}
