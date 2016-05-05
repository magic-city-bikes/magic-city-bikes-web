import _ from 'lodash'
import express from 'express'
import compress from 'compression'
import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
// import pg from 'pg'

var stationCache = null

const HSL_GRAPHQL_URL = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'
const app = express()
const client = new Lokka({
  transport: new Transport(HSL_GRAPHQL_URL)
})

app.disable('x-powered-by')
app.use(compress())
app.use(express.static('./public', {maxAge: 12 * 60 * 60 * 1000}))

app.get('/api/stations', (req, res) => {
  res.send(stationCache)
})

function refreshStationCache() {
  client.query(`
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
    // spacesavailable on kokonaismäärä, siit miinus
    setTimeout(refreshStationCache, 10 * 1000)
  })
}

// pg.defaults.ssl = true
// function saveStations() {
//   pg.connect(process.env.DATABASE_URL, function(err, client) {
//     if (err) throw err
//     console.log('Connected to postgres! Getting schemas...')

//     client
//       .query('SELECT table_schema,table_name FROM information_schema.tables')
//       .on('row', function(row) {
//         console.log(JSON.stringify(row))
//       })
//   })
// }

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Tsygät.fi listening on *:${port}`)
  refreshStationCache()
  // setInterval(saveStations, 10 * 1000)
})

