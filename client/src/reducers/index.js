/* @flow */
"use strict";

import { combineReducers } from "redux";
import { reducer as formReducer} from "redux-form";

import authReducer from "./auth";
import routeReducer from "./route";

const rootReducer = combineReducers(
    {
        form: formReducer,
        auth: authReducer,
        route: routeReducer
    }
);

export default rootReducer;
