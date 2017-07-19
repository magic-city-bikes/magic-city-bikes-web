const _ = require('lodash')
const express = require('express')
const compress = require('compression')
const Lokka = require('lokka').Lokka
const Transport = require('lokka-transport-http').Transport
const helmet = require('helmet')
const MongoClient = require('mongodb').MongoClient

var stationCache = null
var database = null

const HSL_GRAPHQL_URL = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'
const app = express()
const graphQLClient = new Lokka({
  transport: new Transport(HSL_GRAPHQL_URL)
})

app.use(compress())
app.use(helmet())
app.use(express.static('./public', {maxAge: 30 * 60 * 1000}))

app.get('/api/stations', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=10')
  res.send(stationCache)
})

function refreshStationCache() {
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
    stationCache = result
  })
}

function saveStations() {
  if (stationCache) {
    const stationsWithTimestamp = _.extend(
      {},
      stationCache,
      {
        timestamp: new Date().getTime()
      }
    )
    database.collection('stations').insertOne(stationsWithTimestamp, (err, result) => {})
  }
}

function startStationSaving() {
  if (process.env.MONGODB_URI) {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (!err) {
        database = db
        console.log("Connected to MongoDB")
        setInterval(saveStations, 60 * 1000)
      } else {
        console.error(err)
      }
    })
  }
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Kaupunkifillarit.fi listening on *:${port}`)
  setInterval(refreshStationCache, 10 * 1000)
  refreshStationCache()
  startStationSaving()
})

