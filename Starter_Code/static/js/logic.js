// Store APIU enpoint as a variable: url
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {

    console.log(data)
    // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Function to determine marker size based on Magnitude size
function markerSize(mag) {
    return Math.sqrt(mag) * 50
};

// Function to determine color of marker based on depth
function chooseColor(depth){
    if (depth <10) return "#ECCA00";
    else if (depth <= 30) return "#EC9B00";
    else if (depth <= 50) return "#EC0000";
    else if (depth <= 70) return "#BC0000";
    else if (depth <= 90) return "#8D0000";
    else if (depth >90) return "#5E0000";
}

function createFeatures(earthquakeData){

    // Function to give each marker a popup that describes the place and time of the earthquake
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    };

    // Determine marker style based on depth and magnitude
    function createMarker(feature, latlng){
        let markers = {
            radius: feature.properties.mag*5,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            color: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.5,
            weight: 0.5
        }
        return L.circleMarker(latlng,markers);
    };

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquake = L.geoJSON(earthquakeData,{
        onEachFeature: onEachFeature,
        pointToLayer: createMarker
    });



    createMap(earthquake);
}

function createMap(earthquake){
    
    // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create the baseMap object
  let baseMaps = {
    "Street Map": street
  };
  
  // Create an overlay object to hold the overlay
  let overlayMaps = {
    Earthquake: earthquake
  };
  
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquake]
  });
  
    // Create legend
  let legend = L.control({
        position: "bottomright"
    });
    
    legend.onAdd = function(){
    let div = L.DomUtil.create("div", "legend"),
    depthRange = [-10,10,30,50,70,90];


    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        for (let i = 0; i < depthRange.length; i++) {
            let color = chooseColor(depthRange[i] +1)
            div.innerHTML +=
            '<i style="background:' + color + '"></i> ' + depthRange[i] + (depthRange[i + 1] ? '&ndash;' + depthRange[i + 1] + '<br>' : '+');
        }
        return div;

    };
    legend.addTo(myMap);

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);
  
}

