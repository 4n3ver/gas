"use strict";

import { API_GMAPS_KEY, API_GMAPS_ENDPOINT } from "../config";
import request from "request";

function unique(arr) {
    return Object.keys(arr.reduce(
        (prev, curr) => {
            prev[JSON.stringify(curr)] = null;
            return prev;
        }, {}
    )).map(e => JSON.parse(e));
}

var latitude = 1;
var longitude = 2;

var p = (origin, destination, cb) =>
    request(
        `${API_GMAPS_ENDPOINT}origin=${origin}&destination=${destination}&key=${API_GMAPS_KEY}`,
        (err, reqResp, body) => {
            if (!err) {
                body = JSON.parse(body);
                let path = [body.routes[0].legs[0].start_location];
                body.routes[0].legs[0].steps.forEach(
                    step => path.push(step.end_location));
                return cb(path);
            }
        });
function sind(a) {
    return Math.sin(a * 180 / Math.PI);
}

function cosd(a) {
    return Math.cos(a * 180 / Math.PI);
}

function getXYZ(lat, lng) {
    R = 3959;
    x = R * sind(lat) * cos(lng);
    y = R * sind(lat) * cos(lng);
    z = R * cosd(lat);
    return [x, y, z];
}

function areaTriangle(a, b, c) {
    var p = (a + b + c) / 2;
    var area = Math.sqrt(p * (p - a) * (p - b) * (p - c));
    return area;
}
function getDistToLine(lat1, lon1, lat2, lon2, lat3, lon3) {
    var point1 = {
        "longitude": lon1,
        "latitude" : lat1
    };
    var point2 = {
        "longitude": lon2,
        "latitude" : lat2
    };
    var point3 = {
        "longitude": lon3,
        "latitude" : lat3
    };

    var a = distance(point1, point2);
    var b = distance(point1, point3);
    var c = distance(point2, point3);
    var area = areaTriangle(a, b, c);
    return area * 2 / a;

}
function distance(p1, p2) {
    var lat1 = p1.latitude;
    var lat2 = p2.latitude;
    var lon1 = p1.longitude;
    var lon2 = p2.longitude;
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1)
        * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
}
function getData(lat, lng, distance, type) {
    theUrl = "http://devapi.mygasfeed.com/stations/radius/" + lat + "/" + lng
        + "/" + distance + "/" + type + "/distance/rfej9napna.json?";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getAPIRequest(latitude, longitude, distance, type, cb) {
    var request = require("request");
    var subBody;
    var url = "http://devapi.mygasfeed.com/stations/radius/" + latitude + "/"
        + longitude + "/" + distance + "/" + type
        + "/Distance/rfej9napna.json?";
    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            var index = body.search(/{\s*"status"[\s\S]+}/mi);
            subBody = body.substring(index);
            subBody = JSON.parse(subBody);
        } else {
            console.log(error, response.statusCode, "ERROR HTTP REQUEST");
        }
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
        return cb(listOfStations);
    });
}

function filterBrand(body, brand) {
    var found = body.filter(function (item) {
        return item.Brand === brand;
    });
    return found;
    //console.log(found);
}

function getStationArray(stepsArray, brand, cb) {
    brand = brand || "x";
    var i;
    var R = 3959;
    var j;
    var gasStation = [];
    //console.log("stepsarray", stepsArray);
    for (i = 1; i < stepsArray.length - 1; i++) {
        var latA = stepsArray[i - 1].lat;
        var lngA = stepsArray[i - 1].lng;
        var latB = stepsArray[i].lat;
        var lngB = stepsArray[i].lng;
        var disTo = 5;
        var type = "reg";
        getAPIRequest(latA, lngA, disTo, type, gasApi => {
            for (j = 0; j < gasApi.length; j++) {
                var latC = parseFloat(gasApi[j].lat);
                var lngC = parseFloat(gasApi[j].lng);
                var distance = getDistToLine(latA, lngA, latB, lngB, latC,
                                             lngC);
                if (distance < 2) {
                    gasStation.push(
                        {
                            "Brand"    : gasApi[j].station,
                            "Price"    : gasApi[j].reg_price,
                            "latitude" : gasApi[j].lat,
                            "longitude": gasApi[j].lng
                        }
                    );
                }
            }
            if (brand !== "x") {
                gasStation = filterBrand(gasStation, "Texaco");
                // console.log("Inside IF")
            }
            gasStation = unique(gasStation);
            return cb(gasStation);
        });
    }
    //return gasStation;
}

function getNearestGasStation(remainingRange, gasStationArray, carLocation, cb) {
    var tresholdRange = 60;
    var distanceArray = [];
    for (var i = 0; i < gasStationArray.length; i++) {
        var gasStationLocate = {
            "longitude": gasStationArray[i].longitude,
            "latitude" : gasStationArray[i].latitude
        }
        var distanceTemp = distance(carLocation, gasStationLocate);
        if (distanceTemp > remainingRange) {
            gasStationLocate.splice(i, 1);
        }
        else if (distanceTemp < remainingRange - tresholdRange) {
            gasStationLocate.splice(i, 1);

        }
        else {
            distanceArray.push(distanceTemp);
        }
    }
    var priceArray = gasStationArray.map(function (e) {
        return e.Price;
    })
    var indexOfMinValue = priceArray.reduce(
        (iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
    return cb(gasStationArray[indexOfMinValue]);
}

export default (origin, destination, brand, rangeLeft, loc, cb) => {
    p(origin, destination,
      step =>
          getStationArray(
              step, brand,
              gasSArr =>
                  getNearestGasStation(rangeLeft, gasSArr, loc, cb)
          ));
};
