jQuery.fn.reldata = function () {
    // var data = $(this).reldata();
    var rel = jQuery(this).attr('rel');
    if (rel !== undefined) {
        try {
            var relData = eval('(' + rel + ')');
            return relData;
        } catch (err) {}
    }
    return false;
};

$(document).ready(function () {

    function reload_captcha(captcha) {
        // Reload captcha
        if ($('#' + captcha).length != 0) {
            $('#' + captcha).attr({src: '/f/i/ajax-loader.gif', width: '85', height: '35'});
            unix_time_stamp = new Date().getTime();
            $('#' + captcha).attr('src', '/captcha/' + $('#' + captcha).attr('rel') + '.jpeg?' + unix_time_stamp);
        }
    }

    $('#tracking').submit(function (event) {
        lang = $('input[name="lang"]').val();
        $.ajax({
            url: '/' + lang + '/tracking.json',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            beforeSend: function () {
                $('#map_canvas').html('');
                $('button[type="submit"]').addClass('disabled').attr('disabled', 'disabled');
                $('#response').html('<p class="text-center"><img src="/f/i/ajax-loader.gif" alt="Loading..."></p>');
            },
            success: function (data) {
                reload_captcha('captcha');             
                if (data.success) {
                    $('#response').html(data.response);
                    if (data.callback) {
                        var directionDisplay;
                        var directionsService = new google.maps.DirectionsService();
                        var map;
                        directionsDisplay = new google.maps.DirectionsRenderer();
                        var center_map = new google.maps.LatLng();
                        var myOptions = {
                            zoom: 12,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            center: center_map
                        }
                        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                        directionsDisplay.setMap(map);
                        var start = data.callback.start;
                        var end = data.callback.end;
                        var request = {
                            origin: start,
                            destination: end,
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        directionsService.route(request, function (response, status) {
                            //console.log(status);
                            if (status == google.maps.DirectionsStatus.OK) {
                                directionsDisplay.setDirections(response);
                            }
                        });
                        $('#map_canvas').show();
                    }
                }
                else {
                    $('#map_canvas').hide();

                    if (lang == 'ru') var attn = 'Внимание!';
                    else if (lang == 'uk') var attn = 'Увага!';
                    else if (lang == 'en') var attn = 'Attention!';
                    $('#response').html('<div class="bs-callout bs-callout-danger"><button class="close" data-dismiss="alert" href="#" aria-hidden="true">&times;</button><h4>' + attn + '</h4><p>' + data.response + '</p></div>').hide();
                }
                $('#response').fadeIn();
            },
            complete: function () {
                $('button[type="submit"]').removeClass('disabled').removeAttr('disabled');
            }
        });
        event.preventDefault();
    });

    $('#tracking').on('click', '#captcha', function (event) {
        reload_captcha('captcha');
    });
});