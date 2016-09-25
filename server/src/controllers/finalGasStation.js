'use strict'
// p(origin, destination, getStationArray.bind(this,"Texaco"))

function unique(arr) {
    return Object.keys(arr.reduce(
        (prev, curr) => {
            prev[JSON.stringify(curr)] = null;
            return prev;
        }, {}
    )).map(e => JSON.parse(e));
}

// const departments = Object.keys(parsedData.reduce(
//         (prev, curr) => {
//             prev[curr.department.toUpperCase()] = null;
//             return prev;
//         }, {}
//     ));


const API_GMAPS_KEY = "AIzaSyBObYucO996F9FzYmxnvC754n1CVQO-DTY";
const API_GMAPS_ENDPOINT = "https://maps.googleapis.com/maps/api/directions/json?";
var latitude = 1;
var longitude = 2;
const request = require('request');
var p = (origin, destination, cb) =>
    request(
        `${API_GMAPS_ENDPOINT}origin=${origin}&destination=${destination}&key=${API_GMAPS_KEY}`,
        (err, reqResp, body) => {
            if (!err) {
                body = JSON.parse(body);
                let path = [body.routes[0].legs[0].start_location];
                body.routes[0].legs[0].steps.forEach(
                    step => path.push(step.end_location));
                cb(path);
            }
        });
function sind(a){
    return Math.sin(a*180/Math.PI);
}

function cosd(a){
    return Math.cos(a*180/Math.PI);
}

function getXYZ(lat,lng){
    R=3959;
    x=R*sind(lat)*cos(lng);
    y=R*sind(lat)*cos(lng);
    z=R*cosd(lat);
    return [x,y,z];
}


/*function getDistToLine(lat1,lon1,lat2,lon2,lat3,lon3)
{

    //getDistToLine(33.781577,-84.413087,33.781479,-84.391557,33.778244,-84.397790)
    var y = Math.sin(lon3 - lon1) * Math.cos(lat3);
    var x = Math.cos(lat1) * Math.sin(lat3) - Math.sin(lat1) * Math.cos(lat3) * Math.cos(lat3 - lat1);
    var bearing1 = (Math.atan2(y, x))*180/Math.PI;
    bearing1 = 360 - (bearing1 + 360 % 360);

    var y2 = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var x2 = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lat2 - lat1);
    var bearing2 = (Math.atan2(y2, x2))*180/Math.PI;
    bearing2 = 360 - (bearing2 + 360 % 360);

    var lat1Rads = (lat1)*Math.PI/180;
    var lat3Rads = (lat3)*Math.PI/180;
    var dLon = (lon3 - lon1)*Math.PI/180;

    var distanceAC = Math.acos(Math.sin(lat1Rads) * Math.sin(lat3Rads)+Math.cos(lat1Rads)*Math.cos(lat3Rads)*Math.cos(dLon)) * 3959;  
    var min_distance = Math.abs(Math.asin(Math.sin(distanceAC/3959)*Math.sin((bearing1)*Math.PI/180-(bearing2)*Math.PI/180)) * 3959);
    return min_distance

}*/
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
function getData(lat, lng, distance, type) {
    theUrl = 'http://devapi.mygasfeed.com/stations/radius/' + lat + '/' + lng + '/' + distance + '/' + type + '/distance/rfej9napna.json?';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getAPIRequest(latitude, longitude, distance, type, cb) {
    var request = require('request');
    var subBody;
    var url = 'http://devapi.mygasfeed.com/stations/radius/' + latitude + '/' + longitude + '/' + distance + '/' + type + '/Distance/rfej9napna.json?';
    request(url, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            var index = body.search(/{\s*"status"[\s\S]+}/mi);
            // console.log("index", index)
            subBody = body.substring(index)
            //console.log("subBody", subBody) // Show the HTML for the Google homepage.
            subBody = JSON.parse(subBody);
        } else {
            console.log(error, response.statusCode, "ERROR HTTP REQUEST")
        }
        // console.log("subBody", subBody.stations)
        var listOfStations = subBody.stations;
        for (var i = 0; i < listOfStations.length; i++) {
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
        cb(listOfStations);
    })
}

function filterBrand(body, brand) {
    var found = body.filter(function(item) {
        return item.Brand === brand;
    });
    return found;
    //console.log(found);
}

function getStationArray(stepsArray, brand) {
    brand=brand||'x';
    var i;
    var R = 3959;
    var j;
    var gasStation=[];
    console.log("stepsarray",stepsArray);
    for (i = 1; i < stepsArray.length-1; i++) {
        var latA = stepsArray[i - 1].lat;
        var lngA = stepsArray[i - 1].lng;
        var latB = stepsArray[i].lat;
        var lngB = stepsArray[i].lng;
        //console.log(i,[latA, lngA, latB, lngB]);
        var disTo = 5;
        var type = 'reg';
        // http://devapi.mygasfeed.com/stations/radius/41.80064309999999/-86.7206556/5/reg/Distance/rfej9napna.json?
        //gasApi=getAPIRequest(latA,lngA,disToLine,type);
        getAPIRequest(latA, lngA, disTo, type, gasApi => {
            //console.log(gasApi);
            for (j = 0; j < gasApi.length; j++) {
                var latC = parseFloat(gasApi[j].lat);
                var lngC = parseFloat(gasApi[j].lng);
                // console.log(latA,lngA,latB,lngB,latC,lngC);
                var distance = getDistToLine(latA, lngA, latB, lngB, latC, lngC);
                // console.log('distance',distance);
                if (distance < 2) {
                    // console.log("FOUND!")
                    gasStation.push( {
                        'Brand': gasApi[j].station,
                        'Price': gasApi[j].reg_price,
                        'latitude': gasApi[j].lat,
                        'longitude': gasApi[j].lng
                    });
                    // console.log("Push",gasStation)
                }
            }
            // console.log("hha",gasStation);
                if(brand!=='x')
    {
        gasStation = filterBrand(gasStation,"Texaco");
        // console.log("Inside IF")

    }
    gasStation = unique(gasStation);
   
    console.log("hiha",gasStation);
        });
        


    }
    //return gasStation;

}
var brandGas = "Texaco"
p("41.99668,-87.87675", "41.583517,-87.691409", step => getStationArray(step, brandGas));