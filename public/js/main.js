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
        path: 'M-25,-35.25 L25,-35.25 L25,-9.48728814 L-25,-9.48728814 L-25,-35.25 Z M0.338983051,0.00423728814 L-5.08474576,-9.48728814 L5.76271186,-9.48728814 L0.338983051,0.00423728814 Z',
        fillColor: color,
        fillOpacity: 1,
        scale: 1.1,
        strokeWeight: 0
      },
      labelAnchor: new google.maps.Point(25, 34),
      labelContent: labelContent
    })
  }

  var spacesAvailable = parseInt(stationObject.spacesAvailable)
  var bikesAvailable = parseInt(stationObject.bikesAvailable)
  var totalSpaces = spacesAvailable + bikesAvailable
  createStationMarker('#FCBC19', '<div class="count">' + bikesAvailable + ' / ' + totalSpaces + '</div>')
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

function getCompassHeading() {
  if (event.webkitCompassHeading) {
    return event.webkitCompassHeading
  } else {
    return event.alpha
  }
}

function geolocationSuccess(position) {
  var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

  new google.maps.Marker({
    position: userLatLng,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillOpacity: 1,
      fillColor: '#40b3ff',
      strokeOpacity: 0
    },
    map: map
  })

  if (window.DeviceOrientationEvent) {
    function rotateHeadingIcon(eventData) {
      if (headingMarker) {
        var iconOptions = iconBaseOptions
        iconOptions.rotation = getCompassHeading()
        headingMarker.setIcon(iconOptions)
      } else if (event.webkitCompassHeading || event.alpha) {
        headingMarker = new google.maps.Marker({
          position: userLatLng,
          icon: iconBaseOptions,
          map: map
        })
      }
    }

    var iconBaseOptions = {
      path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
      scale: 4,
      fillOpacity: 1,
      fillColor: '#40b3ff',
      anchor: new google.maps.Point(0, 4),
      strokeOpacity: 0
    }

    var headingMarker = undefined
    window.addEventListener('deviceorientation', rotateHeadingIcon)
  }


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
