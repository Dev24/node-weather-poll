const request = require('request');

var apiKey = process.env.OPENWEATHER_KEY;
var pollDuration = 1000*60; //per minute

function getWeather(city = 'sydney'){
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    console.log("calling " + url);
    request(url, function (err, response, body) {
        if(err){
        console.log('error:', error);
        } else {
        let weather = JSON.parse(body)
        let message = `${Date()}: It's ${weather.main.temp/10} degrees in ${weather.name}!`;
        console.log(message);
        }
    });
}


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

