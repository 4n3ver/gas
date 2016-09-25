const request = require("request");
const idpass = 'bDd4eGIzYjllNGNmOGRkZDQ5OWRiZWU4NDZkY2U3OWI1OTVjOmIyODY1MDRhMzM5NjQ0Mjg4ZjBhMGUwODVjOTNlNWVk'

const chevyEquinox = '2CNALPEC3B6000001';
const chevyCamaro = '1G6DH5E53C000000';
const gmcSierra = '1G1PJ5SC9C700000';
const chevySuburban = '1GCRCSE09BZ00000';
const chevyMalibu = '1G1ZE5E03CF000006';
const chevyYukon = '1G1JE6SH2C4000007';


// Get the bearer key
var bearer_key = {
    method: 'GET',
    url: 'https://developer.gm.com/api/v1/oauth/access_token',
    qs: {
        grant_type: 'client_credentials'
    },
    headers: {
        'cache-control': 'no-cache',
        accept: 'application/json',
        authorization: 'Basic ' + idpass;
    }
};

request(bearer_key, function(error, response, body) {
    if (error) throw new Error(error);
    var bearerkey = JSON.parse(body).access_token;
    var options = {
        method: 'POST',
        url: 'https://developer.gm.com/api/v1/account/vehicles/'+ chevyEquinox +'/commands/diagnostics',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            accept: 'application/json',
            authorization: 'Bearer ' + bearerkey
        },
        body: {
            diagnosticsRequest: {
                diagnosticItem: ['FUEL TANK INFO',
                    'VEHICLE RANGE'
                ]
            }
        },
        json: true
    };
    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body.commandResponse.url)
        var diagnostic = {
            method: 'GET',
            url: body.commandResponse.url,
            headers: {
                'cache-control': 'no-cache',
                accept: 'application/json',
                authorization: 'Bearer ' + bearerkey
            }
        };
        var intID = setInterval(function() {
            request(diagnostic, function(error, response, body) {
                if (error) throw new Error(error);
                console.log(body);

                if (JSON.parse(body).commandResponse.status !== 'inProgress') {
                    clearInterval(intID)
                }
            });
        }, 4000)

    });
});
