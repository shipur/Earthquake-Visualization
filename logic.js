// Marking the clusters of eartquake:
// -----------------------------------

// Store our API endpoint inside queryUrl
// var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var tPlateLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

   
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  //?????????? following code needed? ?????????
//   function onEachFeature(feature, layer) {
//     layer.bindPopup("<h3>" + feature.properties.place +
//       "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
//   }
//??????????
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
//   var earthquakes = L.geoJSON(earthquakeData, {
//     onEachFeature: onEachFeature
//   });

  
    // var geojsonMarkerOptions = {
    //     radius: 80000,
    //     fillColor: "#E31A1C",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng, {
                    radius: feature.properties.mag * 10000,
                    fillColor: getColor(feature.properties.mag),
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup("<h3>Place: " + feature.properties.place +
                "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    
});
var tectonicStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
  // Grabbing our GeoJSON data for tectonic plates:
// var tectonicplates = d3.json(tPlateLink, function(data) {
//     // Creating a GeoJSON layer with the retrieved data
//     var tData = L.geoJson(data.features, {
//         style: tectonicStyle
//     });
//     console.log("tData: "+ tData);
//     return tData;
//   });

d3.json(tPlateLink, function(data) {
    // Creating a GeoJSON layer with the retrieved data
    var tData = L.geoJson(data.features, {
        style: function(feature){
            return tectonicStyle
        }
    });
    console.log("tData: "+ tData);
    
    // Sending our earthquakes and tectonic layers to the createMap function
  createMap(earthquakes, tData);
});
  
}

function getColor(d) {
    return d > 5 ? 'OrangeRed' :
           d > 4  ? 'orange' :
           d > 3  ? 'coral' :
           d > 2  ? 'gold' :
           d > 1   ? 'GreenYellow' :
                      'LawnGreen';
}


function createMap(earthquakes, tectonicplates) {

console.log("tectonic plates: "+ tectonicplates);
  // Define streetmap, darkmap and satellite map layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic3B1cm9oaXQiLCJhIjoiY2podjRhMGNqMDFndjNxbWRxZjgyN29ociJ9.UgbRyVe42Yu3p2PhiFe-oA");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic3B1cm9oaXQiLCJhIjoiY2podjRhMGNqMDFndjNxbWRxZjgyN29ociJ9.UgbRyVe42Yu3p2PhiFe-oA");

    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic3B1cm9oaXQiLCJhIjoiY2podjRhMGNqMDFndjNxbWRxZjgyN29ociJ9.UgbRyVe42Yu3p2PhiFe-oA");
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satelite Map": satelliteMap
  };

  // Create two separate layer groups below. One for city markers, and one for states markers
    // var earthquakesLayer = L.layerGroup(cityMarkers);
    // var tectonicplatesLayer = L.layerGroup(stateMarkers);

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Faults": tectonicplates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, satelliteMap]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
// Add legend to the map:
 var legend = L.control({position: 'bottomright'});
 legend.onAdd = function (myMap) {

     var div = L.DomUtil.create('div', 'info legend'),
     mag = [0,1,2,3,4,5],
     labels = [];

     // loop through our density intervals and generate a label with a colored square for each interval
     for (var i = 0; i < mag.length; i++) {
         div.innerHTML +=
             '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' +
             mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
     }

     return div;
 };

 legend.addTo(myMap);

 
}
