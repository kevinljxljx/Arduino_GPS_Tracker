{
    // -------------------gps data pull and init map-----------------------------
    let rawdata;
    let startdate;
    let enddate;
    
    // data query function
    async function getData(){
         let json = await fetch('api/locations');
         return json.json();
    }

    // get date function
    function writeDate(date){
        let newDate = new Date(date);
        let dd = String(newDate.getDate()).padStart(2, '0');
        let mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = newDate.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }
  
    //program start
    getData().then(data=>{
      rawdata = data;

      //start date input
      let oldest = rawdata[rawdata.length-1].created_at;
      document.getElementById('startdate').setAttribute('value', writeDate(oldest));
      let newest = rawdata[0].created_at;
      document.getElementById('enddate').setAttribute('value', writeDate(newest));

      startDate = document.getElementById('startdate').value;
      endDate = document.getElementById('enddate').value;

      //init map
      let locations = data.map((val) => {
          return new google.maps.LatLng(val.lat,val.lon)
      });

      document.getElementById('loading').style.display = 'none';
      initMap(locations);
    });




    // ---------------------------Time select----------------------

    document.addEventListener("DOMContentLoaded",()=>{
        Array.from(document.querySelectorAll('.dateselect')).forEach(elem => {
            elem.addEventListener('change', ()=>{
                let newStartDate = document.getElementById('startdate').value;
                let newEndDate = document.getElementById('enddate').value;

                if (newStartDate > endDate || newEndDate < startDate){

                  document.getElementById('startdate').value = startDate;
                  document.getElementById('enddate').value = endDate;

                } else{
                    startDate = newStartDate;
                    endDate = newEndDate;
                    updateMap(newStartDate, newEndDate);
                }
            });
        });

        document.querySelector('[data-activate]').addEventListener('click', e =>{
            document.getElementById('filter').style.display = 'none';
            document.querySelector(`#${e.target.dataset.activate}`).classList.add('active');
        })
        document.querySelector('[data-deactivate]').addEventListener('click', e=>{
            document.getElementById('filter').style.display = 'block';
            document.querySelector(`#${e.target.dataset.deactivate}`).classList.remove('active');
        })

    }); 


    function updateMap(startdate, enddate){
        let newStartDate = searchDate(rawdata, startdate, 'start');
        let newEndDate = searchDate(rawdata, enddate, 'end');

        let newMapData = rawdata.slice(newEndDate, newStartDate);

        let locations = newMapData.map((val) => {
          return new google.maps.LatLng(val.lat,val.lon)
        });
        updateHeatMap(locations);
    }



    function searchDate (list, value, direction) {
      let start = 0;
      let stop = list.length - 1;
      let middle = Math.floor((start + stop) / 2);

      while (writeDate(list[middle].created_at) !== value && start < stop) {

        if (value > writeDate(list[middle].created_at)) {
          stop = middle - 1;
        } else {
          start = middle + 1;
        }
        middle = Math.floor((start + stop) / 2);

      }

      if (writeDate(list[middle].created_at) !== value){
        if (direction == 'start'){
          let returnDate = writeDate(list[start].created_at);
          document.getElementById('startdate').value = returnDate;
          return start;

        }else if (direction == 'end'){
          let returnDate = writeDate(list[stop].created_at);
          document.getElementById('enddate').value = returnDate;
          return stop;

        }else{
          throw "something went wrong";
        }

      }else{
        return middle;
      }
      
    }




    // ---------------------------google map api----------------------

    let map, heatmap;

    function initMap(locations) {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 37.528605, lng: -122.277451},
        mapTypeId: 'satellite'
      });

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: locations,
        map: map,
        maxIntensity: 10
      });
    }

    function updateHeatMap(locations) {
      heatmap.setMap(null);
      heatmap = new google.maps.visualization.HeatmapLayer({
        data: locations,
        map: map,
        maxIntensity: 10
      });
    }

    function toggleHeatmap() {
      heatmap.setMap(heatmap.getMap() ? null : map);
    }

    function changeRadius() {
      heatmap.set('radius', heatmap.get('radius') ? null : 20);
    }

    function displaySelect(arg){
      let startDate;
      var dateOffset = (24*60*60*1000); //1day
      var myDate = new Date();

      // let endDate =  writeDate(new Date());


      let endDate = new Date();
      endDate.setTime(endDate.getTime() );
      endDate = writeDate(endDate);

      switch(arg){
        case 'all':
          startDate = writeDate(rawdata[rawdata.length-1].created_at);
          break;

        case '1':
          myDate.setTime(myDate.getTime() - dateOffset);
          startDate = writeDate(myDate);
          break;

        case '7':
          myDate.setTime(myDate.getTime() - dateOffset*7);
          startDate = writeDate(myDate);
          break;
      }

      document.getElementById('startdate').value = startDate;
      document.getElementById('enddate').value = endDate;
      updateMap(startDate, endDate);
    }

  }