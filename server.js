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
const exec = require('child_process').exec;

// let deviceName = 'Google Nest mini';
// googlehome.device(deviceName, 'ja');
googlehome.ip(process.env.GOOGLEHOME_IP, 'ja');

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
    let emotion = (req.body.emotion ==='' ? voice.EMOTION.NONE : req.body.emotion);
    let emotion_level = (req.body.emotion_level ==='' ? voice.EMOTION_LEVEL.NONE : req.body.emotion_level);
    if (speaker !== voice.SPEAKER.SHOW) {
      voice.emotion(emotion)
      .emotion_level(emotion_level);
    }
    voice
//    .format(voice.FORMAT.MP3)
    .speaker(speaker)
    .speed(speed)
    .pitch(pitch)
    .speak(text, (err, buf) => {
      if(err)console.error(err);
      fs.writeFile(__dirname + '/public/text.wav', buf, 'binary', (err) => {
        if(err)console.log(err);
        exec('/usr/bin/sox ' + __dirname + '/public/text.wav' + ' ' + __dirname + '/public/delay_text.wav' + ' delay 0.7', (err, stdout, stderr) => {
          if(err)console.log(err);
          googlehome.play(serverUrl + '/delay_text.wav', () => {});
        });
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

