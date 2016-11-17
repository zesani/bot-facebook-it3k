var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var cors = require('cors')

app.use(cors())
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function (req, res) {
  var key = 'EAAasXgVHJYYBAIrnZATFBPJIwf3Q9JjiGBaZBYWJftwHr0l9WwM7VeZC60OiA1juhgbsv25KZC98MMPnLeXlJbGZCJYqeEZC2VeRgWZAhXPAzbZCO3CPqudo4uSdr5XK4U5F2enS6iSyZBuTIpZCJmGwJc8uaN6AAqONxl60IgaWGT5AZDZD'
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === key) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
})

app.post('/webhook', function (req, res) {
  var data = req.body
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      var pageID = entry.id
      var timeOfEvent = entry.time
      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        if (event.message) {
          receivedMessage(event)
        } else {
          console.log('Webhook received unknown event: ', event)
        }
      })
    })

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200)
  }
})

function receivedMessage (event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log('Message data: ', event.message)
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = event.timestamp
  var message = event.message

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  var messageId = message.mid

  var messageText = message.text
  var messageAttachments = message.attachments

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID)
        break
      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received')
  }
}

app.get('/', function (req, res) {
  res.send('Hello')
})
app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
