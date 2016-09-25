/* @flow */
"use strict";

import React, { Component } from "react";

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
                lat: this.props.origin.lat,
                lng: this.props.origin.lon
            },
            zoom  : 6
        });
        this.directionsDisplay.setMap(this.map);
    }

    componentWillReceiveProps(nextProps) {
        //this.map.panTo(
        //    {
        //        lat: nextProps.origin.lat,
        //        lng: nextProps.origin.lon
        //    }
        //);
        this._fetchRoute(nextProps.origin, nextProps.end);
    }

    _bind(...methods) {
        methods.forEach((method) => this[method] = this[method].bind(this));
    }

    _fetchRoute(origin, end) {
        console.log(this.props.waypoints.map(
            point => `${point.location.lat},${point.location.lon}`));
        this.directionsService.route(
            {
                origin     : `${origin.lat},${origin.lon}`,
                destination: `${end.lat},${end.lon}`,
                travelMode : "DRIVING",
                waypoints  : this.props.waypoints.map(
                    point => ({
                        location: `${point.location.lat},${point.location.lon}`
                    }))
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
        // put the route for the first time
        this._fetchRoute(this.props.origin, this.props.end);

        // ref is to get direct reference to the actual DOM
        return <div id="map" ref="map"></div>;
    }
}

export default GMap;
