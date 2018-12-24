
/*
Heroku observations:   
    case sensitive references to files
    idles after around 45minutes of inactivity, the next call restarts it again.
    
*/

// ==== logic for calling weather service ====
const request = require('request');



var apiKey = process.env.OPENWEATHER_KEY;
var pollDuration = 1000*60*60; //per hour
var intermPollDuration = 1000*60*5 // 5min
var appPort = process.env.PORT || 3000;

function getWeather(city = 'sydney'){
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    
    request(url, function (err, response, body) {
        if(err){
            console.log('error:', err);
        } else {
            let weather = JSON.parse(body)
            let message = `It's ${weather.main.temp/10} degrees in ${weather.name}!`;
            console.log(message);
        }
    });
}

// ==== adding logic for poller ====
const Poller = require('./poller');

// Set 1s timeout between polls
// note: this is previous request + processing time + timeout
let poller = new Poller(pollDuration); 

// Wait till the timeout sent our event to the EventEmitter
poller.onPoll(() => {
    getWeather('sydney');
    poller.poll(); // Go for the next poll
});

// Initial start
console.log("================ starting weather poller ================");
poller.poll();

let intermPoller = new Poller(intermPollDuration);
intermPoller.onPoll(() => {
    let url = `http://node-weather-poll.herokuapp.com/status`;
    console.log("----- interm Poller ran ", url);
    request(url, function (err, response, body) {
        if(err){
            console.log('error:', err);
        } else {
            console.log("call resp: " + body);
        }
    });
    intermPoller.poll();
});
console.log("-- starting interm poll");
intermPoller.poll();


// ==== adding rest service - so heroku port gets binded ====
var express = require("express");
var app = express();
app.listen(appPort, () => {
    console.log("Server running on port 3000");
});
app.get("/status", (req, res, next) => {
    res.json({'status': 'up'});
});