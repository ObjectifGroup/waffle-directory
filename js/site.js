/*! js-cookie v2.2.1 | MIT */

!function(a){var b;if("function"==typeof define&&define.amd&&(define(a),b=!0),"object"==typeof exports&&(module.exports=a(),b=!0),!b){var c=window.Cookies,d=window.Cookies=a();d.noConflict=function(){return window.Cookies=c,d}}}(function(){function a(){for(var a=0,b={};a<arguments.length;a++){var c=arguments[a];for(var d in c)b[d]=c[d]}return b}function b(a){return a.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}function c(d){function e(){}function f(b,c,f){if("undefined"!=typeof document){f=a({path:"/"},e.defaults,f),"number"==typeof f.expires&&(f.expires=new Date(1*new Date+864e5*f.expires)),f.expires=f.expires?f.expires.toUTCString():"";try{var g=JSON.stringify(c);/^[\{\[]/.test(g)&&(c=g)}catch(j){}c=d.write?d.write(c,b):encodeURIComponent(c+"").replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),b=encodeURIComponent(b+"").replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var h="";for(var i in f)f[i]&&(h+="; "+i,!0!==f[i]&&(h+="="+f[i].split(";")[0]));return document.cookie=b+"="+c+h}}function g(a,c){if("undefined"!=typeof document){for(var e={},f=document.cookie?document.cookie.split("; "):[],g=0;g<f.length;g++){var h=f[g].split("="),i=h.slice(1).join("=");c||'"'!==i.charAt(0)||(i=i.slice(1,-1));try{var j=b(h[0]);if(i=(d.read||d)(i,j)||b(i),c)try{i=JSON.parse(i)}catch(k){}if(e[j]=i,a===j)break}catch(k){}}return a?e[a]:e}}return e.set=f,e.get=function(a){return g(a,!1)},e.getJSON=function(a){return g(a,!0)},e.remove=function(b,c){f(b,"",a(c,{expires:-1}))},e.defaults={},e.withConverter=c,e}return c(function(){})});

/* map code Copyright Objectif Group 2020. All Rights Reserved. */

       const colorArray = [
           'rgb(0, 255, 0)',
           'rgb(0, 255, 0)',
           'rgb(53, 251, 0)',
           'rgb(100, 242, 0)',
           'rgb(141, 226, 0)',
           'rgb(176, 204, 0)',
           'rgb(204, 176, 0)',
           'rgb(226, 141, 0)',
           'rgb(242, 100, 0)',
           'rgb(251, 53, 0)',
           'rgb(255, 0, 0)'
       ]

       const zoomDivHelper = document.getElementById('zoomLevel');
       let pins = []
       let states = []

  

       var map = new mapboxgl.Map({
           container: 'map', // container id
           style: {
               "version": 8,
               "sources": {
                   "simple-tiles": {
                       "type": "raster",
                       "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                       "tileSize": 256,
					   "attribution": '&copy; <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                   },
               },
               "layers": [{
                   "id": "simple-tiles",
                   "type": "raster",
                   "source": "simple-tiles",
                   "minzoom": 0,
                   "maxzoom": 22
               },
               ]
           },
           center: { lng: -91.69509679426278, lat: 45.44680704767657 },
           zoom: 1.5
       });

       var nav = new mapboxgl.NavigationControl();
       map.addControl(nav, 'top-left');

       var hoveredStateId = null;

       //API Sources    
       //https://data.waffle.directory/apple.geojson
       //https://data.waffle.directory/wafflehouse.geojson

       


       const click = [...document.querySelectorAll('input[type="checkbox"]')].map(checkbox => {
           checkbox.addEventListener('change', function () {
               const filterNames = [...document.querySelectorAll('.filters:checked')].map(e => e.id);
               updateFilters(filterNames);
           });
       })

       function updateFilters(filterNames = []) {
           //console.log('filterNames', filterNames);

           const filtered = turf.featureCollection(pins.features.filter(i => {
               return filterNames.includes(i.type)
           }))

           //set pin to state 
           states.features.forEach(state => {
               // console.log('s', state.properties.STATE_NAME.toLowerCase());
               state.properties.closed = 0;
               state.properties.storeNumber = 0;
               filtered.features
                   .filter(pin => pin.geometry.coordinates[0] && pin.geometry.coordinates[1])//skip null coordinates
                   .forEach(pin => {
                       if (state.properties.STATE_NAME && state.properties.STATE_NAME.toLowerCase() === pin.state.toLowerCase()) {
                           state.properties.storeNumber++
                           if (pin.properties.closed === 1) {
                               state.properties.closed++;
                           }
                       }
                       if (state.properties.ISO && state.properties.ISO.toLowerCase() === pin.country.toLowerCase()) {
                           state.properties.storeNumber++
                           if (pin.properties.closed === 1) {
                               state.properties.closed++;
                           }
                       }
                   })

               //calculate %      
               state.properties.color = 'white'
               /*
               if (state.properties.closed >= 10) {
                   state.properties.color = 'red'
               }
               if (state.properties.storeNumber > 0 && state.properties.closed < 10) {
                   state.properties.color = 'green'
               }
               */

               state.properties.percent = -1; // no data in state 

               if (state.properties.storeNumber > 0) {

                   if (state.properties.closed > 0) {
                       state.properties.percent = (100 * state.properties.closed) / state.properties.storeNumber
                   } else {
                       state.properties.percent = '0'
                   }
               }


               const c = Math.ceil(state.properties.percent / 10)

               //console.log('state.properties.percent', state.properties.STATE_NAME, state.properties.percent, c, colorArray[c]);

               if (state.properties.percent !== -1 && colorArray[c]) {
                   state.properties.color = colorArray[c]
               } else {
                   state.properties.color = 'white'
               }


           })

           map.getSource("states").setData(states)
           map.getSource("pins").setData(filtered)
       }


       map.on('load', function () {
		
        Promise.all([
            fetch("https://data.waffle.directory/wafflehouse.geojson"),
            fetch("https://data.waffle.directory/apple.geojson"),
			fetch("https://data.waffle.directory/timhorton.geojson"),
            fetch("https://data.waffle.directory/joined.json"), // usa canada states only
        ])
            .then(result => Promise.all(result.map(v => v.json())))
            .then(result => {

                result[0].features.forEach(f => {
                    f.type = 'wafflehouse'
                })
                result[1].features.forEach(f => {
                    f.type = 'apple'
                })
                result[2].features.forEach(f => {
                    f.type = 'timhorton'
                })
				

                pins = turf.featureCollection([...result[0].features, ...result[1].features, ...result[2].features]) // join pins 
                states = result[3]

                pins.features.forEach(pin => {
                    pin.properties.color = 'green';
                    if (pin.properties.closed === 1) {
                        pin.properties.color = 'red'
                    }
                });

               // console.log('results123:', pins, states);
               // updateFilters(['timhorton', 'apple'])
			   //only showing apple during the pandemic; waffle house comes back when hurricane season starts
updateFilters(['apple','timhorton'])

			   $('#loadingModal').modal('hide'); // remove modal popup
                map.getSource("states").setData(states)
                map.getSource("pins").setData(pins)
            })
		    map.resize();

           console.log('map load done');

           map.addSource('states', {
               'type': 'geojson',
               'data': {
                   "type": "FeatureCollection",
                   "features": []
               }
           });

           // The feature-state dependent fill-opacity expression will render the hover effect
           // when a feature's hover state is set to true.
           map.addLayer({
               'id': 'state-fills',
               'type': 'fill',
               'source': 'states',
               'maxzoom': 5.5,
               'layout': {},
               'paint': {
                   'fill-color': ['get', 'color'],
                   'fill-opacity': [
                       'case',
                       ['boolean', ['feature-state', 'hover'], false],
                       0.8,
                       0.5
                   ]
               }
           });


           map.addLayer({
               'id': 'state-borders',
               'type': 'line',
               'source': 'states',
               'layout': {},
               'paint': {
                   'line-color': '#627BC1',
                   'line-width': 0
               }
           });

           map.addSource('pins', {
               "type": "geojson",
               "data": {
                   "type": "FeatureCollection",
                   "features": []
               }
           });
           map.addLayer({
               'id': 'pin',
               'type': 'circle',
               'source': 'pins',
               'minzoom': 7,
               'paint': {
                   'circle-radius': 5,
                   'circle-color': ['get', 'color'],
                   'circle-stroke-color': 'white',
                   'circle-stroke-width': 1
               }
           });

           map.addLayer({
               'id': 'pins-heat',
               'type': 'heatmap',
               'source': 'pins',
               'minzoom': 5.5,
               'maxzoom': 7,
               'paint': {
                   // increase intensity as zoom level increases
                   'heatmap-intensity': {
                       'stops': [
                           [11, 1],
                           [15, 3]
                       ]
                   },
                   // use sequential color palette to use exponentially as the weight increases
                   'heatmap-color': [
                       'interpolate',
                       ['linear'],
                       ['heatmap-density'],
                       0,
                       'rgba(236,0,0,0)',
                       0.2,
                       'rgb(208,0,0)',
                       0.4,
                       'rgb(166,0,0)',
                       0.6,
                       'rgb(123,12,0)',
                       0.8,
                       'rgb(100,12,0)'
                   ],
                   // increase radius as zoom increases
                   'heatmap-radius': {
                       'stops': [
                           [5.5, 45],
                           [11, 45],
                           [15, 30]
                       ]
                   },
                   // decrease opacity to transition into the circle layer
                   'heatmap-opacity': {
                       'default': 1,
                       'stops': [
                           [14, 1],
                           [15, 0]
                       ]
                   }
               },
               filter: ['==', ['get', 'color'], 'red']
           },
           );

           var popup = new mapboxgl.Popup({
               closeButton: false,
               closeOnClick: false
           });

           // When the user moves their mouse over the state-fill layer, we'll update the
           // feature state for the feature under the mouse.
           map.on('mousemove', 'state-fills', function (e) {
               //console.log('state name ', e.features[0].properties.STATE_NAME);
               const { STATE_NAME, closed, storeNumber, COUNTRY } = e.features[0].properties;
               if (e.features.length > 0) {
                   if (hoveredStateId) {
                       map.setFeatureState(
                           { source: 'states', id: hoveredStateId },
                           { hover: false }
                       );
                   }
                   hoveredStateId = e.features[0].id;
                   map.setFeatureState(
                       { source: 'states', id: hoveredStateId },
                       { hover: true }
                   );
               }

               var coordinates = e.lngLat;
			if (!STATE_NAME) {var showName = COUNTRY; } else {var showName = STATE_NAME; }
               var description = `                 
                   ${closed} (of ${storeNumber}) stores are closed in ${showName}
               `
               popup
                   .setLngLat(coordinates)
                   .setHTML(description)
                   .addTo(map);
           });

           // When the mouse leaves the state-fill layer, update the feature state of the
           // previously hovered feature.
           map.on('mouseleave', 'state-fills', function () {
               if (hoveredStateId) {
                   map.setFeatureState(
                       { source: 'states', id: hoveredStateId },
                       { hover: false }
                   );
               }
               hoveredStateId = null;

               popup.remove();
               map.getCanvas().style.cursor = '';
           });

           //============= pins click ============================
           map.on('click', 'pin', function (e) {
               const coordinates = e.features[0].geometry.coordinates.slice();
               const { name, closed } = e.features[0].properties;

               // Ensure that if the map is zoomed out such that multiple
               // copies of the feature are visible, the popup appears
               // over the copy being pointed to.
               while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
               }
			   if(closed == 1) { var isClosedtxt = 'closed'; } else { var isClosedtxt = 'open'; }
               popup
                   .setLngLat(coordinates)
                   .setHTML(`
                   ${name} is ${ isClosedtxt}.
                   `)
                   .addTo(map);
           });

           // Change the cursor to a pointer when the mouse is over the places layer.
           map.on('mouseenter', 'pin', function () {
               map.getCanvas().style.cursor = 'pointer';
           });

           // Change it back to a pointer when it leaves.
           map.on('mouseleave', 'pin', function () {
               map.getCanvas().style.cursor = '';
           });

           map.on('error', event => console.log("!!!", event))
		

       });


       //============= modal part =======================
	   
	   if (!Cookies.get('first')) {
	   	$('#infoModal').modal('show');
		Cookies.set('first','no', {expires: 30});
	   } else {
	   	$('#loadingModal').modal('show');
		Cookies.set('first','no', {expires: 30});
	   }
	   
	   
	   