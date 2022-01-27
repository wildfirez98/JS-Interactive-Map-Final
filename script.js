// Create map                                                
const myMap = L.map('map', {
    coordinates: [],
	businesses: [],
	map: {},
	markers: {},

    center: [39.044966, -94.580958],
    zoom: 12,

    // Add business markers
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		])
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.map)
		}
    }
});

// Add Openstreetmap tiles

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoid2lsZGZpcmV6OTgiLCJhIjoiY2t5d2E3ZDI0MDZxbjJ2cDM5dHFyN3RmOCJ9.hSqVhWsP57-gnMuMDQhFsA'
}).addTo(myMap);

// Create and add a geolocation marker 

const marker = L.marker([39.044966, -94.580958])
marker.addTo(myMap).bindPopup('<p1><b>You are here!</b></p1>').openPopup()

// Note: no coffee shops around my house - hard coding location in above to try and work with
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

//Add fun functionality on map to get coordinates when user clicks on it (from Leaflet setup)

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(myMap);
}

myMap.on('click', onMapClick);

// Add Foursquare API and businesses
async function getFoursquare(business){

const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'fsq3tnw23bpSjPiG6OyorhXzG+OvvU9S23qxwfPBYAnrRo0='
    }
}
  let limit = 5;
  let lat = myMap.coordinates[0];
  let lon = myMap.coordinates[1];
  let response = await fetch('https://api.foursquare.com/v3/places/search?query=coffee&ll=39.044966%2C-94.580958&limit=5', options);
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let businesses = parsedData.results;
  return businesses
}    

// Process Foursquare Array 
function processBusinesses(data) {
	let businesses = data.map((element) => {
		let location = {
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return location
	})
	return businesses
}

// Event Handlers

// Window Load
window.onload = async () => {
	const coords = await getCoords()
	myMap.coordinates = coords
	//myMap.buildMap()
}

// Business submit button for info from Foursquare
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business').value
	let data = await getFoursquare(business)
	myMap.businesses = processBusinesses(data)
	myMap.addMarkers()
})