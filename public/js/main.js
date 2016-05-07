var map = null
var locationMarker = null
var headingMarker = null

var headingIconBaseOptions = {
  path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
  scale: 4,
  fillOpacity: 1,
  fillColor: '#40b3ff',
  anchor: new google.maps.Point(0, 4),
  strokeOpacity: 0
}

var locationIconBaseOptions = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 10,
  fillOpacity: 1,
  fillColor: '#40b3ff',
  strokeOpacity: 0
}

var defaultMapSettings = {
  lat: 60.1729721445,
  lng: 24.9399946767,
  zoom: 15
}

function initializeGoogleMaps() {
  var styles = [{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#d3d3d3"}]},{"featureType":"transit","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#b3b3b3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":1.8}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#d7d7d7"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ebebeb"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#a7a7a7"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#efefef"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#696969"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#737373"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#d6d6d6"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#dadada"}]}]

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
