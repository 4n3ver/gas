/* @flow */
"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";

class GMap extends Component {
    constructor(props) {
        super(props);
        this._bind("_fetchRoute");
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();
    }

    shouldComponentUpdate() {
        // always return false everytime the component is about to be
        // re-rendered
        return false;
    }

    componentDidMount() {
        this.map = new google.maps.Map(this.refs.map, {
            center: {
                lat: 41.99668,
                lng: -87.87675
            },
            zoom  : 6
        });
        this.directionsDisplay.setMap(this.map);
    }

    componentWillReceiveProps(nextProps) {
        this._fetchRoute(nextProps.origin, nextProps.destination,
                         nextProps.waypoints);
    }

    _bind(...methods) {
        methods.forEach((method) => this[method] = this[method].bind(this));
    }

    _fetchRoute(origin, end, waypoints) {
        console.log(Object.keys(waypoints));
        this.directionsService.route(
            {
                origin     : origin,
                destination: end,
                travelMode : "DRIVING",
                waypoints  : Object.keys(waypoints).map(pt => ({location: pt}))
            },
            (response, status) => {
                console.log(response, status);
                if (status === "OK") {
                    this.directionsDisplay.setDirections(response);
                } else {
                    alert(`Directions request failed due to ${status}`);
                }
            }
        );
    }

    render() {
        // ref is to get direct reference to the actual DOM
        return <div id="map" ref="map"></div>;
    }
}

const mapStateToProps = state => ({
    origin     : state.route.origin,
    destination: state.route.destination,
    waypoints  : state.route.waypoints
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GMap);
