var map = null
var locationMarker = null
var headingMarker = null

var locationBaseColor = '#333333'

var headingIconBaseOptions = {
  path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
  scale: 4,
  fillOpacity: 1,
  fillColor: locationBaseColor,
  anchor: new google.maps.Point(0, 4),
  strokeOpacity: 0
}

var locationIconBaseOptions = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 10,
  fillOpacity: 1,
  fillColor: locationBaseColor,
  strokeOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#ffffff"
}

var defaultMapSettings = {
  lat: 60.1729721445,
  lng: 24.9399946767,
  zoom: 15
}

function initializeGoogleMaps() {
  var styles = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}]

  var mapOptions = {
    center: new google.maps.LatLng(defaultMapSettings.lat, defaultMapSettings.lng),
    zoom: defaultMapSettings.zoom,
    disableDefaultUI: true,
    zoomControl: false,
    styles: styles
  }

  var mapElement = document.getElementById('map-canvas')
  map = new google.maps.Map(mapElement, mapOptions)

  getUserGPSLocation()
}

function createStation(stationObject) {
  function createStationMarker(bikesAvailable, totalSpaces) {
    new MarkerWithLabel({
      position: new google.maps.LatLng(stationObject.lat, stationObject.lon),
      map: map,
      icon: {
        path: 'M1.0658141e-14,-26.5 C-11.0283582,-26.5 -20,-17.1983066 -20,-5.7650073 C-20,7.61420438 -1.49104478,25.2218102 -0.703731343,25.8988175 L-0.00447761194,26.5 L0.697761194,25.9026861 C1.48656716,25.2334161 20,7.80686131 20,-5.7650073 C20,-17.1983066 11.0276119,-26.5 1.0658141e-14,-26.5 L1.0658141e-14,-26.5 Z',
        fillColor: '#FFFFFF',
        fillOpacity: 1,
        scale: 1.1,
        strokeWeight: 0
      },
      labelAnchor: new google.maps.Point(20, 15),
      labelContent: '<div class="count">' + bikesAvailable + ' / ' + totalSpaces + '</div>'
    })
  }

  var spacesAvailable = parseInt(stationObject.spacesAvailable)
  var bikesAvailable = parseInt(stationObject.bikesAvailable)
  var totalSpaces = spacesAvailable + bikesAvailable
  createStationMarker(bikesAvailable, totalSpaces)
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

function getCompassHeading() {
  if (event.webkitCompassHeading) {
    return event.webkitCompassHeading
  } else {
    return event.alpha
  }
}

function setupHeadingMarker(userLatLng) {
  function rotateHeadingIcon(eventData) {
    if (headingMarker) {
      var iconOptions = headingIconBaseOptions
      iconOptions.rotation = getCompassHeading()

      headingMarker.setOptions({
        position: userLatLng,
        icon: iconOptions
      })
    } else if (event.webkitCompassHeading || event.alpha) {
      headingMarker = new google.maps.Marker({
        position: userLatLng,
        icon: headingIconBaseOptions,
        map: map
      })
    }
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', rotateHeadingIcon)
  }
}

function createOrUpdateLocationMarker(userLatLng) {
  if (locationMarker) {
    locationMarker.setOptions({
      position: userLatLng,
      icon: locationIconBaseOptions
    })
  } else {
    locationMarker = new google.maps.Marker({
      position: userLatLng,
      icon: locationIconBaseOptions,
      map: map
    })
  }
}

function geolocationSuccess(position) {
  var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

  createOrUpdateLocationMarker(userLatLng)
  setupHeadingMarker(userLatLng)

  if (!outsideOperationTheatre(position)) {
    map.panTo(userLatLng)
  }
}

function getUserGPSLocation() {
  var geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 30 * 1000,
    maximumAge: 45,
    frequency: 1000
  }

  navigator.geolocation.watchPosition(geolocationSuccess, function(){}, geolocationOptions)
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

function initializeApp() {
  initializeGoogleMaps()
  getJSON('/api/stations', function(data) {
    // handle no data from server
    // joku intervalli toho datan refreshii 60s hyvä
    data.bikeRentalStations.map(createStation)
  })
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}
ready(initializeApp)
