'use strict';
const express = require('express'); // npm i express
require('dotenv').config(); // npm i dotenv
// CORS: Cross Origin Resource Sharing -> for giving the permission for who(clients) can touch my server oe send requests to my server
const cors = require('cors'); // npm i cors
const server = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 5000;
server.use(cors());
server.get('/', homeRouteHandler);
server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.get('/parks', parkHandler);
server.get('*', erroeHandler);
// request url (browser): localhost:3030/
function homeRouteHandler(request, response) {
  response.status(200).send('you server is alive!!');
}
// request url (browser): localhost:3030/location
function locationHandler(req, res) {
  // console.log(req.query);
  let cityName = req.query.city;
  // console.log(cityName);
  let key = process.env.LOCATION_KEY;

  let locURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  superagent.get(locURL)
    .then(geoData => {
      // console.log(geoData.body);
      let lData = geoData.body;
      let locationData = new Location(lData, cityName);
      res.send(locationData);
    })
    .catch(error => {
      // console.log('inside superagent');
      // console.log('Error in getting data from LocationIQ server');
      // console.error(error);
      res.send(error);
    });
  console.log('after superagent');
}
function weatherHandler(req, res) {
  // console.log(req.query);
  let data1 = [];
  let cityName = req.query.city;
  console.log(cityName);
  let key = process.env.WEATHER_KEY;
  // `https://api.weatherbit.io/v2.0/forecast/daily`
  let weaURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}`;
  superagent.get(weaURL)
    .then(day => {
      // console.log(day.body.data.Weather);
      day.body.data.map(val => {
        data1.push(new Weather(val));
      });
      res.send(data1);
    });
}
function parkHandler(req, res) {
  let data2 = [];
  console.log(req.query);
  let parkeName = req.query.search_query;
  let key = process.env.PARK_KEY;

  let parURL =`https://developer.nps.gov/api/v1/parks?q=${parkeName}&api_key=${key}`;
  superagent.get(parURL)
    .then(parkData => {
      parkData.body.data.forEach(val => {
        console.log(parkData.body);
        data2.push(new Park(val));
      });
      res.send(data2);
    });
}
function Location(geoData, cityName) {
  this.search_query = cityName;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
function Weather(weatherDay) {
  // console.log(weatherDay);
  this.description = weatherDay.weather.description;
  this.valid_date = weatherDay.valid_date;
}
function Park(parkData) {
  this.name = parkData.name;
  this.address = parkData.address;
  this.free = parkData.free;
  this.description = parkData.description;
  this.url = parkData.url;
}
//location:3030/ddddddd
function erroeHandler(req, res) {
  let errObj = {
    status: 500,
    responseText: "Sorry, something went wrong"
  };
  res.status(500).send(errObj);
}
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
