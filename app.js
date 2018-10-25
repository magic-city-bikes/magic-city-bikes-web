const _ = require('lodash')
const express = require('express')
const compress = require('compression')
const Lokka = require('lokka').Lokka
const Transport = require('lokka-transport-http').Transport
const helmet = require('helmet')
const fetch = require('node-fetch')
const moment = require('moment')
const xmlJS = require('xml-js')

let stationCaches = {}
let weatherCache = {temperature: 10.0, rain: 0.0}

const app = express()
const HSL_GRAPHQL_URL = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'
const FOLI_REST_URL = 'http://data.foli.fi/citybike'
const FMI_API_URL_BASE = 'http://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::timevaluepair&fmisid=101004&parameters=t2m,r_1h&starttime='

const graphQLClient = new Lokka({
  transport: new Transport(HSL_GRAPHQL_URL)
})

app.use(compress())
app.use(helmet())
app.use(express.static('./public', {maxAge: 30 * 60 * 1000}))

app.get('/api/stations', (req, res) => {
  setWeatherCache()
  res.setHeader('Cache-Control', 'public, max-age=5')
  res.json({
    bikeRentalStations: _.flatMap(Object.values(stationCaches), cache => cache.bikeRentalStations)
  })
})

function setWeatherCache() {
  fetch(FMI_API_URL_BASE + moment().subtract(1, 'hours').utc().format())
    .then(res => res.text())
    .then(data => {
      data = xmlJS.xml2js(data, {compact: true, spaces: 4})
      let temp = data['wfs:FeatureCollection']['wfs:member'][0]['omso:PointTimeSeriesObservation']['om:result']['wml2:MeasurementTimeseries']['wml2:point']
      let rain = data['wfs:FeatureCollection']['wfs:member'][1]['omso:PointTimeSeriesObservation']['om:result']['wml2:MeasurementTimeseries']['wml2:point']
      let avgTemp = 0.0
      let i = 0
      temp.forEach(t => {
        if (!isNaN(t['wml2:MeasurementTVP']['wml2:value']._text)) {
          i++
          avgTemp += parseFloat(t['wml2:MeasurementTVP']['wml2:value']._text)
        }
      })
      avgTemp = (i !== 0) ? avgTemp / i : 10.0
      let avgRain = 0.0
      i = 0
      rain.forEach(r => {
        if (!isNaN(r['wml2:MeasurementTVP']['wml2:value']._text)) {
          i++
          avgRain += parseFloat(r['wml2:MeasurementTVP']['wml2:value']._text)
        }
      })

      avgRain = (i !== 0) ? avgRain / i : 0.0
      weatherCache = {temperature: avgTemp, rain: avgRain}
    }).catch(err => {
      console.error(err);
    })
}

function refreshStationCacheFoli() {
  fetch(FOLI_REST_URL)
    .then(res => res.json())
    .then(data => Object.values(data.racks))
    .then(racks => ({
        bikeRentalStations: racks.map(rack => ({
          id: rack.id,
          name: rack.name,
          lat: rack.lat,
          lon: rack.lon,
          bikesAvailable: rack.bikes_avail,
          spacesAvailable: rack.slots_avail
        }))
      })
    ).then(result => {
      stationCaches.foli = result
    })
}

function refreshStationCacheHSL() {
  graphQLClient.query(`
    {
      bikeRentalStations {
        id,
        name,
        lat,
        lon,
        bikesAvailable,
        spacesAvailable
      }
    }
  `).then(result => {
    stationCaches.hsl = result
  })
}

function refreshStationCaches() {
  // Update caches independently in order to isolate possible API hickups.
  refreshStationCacheFoli()
  refreshStationCacheHSL()
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Kaupunkifillarit.fi listening on *:${port}`)
  setInterval(refreshStationCaches, 5 * 1000)
  refreshStationCaches()
})
