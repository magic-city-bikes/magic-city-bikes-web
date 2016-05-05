var map = null

function initializeGoogleMaps() {
  var styles = [{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#d3d3d3"}]},{"featureType":"transit","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#b3b3b3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":1.8}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#d7d7d7"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ebebeb"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#a7a7a7"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#efefef"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#696969"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#737373"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#d6d6d6"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#dadada"}]}]

  var defaultUserSettings = {
    lat: 60.1729721445,
    lng: 24.9399946767,
    zoom: 15
  }

  var mapOptions = {
    center: new google.maps.LatLng(defaultUserSettings.lat, defaultUserSettings.lng),
    zoom: defaultUserSettings.zoom,
    disableDefaultUI: true,
    zoomControl: false,
    styles: styles
  }

  var mapElement = document.getElementById('map-canvas')
  map = new google.maps.Map(mapElement, mapOptions)

  getUserGPSLocation()
}


function createStation(stationObject) {
  function createStationMarker(color, labelContent) {
    new MarkerWithLabel({
      position: new google.maps.LatLng(stationObject.lat, stationObject.lon),
      map: map,
      icon: {
        path: 'M10,0 C4.47743652,0 -5.68434189e-14,4.47712722 -5.68434189e-14,10 C-5.68434189e-14,19.2282948 10,28.809811 10,28.809811 C10,28.809811 20,18.2592558 20,9.9996907 C20,4.47712722 15.5225635,0 10,0',
        fillColor: color,
        anchor: new google.maps.Point(10, 28),
        fillOpacity: 1,
        scale: 1.2,
        strokeWeight: 0
      },
      labelClass: 'spaces',
      labelAnchor: new google.maps.Point(15, 30),
      labelContent: labelContent
    })
  }

  var spacesAvailable = parseInt(stationObject.spacesAvailable)
  var bikesAvailable = parseInt(stationObject.bikesAvailable)

  createStationMarker('#FCBC19', '<div class="count bikes-available">' + bikesAvailable + '</div>')
  createStationMarker('#FCBC19', '<div class="count spaces-available hidden">' + spacesAvailable + '</div>')
}

function getJSON(url, callback) {
  var request = new XMLHttpRequest()
  request.open('GET', url, true)

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        var data = JSON.parse(this.responseText)
        callback(data)
      }
    }
  }

  request.send()
  request = null
}

function outsideOperationTheatre(position) {
  var theatreWestSouthPoint = {
    lat: 60.152162,
    lng: 24.910469
  }
  var theatreEastNorthPoint = {
    lat: 60.191951,
    lng: 24.985142
  }

  var latMin = theatreWestSouthPoint.lat
  var latMax = theatreEastNorthPoint.lat
  var lngMin = theatreWestSouthPoint.lng
  var lngMax = theatreEastNorthPoint.lng

  var latInside = position.coords.latitude <= latMax && position.coords.latitude >= latMin
  var lngInside = position.coords.longitude <= lngMax && position.coords.longitude >= lngMin

  return !latInside && !lngInside
}

function geolocationSuccess(position) {
  var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

  new google.maps.Marker({
    position: userLatLng,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillOpacity: 0.9,
      fillColor: '#40b3ff',
      strokeOpacity: 0
    },
    map: map
  })

  if (!outsideOperationTheatre(position)) {
    map.panTo(userLatLng)
  }
}

function getUserGPSLocation() {
  var geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 60 * 1000,
    maximumAge: 30
  }

  navigator.geolocation.getCurrentPosition(geolocationSuccess, function(){}, geolocationOptions)
}

function toggleMapMode(mode) {
  var modeIsRent = mode === 'rent-button'
  var toBeHidden = modeIsRent ? '.spaces-available' : '.bikes-available'
  var toBeShown = modeIsRent ? '.bikes-available' : '.spaces-available'

  var toBeHiddenElements = document.querySelectorAll(toBeHidden)
  var toBeShownElements = document.querySelectorAll(toBeShown)

  for(var i = 0; i < toBeHiddenElements.length; i++){
    toBeHiddenElements[i].classList.add('hidden')
  }
  for(var i = 0; i < toBeShownElements.length; i++){
    toBeShownElements[i].classList.remove('hidden')
  }
}

function toggleMode() {
  function toggleButtonStates(element) {
    var buttons = document.querySelectorAll('.mode-button')

    for(var i = 0; i < buttons.length; i++){
      buttons[i].classList.remove('button-active')
    }

    element.classList.add('button-active')
  }


  var isActiveMode = this.classList.contains('button-active')
  if (!isActiveMode) {
    var mode = this.getAttribute('id')
    toggleButtonStates(this) // cleanup this
    toggleMapMode(mode)
  }
}

function addButtonListeners() {
  var rentButton = document.getElementById("rent-button")
  var returnButton = document.getElementById("return-button")
  rentButton.addEventListener("click", toggleMode, false)
  returnButton.addEventListener("click", toggleMode, false)
}

function initializeApp() {
  initializeGoogleMaps()
  getJSON('/api/stations', function(data) {
    // handle no data from server
    // joku intervalli toho datan refreshii 60s hyvä
    _.map(data.bikeRentalStations, createStation)
  })
  addButtonListeners()
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}
ready(initializeApp)


