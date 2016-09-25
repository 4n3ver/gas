/* @flow */
"use strict";

import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import FormInput, { required, pattern } from "./input/FormInput";
import { planRoute, addWaypoint, removeWaypoint } from "../actions";

class RouteForm extends Component {
    constructor(props) {
        super(props);
        this._bind("_onSubmit");
    }

    _bind(...methods) {
        methods.forEach(
            method => this[method] = this[method].bind(this));
    }

    _onSubmit({vin, brand, origin, destination}) {
        console.log(vin, brand, origin, destination);
        this.props.planRoute(origin, destination, vin, brand);
    }

    _renderAlert() {
        if (this.props.errorMessage) {
            return (
                <div className="ui error message">
                    <div className="header">Oops!</div>
                    {this.props.errorMessage}
                </div>
            );
        }
    }

    render() {
        const formClass = `ui inverted${this.props.processing
            ? " loading"
            : ""} error form`;
        return (
            <div className="ui inverted segment">
                <form onSubmit={this.props.handleSubmit(this._onSubmit)}
                    className={formClass}>
                    <div className="field">
                        <label>Car type</label>
                        <Field name="vin" component="select">
                            <option>Select Car Type</option>
                            <option value="2CNALPEC3B6000001">Chevy Equinox</option>
                            <option value="1G6DH5E53C000000">Chevy Camaro</option>
                            <option value="1G1PJ5SC9C700000">GMC Sierra</option>
                            <option value="1GCRCSE09BZ00000">Chevy Suburban</option>
                            <option value="1G1ZE5E03CF000006">Chevy Malibu</option>
                            <option value="1G1JE6SH2C4000007">Chevy Yukon</option>
                        </Field>
                    </div>
                    <div className="field">
                        <label>Gasoline Brand</label>
                        <Field name="brand" component="select">
                            <option value={undefined}>Any</option>
                            <option value="Texaco">Texaco</option>
                        </Field>
                    </div>
                    <Field
                        component={FormInput}
                        name="origin"
                        type="text"
                        label="Origin"
                        placeholder="latitude,longitude"/>
                    <Field
                        component={FormInput}
                        name="destination"
                        label="Destination"
                        type="text"
                        placeholder="latitude,longitude"/>
                    {this._renderAlert()}
                    <button type="submit"
                        disabled={!this.props.valid || this.props.submitting}
                        className="ui fluid primary button">
                        Set Route
                    </button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    errorMessage: state.route.error,
    processing  : state.route.processing
});

const mapDispatchToProps = {
    planRoute,
    addWaypoint,
    removeWaypoint
};

const validateForm = values => {
    const errors = pattern(
        /-?[0-9]+.[0-9]+,-?[0-9]+.[0-9]+/,
        "Invalid format!",
        "origin", "destination"
    )(values, required("vin", "origin", "destination")(values));
    ["origin", "destination"].forEach(
        name =>
            values[name] &&
            values[name].split(",")
                        .map(e => parseFloat(e))
                        .some(
                            (e, i) => i === 0
                                ? e < -90 || e > 90   // latitude
                                : e < -180 || e > 180 // longitude
                        )
                ? errors[name] = "Value is not valid"
                : null
    );
    return errors;
};

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    reduxForm(
        {
            form    : "route-form",
            validate: validateForm
        }
    )
)(RouteForm);
