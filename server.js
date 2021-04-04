'use strict';
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const server = express();
const PORT = process.env.PORT || 6000;

server.use(cors());

server.get('/',(req,res)=>{
  res.send('your server is working!')
})

server.get('/location',(req,res)=>{
  
  let locationData = require('./data/location.json');
  console.log(locationData);
  let locationCity = new Location (locationData);
  // console.log(locationData);
  res.send(locationCity);
})
// {
//   "search_query": "seattle",
//   "formatted_query": "Seattle, WA, USA",
//   "latitude": "47.606210",
//   "longitude": "-122.332071"
// }
function Location(locData) {
this.search_query='Lynnwood';
this.formatted_query=locData[0].display_name;
this.latitude=locData[0].lat;
this.longitude=locData[0].lon;
}
server.get('/weather',(req,res)=>{
  let weatherArr=[];
  let weatherData = require('./data/ weather.json');
  weatherData.data.forEach((element,i)=>{
 let desc=weatherData.data[i].weather.description;
 let timeC=weatherData.data[i].valid_date;
 let weatherCity=new Weather(desc,timeC);
 weatherArr.push(weatherCity);

});

  res.send(weatherArr);
});
// [
//   {
//     "forecast": "Partly cloudy until afternoon.",
//     "time": "Mon Jan 01 2001"
//   },
//   {
//     "forecast": "Mostly cloudy in the morning.",
//     "time": "Tue Jan 02 2001"
//   },
//   ...
// ]

function Weather(description,timeCity){
this.forecast=description;
this.time=timeCity;
  
  // this.forecast=wethData.data[0].weather.description;
  // this.time=wethData.data[0].valid_date;
  // console.log(weatherArr);

}
server.get('*',(req,res)=>{
  
  let errorObject = {
      status: 500,
      responseText: "Sorry, wrong path!"
  }
  res.status(500).send(errorObject);
})








server.listen(PORT,()=>{
  console.log(`Hello!, you Listening on PORT  ${PORT}`)
})