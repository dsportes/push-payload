const express = require('express')
const bodyParser = require('body-parser')
const webPush = require("web-push")

const app = express()

/*
const keys = webPush.generateVAPIDKeys();
const VAPID_PUBLIC_KEY = keys.publicKey
const VAPID_PRIVATE_KEY = keys.privateKey
*/
const VAPID_PRIVATE_KEY = "FiRYdJ-p3UOI4CHGItM0Td9hfkc_AhJqbyz2CCw8J-M"
const VAPID_PUBLIC_KEY = "BC8J60JGGoZRHWJDrSbRih-0qi4Ug0LPbYsnft668oH56hqApUR0piwzZ_fsr0qGrkbOYSJ0lX1hPRTawQE88Ew"

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  "https://example.com/",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

app.use(bodyParser.json())

app.use((req, res, next) => { // force SSL
  const host = req.get('Host')
  const localhost = 'localhost'

  if (host.substring(0, localhost.length) !== localhost) {
    // https://developer.mozilla.org/en-US/docs/Web/Security/HTTP_strict_transport_security
    res.header('Strict-Transport-Security', 'max-age=15768000')
    // https://github.com/rangle/force-ssl-heroku/blob/master/force-ssl-heroku.js
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + host + req.url)
    }
  }
  return next()
})

app.use((req, res, next) => {
  // http://enable-cors.org/server_expressjs.html
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
  next();
})

app.use((req, res, next) => {
  // https://github.com/mozilla/serviceworker-cookbook/issues/201
  const file = req.url.split('/').pop()
  if (file === 'service-worker.js' || file === 'worker.js') {
    res.header('Cache-control', 'public, max-age=0');
  }
  next()
})

app.use(express.static('./dist'));

// app.get("/vapidPublicKey", (req, res) => { res.send(VAPID_PUBLIC_KEY) })

app.post("/register", function (req, res) {
  // A real world application would store the subscription info.
  const subscription = req.body.subscription
  res.sendStatus(201)
});

app.post("/sendNotification", function (req, res) {
  const subscription = req.body.subscription
  const payload = req.body.payload
  const options = { TTL: req.body.ttl, }

  setTimeout(async () => {
    try {
      await webPush.sendNotification(subscription, payload, options)
      res.sendStatus(201)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  }, req.body.delay * 1000)
})

const port = process.env.PORT || 3003
app.listen(port, (err) => {
  if (err) console.error('server.js : HTTP error = ' + e.message + '\n' + e.stack)
  else console.log('HTTP_SERVER écoute [' + port +']')
})
