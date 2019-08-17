const path = require('path');
const ENV_PATH = path.join(__dirname, '.env');
require('dotenv').config({path: ENV_PATH});
var fs = require('fs');
var express = require('express');
var googlehome = require('google-home-notifier');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 1234;
let Voicetext = require('voicetext');
var voice = new Voicetext(process.env.VOICETEXT_APIKEY);

let deviceName = 'Google Home';
googlehome.device(deviceName, 'ja');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let serverUrl = process.env.SERVERURL;

app.use(express.static(path.join(__dirname, '/public')));

app.post('/', (req, res) => {
  try {
    let text = (req.body.text === '' ? 'ガハハハハハ' : req.body.text);
    let speaker = (req.body.speaker === '' ? voice.SPEAKER.HIKARI : req.body.speaker);
    let speed = (req.body.speed === '' ? 100 : req.body.speed);
    let pitch = (req.body.pitch ==='' ? 100 : req.body.pitch);
    voice
    .speaker(speaker)
    .format(voice.FORMAT.MP3)
    .emotion(voice.EMOTION.HAPINESS)
    .speed(speed)
    .pitch(pitch)
    .speak(text, (err, buf) => {
      if(err)console.error(err);
      fs.writeFile(__dirname + '/public/text.mp3', buf, 'binary', (err) => {
        if(err)console.log(err);
        googlehome.play(serverUrl + '/text.mp3', () => {});
      });
    });
    res.status(200);
    res.end();
  } catch(err) {
    let text = "何かしらエラーが発生しました。";
    console.error(err);
    res.status(500);
    res.send(err);
    googlehome.notify(text, () => {});
  }
});

app.listen(serverPort);

