const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const app = express();
let timeNow = new Date(Date.now());

const instance = axios.create({
	baseURL: 'https://io.adafruit.com/api/v2/YOUR_MQTT_DIR',
	timeout: 2000,
	headers: { 'X-AIO-Key': 'YOUR_API_KEY' }
});

//data query async function 
async function getData(time) {
	try {
		let result = await instance.get('/data', {
			params: {
				include: 'lat,lon,created_at',
				end_time: time
			}
		})

		let count = result.headers['x-pagination-count'];
		let endtime = result.headers['x-pagination-start'];
		let mapData = result.data;

		if (count == 1000) {
			let rec = await getData(endtime);
			mapData = mapData.concat(rec);
			return mapData;

		} else {
			return mapData;
		}
	} catch (error) {
		console.log(error);
	}
}


//data query promise way
const getDataPromise = time => {
	return new Promise((resolve, reject) => {
		instance.get('/data', {
			params: {
				include: 'lat,lon,created_at',
				end_time: time
			}
		})
			.then(res => {
				let count = res.headers['x-pagination-count'];
				let endtime = res.headers['x-pagination-start'];
				let mapData = res.data;

				if (count == 1000) {
					getDataPromise(endtime)
						.then(res => {
							mapData = mapData.concat(res);
							resolve(mapData);
						})
				} else {
					resolve(mapData);
				}
			})
			.catch(error => {
				reject(error);
			})

	});
};


app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/locations', function (req, res) {

	timeNow = new Date(Date.now());
	
	getData(timeNow)
		.then(data => {
			console.log(`Time now ${timeNow}, data points returned: ${data.length}`);
			res.send(data);
		})
		.catch(error => console.log(error));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log(`Time now: ${timeNow}`);
	console.log(`Server started on Port ${port}...`);
});