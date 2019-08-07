
function initialize() {
    $("#nav-bar").hide();
    $('#alert-window').hide();
    watchShowIP();
    watchCustomIP();
    watchGoHome();
    watchHelpButton();
    $('#help-section').data('state', '0');
    $('#hero').data('state', '0');
    console.log('App loaded...')
}

// watches for click on "Show my IP" button
function watchShowIP() {
    $('#button-show-ip').click(function() {
        event.preventDefault();
        getIP();
        showHideNav();
        helpHide();
        $('#button-show-ip').hide();
        $('#button-custom-ip').hide();
        $('#ip-info').removeClass("hidden");
        $('#help-info').css({
            'color': 'rgba(255, 255, 255, 0.856)',
            'text-shadow': '1px 1px 1px rgb(75, 75, 75)',
        })
        $('#help-info a').css({
            'color': 'rgb(132, 179, 190)',
        })
        $('#help-section').css({
            'box-shadow': 'inset 0 0 15px rgba(255, 255, 255)',
            'background-color': 'rgba(95, 95, 95)',
        })
        $('#hero').data('state', '1');
    })
}

// watches for click on home button
function watchGoHome() {
    $('#nav-button').click(function() {
        goHome();
    })
}

function goHome() {
    location.reload();
}

// slides the home button into/out of view
function showHideNav() {
    $("#nav-bar").slideToggle( "slow", function() {
        // Animation complete.
      });
}

// watches for click on "Enter custom IP" button
function watchCustomIP() {
    $('#button-custom-ip').click(function() {
        event.preventDefault();
        watchCustomIPSubmit();
        $('#button-show-ip').hide();
        $('#button-custom-ip').hide();
        $('form').css({
            'transform': 'translate(0, -15px)',
        });
        $('form').removeClass("hidden");
        showHideNav();
    })
}

// watches for custom IP submit
function watchCustomIPSubmit() {
    $('#submit-ip').click(function() {
        event.preventDefault();
        let ipAddress = document.getElementById("input-custom-ip").value;
        if (validateIP(ipAddress) === true){
            helpHide();
            $('#custom-ip-label').html('Enter another IP:');
            $('#ip-info').removeClass("hidden");
            $('#custom-ip-form').css({
                'transform': 'translate(0, 1px)',
            })
            $('#custom-ip-form input').css({
                'height': '40px',
            })
            $('#custom-ip-form button').css({
                'height': '40px',
            })
            $('#submit-ip').css({
                'line-height': '.8',
            })
            $('#hero').data('state', '1');
            $('#help-info').css({
                'color': 'rgba(255, 255, 255, 0.856)',
                'text-shadow': '1px 1px 1px rgb(75, 75, 75)',
            })
            $('#help-info a').css({
                'color': 'rgb(132, 179, 190)',
            })
            $('#help-section').css({
                'box-shadow': 'inset 0 0 15px rgba(255, 255, 255)',
                'background-color': 'rgba(95, 95, 95)',
            })
            $('#input-custom-ip').val('');
            displayResults(ipAddress);
        }
        else {
            $('#input-custom-ip').val('');
            alertShow();
            console.log('INVALID IP ADDRESS');
        }
    })
}

// display alert window
function alertShow() {
    $('#alert-window').show(100);
    alertClose();
}

// closes alert window
function alertClose() {
    $('#alert-close').click(function() {
        $('#alert-window').hide();
    })
}

// checks if custom IP is valid
function validateIP(ipAddress) {
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipAddress.match(ipformat)) {
        return true;
    }
    else {
        return false;
    }
}

// fetches public IP from api.kwelo.com
function getIP() {
    fetch("https://api.kwelo.com/v1/network/ip-address/my?format=json")
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => makeIP(responseJson))
    .catch(err => {
      $('#ip-display').html(`Something went wrong.`);
    });
}

function makeIP(responseJson) {
    let ipAddress = responseJson.data.ip_address;
    displayResults(ipAddress);
}

// displays public IP
function displayResults(ipAddress) {
    $('#hero').css({
        'background-color': 'rgba(95, 95, 95, 0.822)',
        'border': '4px solid #67919B',
    }); 
    $('#ip-display').html(`${ipAddress}`);
    $('#ip-label').html('IP address: ');
    additionalInfo(ipAddress);
}

