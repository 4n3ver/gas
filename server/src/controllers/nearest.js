var gasStationArray = [
    {"Brand":"Shell","Price":2.19, "longitude":-84.407868,"latitude":33.781799},
    {"Brand":"Shell","Price":2.39, "longitude":-84.398881,"latitude":33.778463},
];
var carLocation = {"longitude":-84.407868 ,"latitude":33.781799};
var remainingRange = 60;
var point1 = {"longitude":-84.407868 ,"latitude":33.781799};
var point2 =  {"longitude":-84.398881 ,"latitude":33.778463};

function distance(p1,p2) {
	var lat1 = p1.latitude;
	var lat2=p2.latitude;
	var lon1=p1.longitude;
	var lon2=p2.longitude;
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	return dist
}
function areaTriangle(a,b,c)
{
	var p = (a+b+c)/2;
	var area = Math.sqrt(p*(p-a)*(p-b)*(p-c));
	return area
}

function getDistToLine(lat1,lon1,lat2,lon2,lat3,lon3)
{
	var point1 = {"longitude":lon1 ,"latitude":lat1};
	var point2 = {"longitude":lon2 ,"latitude":lat2};
	var point3 = {"longitude":lon3 ,"latitude":lat3};

	var a = distance(point1,point2);
	var b = distance(point1,point3);
	var c = distance(point2,point3);
	var area = areaTriangle(a,b,c);
	return area*2/a;

}
function getNearestGasStation (remainingRange,gasStationArray,carLocation)
{	
	var tresholdRange = 60;
	var distanceArray = [];
	for (i = 0; i < gasStationArray.length; i++) 
	{ 
		var gasStationLocate = {"longitude":gasStationArray[i].longitude,"latitude":gasStationArray[i].latitude}
    	distanceTemp = distance(carLocation,gasStationLocate);
    	if(distanceTemp>remainingRange)
    	{
    		gasStationLocate.splice(i,1);
    	}
    	else if(distanceTemp<remainingRange-tresholdRange)
    	{
    		gasStationLocate.splice(i,1);
    		
    	}
    	else
    	{
    		distanceArray.push(distanceTemp);
    	}
    }
    priceArray = gasStationArray.map(function(e){return e.Price;})
	var indexOfMinValue = priceArray.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);	
	return gasStationArray[indexOfMinValue];
}

function getAPIRequest(latitude,longitude,distance,type)
{
	var request = require('request');
	request('http://devapi.mygasfeed.com/stations/radius/'+latitude+'/'+longitude+'/'+distance+'/'+'type'+'/Distance/rfej9napna.json?', function (error, response, body) 
	{
  	if (!error && response.statusCode == 200) 
  	{
  		subBody = body.substring(body.search(/{\s*"status"[\s\S]+}/m))
    	console.log(subBody) // Show the HTML for the Google homepage.
  	}
	})
	listOfStations = subBody.stations;
	for(i=0;i<listOfStations.length;i++)
	{
		delete listOfStations[i].country;
		delete listOfStations[i].zip;
		delete listOfStations[i].reg_date;
		delete listOfStations[i].mid_date;
		delete listOfStations[i].pre_date;
		delete listOfStations[i].diesel_date;
		delete listOfStations[i].address;
		delete listOfStations[i].diesel;
		delete listOfStations[i].id;
		delete listOfStations[i].region;
		delete listOfStations[i].city;
	}
	return listOfStations;
}
function filterBrand(body,brand)
{
	var found = body.filter(function(item) { return item.station === brand; });
}
