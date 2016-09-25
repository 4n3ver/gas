/* @flow */
"use strict";

import {
    SET_ROUTE_ENDPOINT,
    ADD_WAYPOINT,
    REMOVE_WAYPOINT,
    ROUTE_ERROR
} from "../actions/types";

const removeFromSet = (set, key) => {
    set = Object.assign({}, set);
    delete set[key];
    return set;
};

export default (state = {}, action)=> {
    switch (action.type) {
        case SET_ROUTE_ENDPOINT:
            return Object.assign({}, state, {
                origin     : action.payload.origin,
                destination: action.payload.destination
            });
        case ADD_WAYPOINT:
            return Object.assign({}, state, {
                waypoints: Object.assign({}, state.waypoints,
                                         {[action.payload]: null})
            });
        case REMOVE_WAYPOINT:
            return Object.assign({}, state, {
                waypoints: removeFromSet(state.waypoints, action.payload)
            });
        case ROUTE_ERROR:
            return Object.assign({}, state, {
                error: action.payload
            });
        default:
            return state;
    }
};

