/* @flow */
"use strict";
import { SET_ROUTE_ENDPOINT, ADD_WAYPOINT, REMOVE_WAYPOINT } from "./types";

export const planRoute = (origin, destination) => ({
    type   : SET_ROUTE_ENDPOINT,
    payload: {
        origin,
        destination
    }
});

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
