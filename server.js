'use strict';
const express = require('express'); // npm i express
require('dotenv').config(); // npm i dotenv
// CORS: Cross Origin Resource Sharing -> for giving the permission for who(clients) can touch my server oe send requests to my server
const cors = require('cors'); // npm i cors
const pg = require('pg');
const server = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 5000;
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  //  ssl:
  //   {
  //      rejectUnauthorized: false }
});
server.use(cors());
server.get('/', homeRouteHandler);
server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.get('/parks', parkHandler);
server.get('/movies', movieHandler);
server.get('/yelp',yelpHandler);

server.get('*', errorHandler);

// request url (browser): localhost:3000/
function homeRouteHandler(request, response) {
  response.status(200).send('you server is alive!!');
}

// request url (browser): localhost:3000/location
function locationHandler(req, res) {
  console.log(req.query);
  let cityName = req.query.city;
  console.log(cityName);
  let key = process.env.LOCATION_KEY;
  let LocURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  let SQL = `SELECT * FROM locations WHERE search_query = '${cityName}';`;
  client.query(SQL)
    .then(result => {
      if (result.rows.length === 0) {
        superagent.get(LocURL)
          .then(geoData => {
            let gData = geoData.body;
            const locationData = new Location(cityName, gData);
            res.send(locationData);

            let addLocationData = `INSERT INTO locations (search_query,formatted_query ,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
            let safeValues = [cityName, locationData.formatted_query, locationData.latitude, locationData.longitude];
            client.query(addLocationData, safeValues)
              .then(() => {
              });

          }).catch(() => {
            res.status(404).send('Page Not Found.');
          });
      }
      else {
        res.send(result.rows[0]);
      }
    })
    .catch(error => {
      res.send(error);
    });
}

function weatherHandler(req, res) {
  // console.log(req.query);
  let data1 = [];
  let cityName = req.query.search_query;
  console.log(cityName);
  let key = process.env.WEATHER_KEY;
  // `https://api.weatherbit.io/v2.0/forecast/daily`
  let weaURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}&days=8`;
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

  let parURL = `https://developer.nps.gov/api/v1/parks?q=${parkeName}&api_key=${key}`;
  superagent.get(parURL)
    .then(parkData => {
      parkData.body.data.forEach(val => {
        console.log(parkData.body);
        data2.push(new Park(val));
      });
      res.send(data2);
    });
}
`https://api.themoviedb.org/3/movie/550?api_key=01cf2f200ad09f9b1fdfcf84a43fc9de
`
function movieHandler(req, res) {
  // console.log(req.query);
  let data3 = [];
  let movieName = req.query.search_query;
  console.log(movieName);
  let key = process.env.MOVIE_KEY;
  // `https://api.moviebit.io/v2.0/forecast/daily`
  let movieURL=`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${movieName}`;
  superagent.get(movieURL)
    .then(result => {
      // console.log(result.body.data.movie);
      result.body.results.map(val => {
        data3.push(new Movie (val));
      });
      res.send(data3);
    });
}
let start =1;

function yelpHandler(req, res) {
  // console.log(req.query);
  let data4 = [];

  let yelpName = req.query.search_query;
  let key = process.env.YELP_KEY;
let page =req.query.page;
  let numPerPage=5;
  let start=((page-1)* numPerPage +1);
  console.log(yelpName);
  // `https://api.yelp.com/v3/businesses/search`
  let yelpURL=`https://api.yelp.com/v3/businesses/search?location=${yelpName}&limit=${numPerPage}&offest=${start}`;
  superagent.get(yelpURL).set('authorization',`Bearer ${key}`)


    .then(result => {
      // console.log(result.body.data.yelp);
      result.body.businesses.map(val => {
        data4.push(new Yelp (val));
      });
      res.send(data4);
    });
}

function Location (cityName,geoData) {
  this.search_query = cityName;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
function Weather(weatherDay) {
  console.log(weatherDay);
  this.forecast = weatherDay.weather.description;
  this.time = weatherDay.valid_date;
}
function Park(parkData) {
  this.name = parkData.name;
  this.address = parkData.address;
  this.free = parkData.free;
  this.description = parkData.description;
  this.url = parkData.url;
}
function Movie(movieData) {
  this.title = movieData.title;
  this.overview = movieData.overview;
  this.average_votes = movieData.vote_average;
  this.total_votes = movieData.vote_count;
  this.image_url =`https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
  this.popularity = movieData.popularity;
  this.released_on = movieData.release_date;
}


function Yelp(yelpData) {
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price= yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
  
}

//location:3030/ddddddd
function errorHandler(req, res) {
  let errObj = {
    status: 500,
    responseText: "Sorry, something went wrong"
  };
  res.status(500).send(errObj);
}
client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  });