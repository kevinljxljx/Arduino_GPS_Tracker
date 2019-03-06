# adafruit_io_data_query

This project was created for a GPS tracking app. The idea was to have a GPS tracker in my car which sends data to adafruit.io. So later on I can use Google Map API to visualize those location data. 

The tracker was made with an arduino nano and a SIM808 modue.

Adafruit.io only sends the last 1000 data points for a GET request. This tool provide the ability to query all the data points with the use of pagination.

You have to put in your Google Map API key, Adafruit.io AIO Key and the mqtt topic in order for it to work. 
