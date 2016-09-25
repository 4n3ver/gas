import request from "request";
import { API_GM_KEY as idpass } from "../config";

export const VIN = {
    chevyEquinox : "2CNALPEC3B6000001",
    chevyCamaro  : "1G6DH5E53C0000003",
    gmcSierra    : "1G1PJ5SC9C7000004",
    chevySuburban: "1GCRCSE09BZ000005",
    chevyMalibu  : "1G1ZE5E03CF000006",
    chevyYukon   : "1G1JE6SH2C4000007"
};

export default function gm(vin, cb) {
    // Get the bearer key
    var bearer_key = {
        method : "GET",
        url    : "https://developer.gm.com/api/v1/oauth/access_token",
        qs     : {
            grant_type: "client_credentials"
        },
        headers: {
            "cache-control": "no-cache",
            accept         : "application/json",
            authorization  : "Basic " + idpass
        }
    };

    request(bearer_key, function (error, response, body) {
        if (error) {
            throw new Error(error);
        }
        var bearerkey = JSON.parse(body).access_token;
        var options = {
            method : "POST",
            url    : "https://developer.gm.com/api/v1/account/vehicles/"
            + vin + "/commands/diagnostics",
            headers: {
                "cache-control": "no-cache",
                "content-type" : "application/json",
                accept         : "application/json",
                authorization  : "Bearer " + bearerkey
            },
            body   : {
                diagnosticsRequest: {
                    diagnosticItem: [
                        "FUEL TANK INFO",
                        "VEHICLE RANGE"
                    ]
                }
            },
            json   : true
        };
        request(options, function (error, response, body) {
            if (error) {
                throw new Error(error);
            }
            console.log(body);
            var diagnostic = {
                method : "GET",
                url    : body.commandResponse.url,
                headers: {
                    "cache-control": "no-cache",
                    accept         : "application/json",
                    authorization  : "Bearer " + bearerkey
                }
            };
            var intID = setInterval(function () {
                request(diagnostic, function (error, response, body) {
                    if (error) {
                        throw new Error(error);
                    }
                    body = JSON.parse(body);
                    if (body.commandResponse.status !== "inProgress") {
                        clearInterval(intID);
                        cb(body.commandResponse.body.diagnosticResponse);
                    }
                });
            }, 4000);
        });
    });
}
