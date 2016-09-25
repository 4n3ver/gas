/* @flow */
"use strict";

import { Router } from "express";
import gm from "../controllers/gm";
import finalGas from "../controllers/finalGasStation";

const router = Router();

const once = fn => {
    let done = false;
    return function (...args) {
        if (!done) {
            let ret = fn.apply(this, args);
            done = true;
            return ret;
        }
    };
};

router.get("/", (req, resp) => {
    console.log(req.query.origin, req.query.destination, req.query.vin,
                req.query.brand);
    gm(req.query.vin, x =>
        finalGas(req.query.origin, req.query.destination, req.query.brand,
                 x[1].diagnosticElement[0].value, req.query.origin,
                 once(x =>
                          resp.send({gasStop: `${x.latitude},${x.longitude}`})
                 ))
    );
    //setTimeout(() => resp.send({gasStop: "41.81424,-86.69919"}), 5000);
});

export default router;