// fetches geolocation info with @param ipAddress from ipapi.com
function additionalInfo(ipAddress) {
    fetch(`http://api.ipapi.com/${ipAddress}?access_key=ac199051467c151c8af9e980ccd1ac8e`)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayAdditional(responseJson))
    .catch(err => {
      $('#ip-display').html(`Something went wrong.`);
    });
}

// displays geolocation info
function displayAdditional(responseJson) {
    if (responseJson.city == null) {
        $('#ip-info').hide();
        $('#city-state').html('location unknown');
        $('#country').html('');
        $('#zip').html('');
        $('#longitude').html('');
        $('#latitude').html('');
        $('#ip-info').show();
        nullMap();
    }
    else {
        $('#ip-info').hide();
        $('#city-state').html(responseJson.city + ', ' + responseJson.region_code);
        $('#country').html(`<strong>Country:</strong> `);
        $('#zip').html(`<strong>ZIP code:</strong> `);
        $('#longitude').html(`<strong>Longitude:</strong> `);
        $('#latitude').html(`<strong>Latitude:</strong> `);
        $('#country').append(responseJson.country_name);
        $('#zip').append(responseJson.zip);
        $('#longitude').append(responseJson.longitude);
        $('#latitude').append(responseJson.latitude);
        $('#ip-info').show();
        console.log('Public IP Address: ' + `${responseJson.ip}`);
        console.log('Location: ' + `${responseJson.city}` + ', ' + `${responseJson.region_code}` + ', ' + `${responseJson.country_name}`);
        let latitude = responseJson.latitude;
        let longitude = responseJson.longitude;
        makeMap(latitude, longitude);
    }
}

// fetches and displays static map from maps.googleapis.com
function makeMap(latitude, longitude) {
    let style = '&format=png&maptype=roadmap&style=feature:administrative%7Celement:labels.text%7Ccolor:0x5f5f5f&style=feature:administrative%7Celement:labels.text.stroke%7Ccolor:0xf3f3f3&style=feature:landscape%7Celement:geometry.fill%7Ccolor:0x9baf91&style=feature:poi%7Celement:labels.text%7Ccolor:0x5f5f5f&style=feature:poi%7Celement:labels.text.stroke%7Ccolor:0xe9e9e9&style=feature:road%7Celement:geometry.fill%7Ccolor:0x5f5f5f&style=feature:road%7Celement:labels.text%7Ccolor:0xffffff&style=feature:road%7Celement:labels.text.stroke%7Ccolor:0x5f5f5f&style=feature:road.highway%7Celement:geometry%7Ccolor:0x8c564a&style=feature:water%7Celement:geometry.fill%7Ccolor:0x67919b'
    $('body').css({
        'background-image': `radial-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), #9BAF9A), url('https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=10&size=3000x3000&scale=2&key=AIzaSyDnwktLifUmea_EUZFq_KpTA0n-vr1HFbc${style}')`,
        'background-size': 'cover',
        'background-position': 'center',
    });
    makeMapLink(latitude, longitude);
}

// removes map and map link in case of null responses
function nullMap() {
    $('body').css({
        'background-image': 'radial-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), #9BAF9A)',
        'background-size': 'cover',
        'background-position': 'center',
    });
    $('#map').html('');
}

// adds Google Maps link
function makeMapLink(latitude, longitude) {
    $('#map').html('');
    $('#map').append(`<p><a id="google-maps-link" href="http://maps.google.com/maps?z=12&t=m&q=${latitude},${longitude}" target="_blank">Google Maps</a></p>`);
}

// show/hides help info on '?' click
function watchHelpButton() {
    $('#help-button').click(function() {
        if ($('#help-section').data('state') === '0') {
            helpShow();
            // help section expanded
        } 
        else {
            helpHide();
            // help section minimized
        }
    })
}

function helpShow() {
    $('#help-section').animate({
        'width': '300px',
        'height': '220px',
    }, 200);
    $('#help-section').css({
        'cursor': 'default',
    });
    $('#help-button').html('?');
    $('#help-info').show(300);
    $('#help-section').data('state', '1');
}

function helpHide() {
    $('#help-section').animate({
        'width': '40px',
        'height': '40px',
    }, 200);
    $('#help-section').css({
        'cursor': 'pointer',
    });
    $('#help-info').hide();
    $('#help-button').html('?');
    $('#help-section').data('state', '0');
}

// initializes app
$(initialize);