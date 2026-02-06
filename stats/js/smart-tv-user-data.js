/**
 * Created by Anixe4K on 08.12.2015.
 */


$(document).ready(function(){
    "use strict";

    $('.smart-user ul.grid > li').click(function(){
        $(this).toggleClass('selected');
    });

    $('.smart-user .select-all').click(function(){
        $('.smart-user ul.grid > li').each(function(){
            $(this).addClass('selected');
        })
    });

    $('.smart-user .deselect-all').click(function(){
        $('.smart-user ul.grid > li').each(function(){
            $(this).removeClass('selected');
        })
    });

    $('.smart-user .send').click(function(){
        var smartids="";
        $('.smart-user ul.grid > li.selected').each(function(){
            smartids += $(this).data('smart-id')+",";
        });



        //console.log(smartids.substr(0,smartids.length-1));
        $.post('https://hbbtv01p.anixe.net/pub/common/event.php',{sd:$('#sender').val(),ids:smartids.substr(0,smartids.length-1),ms:$('.adv-text').val()});

    });
});