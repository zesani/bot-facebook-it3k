var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var firebase = require('firebase')

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
var config = {
  apiKey: 'AIzaSyCvfNNe0e6ugHtx7vcvkguZpChxHaZmH84',
  authDomain: 'it3k-87537.firebaseapp.com',
  databaseURL: 'https://it3k-87537.firebaseio.com',
  storageBucket: 'it3k-87537.appspot.com',
  messagingSenderId: '71330528993'
}
firebase.initializeApp(config)

app.get('/webhook', function (req, res) {
  var key = 'EAAD98d4jaMABALd9uZAFMbllQWZCOwZBtjPEkHcZCMrk050ZAjgsTZBIgsprI41nXR8XomBMCUPnhcDQZCMz1Rlyhaz0Vjq1JxlGuV4qcbPu38wpIZCDErky0PupzFJkpk7oqR7uoJaNivR4llCJ8MNLnZA4unhWnZBWkLMabNfxuKOQZDZD'
  if (req.query['hub.verify_token'] === key) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
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
    res.sendStatus(200)
  }
})
function receivedMessage (event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = event.timestamp
  var message = event.message

  console.log('Received message for user %d and page %d at %d with message:',
    senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))
  var messageId = message.mid
  var messageText = message.text
  var messageAttachments = message.attachments

  if (messageText) {
    if (messageText === 'test') {
      sendTextMessage(senderID, senderID)
    }
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
function sendGenericMessage (recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI (messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAD98d4jaMABALd9uZAFMbllQWZCOwZBtjPEkHcZCMrk050ZAjgsTZBIgsprI41nXR8XomBMCUPnhcDQZCMz1Rlyhaz0Vjq1JxlGuV4qcbPu38wpIZCDErky0PupzFJkpk7oqR7uoJaNivR4llCJ8MNLnZA4unhWnZBWkLMabNfxuKOQZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var recipientId = body.recipient_id
      var messageId = body.message_id

      console.log('Successfully sent generic message with id %s to recipient %s',
        messageId, recipientId)
    } else {
      console.error('Unable to send message.')
      console.error(response)
      console.error(error)
    }
  })
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
