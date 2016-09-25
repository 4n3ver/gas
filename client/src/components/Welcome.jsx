/* @flow */
"use strict";

import React, { Component } from "react";
import GMap from "./GMap";
import RouteForm  from "./RouteForm";

class Welcome extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="ui padded raised segment"
                style={{height: "600px"}}>
                <GMap/>
                <div className="ui right attached rail">
                    <RouteForm/>
                </div>
            </div>
        );
    }
}

export default Welcome;
