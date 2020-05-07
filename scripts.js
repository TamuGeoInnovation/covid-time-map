var countyData;
var stateData;
var currentDateSelected;
var currentDateSelected = '2020-05-06'
var stateURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/' + currentDateSelected + '.json'
var countyURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/' + currentDateSelected + '.json'
$(document).ready(function () {
	$.getJSON(countyURL, function (json) {
		countyData = json;
	}).done(function () {
		console.log('counties downloaded')
	});
	$.getJSON(stateURL, function (json) {
		stateData = json;
	}).done(function () {
		console.log('states downloaded')
	});
});

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3NlcHVsdmVkYTk2IiwiYSI6ImNrOHcxNWxveTA5bHkzZm1jZnVia2JpbDEifQ.uItzrq1zGYszzvQCGd3Erg';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/gsepulveda96/ck9x8kqvf16h71ip8tuuvk97i',
	center: [-94.64, 37.68],
	zoom: 4,
	minZoom: 3,
	maxZoom:10
});

function validateDate() {
	var minDate = new Date('01/21/2020');
	var maxDate = new Date('05/06/2020');
	var dateToCheck = new Date($("#mapdate").val())
	if (dateToCheck > minDate && dateToCheck <= maxDate) {
		reloadData()
	} else {
		alert('Date not available\n' + dateToCheck + '')
	}
}

function reloadData() {
	dateValue = moment($("#mapdate").val());
	dateToLoad = dateValue.format("YYYY-MM-DD").toString()
	currentDateSelected = dateToLoad
	console.log(currentDateSelected)

	stateURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/' + currentDateSelected + '.json'
	countyURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/' + currentDateSelected + '.json'
	$.when(
		$.getJSON(countyURL, function(data) {
			countyData = data;
		}),
		$.getJSON(stateURL, function(data) {
			stateData = data;
		})
	).then(function( cData , sData) {
		if (cData && sData ) {
			reloadMap()
		}
		else {
			alert('something went horribly wrong' )
		}

	});
}

function reloadMap() {

	dateValue = moment($("#mapdate").val());
	dateToLoad = dateValue.format("YYYY-MM-DD").toString()
	currentDateSelected = dateToLoad

	var newStateExpression = ['match', ['get', 'STATE']];
	var newCountyExpression = ['match', ['get', 'fips']];

	stateData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		newStateExpression.push(row['STATE'], color);
	});
	countyData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])
		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		newCountyExpression.push(row['fips'], color);
	});

	newStateExpression.push('rgba(255,255,255,1)');
	newCountyExpression.push('rgba(255,255,255,1)');

	map.setPaintProperty('covid-state', 'fill-color', newStateExpression)
	map.setPaintProperty('covid-county', 'fill-color', newCountyExpression)
}

map.on('load', function () {
	map.addSource('counties-with-pops-f-8nbien', {
		type: 'vector',
		url: 'mapbox://gsepulveda96.aj2hpi11'
	});

	map.addSource('state-lines', {
		type: 'vector',
		url: 'mapbox://gsepulveda96.statelines'
	});

	console.log(map.getStyle().layers);

	var countyExpression = ['match', ['get', 'fips']];
	var stateExpression = ['match', ['get', 'STATE']];

	countyData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])

		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		countyExpression.push(row['fips'], color);
	});

	stateData[currentDateSelected].forEach(function (row) {
		number = (row['infection_rate'])

		var color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		stateExpression.push(row['STATE'], color);
	});

	// Last value is the default, used where there is no countyData
	countyExpression.push('rgba(255,255,255,1)');
	stateExpression.push('rgba(255,255,255,1)');

	// Add layer from the vector tile source with countyData-driven style

	map.addLayer({
		'id': 'covid-state',
		'type': 'fill',
		'source': 'state-lines',
		'source-layer': 'state-lines',
		'paint': {
			'fill-color': stateExpression
		}
	},'road-minor-low')

	map.addLayer({
		'id': 'covid-county',
		'type': 'fill',
		'source': 'counties-with-pops-f-8nbien',
		'source-layer': 'counties-with-pops-f-8nbien',
		'paint': {
			'fill-color': countyExpression,
			'fill-outline-color': '#000000',
		}
	}, 'covid-state');

	map.addLayer({
		'id': 'statelines',
		'type': 'line',
		'source': 'state-lines',
		'source-layer': 'state-lines',
		'paint': {
			'line-color': '#000000',
			'line-width': 1
		}
	}), 'state-label';

	
	map.on('mousemove', 'covid-county', function (e) {
		map.getCanvas().style.cursor = 'pointer';
		var coordinates = e.features[0].geometry.coordinates.slice();
		var description = e.features[0].properties.description;
		// Single out the first found feature.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
		var feature = e.features[0];
		selectedCounty = countyData[currentDateSelected].filter(county => county.fips === feature.properties.fips);

		document.getElementById("info-box").innerHTML = (feature.properties.NAME + ' County' + '</br>' +
			'Population: ' + feature.properties.POPESTIMATE2019 + '</br>' +
			'Cases: ' + selectedCounty[0]['confirmed'] + '</br>' +
			'Infection Rate: ' + selectedCounty[0]['infection_rate'].toFixed(2) + '/100,000 People</br>' +
			'Deaths: ' + selectedCounty[0]['confirmed'] + '</br>'+
			'Death Rate: '+ selectedCounty[0]['death_rate'].toFixed(2))
	});
	map.on('mouseleave', 'covid-county', function () {
		map.getCanvas().style.cursor = '';
		document.getElementById("info-box").innerHTML = "Hover over the map to see info"
	});
	
	map.on('mousemove', 'covid-state', function (e) {
		map.getCanvas().style.cursor = 'pointer';
		var coordinates = e.features[0].geometry.coordinates.slice();
		var description = e.features[0].properties.description;
		// Single out the first found feature.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
		var feature = e.features[0];
		selectedState = stateData[currentDateSelected].filter(state => state.STATE === feature.properties.STATE);

		document.getElementById("info-box").innerHTML = (feature.properties.NAME + '</br>' +
			'Population: ' + feature.properties.POPESTIMATE2019 + '</br>' +
			'Cases: ' + selectedState[0]['confirmed'] + '</br>' +
			'Infection Rate: ' + selectedState[0]['infection_rate'].toFixed(2) + '/100,000 People</br>' +
			'Deaths: ' + selectedState[0]['confirmed'] + '</br>' +
			'Death Rate: '+ selectedState[0]['death_rate'].toFixed(2))
	});
	
	map.on('mouseleave', 'covid-county', function () {
		map.getCanvas().style.cursor = '';
		document.getElementById("info-box").innerHTML = "Hover over the map to see info"
	});

	var link = document.createElement('a');
	link.href = '#';
	link.className = ''
	link.textContent = 'Toggle Counties'

	link.onclick = function (e) {
		e.preventDefault();
		e.stopPropagation();

		if (this.className === 'active') {
			map.setLayoutProperty('covid-state', 'visibility', 'visible');
			this.className = '';
		} else {
			map.setLayoutProperty('covid-state', 'visibility', 'none');
			this.className = 'active'
		}
	}

	var mortalButton = document.createElement('a')
	mortalButton.href = '#'
	mortalButton.className = ''
	mortalButton.textContent = 'Mortality Rate'

	var layers = document.getElementById('menu');
	layers.appendChild(link);
	layers.appendChild(mortalButton)

	//map.addControl(new mapboxgl.NavigationControl());
});