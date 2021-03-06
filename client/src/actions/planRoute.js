/* @flow */
"use strict";
import {
    SET_ROUTE_ENDPOINT,
    ADD_WAYPOINT,
    REMOVE_WAYPOINT,
    START_PROCESSING_ROUTE,
    DONE_PROCESSING_ROUTE
} from "./types";
import { API_URL } from "../config";

export const planRoute = (origin, destination, vin, brand) => dispatch => {
    dispatch({type: START_PROCESSING_ROUTE});
    fetch(`${API_URL}/gas?origin=${origin}&destination=${destination}&vin=${vin}&brand=${brand}`,
          {method: "GET"})
        .then(resp => resp.json())
        .then(data => {
            console.log(data);
            dispatch(
                {
                    type   : SET_ROUTE_ENDPOINT,
                    payload: {
                        origin,
                        destination,
                        gasStop: data.gasStop
                    }
                }
            );
            dispatch({type: DONE_PROCESSING_ROUTE});
        });
};

export const addWaypoint = waypoint => ({
    type   : ADD_WAYPOINT,
    payload: waypoint
});

export const removeWaypoint = (waypoint) => ({
    type: REMOVE_WAYPOINT,

});

export default {
    planRoute,
    addWaypoint,
    removeWaypoint
};
