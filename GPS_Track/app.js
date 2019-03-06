var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const axios = require('axios');
var app = express();

var timeNow = new Date(Date.now());

const instance = axios.create({
  baseURL: 'https://io.adafruit.com/api/v2/YOUR USER NAME/feeds/YOUR FEED TOPIC',
  timeout: 2000,
  headers: {'X-AIO-Key': 'YOUR AIO KEY'}
});


function getData(time){
	return instance.get('/data', {
	    params: {
	      include:'lat,lon',
	      end_time:time
	    }
	  })
	  .then(function (response) {
	  	var count = response.headers['x-pagination-count'];
	  	var endtime = response.headers['x-pagination-start'];
		var mapData =  response.data;

		if (count == 1000){
			return getData(endtime).then(function(data){
				mapData = mapData.concat(data);
				return mapData;		
			})
		}else{
	  		return mapData;
		}
	  })
	  .catch(function (error) {
	  		console.log(error);
	  }); 
}


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname,'public')));

app.get('/api/locations', function(req,res){
	getData(timeNow).then(function(data){
		res.send(data);
	});
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log(`Server started on Port ${port}...`);
});