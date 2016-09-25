/* @flow */
"use strict";

import { Router } from "express";
import gm, {VIN} from "../controllers/gm";

const router = Router();

router.get("/", (req, resp) => {
    let origin = "41.99668,-87.87675";
    let destination = "41.81424,-86.69919";
    gm(VIN.chevyMalibu, x => console.log(JSON.stringify(x)));
    setTimeout(() => resp.send({gasStop: destination}), 5000);
});

export default router;
